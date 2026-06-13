const fs = require('fs');
const path = require('path');

function updateInsightsData(siteRoot, article) {
  const filePath = path.join(siteRoot, 'assets/js/insights.js');
  let content = fs.readFileSync(filePath, 'utf8');

  const { title, articleId, smallCat, updatedAt, memo2 } = article;
  const tags = memo2 ? memo2.split('/').map(t => t.trim()).filter(Boolean) : [];
  const url = articleId ? `/insights/${smallCat}/${articleId}/` : `/insights/${smallCat}/`;
  const thumbPath = articleId
    ? `/assets/images/insights/${smallCat}/${articleId}_thumb.webp`
    : `/assets/images/insights/${smallCat}/pillar_thumb.webp`;
  const type = articleId ? 'cluster' : 'pillar';

  const newEntry = `    {
        id: "${articleId || smallCat}",
        title: "${title}",
        excerpt: "",
        url: "${url}",
        image: "${thumbPath}",
        date: "${updatedAt}",
        tags: ${JSON.stringify(tags)},
        theme: "${smallCat}",
        group: "${smallCat}",
        type: "${type}"
    }`;

  content = content.replace(
    /^(const insightsData\s*=\s*\[)/m,
    `$1\n${newEntry},`
  );

  fs.writeFileSync(filePath, content, 'utf8');
  return newEntry;
}

function updateHowtoData(siteRoot, article) {
  const filePath = path.join(siteRoot, 'assets/js/howto.js');
  let content = fs.readFileSync(filePath, 'utf8');

  const { title, articleId, bigCat, smallCat, updatedAt, memo2 } = article;
  const tags = memo2 ? memo2.split('/').map(t => t.trim()).filter(Boolean) : [];
  const isManual = bigCat === 'manual' || ['wix', 'shopify'].includes(smallCat);
  const url = isManual
    ? `/howto/posts/manual/${articleId}/`
    : `/howto/posts/article/${articleId}/`;
  const thumbPath = isManual
    ? `/assets/images/manual/${smallCat}/${articleId}_thumb.webp`
    : `/assets/images/howto/article/${articleId}_thumb.webp`;

  const newEntry = `    {
        id: "${articleId}",
        title: "${title}",
        excerpt: "",
        url: "${url}",
        image: "${thumbPath}",
        date: "${updatedAt}",
        tags: ${JSON.stringify(tags)},
        category: "${smallCat}",
        type: "${isManual ? 'manual' : 'article'}"
    }`;

  content = content.replace(
    /^(const articlesData\s*=\s*\[)/m,
    `$1\n${newEntry},`
  );

  fs.writeFileSync(filePath, content, 'utf8');
  return newEntry;
}

function updateTitleMap(siteRoot, articleId, title) {
  const filePath = path.join(siteRoot, 'assets/js/template.js');
  let content = fs.readFileSync(filePath, 'utf8');

  const entry = `\n        '${articleId}': '${title}',`;
  content = content.replace(
    /(const titleMap\s*=\s*\{)/,
    `$1${entry}`
  );

  fs.writeFileSync(filePath, content, 'utf8');
}

module.exports = { updateInsightsData, updateHowtoData, updateTitleMap };
