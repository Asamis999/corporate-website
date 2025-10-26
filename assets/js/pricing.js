document.addEventListener('DOMContentLoaded', function() {
    /**
     * シンプルなタブ切り替え機能
     */
    function initTabs() {
        const tabNavItems = document.querySelectorAll('.tabs-nav li');
        const tabPanes = document.querySelectorAll('section.tab-pane');
        
        console.log('タブ数:', tabNavItems.length);
        console.log('タブコンテンツ数:', tabPanes.length);
        
        // 最初は全てのタブコンテンツを非表示
        tabPanes.forEach(pane => {
            pane.style.display = 'none';
        });
        
        // タブクリックイベント設定
        tabNavItems.forEach(tab => {
            tab.addEventListener('click', function() {
                const targetId = this.getAttribute('data-target');
                console.log('クリックされたタブ:', targetId);
                
                // アクティブクラスの切り替え
                tabNavItems.forEach(item => item.classList.remove('active'));
                this.classList.add('active');
                
                // コンテンツの表示切り替え
                tabPanes.forEach(pane => {
                    pane.style.display = 'none';
                });
                
                const targetPane = document.getElementById(targetId);
                if (targetPane) {
                    targetPane.style.display = 'block';
                }
            });
        });
        
        // 初期状態では最初のタブを表示
        if (tabNavItems.length > 0 && tabPanes.length > 0) {
            tabNavItems[0].classList.add('active');
            tabPanes[0].style.display = 'block';
        }
    }
    
    /**
     * サブタブ切り替え機能
     */
    function initSubtabs() {
        // 旧式のサブタブナビゲーション
        const subtabSets = document.querySelectorAll('.subtab-navigation');
        
        subtabSets.forEach(subtabSet => {
            const subtabs = subtabSet.querySelectorAll('li');
            const parentSection = subtabSet.closest('section');
            const subtabPanes = parentSection.querySelectorAll('.subtab-pane');
            
            // 最初は全てのサブタブコンテンツを非表示（最初のサブタブだけ表示）
            subtabPanes.forEach((pane, index) => {
                pane.style.display = index === 0 ? 'block' : 'none';
            });
            
            // サブタブの最初の項目をアクティブに
            if (subtabs.length > 0) {
                subtabs[0].classList.add('active');
            }
            
            // サブタブクリックイベント設定
            subtabs.forEach(subtab => {
                subtab.addEventListener('click', function() {
                    const targetId = this.getAttribute('data-subtab');
                    
                    // アクティブクラスの切り替え
                    subtabs.forEach(item => item.classList.remove('active'));
                    this.classList.add('active');
                    
                    // サブタブコンテンツの表示切り替え
                    subtabPanes.forEach(pane => {
                        pane.style.display = 'none';
                    });
                    
                    const targetPane = document.getElementById(targetId);
                    if (targetPane) {
                        targetPane.style.display = 'block';
                    }
                });
            });
        });
        
        // 新式のサブタブナビゲーション
        const newSubtabNavs = document.querySelectorAll('.subtab-nav');
        
        newSubtabNavs.forEach(navSet => {
            const subtabLinks = navSet.querySelectorAll('.subtab-link');
            const parentSection = navSet.closest('section');
            
            if (!parentSection) return;
            
            const subtabPanes = parentSection.querySelectorAll('.subtab-pane');
            
            // サブタブリンククリックイベント設定
            subtabLinks.forEach(link => {
                link.addEventListener('click', function() {
                    const targetId = this.getAttribute('data-target');
                    
                    // アクティブクラスの切り替え
                    subtabLinks.forEach(item => item.classList.remove('active'));
                    this.classList.add('active');
                    
                    // サブタブコンテンツの表示切り替え
                    subtabPanes.forEach(pane => {
                        pane.classList.remove('active');
                    });
                    
                    const targetPane = document.getElementById(targetId);
                    if (targetPane) {
                        targetPane.classList.add('active');
                    }
                });
            });
        });
    }
    
    /**
     * カルーセル機能（モバイル表示用）
     */
    function initCarousels() {
        const carousels = document.querySelectorAll('.pricing-cards-wrapper');
        
        carousels.forEach(carousel => {
            const prevBtn = carousel.querySelector('.carousel-prev');
            const nextBtn = carousel.querySelector('.carousel-next');
            const cards = carousel.querySelectorAll('.modern-card, .pricing-card');
            const cardsContainer = carousel.querySelector('.pricing-cards');
            const indicators = carousel.querySelectorAll('.carousel-indicators span');
            
            if (!prevBtn || !nextBtn || !cardsContainer || cards.length === 0) return;
            
            let currentIndex = 0;
            const totalCards = cards.length;
            
            // カルーセルの横スクロール処理
            nextBtn.addEventListener('click', function() {
                if (currentIndex < indicators.length - 1) {
                    currentIndex++;
                } else {
                    currentIndex = 0; // 復帰させる
                }
                
                const cardIndex = currentIndex;
                const scrollTarget = cards[cardIndex];
                if (scrollTarget) {
                    cardsContainer.scrollTo({
                        left: scrollTarget.offsetLeft - 20,
                        behavior: 'smooth'
                    });
                    updateIndicators();
                }
            });
            
            prevBtn.addEventListener('click', function() {
                if (currentIndex > 0) {
                    currentIndex--;
                } else {
                    currentIndex = indicators.length - 1; // 最後に行く
                }
                
                const cardIndex = currentIndex;
                const scrollTarget = cards[cardIndex];
                if (scrollTarget) {
                    cardsContainer.scrollTo({
                        left: scrollTarget.offsetLeft - 20,
                        behavior: 'smooth'
                    });
                    updateIndicators();
                }
            });
            
            // インジケーターの更新
            function updateIndicators() {
                if (indicators && indicators.length > 0) {
                    indicators.forEach((indicator, index) => {
                        if (currentIndex === index) {
                            indicator.classList.add('active');
                        } else {
                            indicator.classList.remove('active');
                        }
                    });
                }
            }
            
            // スクロールイベントの監視
            cardsContainer.addEventListener('scroll', function() {
                const scrollPosition = cardsContainer.scrollLeft;
                for (let i = 0; i < cards.length; i++) {
                    if (cards[i].offsetLeft - 50 <= scrollPosition && 
                        cards[i].offsetLeft + 50 + cards[i].offsetWidth > scrollPosition) {
                        currentIndex = i;
                        updateIndicators();
                        break;
                    }
                }
            });
        });
    }
    
    /**
     * 月額・年額プラン切り替え機能
     */
    function initPlanPeriodToggle() {
        const toggleButtons = document.querySelectorAll('.plan-toggle-button');
        
        toggleButtons.forEach(button => {
            button.addEventListener('click', function() {
                const period = this.getAttribute('data-period');
                const container = this.closest('.featured-plan-section');
                
                // トグルボタンのアクティブ状態を切り替え
                toggleButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // タイトルを更新
                const titleElement = container.querySelector('.featured-plan-title');
                if (titleElement) {
                    if (period === 'month') {
                        titleElement.textContent = 'ECグロースサポート（月額プラン）';
                    } else {
                        titleElement.textContent = 'ECグロースサポート（年額プラン）';
                    }
                }
                
                // 価格表示を切り替え
                const priceElements = container.querySelectorAll('.price-value');
                const priceNotes = container.querySelectorAll('.price-note');
                
                if (period === 'month') {
                    // 月額プランの表示
                    if (priceElements[0]) priceElements[0].textContent = '¥20,000';
                    if (priceNotes[0]) priceNotes[0].textContent = '円～/月';
                    
                    if (priceElements[1]) priceElements[1].textContent = '¥50,000';
                    if (priceNotes[1]) priceNotes[1].textContent = '円～/月';
                } else {
                    // 年額プランの表示（10%割引を適用）
                    if (priceElements[0]) priceElements[0].textContent = '¥216,000';
                    if (priceNotes[0]) priceNotes[0].textContent = '円～/年（10%OFF）';
                    
                    if (priceElements[1]) priceElements[1].textContent = '¥540,000';
                    if (priceNotes[1]) priceNotes[1].textContent = '円～/年（10%OFF）';
                }
                
                console.log(`料金プラン切り替え: ${period}`);
            });
        });
    }
    
    // 各機能の初期化
    initTabs();
    initSubtabs();
    initCarousels();
    initPlanPeriodToggle();
});
