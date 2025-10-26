/**
 * Howto BOX用のJavaScript
 */

// 記事データ（新しい記事を追加する場合はここに追加）
const articlesData = [
  {
    id: 'article1',
    title: 'WEBマーケ×クリエイティブ戦略で売上UP！',
    excerpt: '専門家が教える、アクセスはあるのに売れない悩みを解決する方法。実例とデータから学ぶ改善施策を徹底解説します。',
    url: '/howto/posts/article/article1/',
    image: '/assets/images/howto/article1_thumb.png',
    date: '2025.05.09',
    tags: ['web集客', 'マーケティング', 'クリエイティブ'],
    category: 'article',
    featured: true,
    type: 'pillar'
  },
  {
    id: 'article2',
    title: '静岡＆神奈川でWeb制作を依頼するなら？',
    excerpt: 'ECサイト制作とマーケ戦略を同時に考える方法。地域特性を活かした成功事例と依頼先選びの重要ポイントを解説します。',
    url: '/howto/posts/article/article2/',
    image: '/assets/images/howto/article2_thumb.png',
    date: '2025.05.09',
    tags: ['web集客', 'マーケティング', 'ECサイト制作'],
    category: 'article'
  },
  {
    id: 'article3',
    title: 'Shopify導入の決め手！メニューカスタマイズで売上2倍も可能な理由',
    excerpt: 'Shopifyのメニューカスタマイズとクリエイティブ戦略で成果を出す方法。実践事例と共に解説します。',
    url: '/howto/posts/article/article3/',
    image: '/assets/images/howto/article3_thumb.webp',
    date: '2025.06.05',
    tags: ['Shopify', 'ECサイト', 'マーケファネル'],
    category: 'article',
    badge: 'CRO'
  },
  {
    id: 'article4',
    title: 'Wixサイト制作を始める前に！ホームページを売上につなげる"Webマーケ×クリエイティブ"の考え方',
    excerpt: 'Wixでのサイト制作とクリエイティブ戦略で成果を出す方法。実践事例と共に解説します。',
    url: '/howto/posts/article/article4/',
    image: '/assets/images/howto/article4_thumb.webp',
    date: '2025.06.01',
    tags: ['Wix', 'LP改善・最適化', 'ECサイト運営'],
    category: 'article',
    badge: 'Wix'
  },
  {
    id: 'article5',
    title: '広告代理店を選ぶ前に知りたい！Web制作とマーケ支援を一体化するメリット',
    excerpt: 'Web制作と広告運用を一体化することで得られるメリットと、実際の改善事例を紹介します。',
    url: '/howto/posts/article/article5/',
    image: '/assets/images/howto/article5_thumb.webp',
    date: '2025.06.10',
    tags: ['Webマーケティング', 'LP改善', 'ECサイト制作・運営'],
    category: 'article'
  },
  {
    id: 'article6',
    title: 'EC LPで"売れない"を解決！クリエイティブ×マーケで実現するCVR向上術',
    excerpt: 'ECランディングページの課題を解決し、CVRを向上させるクリエイティブ×マーケティングの実践手法を解説します。',
    url: '/howto/posts/article/article6/',
    image: '/assets/images/howto/article6_thumb.webp',
    date: '2025.06.15',
    tags: ['Webマーケティング', 'クリエイティブ戦略'],
    category: 'article'
  },
  {
    id: 'wix1',
    title: 'Wix Studio 運用マニュアル｜01. はじめに',
    excerpt: 'Wix Studioの基本的な使い方と運用方法を解説。初めての方でも安心して使えるように、基本操作から応用まで丁寧に説明します。',
    url: '/howto/posts/manual/wix1/',
    image: '/assets/images/manual/wix/wix1-thumb.webp',
    date: '2025.08.01',
    tags: ['Wix Studio', 'マニュアル'],
    category: 'manual',
    badge: 'マニュアル'
  },
  {
    id: 'wix2',
    title: 'Wix Studio 運用マニュアル｜02. 基本操作の前提知識',
    excerpt: 'Wix Studioの基本操作を学ぶ前に知っておきたい前提知識。ログイン方法やエディタの起動方法を解説します。',
    url: '/howto/posts/manual/wix2/',
    image: '/assets/images/manual/wix/wix2-thumb.webp',
    date: '2025.08.02',
    tags: ['Wix Studio', 'マニュアル'],
    category: 'manual',
    badge: 'マニュアル'
  },
  {
    id: 'wix3',
    title: 'Wix Studio 運用マニュアル｜03. テキストやフレームパーツの再利用・編集',
    excerpt: 'Wix Studioでテキストやフレームパーツを複製・編集する方法を解説。効率的なサイト更新のコツを紹介します。',
    url: '/howto/posts/manual/wix3/',
    image: '/assets/images/manual/wix/wix3-thumb.webp',
    date: '2025.08.03',
    tags: ['Wix Studio', 'マニュアル'],
    category: 'manual',
    badge: 'マニュアル'
  },
  {
    id: 'wix4',
    title: 'Wix Studio 運用マニュアル｜04. ページ複製と設定（SEO含む）',
    excerpt: 'Wix Studioでページを複製し、SEO設定を含めた各種設定方法を解説します。',
    url: '/howto/posts/manual/wix4/',
    image: '/assets/images/manual/wix/wix4-thumb.webp',
    date: '2025.08.04',
    tags: ['Wix Studio', 'マニュアル', 'SEO'],
    category: 'manual',
    badge: 'マニュアル'
  },
  {
    id: 'wix5',
    title: 'Wix Studio 運用マニュアル｜05. レスポンシブ編集方法',
    excerpt: 'PCとスマートフォンで最適な表示に調整する方法を解説。レスポンシブ表示のポイントとチェック方法をステップで紹介します。',
    url: '/howto/posts/manual/wix5/',
    image: '/assets/images/manual/wix/wix5-thumb.webp',
    date: '2025.08.10',
    tags: ['Wix Studio', 'マニュアル', 'レスポンシブ'],
    category: 'manual',
    badge: 'マニュアル'
  },
  {
    id: 'wix6',
    title: 'Wix Studio 運用マニュアル｜06. 予約サービス／カレンダー（基本操作）',
    excerpt: 'Wix予約サービスの設定方法と予約カレンダーの管理方法を解説。スタッフ管理や営業時間設定など、予約システムの基本操作を紹介します。',
    url: '/howto/posts/manual/wix6/',
    image: '/assets/images/manual/wix/wix6-thumb.webp',
    date: '2025.08.13',
    tags: ['Wix Studio', 'マニュアル', '予約システム'],
    category: 'manual',
    badge: 'マニュアル'
  },
  {
    id: 'wix7',
    title: 'Wix Studio 運用マニュアル｜07. EC商品の編集と複製登録（Wixストア）',
    excerpt: 'Wixストアでの商品編集と複製登録の方法を解説。効率的な商品管理のコツを紹介します。',
    url: '/howto/posts/manual/wix7/',
    image: '/assets/images/manual/wix/wix7-thumb.webp',
    date: '2025.08.15',
    tags: ['Wix Studio', 'マニュアル', 'ECサイト'],
    category: 'manual',
    badge: 'マニュアル'
  },
  {
    id: 'wix8',
    title: 'Wix Studio 運用マニュアル｜08. ブログ記事の作成と設定',
    excerpt: 'Wix Studioでブログ記事を作成・編集する方法を解説。カテゴリー設定やSEO設定など、ブログ運用の基本を紹介します。',
    url: '/howto/posts/manual/wix8/',
    image: '/assets/images/manual/wix/wix8-thumb.webp',
    date: '2025.08.18',
    tags: ['Wix Studio', 'マニュアル', 'ブログ'],
    category: 'manual',
    badge: 'マニュアル'
  }
];

