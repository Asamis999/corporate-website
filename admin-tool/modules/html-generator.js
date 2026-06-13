const MANUAL_SUBCATS_IMG = ['wix', 'shopify'];

function getImageDir(bigCat, smallCat) {
  if (bigCat === 'insights') return `/assets/images/insights/${smallCat}/`;
  if (MANUAL_SUBCATS_IMG.includes(smallCat) || bigCat === 'manual') {
    return `/assets/images/manual/${smallCat}/`;
  }
  return `/assets/images/howto/article/`;
}

const MANUAL_SUBCATS = ['wix', 'shopify'];

function getArticleUrl(bigCat, smallCat, articleId) {
  if (bigCat === 'insights') {
    if (!articleId) return `/insights/${smallCat}/`;
    return `/insights/${smallCat}/${articleId}/`;
  }
  if (bigCat === 'howto' || bigCat === 'manual') {
    const subDir = (MANUAL_SUBCATS.includes(smallCat) || bigCat === 'manual') ? 'manual' : 'article';
    return `/howto/posts/${subDir}/${articleId}/`;
  }
  return `/${bigCat}/${smallCat}/${articleId}/`;
}

function getBreadcrumbPage(bigCat, smallCat, articleId) {
  if (bigCat === 'insights') {
    if (!articleId) return smallCat;
    return `${smallCat}-${articleId}`;
  }
  return articleId;
}

function blocksToHtml(blocks) {
  const lines = [];
  let inUl = false;
  let inOl = false;

  const closeList = () => {
    if (inUl) { lines.push('                <\/ul>'); inUl = false; }
    if (inOl) { lines.push('                <\/ol>'); inOl = false; }
  };

  let bodyStarted = false;
  const isH1Marker = (b) => b.type === 'h1' && b.text.includes('記事本文');

  for (const block of blocks) {
    if (!bodyStarted) {
      if (isH1Marker(block)) bodyStarted = true;
      continue;
    }

    if (block.type === 'callout') continue;

    if (block.type === 'li') {
      if (inOl) closeList();
      if (!inUl) { lines.push('                <ul class="article-list">'); inUl = true; }
      lines.push(`                    <li>${block.text}<\/li>`);
      continue;
    }
    if (block.type === 'oli') {
      if (inUl) closeList();
      if (!inOl) { lines.push('                <ol class="article-list">'); inOl = true; }
      lines.push(`                    <li>${block.text}<\/li>`);
      continue;
    }
    closeList();

    switch (block.type) {
      case 'h2':
        lines.push(`\n                <h2 class="article-section-title">${block.text}<\/h2>`);
        break;
      case 'h3':
        lines.push(`                <h3 class="article-section-title">${block.text}<\/h3>`);
        break;
      case 'p':
        lines.push(`                <p class="article-p">${block.text}<\/p>`);
        break;
      case 'br':
        break;
      case 'divider':
        lines.push('                <div class="divider"><\/div>');
        break;
    }
  }
  closeList();
  return lines.join('\n');
}

function getToc(blocks) {
  let bodyStarted = false;
  const items = [];
  for (const block of blocks) {
    if (!bodyStarted) {
      if (block.type === 'h1' && block.text.includes('記事本文')) bodyStarted = true;
      continue;
    }
    if (block.type === 'callout') continue;
    if (block.type === 'h2') items.push(block.text);
  }
  return items;
}

