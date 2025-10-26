// ─────────────────────────────────────────────────
// 超シンプル Three.js パーティクルシステム
// カーソル追従 ＆ クリックでロゴ形成
// ─────────────────────────────────────────────────

// Three.jsの読み込み確認
function checkThreeJsLoaded() {
  if (typeof THREE === 'undefined') {
    console.error('Three.jsが読み込まれていません。パーティクルシステムを初期化できません。');
    return false;
  }
  console.log('Three.jsが正常に読み込まれています。');
  return true;
}

// 変数定義
let container, camera, scene, renderer, particles;
let originalPositions = [];
let targetPositions = [];
let logoPoints = [];
let animationProgress = 0;
let isAttractMode = false;
let isExploding = false;
let explosionProgress = 0;
let explosionDuration = 1.0; // 爆発アニメーション時間（秒）
let lastTapPosition = {x: 0, y: 0, z: -300}; // Z座標も追加
let mouse = null;
const particleCount = 12000; // パーティクル数をさらに増加して密度を高める
const cursorRadius = 200;
const cursorStrength = 0.2;
const explosionPower = 800; // 爆発の強さ
const explosionRadius = 800; // 爆発の半径
const ease = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
let clock = null;

// カメラ回転関連の変数
let targetRotationX = 0;
let targetRotationY = 0;
let currentRotationX = 0;
let currentRotationY = 0;

// スクロール関連の変数
let lastScrollY = 0;
let isScrollingEffect = false;
let cardPositions = [];
let serviceCards = [];

document.addEventListener('DOMContentLoaded', init);