// カテゴリーフィルター機能
document.addEventListener('DOMContentLoaded', function() {
  // 記事を動的に読み込む
  loadArticles();
  
  const filterTabs = document.querySelectorAll('.filter-tab');
  const articles = document.querySelectorAll('.article-item');
  
  // フィルタータブのクリックイベント
  filterTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const category = this.getAttribute('data-category');
      
      // アクティブクラスの切り替え
      filterTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      // 記事の表示/非表示切り替え
      articles.forEach(article => {
        if (category === 'all') {
          article.style.display = 'block';
        } else {
          if (article.getAttribute('data-category') === category) {
            article.style.display = 'block';
          } else {
            article.style.display = 'none';
          }
        }
      });
    });
  });
  
  // スマホ表示のカルーセル機能の初期化
  initCategoryCarousel();
});

/**
 * 課題別セクションのカルーセル機能
 * スマホ表示時のみ動作
 */
function initCategoryCarousel() {
  // 新しいHTML構造に合わせて要素を取得
  const categoryGrid = document.querySelector('.category-grid');
  const categoryRows = document.querySelectorAll('.category-row');
  const prevButton = document.querySelector('.carousel-prev');
  const nextButton = document.querySelector('.carousel-next');
  const dotsContainer = document.querySelector('.carousel-dots');
  const carouselNav = document.querySelector('.carousel-nav');
  const cards = document.querySelectorAll('.category-card');
  
  if (!categoryGrid || !categoryRows.length || !prevButton || !nextButton || !dotsContainer || !cards.length || !carouselNav) return;
  
  let currentRow = 0; // 現在表示中の行
  let isMobile = false;
  
  // ドットの生成
  function createDots() {
    dotsContainer.innerHTML = '';
    const totalDots = categoryRows.length; // 行の数だけドットを作成
    
    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement('span');
      dot.classList.add('carousel-dot');
      if (i === currentRow) dot.classList.add('active');
      dot.addEventListener('click', () => switchRow(i));
      dotsContainer.appendChild(dot);
    }
  }
  
  // 行を切り替え
  function switchRow(rowIndex) {
    currentRow = rowIndex;
    
    // すべての行を一旦非表示に
    categoryRows.forEach((row, idx) => {
      if (idx === currentRow) {
        // 選択した行だけ表示
        row.style.display = 'flex';
      } else {
        row.style.display = 'none';
      }
    });
    
    // ドットのアクティブ状態を更新
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentRow);
    });
  }
  
  // 前の行へ
  function movePrev() {
    let prevRow = currentRow - 1;
    if (prevRow < 0) prevRow = categoryRows.length - 1;
    switchRow(prevRow);
  }
  
  // 次の行へ
  function moveNext() {
    let nextRow = currentRow + 1;
    if (nextRow >= categoryRows.length) nextRow = 0;
    switchRow(nextRow);
  }
  
  // レスポンシブ設定
  function updateCarouselSettings() {    
    // スマホかデスクトップか判定
    if (window.innerWidth < 768) {
      // スマホ表示
      isMobile = true;
      enableCarousel();
    } else {
      // タブレット・デスクトップ表示
      isMobile = false;
      disableCarousel();
    }
  }
    
    // カルーセル機能を有効化
  function enableCarousel() {
    // 最初は最初の行のみを表示
    categoryRows.forEach((row, idx) => {
      if (idx === 0) {
        row.style.display = 'flex';
      } else {
        row.style.display = 'none';
      }
    });

    // カルーセルナビゲーションを表示
    carouselNav.style.display = 'flex';
    prevButton.style.display = 'flex';
    nextButton.style.display = 'flex';
    dotsContainer.style.display = 'flex';
    
    // ドットを生成
    createDots();
    
    // 最初の行を表示
    currentRow = 0;
    switchRow(currentRow);
  }
  
  // カルーセル機能を無効化
  function disableCarousel() {
    // すべての行を表示
    categoryRows.forEach(row => {
      row.style.display = 'grid';
    });
    
    // カルーセルナビゲーションを非表示
    carouselNav.style.display = 'none';
  }
  
  // イベントリスナーの設定
  prevButton.addEventListener('click', movePrev);
  nextButton.addEventListener('click', moveNext);
  window.addEventListener('resize', updateCarouselSettings);
  
  // 初期化
  updateCarouselSettings();
}

