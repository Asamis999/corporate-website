/**
 * parser.js
 *
 * Notionページのrawブロックから、GPTs固定フォーマットを解析する。
 * フォーマット: # タイトル / ## META / ## TOC / ## BODY / ## IMAGES
 */

const SECTIONS = ['META', 'TOC', 'BODY', 'IMAGES'];

function plainText(richText) {
  return (richText || []).map(t => t.plain_text).join('');
}

function htmlText(richText) {
  return (richText || []).map(t => {
    let s = t.plain_text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    if (t.annotations?.bold) s = `<strong>${s}</strong>`;
    if (t.annotations?.italic) s = `<em>${s}</em>`;
    return s;
  }).join('');
}

function blockPlain(block) {
  const d = block[block.type];
  return d?.rich_text ? plainText(d.rich_text) : '';
}
function blockHtml(block) {
  const d = block[block.type];
  return d?.rich_text ? htmlText(d.rich_text) : '';
}

// ─────────────────────────────────────────
// セクション分割
// ─────────────────────────────────────────
function splitSections(rawBlocks) {
  let titleText = null;
  let currentSection = null;
  const buckets = { META: [], TOC: [], BODY: [], IMAGES: [] };

  for (const b of rawBlocks) {
    if (b.type === 'heading_1') {
      if (!titleText) titleText = blockPlain(b);
      continue;
    }
    if (b.type === 'heading_2') {
      const t = blockPlain(b).trim();
      if (SECTIONS.includes(t)) { currentSection = t; continue; }
    }
    if (currentSection) buckets[currentSection].push(b);
  }
  return { titleText, buckets };
}

// ─────────────────────────────────────────
// META解析
// ─────────────────────────────────────────
function parseMeta(blocks) {
  const meta = {};
  for (const b of blocks) {
    if (b.type !== 'bulleted_list_item') continue;
    const text = blockPlain(b).trim();
    const ci = text.indexOf(':');
    if (ci < 0) continue;
    const key = text.slice(0, ci).trim();
    const val = text.slice(ci + 1).trim();
    if (['description', 'tags', 'date', 'excerpt'].includes(key)) meta[key] = val;
  }
  if (!Object.keys(meta).length) return null;
  if (meta.tags) meta.tags = meta.tags.split(',').map(t => t.trim()).filter(Boolean);
  return meta;
}