function init() {
  console.log('パーティクル初期化開始');
  
  // Three.jsの読み込み確認
  if (!checkThreeJsLoaded()) {
    console.error('Three.jsが読み込まれていないため、初期化を中止します');
    return;
  }
  
  // Three.jsオブジェクトの初期化
  mouse = new THREE.Vector2();
  clock = new THREE.Clock();
  
  container = document.getElementById('particle-container');
  if (!container) {
    console.error('パーティクルコンテナが見つかりません');
    return;
  }
  
  // パーティクルコンテナをヒーローセクションの高さに合わせる
  // ファーストビューのみに限定
  const heroSection = document.querySelector('.hero');
  
  if (heroSection) {
    // ヒーローセクションとパーティクルコンテナの高さを正確に設定する関数
    const adjustParticleContainer = () => {
      // ヒーローセクションの高さを取得
      const heroRect = heroSection.getBoundingClientRect();
      
      // ヒーローセクションの高さを100vhに固定
      heroSection.style.height = '100vh';
      heroSection.style.minHeight = '600px';
      
      // パーティクルコンテナの設定
      container.style.position = 'absolute';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100%';
      container.style.height = '100%';
      
      console.log(`ヒーロー高さ再設定: 100vh, パーティクル高さ: 100%`);
    };
    
    // 初期設定とリサイズ時の再設定
    adjustParticleContainer();
    window.addEventListener('resize', adjustParticleContainer);
    
    // スクロール時の表示制御
    window.addEventListener('scroll', () => {
      const heroRect = heroSection.getBoundingClientRect();
      if (heroRect.bottom > 0 && heroRect.top < window.innerHeight) {
        container.style.opacity = '1';
      } else {
        container.style.opacity = '0';
      }
    });
    
    // ページ読み込み後すぐには正しく取得できない場合があるので、遅延処理で再設定
    setTimeout(adjustParticleContainer, 100);
    setTimeout(adjustParticleContainer, 500);
    setTimeout(adjustParticleContainer, 1000);
  }
  
  // Three.js 初期化
  scene    = new THREE.Scene();
  camera   = new THREE.PerspectiveCamera(75, container.clientWidth/container.clientHeight, 1, 2000);
  camera.position.z = 800;
  renderer = new THREE.WebGLRenderer({ alpha:true, antialias:true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // ロゴ用サンプル点群を用意
  createLogoPoints();

  // パーティクル生成
  createParticles();

  // イベント
  window.addEventListener('resize', onResize);
  document.addEventListener('mousemove', e => {
    mouse.x = ( e.clientX / window.innerWidth )  * 2 - 1;
    mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
  });
  container.addEventListener('click', toggleAttractMode);

  // スクロールエフェクトの設定
  setupScrollEffect();

  animate();
}

function createParticles() {
  const geom = new THREE.BufferGeometry();
  const pos  = new Float32Array(particleCount*3);
  const colors = new Float32Array(particleCount*3);
  const sizes = new Float32Array(particleCount);

  // 球面分布
  for ( let i = 0; i < particleCount; i++ ) {
    const phi   = Math.acos(2*Math.random()-1);
    const theta = 2*Math.PI*Math.random();
    const r     = 700;
    const x = r*Math.sin(phi)*Math.cos(theta);
    const y = r*Math.sin(phi)*Math.sin(theta);
    const z = r*Math.cos(phi);

    pos[3*i]   = x;
    pos[3*i+1] = y;
    pos[3*i+2] = z;
    
    // パーティクルの初期色をより明るく設定
    const hue = 210 + Math.random() * 30; // 青みがかった色相
    const saturation = 0.7 + Math.random() * 0.3; // 高い彩度
    const lightness = 0.6 + Math.random() * 0.3; // 明るさ
    const rgb = hslToRgb(hue/360, saturation, lightness);
    
    colors[3*i]   = rgb.r;
    colors[3*i+1] = rgb.g;
    colors[3*i+2] = rgb.b;
    originalPositions.push(new THREE.Vector3(x,y,z));
    
    // 色の初期化（白）
    colors[3*i]   = 1.0;
    colors[3*i+1] = 1.0;
    colors[3*i+2] = 1.0;
    
    // サイズをランダム化
    sizes[i] = 3 + Math.random() * 2;
  }

  geom.setAttribute('position', new THREE.BufferAttribute(pos,3));
  geom.setAttribute('color', new THREE.BufferAttribute(colors,3));
  geom.setAttribute('size', new THREE.BufferAttribute(sizes,1));
  
  // マテリアル設定（透明度と輝きを強化）
  const mat = new THREE.PointsMaterial({
    size: 6, // サイズを少し大きく
    vertexColors: true, // 色情報を使用
    transparent: true,
    opacity: 0.85, // 透明度を調整（より見やすく）
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    depthWrite: false
  });

  particles = new THREE.Points(geom, mat);
  scene.add(particles);

  // 初回ロゴターゲットを作っておく
  buildLogoTargets();
}

// パーティクルの色を更新する関数
function updateParticleColors(reset) {
  if (!particles) return;
  
  const colors = particles.geometry.attributes.color.array;
  
  if (reset) {
    // リセット時は既定の青系の色に戻す（明るさと透明度を高め）
    for (let i = 0; i < particleCount; i++) {
      const idx = 3*i;
      // 青みがかった色を基本に
      const hue = 210 + Math.random() * 30; // 青みがかった色相
      const saturation = 0.7 + Math.random() * 0.3; // 高い彩度
      const lightness = 0.6 + Math.random() * 0.3; // 明るさ
      const rgb = hslToRgb(hue/360, saturation, lightness);
      
      colors[idx]   = rgb.r;
      colors[idx+1] = rgb.g;
      colors[idx+2] = rgb.b;
    }
  } else {
    // アニメーション中は色相環を使って色を変化させる（より鮮やか）
    const time = Date.now() * 0.001;
    for (let i = 0; i < particleCount; i++) {
      const idx = 3*i;
      // 位置に応じた色相の変化
      const x = particles.geometry.attributes.position.array[idx];
      const y = particles.geometry.attributes.position.array[idx+1];
      const z = particles.geometry.attributes.position.array[idx+2];
      
      const dist = Math.sqrt(x*x + y*y + z*z) / 700; // 0-1の範囲に正規化
      const hue = (time * 10 + dist * 360) % 360;
      const sat = 0.8; // より鮮やかに
      const light = 0.6 + dist * 0.3; // より明るく
      
      const rgb = hslToRgb(hue/360, sat, light);
      colors[idx]   = rgb.r;
      colors[idx+1] = rgb.g;
      colors[idx+2] = rgb.b;
    }
  }
  
  particles.geometry.attributes.color.needsUpdate = true;
}

// HSLからRGBへの変換ヘルパー関数
function hslToRgb(h, s, l) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [r, g, b];
}

function createLogoPoints() {
  logoPoints = [];
  
  // 大きな「A」一文字を定義
  const letterA = 'A';
  
  // Aの大きさを定義する
  const letterWidth = 500; // 幅500px
  const letterHeight = 550; // 高さ
  
  // Aを中央から上に30%移動させて配置
  // 画面の高さサイズの30%分上に配置する
  const verticalOffset = window.innerHeight * 0.30; // 画面高さの30%分上に移動
  
  const x = 0;
  const y = verticalOffset; // 上に移動（Three.jsではY軸は上がプラス方向）
  
  // Aの大きさに合わせてスケール調整
  const scale = 1.0;
  
  // Aの形状を生成する点群
  logoPoints = generateLetterA(x, y, letterWidth, letterHeight);
  
  console.log(`Aの形状用点群を${logoPoints.length}個生成しました`);
  console.log(`Aを画面上方${verticalOffset}pxに移動しました`);
}

// 文字Aを生成する関数
function generateLetterA(x, y, width, height) {
  const points = [];
  const strokeWidth = width / 6; // Aの線の太さを太く
  const density = 25; // 点の密度を大幅に増加
  
  // 左斜め線 - 正しいAの形状に修正
  for (let t = 0; t <= 1; t += 1/80) { // 高密度の点を維持
    // 左下から上部中央へ
    const baseX = x - width/2 + (width/2) * t;
    const baseY = y - height/2 + height * t - 60; // 60px上に移動
    
    // 非常に高密度の点を追加
    for (let i = 0; i < density; i++) {
      const offsetX = (Math.random() - 0.5) * strokeWidth;
      const offsetY = (Math.random() - 0.5) * strokeWidth;
      points.push({
        x: baseX + offsetX,
        y: baseY + offsetY,
        z: 0
      });
    }
  }
  
  // 右斜め線 - 正しいAの形状に修正
  for (let t = 0; t <= 1; t += 1/80) { // 高密度の点を維持
    // 右下から上部中央へ
    const baseX = x + width/2 - (width/2) * t;
    const baseY = y - height/2 + height * t - 60; // 60px上に移動
    
    // 非常に高密度の点を追加
    for (let i = 0; i < density; i++) {
      const offsetX = (Math.random() - 0.5) * strokeWidth;
      const offsetY = (Math.random() - 0.5) * strokeWidth;
      points.push({
        x: baseX + offsetX,
        y: baseY + offsetY,
        z: 0
      });
    }
  }
  
  // 横棒を適切な太さに調整
  const crossbarHeight = height * 0.4; // 横棒の位置を中央より少し上に
  // 横棒の位置を画面の20%分下に移動
  const crossbarLowerOffset = window.innerHeight * 0.2; // 画面高さの20%分下に移動
  const crossbarPosition = y + height/2 - crossbarHeight - 60 - crossbarLowerOffset; // 下に移動するのでマイナス 
  const crossbarWidth = width * 0.8; // 横棒の幅を維持
  
  // 横棒を非常に高密度に
  for (let t = 0; t <= 1; t += 1/40) {
    const baseX = x - crossbarWidth/2 + crossbarWidth * t;
    
    // 横棒は適切な密度に調整
    for (let i = 0; i < density * 1.75; i++) { // 横棒の点の密度を30%減らして調整
      const offsetX = (Math.random() - 0.5) * strokeWidth * 1.05;
      const offsetY = (Math.random() - 0.5) * strokeWidth * 1.05; // オフセットを小さくして線を細く
      points.push({
        x: baseX + offsetX,
        y: crossbarPosition + offsetY,
        z: 0
      });
    }
  }
  
  // 追加の横棒点を適切な量に調整
  for (let t = 0; t <= 1; t += 1/20) {
    const baseX = x - crossbarWidth/2 + crossbarWidth * t;
    
    // 上側の追加点 (密度を縮小)
    for (let i = 0; i < density * 0.7; i++) { // 30%減らして調整
      const offsetX = (Math.random() - 0.5) * strokeWidth * 0.7;
      const offsetY = (Math.random() - 0.5) * strokeWidth * 0.7; // オフセットも小さく
      points.push({
        x: baseX + offsetX,
        y: crossbarPosition - strokeWidth/3 + offsetY, // 距離を縮小
        z: 0
      });
    }
    
    // 下側の追加点 (密度を縮小)
    for (let i = 0; i < density * 0.7; i++) { // 30%減らして調整
      const offsetX = (Math.random() - 0.5) * strokeWidth * 0.7;
      const offsetY = (Math.random() - 0.5) * strokeWidth * 0.7; // オフセットも小さく
      points.push({
        x: baseX + offsetX,
        y: crossbarPosition + strokeWidth/3 + offsetY, // 距離を縮小
        z: 0
      });
    }
  }
  
  // 点の数を増やす
  if (points.length < 500) {
    // 点が足りない場合は、エッジに沿ってさらに点を追加
    const additionalPoints = [];
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      // 元の点の周りに追加の点を配置
      for (let j = 0; j < 2; j++) { // 各点につき2個の追加点
        additionalPoints.push({
          x: p.x + (Math.random() - 0.5) * strokeWidth * 0.8,
          y: p.y + (Math.random() - 0.5) * strokeWidth * 0.8,
          z: 0
        });
      }
    }
    points.push(...additionalPoints);
  }
  
  return points;
}

