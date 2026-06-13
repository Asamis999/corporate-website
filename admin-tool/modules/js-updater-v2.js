const fs = require('fs');
const path = require('path');
const { getArticleUrl, getImageDir, getJsCategory, getArticleType } = require('./html-generator-v2');

// ─── 今日の日付を YYYY.MM.DD 形式で返す ───
function todayStr() {
  return new Date().toLocaleDateString('ja-JP', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    timeZone: 'Asia/Tokyo'
  }).replace(/\//g, '.');
}

// ─── エントリブロック（{...}）の位置を id 一致で特定する ───
function findEntryBlock(content, entryId) {
  const marker = `id: '${entryId}'`;
  const markerIdx = content.indexOf(marker);
  if (markerIdx === -1) return null;

  // marker より前の { を探す
  let openIdx = content.lastIndexOf('{', markerIdx);
  if (openIdx === -1) return null;

  // ブレース数をカウントして閉じ } を特定
  let depth = 0, closeIdx = -1;
  for (let i = openIdx; i < content.length; i++) {
    if (content[i] === '{') depth++;
    else if (content[i] === '}') { depth--; if (depth === 0) { closeIdx = i; break; } }
  }
  if (closeIdx === -1) return null;

  // 前後の空白・カンマを含む範囲を計算
  let start = openIdx;
  while (start > 0 && (content[start - 1] === ' ' || content[start - 1] === '\t')) start--;
  if (start > 0 && content[start - 1] === '\n') start--;

  let end = closeIdx + 1;
  if (content[end] === ',') end++;

  return { start, end };
}

// ─── UPSERT: 同 id のエントリを全て削除してから先頭に挿入 ───
function upsertEntry(content, arrayName, entryId, newEntry) {
  // 重複含め全て削除（旧コードが複数追加していた場合に対応）
  let cleaned = content;
  for (;;) {
    const block = findEntryBlock(cleaned, entryId);
    if (!block) break;
    cleaned = cleaned.slice(0, block.start) + cleaned.slice(block.end);
  }
  // 先頭に新エントリを挿入
  return cleaned.replace(
    new RegExp(`^(const ${arrayName}\\s*=\\s*\\[)`, 'm'),
    `$1\n${newEntry},`
  );
}

/**
 * insights.js または howto.js に記事エントリを UPSERT する
 * date はデプロイ日（今日）を自動設定。META に date が明示されていればそちらを優先。
 */
function updateArticleJs(siteRoot, dbArticle, parsedContent) {
  const { bigCategory: bigCat, smallCategory: smallCat, articleId } = dbArticle;
  const { meta, images } = parsedContent;

  const title = dbArticle.title;
  const excerpt = meta?.excerpt ?? '';
  const date = meta?.date || todayStr();   // META未設定時はデプロイ日を使用
  const tags = meta?.tags ?? [];
  const url = getArticleUrl(bigCat, smallCat, articleId);
  const imageDir = getImageDir(bigCat, smallCat);
  const thumbFilename = images?.thumb?.['ファイル名'] ?? `${articleId || 'pillar'}_thumb.webp`;
  const thumbPath = `${imageDir}${thumbFilename}`;
  const jsCategory = getJsCategory(bigCat, smallCat);
  const articleType = getArticleType(bigCat, articleId);

  if (bigCat === 'insights') {
    const filePath = path.join(siteRoot, 'assets/js/insights.js');
    let content = fs.readFileSync(filePath, 'utf8');

    const entryId = articleId ? `${smallCat}-${articleId}` : smallCat;
    const newEntry = `    {
        id: '${entryId}',
        title: '${escapeStr(title)}',
        excerpt: '${escapeStr(excerpt)}',
        url: '${url}',
        image: '${thumbPath}',
        date: '${date}',
        tags: ${JSON.stringify(tags)},
        category: 'insights',
        type: '${articleType}',
        theme: '${smallCat}',
        group: '${articleId ? articleId[0].toUpperCase() : ''}'
    }`;

    content = upsertEntry(content, 'insightsData', entryId, newEntry);
    fs.writeFileSync(filePath, content, 'utf8');
    return { entryId, date };

  } else {
    const filePath = path.join(siteRoot, 'assets/js/howto.js');
    let content = fs.readFileSync(filePath, 'utf8');

    const newEntry = `    {
        id: '${articleId}',
        title: '${escapeStr(title)}',
        excerpt: '${escapeStr(excerpt)}',
        url: '${url}',
        image: '${thumbPath}',
        date: '${date}',
        tags: ${JSON.stringify(tags)},
        category: '${jsCategory}'
    }`;

    content = upsertEntry(content, 'articlesData', articleId, newEntry);
    fs.writeFileSync(filePath, content, 'utf8');
    return { entryId: articleId, date };
  }
}

function updateTitleMap(siteRoot, breadcrumbId, title) {
  const filePath = path.join(siteRoot, 'assets/js/template.js');
  let content = fs.readFileSync(filePath, 'utf8');

  // 既存エントリがあれば置換、なければ挿入（重複防止）
  const existingPattern = new RegExp(`'${breadcrumbId}':\\s*'[^']*',?`);
  const newEntry = `'${breadcrumbId}': '${escapeStr(title)}'`;
  if (existingPattern.test(content)) {
    content = content.replace(existingPattern, `${newEntry},`);
  } else {
    content = content.replace(/(const titleMap\s*=\s*\{)/, `$1\n        ${newEntry},`);
  }
  fs.writeFileSync(filePath, content, 'utf8');
}

function escapeStr(s) {
  return (s || '').replace(/'/g, "\\'").replace(/\n/g, ' ');
}

module.exports = { updateArticleJs, updateTitleMap };
