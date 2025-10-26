/**
 * サイト共通のJavaScript機能を定義するファイル
 */
document.addEventListener('DOMContentLoaded', function() {
    // モバイルメニューのトグル機能
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            const expanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !expanded);
            mobileMenu.hidden = expanded;
            
            // メニューボタンのアクティブ状態を切り替え
            this.classList.toggle('active');
            
            // ボディのスクロールをロック/解除
            document.body.classList.toggle('menu-open');
        });
    }
    
    // スクロール時のヘッダー挙動
    let lastScrollTop = 0;
    const header = document.querySelector('.site-header');
    
    if (header) {
        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > lastScrollTop && scrollTop > 50) {
                // 下方向スクロール時
                header.classList.add('header-hidden');
            } else {
                // 上方向スクロール時
                header.classList.remove('header-hidden');
            }
            
            lastScrollTop = scrollTop;
        });
    }
});