// 旧関数は使用しないが一応残しておく
function generateLetterPoints(char, x, y, scale) {
  return [];
}

function buildLogoTargets() {
  targetPositions = [];
  for(let i=0; i<particleCount; i++){
    // 重複してもOK、ロゴ点が足りなければループ
    const p = logoPoints[i % logoPoints.length];
    targetPositions.push(new THREE.Vector3(p.x, p.y, p.z));
  }
}

// グローバルにtoggleAttractModeを公開
window.toggleAttractMode = toggleAttractMode;

// アトラクトモードの切り替え
function toggleAttractMode(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
    
    // タップ位置を記録（爆発エフェクト用）
    const rect = container.getBoundingClientRect();
    if (event.clientX) {
      // マウスイベント
      lastTapPosition.x = event.clientX - rect.left - rect.width/2;
      lastTapPosition.y = -(event.clientY - rect.top - rect.height/2);
    } else if (event.touches && event.touches[0]) {
      // タッチイベント
      const touch = event.touches[0];
      lastTapPosition.x = touch.clientX - rect.left - rect.width/2;
      lastTapPosition.y = -(touch.clientY - rect.top - rect.height/2);
    }
    
    // アトラクトモードに切り替わる時は爆発エフェクト発動
    if (!isAttractMode) {
      startExplosionEffect();
    }
  }
  
  isAttractMode = !isAttractMode;
  animationProgress = isAttractMode ? 0 : 1;
  return false;
};