/**
 * 記事を動的に読み込む関数
 */
function loadArticles() {
  const postsGrid = document.querySelector('.posts-grid');
  if (!postsGrid) return;
  
  // 日付でソート（新しい順）
  const sortedArticles = [...articlesData].sort((a, b) => {
    const dateA = new Date(a.date.replace(/\./g, '-'));
    const dateB = new Date(b.date.replace(/\./g, '-'));
    return dateB - dateA;
  });
  
  // 最新6件を表示
  const latestArticles = sortedArticles.slice(0, 6);
  
  // HTMLをクリア
  postsGrid.innerHTML = '';
  
  // 記事カードを生成
  latestArticles.forEach((article, index) => {
    const articleCard = createArticleCard(article, index === 0);
    postsGrid.appendChild(articleCard);
  });
}

/**
 * 記事カードのHTML要素を生成
 */
function createArticleCard(article, isFirst = false) {
  const articleElement = document.createElement('article');
  articleElement.className = isFirst && article.featured ? 'post-card post-card-featured' : 'post-card';
  
  const link = document.createElement('a');
  link.href = article.url;
  link.className = 'post-link';
  
  // 画像セクション
  const postImage = document.createElement('div');
  postImage.className = 'post-image';
  
  const img = document.createElement('img');
  img.src = article.image;
  img.alt = article.title;
  img.width = 400;
  img.height = 250;
  postImage.appendChild(img);
  
  // タグまたはバッジ
  if (article.featured && isFirst && article.tags) {
    const postTags = document.createElement('div');
    postTags.className = 'post-tags';
    article.tags.forEach(tag => {
      const tagSpan = document.createElement('span');
      tagSpan.className = 'article-tag';
      tagSpan.textContent = tag;
      postTags.appendChild(tagSpan);
    });
    postImage.appendChild(postTags);
    
    if (article.type === 'pillar') {
      const badge = document.createElement('div');
      badge.className = 'badge badge-accent post-featured-badge';
      badge.textContent = 'ピラー記事';
      postImage.appendChild(badge);
    }
  } else if (article.badge) {
    const badge = document.createElement('span');
    badge.className = 'badge badge-primary post-category';
    badge.textContent = article.badge;
    postImage.appendChild(badge);
  }
  
  link.appendChild(postImage);
  
  // コンテンツセクション
  const postContent = document.createElement('div');
  postContent.className = 'post-content';
  
  const title = document.createElement('h3');
  title.className = 'post-title';
  title.textContent = article.title;
  postContent.appendChild(title);
  
  const excerpt = document.createElement('p');
  excerpt.className = 'post-excerpt';
  excerpt.textContent = article.excerpt;
  postContent.appendChild(excerpt);
  
  const postMeta = document.createElement('div');
  postMeta.className = 'post-meta';
  
  const date = document.createElement('time');
  date.className = 'post-date';
  date.textContent = article.date;
  postMeta.appendChild(date);
  
  postContent.appendChild(postMeta);
  link.appendChild(postContent);
  
  articleElement.appendChild(link);
  
  return articleElement;
}
