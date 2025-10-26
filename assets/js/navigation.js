/**
 * ナビゲーション制御用JavaScript
 */
document.addEventListener('DOMContentLoaded', function() {
  // 要素の取得
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const header = document.querySelector('.site-header');
  
  // ヘッダー固定のためのスクロール検出
  let lastScrollTop = 0;
  
  // メニュートグル機能
  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener('click', function() {
      const expanded = this.getAttribute('aria-expanded') === 'true';
      
      // 状態を反転
      this.setAttribute('aria-expanded', !expanded);
      mobileMenu.hidden = expanded;
      
      // bodyのスクロールを制御
      document.body.classList.toggle('menu-open');
      
      // トグルボタンのアクティブ状態を切り替え
      this.classList.toggle('active');
    });
    
    // モバイルメニューの各リンクをクリックしたらメニューを閉じる
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', function() {
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mobileMenu.hidden = true;
        document.body.classList.remove('menu-open');
        mobileMenuToggle.classList.remove('active');
      });
    });
  }
  
  // スクロールによるヘッダー制御
  window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // スクロール方向を検出
    if (scrollTop > lastScrollTop && scrollTop > 200) {
      // 下にスクロール - ヘッダーを隠す
      header.classList.add('header-hidden');
    } else {
      // 上にスクロール - ヘッダーを表示
      header.classList.remove('header-hidden');
    }
    
    // スクロール位置に応じたヘッダースタイル変更
    if (scrollTop > 50) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }
    
    lastScrollTop = scrollTop;
  });
  
  // インクルードヘッダー・フッターの読み込み処理
  loadIncludes();
});

/**
 * ヘッダー・フッターをインクルード
 */
function loadIncludes() {
  const headerContainer = document.getElementById('site-header');
  const footerContainer = document.getElementById('site-footer');
  const breadcrumbContainer = document.getElementById('breadcrumb-container');
  
  // ヘッダーの読み込み
  if (headerContainer) {
    fetch('/includes/header-include.html')
      .then(response => {
        // エラー処理を改善
        if (!response.ok) {
          return Promise.reject('Header file not found');
        }
        return response.text();
      })
      .then(data => {
        headerContainer.innerHTML = data;
        
        // ヘッダー読み込み後のイベント処理
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileMenuToggle && mobileMenu) {
          mobileMenuToggle.addEventListener('click', function() {
            const expanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !expanded);
            mobileMenu.hidden = expanded;
            document.body.classList.toggle('menu-open');
            this.classList.toggle('active');
          });
        }
      })
      .catch(error => {
        console.warn('ヘッダー読み込みエラー - 無視して続行:', error);
        // エラー表示を抑制して空の要素を追加
        headerContainer.innerHTML = '<div class="site-header"><div class="container"></div></div>';
      });
  }
  
  // フッターの読み込み
  if (footerContainer) {
    fetch('/includes/footer-include.html')
      .then(response => response.text())
      .then(data => {
        footerContainer.innerHTML = data;
      })
      .catch(error => console.error('フッター読み込みエラー:', error));
  }
  
  // パンくずリストの読み込み
  if (breadcrumbContainer) {
    const page = breadcrumbContainer.dataset.page || '';
    
    fetch(`/includes/breadcrumb-${page}.html`)
      .then(response => {
        if (!response.ok) {
          // ファイルが見つからない場合は空にする
          breadcrumbContainer.style.display = 'none';
          return Promise.reject('Breadcrumb file not found');
        }
        return response.text();
      })
      .then(data => {
        if (data && data.trim()) {
          breadcrumbContainer.innerHTML = data;
          breadcrumbContainer.style.display = '';
        } else {
          breadcrumbContainer.style.display = 'none';
        }
      })
      .catch(error => {
        console.warn('パンくずリスト読み込みエラー - 非表示にします:', error);
        breadcrumbContainer.style.display = 'none';
      });
  }
}