// スクロールエフェクトの設定
function setupScrollEffect() {
  console.log('スクロールエフェクトセットアップ開始');
  
  // サービスカードを取得
  serviceCards = Array.from(document.querySelectorAll('.service-card'));
  console.log(`サービスカード: ${serviceCards.length}個検出`);
  
  // サービスセクションの存在確認
  const servicesSection = document.querySelector('.services-section');
  if (servicesSection) {
    console.log('サービスセクションが見つかりました');
  } else {
    console.error('サービスセクションが見つかりません');
  }
  
  // スクロールイベントの設定
  console.log('スクロールイベントリスナーを設定します');
  window.removeEventListener('scroll', handleScroll); // 冗長登録を防ぐため一度削除
  window.addEventListener('scroll', handleScroll);
  console.log('スクロールイベントリスナーを設定完了');
  
  window.removeEventListener('resize', updateCardPositions); // 冗長登録を防ぐため一度削除
  window.addEventListener('resize', updateCardPositions);
  
  // 初期化時にカード位置を取得
  console.log('初期カード位置取得を予約しました');
  setTimeout(() => {
    updateCardPositions();
    // 手動で最初のスクロールイベントをトリガー
    console.log('手動でスクロールイベントをトリガーします');
    handleScroll();
  }, 1000); // 少し長めに設定
}

