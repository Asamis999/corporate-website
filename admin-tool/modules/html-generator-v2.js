/**
 * html-generator-v2.js
 *
 * parser.js の parseArticleContent 出力をもとにHTMLを生成する。
 */

const MANUAL_SUBCATS = ['wix', 'shopify', 'manual'];

// ─────────────────────────────────────────
// パス・URL計算（旧html-generator.jsと同一ロジック）
// ─────────────────────────────────────────
function getImageDir(bigCat, smallCat) {
  if (bigCat === 'insights') return `/assets/images/insights/${smallCat}/`;
  if (MANUAL_SUBCATS.includes(smallCat) || bigCat === 'manual') {
    return `/assets/images/manual/${smallCat}/`;
  }
  return `/assets/images/howto/article/`;
}

function getArticleUrl(bigCat, smallCat, articleId) {
  if (bigCat === 'insights') {
    return articleId ? `/insights/${smallCat}/${articleId}/` : `/insights/${smallCat}/`;
  }
  if (bigCat === 'howto' || bigCat === 'manual') {
    const sub = (MANUAL_SUBCATS.includes(smallCat) || bigCat === 'manual') ? 'manual' : 'article';
    return `/howto/posts/${sub}/${articleId}/`;
  }
  return `/${bigCat}/${smallCat}/${articleId}/`;
}

function getOutputPath(siteRoot, bigCat, smallCat, articleId) {
  const url = getArticleUrl(bigCat, smallCat, articleId);
  return `${siteRoot}${url}index.html`;
}

function getBreadcrumbId(bigCat, smallCat, articleId) {
  if (bigCat === 'insights') {
    return articleId ? `${smallCat}-${articleId}` : smallCat;
  }
  return articleId;
}

// ─────────────────────────────────────────
// TOC HTML生成
// ─────────────────────────────────────────
function generateTocHtml(toc) {
  if (!toc?.length) return '';
  const items = toc
    .map(item => `                    <li><a href="#${item.anchor}">${item.text}</a></li>`)
    .join('\n');
  return `            <section class="article-section fade-in">
                <h2 class="article-section-title">目次</h2>
                <ol class="article-list">
${items}
                </ol>
            </section>

            <div class="divider"></div>`;
}

// ─────────────────────────────────────────
// BODY HTML生成
// ─────────────────────────────────────────
function generateBodyHtml(bodyItems, images, imageDir, toc) {
  if (!bodyItems?.length) return '';

  // TOCからアンカーマップを構築: 見出しテキスト → anchorID
  const anchorMap = {};
  if (toc) {
    for (const item of toc) anchorMap[item.text] = item.anchor;
  }

  const lines = [];
  let inUl = false;
  let inOl = false;
  let sectionCount = 0;

  const closeList = () => {
    if (inUl) { lines.push('                </ul>'); inUl = false; }
    if (inOl) { lines.push('                </ol>'); inOl = false; }
  };

  for (const item of bodyItems) {
    if (item.type === 'li') {
      if (inOl) closeList();
      if (!inUl) { lines.push('                <ul class="article-list">'); inUl = true; }
      lines.push(`                    <li>${item.html}</li>`);
      continue;
    }
    if (item.type === 'oli') {
      if (inUl) closeList();
      if (!inOl) { lines.push('                <ol class="article-list">'); inOl = true; }
      lines.push(`                    <li>${item.html}</li>`);
      continue;
    }
    closeList();

    switch (item.type) {
      case 'h2':
        lines.push(`\n                <h2 class="article-section-title">${item.html}</h2>`);
        break;
      case 'h3': {
        sectionCount++;
        const anchorId = anchorMap[item.raw] || `section${sectionCount}`;
        lines.push(`\n                <h2 id="${anchorId}" class="article-section-title">${item.html}</h2>`);
        break;
      }
      case 'p':
        lines.push(`                <p class="article-p">${item.html}</p>`);
        break;
      case 'image_marker': {
        const imgKey = item.section;
        const imgData = images?.[imgKey];
        if (imgData) {
          const filename = imgData['ファイル名'] || '';
          const alt = imgData['alt'] || '';
          lines.push(`                <div class="article-image-container">`);
          lines.push(`                    <img src="${imageDir}${filename}" alt="${alt}" class="article-image" style="max-width: 100%;">`);
          lines.push(`                </div>`);
        }
        break;
      }
    }
  }
  closeList();
  return lines.join('\n');
}

// ─────────────────────────────────────────
// 記事タイプ判定
// ─────────────────────────────────────────
function getJsCategory(bigCat, smallCat) {
  if (bigCat === 'insights') return 'insights';
  if (MANUAL_SUBCATS.includes(smallCat) || bigCat === 'manual') return 'manual';
  return 'article';
}

