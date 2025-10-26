/**
 * 制作事例ページの機能を管理するスクリプト
 */
document.addEventListener('DOMContentLoaded', function() {
  // URLパラメータの取得
  function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }
  
  // 制作事例データ
  const worksData = [
    // ページ1の事例
    {
      category: 'shopify',
      title: 'ブラックがコンセプトのコーヒーショップ',
      summary: '珈琲豆専門店のブランド価値を高めるデザインと使いやすいECサイトを構築',
      image: '../assets/images/corporate_sv-shopify.webp',
      alt: 'ブラックがコンセプトのコーヒーショップ',
      url: 'shopify/coffee-shop/'
    },
    {
      category: 'landing-page',
      title: '羽釜×土鍋のハイブリッドかまどごはん（つむぎ釜）',
      summary: 'Shopifyで制作した、かまどごはんを家庭で簡単に実現する調理器具のLP',
      image: '../assets/images/works/tsumugi/portfolio_tsumugi-top.webp',
      alt: '羽釜×土鍋のハイブリッドかまどごはん（つむぎ釜）',
      url: 'lp/tsumugi/'
    },
    {
      category: 'landing-page',
      title: 'ホエイプロテインドリンク（RAPOL）',
      summary: 'Shopifyで制作した、毎日続けられるホエイプロテインドリンクのLP',
      image: '../assets/images/works/rapol/portfolio_rapol-top.webp',
      alt: 'ホエイプロテインドリンク（RAPOL）',
      url: 'lp/rapol/'
    },
    {
      category: 'landing-page',
      title: '男性向けホワイトニング歯磨き粉（SHIROIHA）',
      summary: 'Shopifyで制作した、美白×抗菌の新基準となる男性向け高機能歯磨き粉LP',
      image: '../assets/images/works/shiro-b/portfolio_shiro-b-top.webp',
      alt: '男性向けホワイトニング歯磨き粉（SHIROIHA）',
      url: 'lp/shiro-b/'
    },
    {
      category: 'landing-page',
      title: 'ソムリエサーバー（Vinxper）',
      summary: 'Shopifyで制作した、ワインエアレーターからソムリエサーバーへの新商品LP',
      image: '../assets/images/works/vxp/portfolio_vxp-top.webp',
      alt: 'ソムリエサーバー（Vinxper）',
      url: 'lp/vxp/'
    },
    {
      category: 'landing-page',
      title: '買いたてのスルッと感が長続きするフライパン',
      summary: 'Shopifyで制作した、長期間にわたり調理のストレスを解消するフライパンのLP',
      image: '../assets/images/works/surutto/portfolio_surutto-ec-top.webp',
      alt: 'スルッと感が長続きするフライパン（SURUTTO）',
      url: 'lp/surutto/'
    },
    
    // ページ2の事例（サンプル）
    {
      category: 'amazon',
      title: 'オーガニックコスメブランド',
      summary: 'Amazon A+コンテンツで商品の特長を魅力的に伝えるページデザイン',
      image: '../assets/images/corporate_sv-amazon.webp',
      alt: 'オーガニックコスメブランド',
      url: 'amazon/organic-cosmetics/'
    },
    {
      category: 'rakuten',
      title: '自社ブランドの楽天公式ショップ',
      summary: '楽天市場でのブランディングと集客を強化するショップページデザイン',
      image: '../assets/images/corporate_sv-rakuten.webp',
      alt: '自社ブランドの楽天公式ショップ',
      url: 'rakuten/brand-shop/'
    },
    
    // ページ3の事例（サンプル）
    {
      category: 'shopify',
      title: 'アパレルブランドECサイト',
      summary: 'ブランドの世界観を表現しつつ、商品の魅力が伝わるECサイト',
      image: '../assets/images/corporate_sv-shopify.webp',
      alt: 'アパレルブランドECサイト',
      url: 'shopify/apparel-brand/'
    }
  ];
  
  // 現在のページと表示数の設定
  const currentPage = parseInt(getUrlParameter('page')) || 1;
  const itemsPerPage = 6; // 1ページあたりの表示件数
  let currentCategory = 'all'; // 現在のカテゴリー
  
  // 制作事例を表示する関数
  function displayWorks(page, category) {
    const worksGrid = document.querySelector('.works-grid');
    
    // 制作事例リストを一旦クリア
    worksGrid.innerHTML = '';
    
    // フィルタリングされたデータを取得
    const filteredWorks = category === 'all' 
      ? worksData 
      : worksData.filter(work => work.category === category);
    
    // ページネーション用に分割
    const totalPages = Math.ceil(filteredWorks.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredWorks.length);
    const currentWorks = filteredWorks.slice(startIndex, endIndex);
    
    // 各制作事例をHTMLとして追加
    currentWorks.forEach(work => {
      const workItem = document.createElement('div');
      workItem.className = 'work-item';
      workItem.setAttribute('data-category', work.category);
      
      workItem.innerHTML = `
        <a href="${work.url}" class="work-link">
          <div class="work-image">
            <img src="${work.image}" alt="${work.alt}" width="400" height="300">
            <span class="badge badge-accent">${work.category === 'landing-page' ? 'LP' : work.category.charAt(0).toUpperCase() + work.category.slice(1)}</span>
          </div>
          <div class="work-content">
            <h3 class="work-title">${work.title}</h3>
            <p class="work-summary">${work.summary}</p>
          </div>
        </a>
      `;
      
      worksGrid.appendChild(workItem);
    });
    
    // ページネーション更新
    updatePagination(page, totalPages, category);
  }
  
  // ページネーションを更新する関数
  function updatePagination(currentPage, totalPages, category) {
    const paginationContainer = document.querySelector('.pagination');
    
    // ページ数が1以下なら非表示
    if (totalPages <= 1) {
      paginationContainer.style.display = 'none';
      return;
    }
    
    // 表示するページネーションリンクを生成
    paginationContainer.style.display = 'flex';
    paginationContainer.innerHTML = '';
    
    // 前のページリンク
    if (currentPage > 1) {
      const prevLink = document.createElement('a');
      prevLink.href = `?page=${currentPage - 1}&category=${category}`;
      prevLink.classList.add('prev');
      prevLink.innerHTML = '&laquo; 前へ';
      prevLink.addEventListener('click', function(e) {
        e.preventDefault();
        displayWorks(currentPage - 1, category);
        // URL更新（ページ遷移なし）
        window.history.pushState({}, '', `?page=${currentPage - 1}&category=${category}`);
      });
      paginationContainer.appendChild(prevLink);
    }
    
    // 各ページ番号のリンク
    for (let i = 1; i <= totalPages; i++) {
      if (i === currentPage) {
        // 現在ページはリンクなし
        const current = document.createElement('span');
        current.classList.add('current');
        current.textContent = i;
        paginationContainer.appendChild(current);
      } else {
        // 他ページはリンク付き
        const pageLink = document.createElement('a');
        pageLink.href = `?page=${i}&category=${category}`;
        pageLink.textContent = i;
        pageLink.addEventListener('click', function(e) {
          e.preventDefault();
          displayWorks(i, category);
          // URL更新（ページ遷移なし）
          window.history.pushState({}, '', `?page=${i}&category=${category}`);
        });
        paginationContainer.appendChild(pageLink);
      }
    }
    
    // 次のページリンク
    if (currentPage < totalPages) {
      const nextLink = document.createElement('a');
      nextLink.href = `?page=${currentPage + 1}&category=${category}`;
      nextLink.classList.add('next');
      nextLink.innerHTML = '次へ &raquo;';
      nextLink.addEventListener('click', function(e) {
        e.preventDefault();
        displayWorks(currentPage + 1, category);
        // URL更新（ページ遷移なし）
        window.history.pushState({}, '', `?page=${currentPage + 1}&category=${category}`);
      });
      paginationContainer.appendChild(nextLink);
    }
  }
  
  // フィルタータブの機能
  const filterTabs = document.querySelectorAll('.filter-tab');
  
  // フィルタータブのクリックイベント
  filterTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // アクティブクラスの切替
      filterTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      // フィルターカテゴリの取得
      currentCategory = this.getAttribute('data-category');
      
      // ページリセットして再表示
      displayWorks(1, currentCategory);
      window.history.pushState({}, '', `?page=1&category=${currentCategory}`);
    });
  });
  
  // ギャラリー画像のライトボックス機能（詳細ページ用）
  function initLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item img');
    if (galleryItems.length > 0) {
      galleryItems.forEach(item => {
        item.addEventListener('click', function() {
          const imgSrc = this.getAttribute('src');
          const lightbox = document.createElement('div');
          lightbox.classList.add('lightbox');
          
          lightbox.innerHTML = `
            <div class="lightbox-inner">
              <button class="lightbox-close">&times;</button>
              <img src="${imgSrc}" alt="拡大画像">
            </div>
          `;
          
          document.body.appendChild(lightbox);
          document.body.style.overflow = 'hidden';
          
          // 閉じるボタンのイベントリスナー
          lightbox.querySelector('.lightbox-close').addEventListener('click', function() {
            document.body.removeChild(lightbox);
            document.body.style.overflow = '';
          });
          
          // 背景クリックで閉じる
          lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
              document.body.removeChild(lightbox);
              document.body.style.overflow = '';
            }
          });
        });
      });
    }
  }
  
  // URLからパラメータを取得して初期表示
  const urlCategory = getUrlParameter('category') || 'all';
  const urlPage = parseInt(getUrlParameter('page')) || 1;
  
  // カテゴリータブの初期選択状態設定
  filterTabs.forEach(tab => {
    if (tab.getAttribute('data-category') === urlCategory) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
  
  // 初期表示実行
  currentCategory = urlCategory;
  displayWorks(urlPage, currentCategory);
  
  // サイトのナビゲーション機能に対応（ブラウザの戻るボタンと進むボタン）
  window.addEventListener('popstate', function() {
    const newCategory = getUrlParameter('category') || 'all';
    const newPage = parseInt(getUrlParameter('page')) || 1;
    
    // カテゴリータブの更新
    filterTabs.forEach(tab => {
      if (tab.getAttribute('data-category') === newCategory) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
    
    // 表示更新
    currentCategory = newCategory;
    displayWorks(newPage, currentCategory);
  });
  
  // ライトボックス初期化
  initLightbox();
});