// カード位置の更新
function updateCardPositions() {
  cardPositions = [];
  
  // サービスカードが未取得の場合は再取得
  if (serviceCards.length === 0) {
    console.log('サービスカードを再取得します');
    serviceCards = Array.from(document.querySelectorAll('.service-card'));
    console.log(`再取得結果: ${serviceCards.length}個のカードを検出`);
  }
  
  if (serviceCards.length === 0) {
    // サービスカードが見つからない場合は全要素をダンプして確認
    console.log('サービスカードが見つかりません。DOM構造を確認します:');
    const allElements = document.querySelectorAll('.services-grid > *');
    console.log(`services-grid内の要素数: ${allElements.length}`);
    allElements.forEach((el, index) => {
      console.log(`要素[${index}]: ${el.tagName} | クラス: ${el.className} | 内容: ${el.textContent.substring(0, 20)}...`);
    });
  }
  
  serviceCards.forEach((card, index) => {
    const rect = card.getBoundingClientRect();
    // 座標系変換（ブラウザの座標系からThree.jsの座標系へ）
    cardPositions.push({
      x: rect.left + rect.width/2 - window.innerWidth/2,
      y: -(rect.top + rect.height/2 - window.innerHeight/2), // Y軸は反転
      width: rect.width,
      height: rect.height,
      element: card
    });
    console.log(`カード[${index}] 座標: x=${Math.round(rect.left)}, y=${Math.round(rect.top)}, width=${Math.round(rect.width)}, height=${Math.round(rect.height)}`);
  });
  
  console.log(`サービスカード位置を更新: ${cardPositions.length}個検出`);
}

// スクロールハンドラ
function handleScroll() {
  const scrollY = window.scrollY;
  console.log(`スクロール位置: ${scrollY}px`);
  
  const heroElement = document.querySelector('.hero');
  if (!heroElement) {
    console.error('ヒーロー要素が見つかりません');
    return;
  }
  
  const heroHeight = heroElement.offsetHeight;
  console.log(`ヒーロー高さ: ${heroHeight}px`);
  
  const scrollThreshold = heroHeight * 0.2; // ヒーローセクションの20%スクロールしたらエフェクト開始
  console.log(`スクロール開始閾値: ${scrollThreshold}px`);
  
  // スクロールが一定量を超えたらエフェクト開始
  if (scrollY > scrollThreshold) {
    console.log('スクロールエフェクト発動!');
    isScrollingEffect = true;
    updateCardPositions(); // カードの位置を更新
    
    // 吸引力の計算（スクロール量に比例）
    const maxScroll = heroHeight * 0.8;
    const attractionFactor = Math.min(1, (scrollY - scrollThreshold) / maxScroll);
    console.log(`吸引力: ${attractionFactor}`);
    applyParticleAttraction(attractionFactor);
  } else {
    isScrollingEffect = false;
  }
  
  lastScrollY = scrollY;
}

