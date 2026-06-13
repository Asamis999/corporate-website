document.addEventListener('DOMContentLoaded', () => {
  if (typeof articlesData === 'undefined' || !Array.isArray(articlesData)) return;

  const breadcrumb = document.getElementById('breadcrumb-container');
  const currentId = breadcrumb?.getAttribute('data-page');
  if (!currentId) return;

  let currentArticle = articlesData.find(a => a.id === currentId);
  // デプロイ前プレビュー用フォールバック: HTMLに埋め込まれたデータを使用
  if (!currentArticle && window.__currentArticle?.id === currentId) {
    currentArticle = window.__currentArticle;
  }
  if (!currentArticle) return;

  const relatedSection = document.querySelector('section.related-articles');
  if (!relatedSection) return;

  const currentTags = Array.isArray(currentArticle.tags) ? currentArticle.tags : [];
  const currentClusterId = currentArticle.clusterId;

  const candidates = articlesData
    .filter(a => a && a.category === currentArticle.category)
    .filter(a => a.id !== currentId);

  const scored = candidates.map(a => {
    const tags = Array.isArray(a.tags) ? a.tags : [];
    const sharedTagCount = currentTags.filter(t => tags.includes(t)).length;

    let score = sharedTagCount * 10;

    if (currentClusterId && a.clusterId && a.clusterId === currentClusterId) {
      score += 100;
    }

    if (a.type && currentArticle.type && a.type === currentArticle.type) {
      score += 5;
    }

    return { article: a, score };
  });

  const related = scored
    .sort((x, y) => y.score - x.score)
    .map(x => x.article)
    .slice(0, 3);

  if (related.length === 0) return;

  const grid = relatedSection.querySelector('.related-articles-grid') || relatedSection;
  grid.innerHTML = '';

  related.forEach(a => {
    const link = document.createElement('a');
    link.href = a.url;
    link.className = 'related-article-card';

    const imageWrap = document.createElement('div');
    imageWrap.className = 'related-article-image';

    const img = document.createElement('img');
    img.src = a.image;
    img.alt = a.title;

    imageWrap.appendChild(img);

    const title = document.createElement('h4');
    title.className = 'related-article-title';
    title.textContent = a.title;

    link.appendChild(imageWrap);
    link.appendChild(title);

    grid.appendChild(link);
  });
});