function generateInsightsClusterHtml(article, blocks) {
  const { title, articleId, smallCat, bigCat, updatedAt, memo2 } = article;
  const imageDir = getImageDir(bigCat, smallCat);
  const canonicalUrl = `https://a-inc.info${getArticleUrl(bigCat, smallCat, articleId)}`;
  const breadcrumbPage = getBreadcrumbPage(bigCat, smallCat, articleId);
  const thumbPath = `${imageDir}${articleId}_thumb.webp`;
  const toc = getToc(blocks);
  const bodyHtml = blocksToHtml(blocks);
  const tags = memo2 ? memo2.split('/').map(t => t.trim()).filter(Boolean) : [];
  const metaDesc = blocks.find(b => b.type === 'p')?.text.replace(/<[^>]+>/g, '').slice(0, 120) ?? '';

  const tocHtml = toc.map(item => `                    <li>${item}<\/li>`).join('\n');
  const tagHtml = tags.map(t => `                    <span class="article-tag">${t}<\/span>`).join('\n');

  return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>${title} | ナレッジ<\/title>
    <meta name="description" content="${metaDesc}">
    <link rel="canonical" href="${canonicalUrl}">

    <link rel="stylesheet" href="/assets/css/template.css">
    <link rel="stylesheet" href="/assets/css/header.css">
    <link rel="stylesheet" href="/assets/css/howto.css">
    <link rel="stylesheet" href="/assets/css/article-unified.css">

    <script src="/assets/js/template.js" defer><\/script>
<\/head>
<body class="howto-article">
    <div id="site-header"><\/div>

    <div id="breadcrumb-container" data-page="${breadcrumbPage}"><\/div>

    <main class="main-content">
        <div class="article-container">
            <header class="article-header">
                <h1 class="article-title">${title}<\/h1>
                <div class="article-meta">${updatedAt}<\/div>
                <div class="article-tag-list">
${tagHtml}
                <\/div>
            <\/header>

            <div class="article-image-container">
                <img src="${thumbPath}" alt="${title}" class="article-image" style="max-width: 100%;">
            <\/div>

            <section class="article-section fade-in">
                <h2 class="article-section-title">目次<\/h2>
                <ol class="article-list">
${tocHtml}
                <\/ol>
            <\/section>

            <div class="divider"><\/div>

            <section class="article-section fade-in">
${bodyHtml}
            <\/section>

            <div class="divider"><\/div>

            <section class="related-articles fade-in">
                <h3 class="article-section-title">関連記事<\/h3>
                <div class="related-articles-grid"><\/div>
            <\/section>

            <div class="divider"><\/div>
            <div id="profile-container" class="fade-in"><\/div>
        <\/div>
    <\/main>

    <div id="site-footer"><\/div>

    <script src="/assets/js/main.js"><\/script>
    <script src="/assets/js/insights.js"><\/script>
    <script src="/assets/js/insights-related.js"><\/script>
<\/body>
<\/html>
`;
}

function generateInsightsPillarHtml(article, blocks) {
  const { title, smallCat, bigCat, updatedAt, memo2 } = article;
  const imageDir = getImageDir(bigCat, smallCat);
  const canonicalUrl = `https://a-inc.info${getArticleUrl(bigCat, smallCat, '')}`;
  const breadcrumbPage = getBreadcrumbPage(bigCat, smallCat, '');
  const thumbPath = `${imageDir}pillar_thumb.webp`;
  const toc = getToc(blocks);
  const bodyHtml = blocksToHtml(blocks);
  const tags = memo2 ? memo2.split('/').map(t => t.trim()).filter(Boolean) : [];
  const metaDesc = blocks.find(b => b.type === 'p')?.text.replace(/<[^>]+>/g, '').slice(0, 120) ?? '';

  const tocHtml = toc.map(item => `                    <li>${item}<\/li>`).join('\n');
  const tagHtml = tags.map(t => `                    <span class="article-tag">${t}<\/span>`).join('\n');

  return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>${title} | ナレッジ<\/title>
    <meta name="description" content="${metaDesc}">
    <link rel="canonical" href="${canonicalUrl}">

    <link rel="stylesheet" href="/assets/css/template.css">
    <link rel="stylesheet" href="/assets/css/header.css">
    <link rel="stylesheet" href="/assets/css/howto.css">
    <link rel="stylesheet" href="/assets/css/article-unified.css">

    <script src="/assets/js/template.js" defer><\/script>
<\/head>
<body class="howto-article">
    <div id="site-header"><\/div>

    <div id="breadcrumb-container" data-page="${breadcrumbPage}"><\/div>

    <main class="main-content">
        <div class="article-container">
            <header class="article-header">
                <h1 class="article-title">${title}<\/h1>
                <div class="article-meta">テーマ：${smallCat}<\/div>
                <div class="article-tag-list">
${tagHtml}
                <\/div>
            <\/header>

            <div class="article-image-container">
                <img src="${thumbPath}" alt="${title}" class="article-image" style="max-width: 100%;">
            <\/div>

            <section class="article-section fade-in">
                <h2 class="article-section-title">目次<\/h2>
                <ol class="article-list">
${tocHtml}
                <\/ol>
            <\/section>

            <div class="divider"><\/div>

            <section class="article-section fade-in">
${bodyHtml}
            <\/section>

            <div class="divider"><\/div>

            <section class="related-articles fade-in">
                <h3 class="article-section-title">関連記事<\/h3>
                <div class="related-articles-grid"><\/div>
            <\/section>

            <div class="divider"><\/div>
            <div id="profile-container" class="fade-in"><\/div>
        <\/div>
    <\/main>

    <div id="site-footer"><\/div>

    <script src="/assets/js/main.js"><\/script>
    <script src="/assets/js/insights.js"><\/script>
    <script src="/assets/js/insights-related.js"><\/script>
<\/body>
<\/html>
`;
}

function generateHtml(article, blocks) {
  const { bigCat, articleId } = article;
  if (bigCat === 'insights') {
    return articleId
      ? generateInsightsClusterHtml(article, blocks)
      : generateInsightsPillarHtml(article, blocks);
  }
  return generateInsightsClusterHtml(article, blocks);
}

function getOutputPath(siteRoot, bigCat, smallCat, articleId) {
  const url = getArticleUrl(bigCat, smallCat, articleId);
  return `${siteRoot}${url}index.html`;
}

module.exports = { generateHtml, getOutputPath, getArticleUrl, getImageDir };