// パーティクル吸引処理
function applyParticleAttraction(attractionFactor) {
  if (cardPositions.length === 0) return;
  
  // position配列に直接アクセス
  const positionArray = particles.geometry.attributes.position.array;
  const colorArray = particles.geometry.attributes.color.array;
  
  // 各パーティクルに対して処理
  for (let i = 0; i < particleCount; i++) {
    const idx = i * 3;
    
    // パーティクルIDに基づいて、どのカードに吸引されるかを決定（分散させる）
    const targetCardIndex = i % cardPositions.length;
    const targetCard = cardPositions[targetCardIndex];
    
    if (targetCard) {
      // 現在のパーティクル位置
      let px = positionArray[idx];
      let py = positionArray[idx + 1];
      let pz = positionArray[idx + 2];
      
      // パーティクルとカードの距離を計算
      const dx = targetCard.x - px;
      const dy = targetCard.y - py;
      const dz = -300 - pz; // Z方向も調整
      
      // 吸引力を適用（強化版）
      positionArray[idx] += dx * 0.05 * attractionFactor;
      positionArray[idx + 1] += dy * 0.05 * attractionFactor;
      positionArray[idx + 2] += dz * 0.025 * attractionFactor;
      
      // デバッグ用（10個に1つの項目のみ記録）
      if (i % 1000 === 0) {
        console.log(`パーティクル[${i}] 移動: dx=${Math.round(dx*100)/100}, dy=${Math.round(dy*100)/100}, 吸引力=${attractionFactor}`);
      }
      
      // 色をわずかに変更（カードごとに異なる色にする）
      if (attractionFactor > 0.3 && colorArray) {
        const hue = (targetCardIndex / cardPositions.length) * 0.2 + 0.6; // 色相
        const color = new THREE.Color().setHSL(hue, 0.8, 0.6);
        
        // 現在の色を取得
        const r = colorArray[idx];
        const g = colorArray[idx + 1];
        const b = colorArray[idx + 2];
        
        // 新しい色に応じて微調整
        colorArray[idx] = r * 0.99 + color.r * 0.01;
        colorArray[idx + 1] = g * 0.99 + color.g * 0.01;
        colorArray[idx + 2] = b * 0.99 + color.b * 0.01;
      }
    }
  }
  
  // 変更を反映
  particles.geometry.attributes.position.needsUpdate = true;
  if (particles.geometry.attributes.color) {
    particles.geometry.attributes.color.needsUpdate = true;
  }
}

// 爆発エフェクト開始
function startExplosionEffect() {
  isExploding = true;
  explosionProgress = 0;
  clock.start();
  
  // 色の変化アニメーションのリセット
  updateParticleColors(true);
}

