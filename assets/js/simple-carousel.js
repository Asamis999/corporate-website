/**
 * 成功事例スクロールカルーセルスクリプト
 * ボタンを使用したカルーセルで、自動スクロール機能付き
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing carousel with auto-scroll...');
  initEnhancedCarousel();
});

/**
 * 拡張カルーセルの初期化
 */
function initEnhancedCarousel() {
  const container = document.querySelector('.case-studies-container');
  const slider = document.querySelector('.case-studies-slider');
  const items = document.querySelectorAll('.case-study-item');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  
  // 要素が存在するか確認
  console.log('Container found:', !!container);
  console.log('Slider found:', !!slider);
  console.log('Items count:', items.length);
  console.log('Prev button found:', !!prevBtn);
  console.log('Next button found:', !!nextBtn);
  
  if (!container || !slider || items.length === 0) {
    console.error('カルーセル要素が見つかりません');
    return;
  }
  
  // 各カードの幅を800pxに固定
  const itemWidth = 800; // カードの固定幅
  const itemGap = 30;    // カード間のギャップ
  
  let currentIndex = 0;
  const totalItems = items.length;
  
  // 自動スクロール関連の変数
  let autoScrollInterval;
  const autoScrollDelay = 2000; // 2秒間隔でスクロール
  let isAutoScrollPaused = false;
  
  // 次のカードに移動する関数
  function scrollToNext() {
    currentIndex++;
    if (currentIndex >= totalItems) {
      currentIndex = 0;
    }
    scrollToCard(currentIndex);
  }
  
  // 前のカードに移動する関数
  function scrollToPrev() {
    currentIndex--;
    if (currentIndex < 0) {
      currentIndex = totalItems - 1;
    }
    scrollToCard(currentIndex);
  }
  
  // 指定したカードにスクロールする関数
  function scrollToCard(index) {
    const targetScroll = index * (itemWidth + itemGap);
    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  }
  
  // 自動スクロールを開始する関数
  function startAutoScroll() {
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval);
    }
    autoScrollInterval = setInterval(() => {
      if (!isAutoScrollPaused) {
        scrollToNext();
      }
    }, autoScrollDelay);
  }
  
  // 自動スクロールを停止する関数
  function stopAutoScroll() {
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval);
      autoScrollInterval = null;
    }
  }
  
  // ボタンクリックイベントの設定
  if (prevBtn) {
    prevBtn.addEventListener('click', function(e) {
      e.preventDefault();
      isAutoScrollPaused = true; // ボタンクリック時に自動スクロールを一時停止
      scrollToPrev();
      
      // 5秒後に自動スクロールを再開
      setTimeout(() => {
        isAutoScrollPaused = false;
      }, 5000);
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', function(e) {
      e.preventDefault();
      isAutoScrollPaused = true; // ボタンクリック時に自動スクロールを一時停止
      scrollToNext();
      
      // 5秒後に自動スクロールを再開
      setTimeout(() => {
        isAutoScrollPaused = false;
      }, 5000);
    });
  }
  
  // ドラッグによるスクロールアシスト
  let isDragging = false;
  let startX;
  let scrollLeft;
  
  container.addEventListener('mousedown', function(e) {
    isDragging = true;
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
    container.style.cursor = 'grabbing';
    isAutoScrollPaused = true; // ドラッグ中は自動スクロールを停止
    e.preventDefault();
  });
  
  container.addEventListener('mouseleave', function() {
    isDragging = false;
    container.style.cursor = 'grab';
    // 3秒後に自動スクロールを再開
    setTimeout(() => {
      isAutoScrollPaused = false;
    }, 3000);
  });
  
  container.addEventListener('mouseup', function() {
    isDragging = false;
    container.style.cursor = 'grab';
    // 3秒後に自動スクロールを再開
    setTimeout(() => {
      isAutoScrollPaused = false;
    }, 3000);
  });
  
  container.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 2;
    container.scrollLeft = scrollLeft - walk;
  });
  
  // タッチデバイス用のスワイプサポート
  let touchStartX = 0;
  let touchEndX = 0;
  
  container.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
    isAutoScrollPaused = true;
  });
  
  container.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
    
    // 3秒後に自動スクロールを再開
    setTimeout(() => {
      isAutoScrollPaused = false;
    }, 3000);
  });
  
  function handleSwipe() {
    if (Math.abs(touchEndX - touchStartX) < 50) {
      return;
    }
    
    if (touchEndX < touchStartX) {
      // 左スワイプ（次のカードへ）
      scrollToNext();
    } else {
      // 右スワイプ（前のカードへ）
      scrollToPrev();
    }
  }
  
  // カルーセルにマウスが乗ったときに自動スクロールを一時停止
  container.addEventListener('mouseenter', function() {
    isAutoScrollPaused = true;
  });
  
  container.addEventListener('mouseleave', function() {
    // 2秒後に自動スクロールを再開
    setTimeout(() => {
      isAutoScrollPaused = false;
    }, 2000);
  });
  
  // スクロールイベントのリスナー
  container.addEventListener('scroll', function() {
    // スクロール位置から現在のカードインデックスを計算
    const scrollPosition = container.scrollLeft;
    const newIndex = Math.round(scrollPosition / (itemWidth + itemGap));
    
    // 有効なインデックスの場合のみ更新
    if (newIndex >= 0 && newIndex < totalItems && newIndex !== currentIndex) {
      currentIndex = newIndex;
    }
  });
  
  // ウィンドウリサイズ時の処理
  window.addEventListener('resize', function() {
    // 現在のカードに再度スクロールして位置を照合
    scrollToCard(currentIndex);
  });
  
  // 自動スクロールを開始
  startAutoScroll();
  
  // 初期表示時のカードを最初のカードに設定
  scrollToCard(0);
}