function getArticleType(bigCat, articleId) {
  if (bigCat !== 'insights') return null;
  return articleId ? 'cluster' : 'pillar';
}

// ─────────────────────────────────────────
// 完全なHTML生成
// ─────────────────────────────────────────
function generateHtml(dbArticle, parsedContent) {
  const { bigCategory: bigCat, smallCategory: smallCat, articleId } = dbArticle;
  const { title: rawTitle, meta, toc, body, images } = parsedContent;

  const title = dbArticle.title || rawTitle || '';
  const description = meta?.description ?? '';
  const date = meta?.date ?? dbArticle.updatedAt ?? '';
  const tags = meta?.tags ?? [];
  const excerpt = meta?.excerpt ?? '';

  const imageDir = getImageDir(bigCat, smallCat);
  const canonicalUrl = `https://a-inc.info${getArticleUrl(bigCat, smallCat, articleId)}`;
  const breadcrumbId = getBreadcrumbId(bigCat, smallCat, articleId);

  const thumbFilename = images?.thumb?.['ファイル名'] ?? '';
  const thumbAlt = images?.thumb?.['alt'] ?? title;
  const thumbPath = `${imageDir}${thumbFilename}`;

  const tagHtml = tags
    .map(t => `                    <span class="article-tag">${t}</span>`)
    .join('\n');

  const tocHtml = generateTocHtml(toc);
  const bodyHtml = generateBodyHtml(body, images, imageDir, toc);

  const jsCategory = getJsCategory(bigCat, smallCat);
  const articleType = getArticleType(bigCat, articleId);
  const articleUrl = getArticleUrl(bigCat, smallCat, articleId);

  // 関連記事JSがデプロイ前(データ配列未追加)でも動作するよう埋め込む
  const currentArticleJson = JSON.stringify({
    id: breadcrumbId,
    title,
    url: articleUrl,
    image: thumbPath,
    date,
    tags,
    category: bigCat === 'insights' ? 'insights' : jsCategory,
    type: articleType,
    theme: smallCat,
    group: smallCat
  });

  const jsFiles = bigCat === 'insights'
    ? `    <script>window.__currentArticle = ${currentArticleJson};</script>\n    <script src="/assets/js/main.js"></script>\n    <script src="/assets/js/insights.js"></script>\n    <script src="/assets/js/insights-related.js"></script>`
    : `    <script>window.__currentArticle = ${currentArticleJson};</script>\n    <script src="/assets/js/main.js"></script>\n    <script src="/assets/js/howto.js"></script>\n    <script src="/assets/js/howto-related.js"></script>`;

  const metaTheme = bigCat === 'insights' ? `テーマ：${smallCat}` : date;

  return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>${title} | ナレッジ</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${canonicalUrl}">

    <link rel="stylesheet" href="/assets/css/template.css">
    <link rel="stylesheet" href="/assets/css/header.css">
    <link rel="stylesheet" href="/assets/css/howto.css">
    <link rel="stylesheet" href="/assets/css/article-unified.css">

    <script src="/assets/js/template.js" defer></script>
</head>
<body class="howto-article">
    <div id="site-header"></div>

    <div id="breadcrumb-container" data-page="${breadcrumbId}"></div>

    <main class="main-content">
        <div class="article-container">
            <header class="article-header">
                <h1 class="article-title">${title}</h1>
                <div class="article-meta">${metaTheme}</div>
                <div class="article-tag-list">
${tagHtml}
                </div>
            </header>

            <div class="article-image-container">
                <img src="${thumbPath}" alt="${thumbAlt}" class="article-image" style="max-width: 100%;">
            </div>

${tocHtml}

            <section class="article-section fade-in">
${bodyHtml}
            </section>

            <div class="divider"></div>

            <section class="cta-banner" style="margin:2rem 0;">
                <a href="https://a-inc.info/services/lp-lpo-v2/" target="_blank" rel="noopener noreferrer">
                    <img src="/assets/images/banner-cta_1.webp" alt="LP・LPO支援サービス" style="width:100%;display:block;border-radius:8px;">
                </a>
            </section>

            <div class="divider"></div>

            <section class="related-articles fade-in">
                <h3 class="article-section-title">関連記事</h3>
                <div class="related-articles-grid"></div>
            </section>

            <div class="divider"></div>
            <div id="profile-container" class="fade-in"></div>
        </div>
    </main>

    <div id="site-footer"></div>

${jsFiles}
</body>
</html>
`;
}

module.exports = {
  generateHtml,
  getOutputPath,
  getArticleUrl,
  getImageDir,
  getBreadcrumbId,
  getJsCategory,
  getArticleType
};