function onResize() {
  // ヒーローセクションとサービスセクションの高さを取得
  const heroSection = document.querySelector('.hero');
  const servicesSection = document.querySelector('.services-section');
  
  let totalHeight = window.innerHeight; // 最低でも画面高さを確保
  
  if (heroSection && servicesSection) {
    // 両セクションの高さを計算
    const heroRect = heroSection.getBoundingClientRect();
    const servicesRect = servicesSection.getBoundingClientRect();
    const servicesBottom = servicesRect.top + servicesRect.height;
    totalHeight = Math.max(window.innerHeight, servicesBottom);
    console.log(`パーティクルキャンバス高さ計算: ヒーロー=${heroRect.height}px + サービス=${servicesRect.height}px = ${totalHeight}px`);
  }
  
  // キャンバスの高さを設定
  if (container) {
    container.style.height = `${totalHeight}px`;
  }
  
  // カメラとレンダラーのサイズを更新
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

// アニメーションループ
function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  // カメラの動きを滑らかに
  currentRotationX += (targetRotationX - currentRotationX) * 0.05;
  currentRotationY += (targetRotationY - currentRotationY) * 0.05;
  
  // カメラを回転
  camera.position.x = Math.sin(currentRotationX) * 1000;
  camera.position.z = Math.cos(currentRotationX) * 1000;
  camera.position.y = Math.sin(currentRotationY) * 500;
  
  camera.lookAt(scene.position);
  
  const pos = particles.geometry.attributes.position.array;
  const delta = clock.getDelta();
  
  // 爆発エフェクトの進行状況を更新
  if (isExploding) {
    explosionProgress += delta / explosionDuration;
    if (explosionProgress >= 1.0) {
      isExploding = false;
      explosionProgress = 1.0;
    }
    
    // 爆発中はパーティクルの色を更新
    updateParticleColors(false);
  }
  
  // アニメーションの優先順位
  // 1. 爆発エフェクト
  // 2. スクロールエフェクト
  // 3. アトラクトモード
  // 4. 通常モード
  if (isExploding) {
    // 爆発エフェクトはパーティクル更新ループ内で処理される
    // 個別の対応は必要ない
  } else if (isScrollingEffect) {
    // スクロール中の吸引エフェクトは処理済み
    // handleScrollとapplyParticleAttractionで対応
  } else if (isAttractMode) {
    // Aの形状に吸引されるモード
    // 各パーティクルが自動的に目標位置に向かう処理はパーティクル更新ループ内で処理済み
  } else {
    // 通常モード
    // 特別な処理は必要ない
  }

  // パーティクルの更新
  for(let i=0; i<particleCount; i++){
    const idx = 3*i;
    let vx = pos[idx], vy = pos[idx+1], vz = pos[idx+2];

    if(isAttractMode) {
      // ロゴ吸着アニメーション
      
      if (isExploding) {
        // 爆発エフェクト中
        // 最初に飛び散ってから、ターゲットへ収束
        const explodePhase = explosionProgress < 0.3 ? explosionProgress / 0.3 : (1 - explosionProgress) / 0.7;
        
        // 爆発している球体身体からの方向ベクトル
        const diffX = originalPositions[i].x - lastTapPosition.x;
        const diffY = originalPositions[i].y - lastTapPosition.y;
        const diffZ = originalPositions[i].z - lastTapPosition.z;
        
        // 正規化した方向ベクトルに爆発力を掛ける
        const len = Math.sqrt(diffX*diffX + diffY*diffY + diffZ*diffZ) || 1;
        const power = explodePhase * explosionRadius * (Math.random() * 0.5 + 0.5);
        
        const explodeX = lastTapPosition.x + diffX/len * power * (Math.random() * 0.5 + 0.75);
        const explodeY = lastTapPosition.y + diffY/len * power * (Math.random() * 0.5 + 0.75);
        const explodeZ = lastTapPosition.z + diffZ/len * power * (Math.random() * 0.5 + 0.75);
        
        // ターゲット位置への移動と爆発の混合
        const blendFactor = Math.pow(explosionProgress, 2);
        vx = THREE.MathUtils.lerp(explodeX, targetPositions[i].x, blendFactor);
        vy = THREE.MathUtils.lerp(explodeY, targetPositions[i].y, blendFactor);
        vz = THREE.MathUtils.lerp(explodeZ, targetPositions[i].z, blendFactor);
        
      } else {
        // 通常の吸着アニメーション
        const t = ease(animationProgress);
        const to = targetPositions[i];
        const from = originalPositions[i];
        vx = THREE.MathUtils.lerp(from.x, to.x, t);
        vy = THREE.MathUtils.lerp(from.y, to.y, t);
        vz = THREE.MathUtils.lerp(from.z, to.z, t);
      }
    } else {
      // カーソル追従
      const dx = mouse.x * window.innerWidth/2  - vx;
      const dy = mouse.y * window.innerHeight/2 - vy;
      const dist = Math.hypot(dx,dy);
      if(dist < cursorRadius) {
        const f = (1 - dist/cursorRadius) * cursorStrength;
        vx += dx * f;
        vy += dy * f;
      }
      // ゆるやかに元の位置に戻る
      const restore = 0.02;
      vx += (originalPositions[i].x - vx)*restore;
      vy += (originalPositions[i].y - vy)*restore;
      vz += (originalPositions[i].z - vz)*restore;
    }

    pos[idx]   = vx;
    pos[idx+1] = vy;
    pos[idx+2] = vz;
  }

  // アニメーション進行度を更新
  if(isAttractMode && animationProgress < 1) {
    animationProgress = Math.min(1, animationProgress + 0.01);
  }
  if(!isAttractMode && animationProgress > 0) {
    animationProgress = Math.max(0, animationProgress - 0.01);
  }

  particles.geometry.attributes.position.needsUpdate = true;
  
  // レンダリング
  renderer.render(scene, camera);
}
