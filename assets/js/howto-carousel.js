/**
 * 成功事例スクロールカルーセルスクリプト
 * シンプルな横スクロールで動作するカルーセル
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing simple scroll carousel...');
  initSimpleCarousel();
});

/**
 * シンプルなスクロールカルーセルの初期化
 */
function initSimpleCarousel() {
  const container = document.querySelector('.case-studies-container');
  const slider = document.querySelector('.case-studies-slider');
  const items = document.querySelectorAll('.case-study-item');
  const dotsContainer = document.querySelector('.carousel-dots');
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');
  
  // 初期変数設定
  let currentIndex = 0;
  let isScrolling = false;
  let scrollTimeout;
  let isDragging = false;
  let startX;
  let scrollLeft;
  const totalItems = items.length;
  
  // 要素が存在するか確認
  console.log('Container found:', !!container);
  console.log('Slider found:', !!slider);
  console.log('Items count:', items.length);
  
  if (!container || !slider || items.length === 0) {
    console.error('カルーセル要素が見つかりません');
    return;
  }
  
  // 各カードの幅を800pxに固定
  const itemWidth = 800; // カードの固定幅
  const itemGap = 30; // カード間のギャップ
  const itemMargin = itemGap / 2; // アイテム間のマージン
  
  // カードの幅を設定
  updateSliderWidth();
  
  // スクロールが機能しない場合の対策として、
  // スクロール動作をアシストするクリックイベントを追加
  container.addEventListener('click', function(e) {
    // カード要素やリンク要素のクリックを無視
    if (e.target.closest('.case-study-item') || e.target.closest('a')) {
      return;
    }
    
    // クリック位置がコンテナの右半分か左半分か判定
    const containerWidth = container.offsetWidth;
    const clickX = e.clientX - container.getBoundingClientRect().left;
    const isRightSide = clickX > containerWidth / 2;
    
    // スクロール位置を計算
    const currentScroll = container.scrollLeft;
    const targetScroll = isRightSide ? 
      currentScroll + itemWidth + itemGap : 
      currentScroll - (itemWidth + itemGap);
    
    // スムーズスクロール
    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  });
  
  // ドラッグによるスクロールアシスト
  container.addEventListener('mousedown', function(e) {
    isDragging = true;
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
    container.style.cursor = 'grabbing';
    e.preventDefault(); // ドラッグ中にテキスト選択を防止
  });
  
  container.addEventListener('mouseleave', function() {
    isDragging = false;
    container.style.cursor = 'grab';
  });
  
  container.addEventListener('mouseup', function() {
    isDragging = false;
    container.style.cursor = 'grab';
  });
  
  container.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 2; // スクロール速度の倍率
    container.scrollLeft = scrollLeft - walk;
  });
  
  // スナップスクロールのアシスト
  container.addEventListener('scroll', function() {
    clearTimeout(scrollTimeout);
    
    if (!isScrolling && !isDragging) {
      isScrolling = true;
      
      // スクロール位置から現在のカードインデックスを計算
      const scrollPosition = container.scrollLeft;
      currentIndex = Math.round(scrollPosition / (itemWidth + itemGap));
      
      // インデックスの境界値チェック
      if (currentIndex >= totalItems) currentIndex = totalItems - 1;
      if (currentIndex < 0) currentIndex = 0;
      
      updateDots(); // ドット表示を更新
      
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 150);
    }
  }, { passive: true });
  
  // キーボードナビゲーション
  document.addEventListener('keydown', function(e) {
    // カルーセルが視界に入っている場合のみ反応
    const rect = container.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    
    if (isVisible) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        currentIndex--;
        if (currentIndex < 0) {
          currentIndex = totalItems - 1; // ループ機能
        }
        updateSliderPosition();
        updateDots();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        currentIndex++;
        if (currentIndex >= totalItems) {
          currentIndex = 0; // ループ機能
        }
        updateSliderPosition();
        updateDots();
      }
    }
  });
  
  // スワイプ処理
  let startX1, endX;
  container.addEventListener('touchstart', function(e) {
    startX1 = e.touches[0].clientX;
  }, { passive: true });
  
  container.addEventListener('touchend', function(e) {
    endX = e.changedTouches[0].clientX;
    const diff = startX1 - endX;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // 左スワイプ -> 次へ
        currentIndex++;
        if (currentIndex >= totalItems) {
          currentIndex = 0; // ループ機能
        }
      } else if (diff < 0) {
        // 右スワイプ -> 前へ
        currentIndex--;
        if (currentIndex < 0) {
          currentIndex = totalItems - 1; // ループ機能
        }
      }
      
      updateSliderPosition();
      updateDots();
    }
  }, { passive: true });
  
  // ドット生成
  createDots();
  updateDots();
  
  // 初期位置にセット
  updateSliderPosition();
  
  // ボタンイベント
  if (prevBtn) {
    prevBtn.addEventListener('click', function(e) {
      e.preventDefault();
      currentIndex--;
      // ループ機能追加: 最初のアイテムから前に行くと最後に移動
      if (currentIndex < 0) {
        currentIndex = totalItems - 1;
      }
      updateSliderPosition();
      updateDots();
      console.log('Previous clicked, new index:', currentIndex);
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', function(e) {
      e.preventDefault();
      currentIndex++;
      // ループ機能追加: 最後のアイテムから次に行くと最初に戻る
      if (currentIndex >= totalItems) {
        currentIndex = 0;
      }
      updateSliderPosition();
      updateDots();
      console.log('Next clicked, new index:', currentIndex);
    });
  }
  
  // 初期状態のボタン更新
  updateNavButtons();
  
  // ドット生成関数
  function createDots() {
    if (!dotsContainer) return;
    
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalItems; i++) {
      const dot = document.createElement('span');
      dot.classList.add('dot');
      if (i === currentIndex) {
        dot.classList.add('active');
      }
      
      dot.addEventListener('click', function() {
        currentIndex = i;
        updateSliderPosition();
        updateDots();
        console.log('Dot clicked, new index:', currentIndex);
      });
      
      dotsContainer.appendChild(dot);
    }
  }
  
  // ドット更新
  function updateDots() {
    if (!dotsContainer) return;
    
    const dots = dotsContainer.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
      if (index === currentIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }
  
  // スライダーの幅を計算する関数
  function updateSliderWidth() {
    // 各アイテムの幅とギャップを考慮した全体の幅を設定
    const totalWidth = (itemWidth + itemGap) * totalItems - itemGap; // 最後のギャップを引く
    slider.style.width = `${totalWidth}px`;
    
    // 各カードの幅を固定に設定
    items.forEach(item => {
      item.style.width = `${itemWidth}px`;
      item.style.minWidth = `${itemWidth}px`;
      item.style.maxWidth = `${itemWidth}px`;
      item.style.flexBasis = `${itemWidth}px`;
    });
  }
  
  // スライダー位置更新
  function updateSliderPosition() {
    // カード位置に基づいてオフセットを計算（ギャップを考慮）
    const offset = currentIndex * (itemWidth + itemGap);
    console.log('Updating slider position:', `-${offset}px`);
    
    // translateXではなくscrollLeftを使用して自然なスクロール動作に変更
    slider.scrollLeft = offset;
    updateNavButtons();
  }
  
  // ナビゲーションボタンのスタイル更新処理を追加
  function updateNavButtons() {
    // ループ機能を実装するため、常に有効にする
    if (prevBtn) {
      prevBtn.disabled = false;
      prevBtn.style.opacity = '1';
      prevBtn.style.cursor = 'pointer';
    }
    if (nextBtn) {
      nextBtn.disabled = false;
      nextBtn.style.opacity = '1';
      nextBtn.style.cursor = 'pointer';
    }
  }
  
  // 自動スクロール機能を追加
  let autoScrollTimer;
  
  function startAutoScroll() {
    // 5秒ごとに自動スクロール
    autoScrollTimer = setInterval(() => {
      // カルーセルが視界内にある場合のみ自動スクロール
      const rect = container.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        currentIndex++;
        if (currentIndex >= totalItems) {
          currentIndex = 0;
        }
        updateSliderPosition();
        updateDots();
      }
    }, 5000);
  }
  
  function stopAutoScroll() {
    clearInterval(autoScrollTimer);
  }
  
  // カルーセルにマウスが入ったら自動スクロールを停止
  container.addEventListener('mouseenter', stopAutoScroll);
  
  // カルーセルからマウスが出たら自動スクロールを再開
  container.addEventListener('mouseleave', startAutoScroll);
  
  // 初期化時に自動スクロールを開始
  startAutoScroll();
  
  // ウィンドウリサイズ対応
  window.addEventListener('resize', function() {
    // ウィンドウサイズ変更時にカード幅とスライダー幅を再計算
    let newItemWidth;
    if (window.innerWidth >= 992) {
      newItemWidth = container.offsetWidth * 0.333 - 30;
    } else if (window.innerWidth >= 768) {
      newItemWidth = container.offsetWidth * 0.5 - 30;
    } else {
      newItemWidth = container.offsetWidth - 30;
    }
    
    const newTotalItemWidth = newItemWidth + (itemMargin * 2);
    slider.style.width = `${Math.max(container.offsetWidth * 2, totalItems * newTotalItemWidth)}px`;
    
    // スライダー位置を更新
    updateSliderPosition();
  });
  
  console.log('Carousel initialized successfully');
}
