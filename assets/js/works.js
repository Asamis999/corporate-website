/**
 * 実績事例ページの機能を管理するスクリプト
 */
document.addEventListener('DOMContentLoaded', function() {
  const WORK_DETAIL_CACHE_VERSION = 'v2';
  // URLパラメータの取得
  function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }
  
  // 実績事例データ
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
      category: 'shopify',
      title: 'ミシュランシェフ厳選のセクトショップ｜Shopify',
      summary: '“一流の味を自宅で楽しむ” 高級感と使いやすさを両立したECサイト設計',
      image: '../assets/images/works/5star/portfolio_5star-top.webp',
      alt: 'ミシュランシェフ厳選のセクトショップ｜Shopify',
      url: 'shopify/5star-ec/'
    },
    {
      category: ['landing-page', 'shopify'],
      title: '羽釜×土鍋のハイブリッドかまどごはん（つむぎ釜）',
      summary: 'Shopifyで制作した、かまどごはんを家庭で簡単に実現する調理器具のLP',
      image: '../assets/images/works/tsumugi/portfolio_tsumugi-top.webp',
      alt: '羽釜×土鍋のハイブリッドかまどごはん（つむぎ釜）',
      url: 'lp/tsumugi/'
    },
    {
      category: 'landing-page',
      title: '中小製造業向けECサポート事業（BtoB）｜WIXで制作',
      summary: 'BtoB集客に特化したEC支援LP × LINE × 広告最適化LPOでリード獲得を強化',
      image: '../assets/images/works/ecbrain/portfolio_ecb-top.webp',
      alt: '中小製造業向けECサポート事業（BtoB）｜WIXで制作',
      url: 'lp/lp-ecb/'
    },
    {
      category: 'landing-page',
      title: '底から洗える大容量タンブラー（FlippingCup）｜WordPressで制作',
      summary: 'クラウドファンディング成功に向けた事前集客LP（LINE誘導含む）',
      image: '../assets/images/works/fpcup/portfolio_fpcup-top.webp',
      alt: '底から洗える大容量タンブラー（FlippingCup）｜WordPressで制作',
      url: 'lp/lp-fpcup/'
    },
    {
      category: 'landing-page',
      title: 'サロン向け開店支援事業（BtoB）｜WIXで制作',
      summary: 'BtoB集客に特化したLP × LINE活用で開業相談リードの獲得',
      image: '../assets/images/works/kaminego/portfolio_kaminego-top.webp',
      alt: 'サロン向け開店支援事業（BtoB）｜WIXで制作',
      url: 'lp/lp-kaminego/'
    },
    {
      category: 'landing-page',
      title: '美容商材OEM事業（BtoB)｜WIXで制作',
      summary: 'BtoB集客に特化したLPで、リード獲得向上を',
      image: '../assets/images/works/oembank/portfolio_oemb-top.webp',
      alt: '美容商材OEM事業（BtoB)｜WIXで制作',
      url: 'lp/lp-oemb/'
    },
    {
      category: 'landing-page',
      title: '白髪ぼかしトリートメント｜WIXで作成',
      summary: 'ストーリー設計を重視した集客LPとステップLINEの構築',
      image: '../assets/images/works/yakujo-b/portfolio_yakujo-b-top.webp',
      alt: '白髪ぼかしトリートメント｜WIXで作成',
      url: 'lp/lp-yakujo-b/'
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
      category: ['landing-page', 'shopify'],
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
  ];

  // HOME等でも利用できるようにエクスポート（グローバル）
  window.worksData = worksData;

  function resolveWorkHref(workUrl) {
    const isWorksContext = document.body.classList.contains('works-page') || !!document.querySelector('.filter-tabs');
    if (isWorksContext) return workUrl;
    return `works/${workUrl}`;
  }

  function renderWorksIntoGrid(worksGrid, works, options) {
    if (!worksGrid) return;
    worksGrid.innerHTML = '';

    works.forEach(work => {
      const primaryCategory = Array.isArray(work.category) ? work.category[0] : work.category;
      const badgeText = primaryCategory === 'landing-page'
        ? 'LP'
        : primaryCategory.charAt(0).toUpperCase() + primaryCategory.slice(1);

      const href = resolveWorkHref(work.url);
      const workItem = document.createElement('div');
      workItem.className = 'work-item';
      workItem.setAttribute('data-category', primaryCategory);
      workItem.setAttribute('data-work-url', href);

      const showSummary = !(options && options.hideSummary);
      workItem.innerHTML = `
        <a href="${href}" class="work-link">
          <div class="work-image">
            <img src="${work.image}" alt="${work.alt}" width="400" height="300">
            <span class="badge badge-accent">${badgeText}</span>
          </div>
          <div class="work-content">
            <h3 class="work-title">${work.title}</h3>
            ${showSummary ? `<p class=\"work-summary\">${work.summary}</p>` : ''}
          </div>
        </a>
      `;

      worksGrid.appendChild(workItem);
    });

    hydrateWorkCardImagesFromDetailPages(worksGrid);
  }
  
  const isWorksListingPage = document.body.classList.contains('works-page') || !!document.querySelector('.filter-tabs');
  const isHomeWorksSection = !!document.querySelector('.works-section .works-grid[data-source="worksData"]');

  // HOME: worksDataから最新N件を描画
  if (!isWorksListingPage && isHomeWorksSection) {
    const homeGrid = document.querySelector('.works-section .works-grid[data-source="worksData"]');
    const limit = parseInt(homeGrid.getAttribute('data-limit') || '3', 10) || 3;
    const latestWorks = worksData.slice(0, limit);
    renderWorksIntoGrid(homeGrid, latestWorks, { hideSummary: false });
    initLightbox();
    return;
  }

  // /works/ページ以外は何もしない
  if (!isWorksListingPage) {
    initLightbox();
    return;
  }

  // 現在のページと表示数の設定
  const currentPage = parseInt(getUrlParameter('page')) || 1;
  const itemsPerPage = 6; // 1ページあたりの表示件数
  let currentCategory = 'all'; // 現在のカテゴリー
  
  // 実績事例を表示する関数
  function displayWorks(page, category) {
    const worksGrid = document.querySelector('.works-grid');
    
    // フィルタリングされたデータを取得
    const filteredWorks = category === 'all'
      ? worksData
      : worksData.filter(work => {
          if (Array.isArray(work.category)) return work.category.includes(category);
          return work.category === category;
        });
    
    // ページネーション用に分割
    const totalPages = Math.ceil(filteredWorks.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredWorks.length);
    const currentWorks = filteredWorks.slice(startIndex, endIndex);
    
    renderWorksIntoGrid(worksGrid, currentWorks, { hideSummary: false });
    
    // ページネーション更新
    updatePagination(page, totalPages, category);
  }

  /**
   * 実績事例詳細ページのトップ画像(.work-detail-image img)を取得し、一覧カードの画像を上書き
   * - 取得できない場合は worksData.image をそのまま表示
   * - 相対パスはURL解決して絶対パス化
   */
  function hydrateWorkCardImagesFromDetailPages(worksGrid) {
    if (!worksGrid) return;

    const items = worksGrid.querySelectorAll('.work-item[data-work-url]');
    if (!items.length) return;

    items.forEach(item => {
      const detailUrlRaw = item.getAttribute('data-work-url');
      const imgEl = item.querySelector('.work-image img');
      const titleEl = item.querySelector('.work-title');
      const summaryEl = item.querySelector('.work-summary');
      if (!detailUrlRaw || !imgEl) return;

      let detailUrl;
      try {
        detailUrl = new URL(detailUrlRaw, window.location.href).toString();
      } catch (e) {
        return;
      }

      // 連打/ページングで同じURLを何度も取りに行かないための簡易キャッシュ
      const cacheKey = `work-detail:${WORK_DETAIL_CACHE_VERSION}:${detailUrl}`;
      try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          // 新形式: JSON { image, title, summary }
          if (cached.trim().startsWith('{')) {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.image) {
              imgEl.src = parsed.image;
            }
            if (parsed && parsed.title && titleEl) {
              titleEl.textContent = parsed.title;
            }
            if (parsed && parsed.summary && summaryEl) {
              summaryEl.textContent = parsed.summary;
            }
          } else {
            // 旧形式: 画像URLのみ
            imgEl.src = cached;
          }
          return;
        }
      } catch (e) {
        // sessionStorageが使えない環境でも動作させる
      }

      fetch(detailUrl)
        .then(res => {
          if (!res.ok) throw new Error(`Failed to fetch: ${detailUrl}`);
          return res.text();
        })
        .then(html => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const topImg = doc.querySelector('.work-detail-image img');
          const detailTitle = doc.querySelector('h1.work-detail-title');
          const detailDesc = doc.querySelector('meta[name="description"]');

          let resolvedImage = '';
          if (topImg) {
            const src = topImg.getAttribute('src');
            if (src) {
              resolvedImage = new URL(src, detailUrl).toString();
              imgEl.src = resolvedImage;
            }
          }

          const resolvedTitle = detailTitle ? (detailTitle.textContent || '').trim() : '';
          if (resolvedTitle && titleEl) {
            titleEl.textContent = resolvedTitle;
          }

          const resolvedSummary = detailDesc ? (detailDesc.getAttribute('content') || '').trim() : '';
          if (resolvedSummary && summaryEl) {
            summaryEl.textContent = resolvedSummary;
          }

          try {
            const payload = {
              image: resolvedImage,
              title: resolvedTitle,
              summary: resolvedSummary
            };
            sessionStorage.setItem(cacheKey, JSON.stringify(payload));
          } catch (e) {
            // noop
          }
        })
        .catch(() => {
          // 取得できない場合は何もしない（初期表示のworksData.imageが残る）
        });
    });
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
