const fs = require('fs');
const path = require('path');
const { getArticleUrl, getImageDir, getJsCategory, getArticleType } = require('./html-generator-v2');

/**
 * insights.js または howto.js に記事エントリを追加する
 */
function updateArticleJs(siteRoot, dbArticle, parsedContent) {
  const { bigCategory: bigCat, smallCategory: smallCat, articleId } = dbArticle;
  const { meta, images } = parsedContent;

  const title = dbArticle.title;
  const excerpt = meta?.excerpt ?? '';
  const date = meta?.date ?? dbArticle.updatedAt ?? '';
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
        group: '${smallCat}'
    }`;

    content = content.replace(/^(const insightsData\s*=\s*\[)/m, `$1\n${newEntry},`);
    fs.writeFileSync(filePath, content, 'utf8');
    return newEntry;
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

    content = content.replace(/^(const articlesData\s*=\s*\[)/m, `$1\n${newEntry},`);
    fs.writeFileSync(filePath, content, 'utf8');
    return newEntry;
  }
}

function updateTitleMap(siteRoot, breadcrumbId, title) {
  const filePath = path.join(siteRoot, 'assets/js/template.js');
  let content = fs.readFileSync(filePath, 'utf8');
  const entry = `\n        '${breadcrumbId}': '${escapeStr(title)}',`;
  content = content.replace(/(const titleMap\s*=\s*\{)/, `$1${entry}`);
  fs.writeFileSync(filePath, content, 'utf8');
}

function escapeStr(s) {
  return (s || '').replace(/'/g, "\\'").replace(/\n/g, ' ');
}

module.exports = { updateArticleJs, updateTitleMap };