// ─────────────────────────────────────────
// TOC解析
// ─────────────────────────────────────────
function parseToc(blocks) {
  const toc = [];
  for (const b of blocks) {
    if (b.type !== 'bulleted_list_item') continue;
    const text = blockPlain(b).trim();

    // 形式1: [見出し](#sectionN) (Notionがプレーンテキストとして保存)
    const m1 = text.match(/^\[(.+?)\]\(#(section\d+)\)$/);
    if (m1) { toc.push({ text: m1[1], anchor: m1[2] }); continue; }

    // 形式2: Notionがリンクアノテーションに変換した場合
    const rt = b.bulleted_list_item?.rich_text || [];
    for (const t of rt) {
      if (!t.href) continue;
      // 形式2a: href が #sectionN で始まる
      if (t.href.startsWith('#section')) {
        toc.push({ text: t.plain_text, anchor: t.href.slice(1) });
        break;
      }
      // 形式2b: ChatGPT等のフルURLで末尾に #sectionN フラグメントが付いている
      const fm = t.href.match(/#(section\d+)$/);
      if (fm) {
        toc.push({ text: t.plain_text, anchor: fm[1] });
        break;
      }
    }
  }
  return toc.length ? toc : null;
}

// ─────────────────────────────────────────
// BODY解析
// ─────────────────────────────────────────
function parseBody(blocks) {
  const items = [];
  for (const b of blocks) {
    switch (b.type) {
      case 'heading_2':
        items.push({ type: 'h2', html: blockHtml(b), raw: blockPlain(b) });
        break;
      case 'heading_3':
        items.push({ type: 'h3', html: blockHtml(b), raw: blockPlain(b) });
        break;
      case 'paragraph': {
        const raw = blockPlain(b).trim();
        const im = raw.match(/^\[IMAGE:\s*(section\d+)\]$/);
        if (im) {
          items.push({ type: 'image_marker', section: im[1] });
        } else if (raw) {
          items.push({ type: 'p', html: blockHtml(b) });
        }
        break;
      }
      case 'bulleted_list_item':
        items.push({ type: 'li', html: blockHtml(b) });
        break;
      case 'numbered_list_item':
        items.push({ type: 'oli', html: blockHtml(b) });
        break;
    }
  }
  return items;
}

// ─────────────────────────────────────────
// IMAGES解析
// ─────────────────────────────────────────
function parseImages(blocks) {
  const images = {};
  let cur = null;
  for (const b of blocks) {
    if (b.type === 'heading_3') {
      cur = blockPlain(b).trim();
      images[cur] = {};
    } else if (b.type === 'bulleted_list_item' && cur) {
      const text = blockPlain(b).trim();
      const ci = text.indexOf(':');
      if (ci >= 0) {
        images[cur][text.slice(0, ci).trim()] = text.slice(ci + 1).trim();
      }
    }
  }
  return Object.keys(images).length ? images : null;
}

// ─────────────────────────────────────────
// メインパース
// ─────────────────────────────────────────
function parseArticleContent(rawBlocks) {
  const { titleText, buckets } = splitSections(rawBlocks);
  return {
    title: titleText,
    meta: parseMeta(buckets.META),
    toc: parseToc(buckets.TOC),
    body: parseBody(buckets.BODY),
    images: parseImages(buckets.IMAGES)
  };
}

// ─────────────────────────────────────────
// バリデーション
// ─────────────────────────────────────────
function validateContent(parsed, uploadedImages = []) {
  const errors = [];
  const warnings = [];

  // ─ 基本構造
  if (!parsed.title) warnings.push('原文のH1タイトルがありません（Notion DBタイトルを使用します）');

  // ─ META
  if (!parsed.meta) {
    errors.push('METAセクションがありません');
  } else {
    if (!parsed.meta.description) errors.push('META: description が空です');
    if (!parsed.meta.tags?.length) errors.push('META: tags が空です');
    if (!parsed.meta.date) errors.push('META: date が空です');
    if (!parsed.meta.excerpt) errors.push('META: excerpt が空です');
    if (parsed.meta.date && !/^\d{4}\.\d{2}\.\d{2}$/.test(parsed.meta.date)) {
      errors.push('META: date は YYYY.MM.DD 形式にしてください');
    }
    if (parsed.meta.description?.length > 160) {
      warnings.push(`META: description が ${parsed.meta.description.length} 文字です（推奨120文字以内）`);
    }
    if (parsed.meta.excerpt?.length > 80) {
      warnings.push(`META: excerpt が ${parsed.meta.excerpt.length} 文字です（推奨80文字以内）`);
    }
  }

  // ─ TOC（オプショナル）
  if (!parsed.toc?.length) warnings.push('TOCセクションがありません（TOCなし記事として処理します）');

  // ─ BODY
  if (!parsed.body?.length) {
    errors.push('BODYが空です');
  } else {
    const markers = parsed.body.filter(b => b.type === 'image_marker').map(b => b.section);
    if (parsed.images) {
      for (const m of markers) {
        if (!parsed.images[m]) {
          errors.push(`BODY内の [IMAGE: ${m}] に対応する IMAGES ### ${m} がありません`);
        }
      }
    }
    // TOCとBODY見出しの整合チェック
    if (parsed.toc) {
      const bodyH3 = parsed.body.filter(b => b.type === 'h3').map(b => b.raw);
      for (const item of parsed.toc) {
        if (!bodyH3.includes(item.text)) {
          warnings.push(`TOCの「${item.text}」がBODY内の ### 見出しと一致しません`);
        }
      }
    }
  }

  // ─ IMAGES
  if (!parsed.images) {
    errors.push('IMAGESセクションがありません');
  } else {
    if (!parsed.images.thumb) errors.push('IMAGES: ### thumb がありません');

    for (const [key, img] of Object.entries(parsed.images)) {
      const fn = img['ファイル名'];
      if (!fn) {
        errors.push(`IMAGES ### ${key}: ファイル名がありません`);
      } else if (!uploadedImages.some(f => f.toLowerCase() === fn.toLowerCase())) {
        warnings.push(`画像「${fn}」が未アップロードです`);
      }
    }
  }

  return { errors, warnings };
}

module.exports = { parseArticleContent, validateContent };
