/**
 * お問い合わせモーダル用JavaScript
 * サイト全体のお問い合わせリンクをモーダル表示に変換
 */

// ページ読み込み時に自動実行
document.addEventListener('DOMContentLoaded', function() {
  // サイト全体のお問い合わせリンクを検索してモーダル化
  window.convertContactLinksToModal();
  
  console.log('お問い合わせモーダル初期化完了（DOMContentLoaded）');
});

/**
 * お問い合わせリンクをモーダル表示に変換
 * グローバル関数として定義してどこからでも呼び出せるようにする
 */
window.convertContactLinksToModal = function() {
  console.log('お問い合わせリンク変換処理開始');
  
  // 対象となるリンクのセレクタを拡張
  const selectors = [
    'a[href="/contact/"]',                // 通常のコンタクトリンク
    '.footer-contact-highlight',          // フッターのハイライトリンク
    'a.contact-btn',                      // お問い合わせボタン
    'a.cta-button[href*="contact"]',     // CTAボタン
    'a[href*="contact"].button'          // その他のお問い合わせボタン
  ];
  
  // すべてのセレクタを結合して一度に取得
  const contactLinks = document.querySelectorAll(selectors.join(', '));
  console.log(`変換対象リンク数: ${contactLinks.length}`);
  
  // 各リンクをモーダル表示用に変更
  contactLinks.forEach((link, index) => {
    // 既にモーダルリンクになっている場合はスキップ
    if (link.getAttribute('onclick') === 'openContactModal()') {
      return;
    }
    
    // CTA用のクラスを持っているか確認（スタイルを保持するため）
    const hasCtaClass = link.classList.contains('cta-button') || 
                        link.classList.contains('contact-btn') || 
                        link.classList.contains('button');
    
    // リンクのテキストを保存
    const linkText = link.innerHTML;
    
    // リンクの属性を変更
    link.setAttribute('href', 'javascript:void(0);');
    link.setAttribute('onclick', 'openContactModal()');
    
    // 元のテキストを復元
    link.innerHTML = linkText;
    
    console.log(`リンク ${index + 1} をモーダル化しました: ${linkText.replace(/<[^>]*>/g, '').trim()}`);
  });
  
  console.log('お問い合わせリンク変換処理完了');
  
  // 無料相談・お問い合わせリンク
  const freeConsultLinks = document.querySelectorAll('a[href*="contact"][href*="free"]');
  freeConsultLinks.forEach(link => {
    const linkText = link.innerHTML;
    link.setAttribute('href', 'javascript:void(0);');
    link.setAttribute('onclick', 'openContactModal()');
    link.innerHTML = linkText;
  });
  
  // お見積もりリンク
  const estimateLinks = document.querySelectorAll('a[href*="estimate"], a[href*="quote"]');
  estimateLinks.forEach(link => {
    const linkText = link.innerHTML;
    link.setAttribute('href', 'javascript:void(0);');
    link.setAttribute('onclick', 'openContactModal()');
    link.innerHTML = linkText;
  });
}

/**
 * メール送信処理
 * @param {FormData} formData フォームデータ
 * @returns {Promise} 送信結果のPromise
 */
function sendContactEmail(formData) {
  return new Promise((resolve, reject) => {
    // フォームデータからオブジェクトを作成
    const formDataObj = {};
    formData.forEach((value, key) => {
      formDataObj[key] = value;
    });
    
    // メール送信先
    const emailTo = 'acreate.team@gmail.com';
    
    // デモモードで動作（実際にはバックエンドAPIが必要）
    console.log('デモモード: フォームデータを送信しました', {
      to: emailTo,
      subject: 'ウェブサイトからのお問い合わせ',
      formData: formDataObj
    });
    
    // 成功時の動作をシミュレート
    setTimeout(() => {
      resolve({
        success: true,
        message: 'メールが正常に送信されました（デモモード）'
      });
    }, 1000);
    
    /* バックエンドAPI実装後は以下のコードを使用
    fetch('/api/send-contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: emailTo,
        subject: 'ウェブサイトからのお問い合わせ',
        formData: formDataObj
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('送信に失敗しました');
      }
      return response.json();
    })
    .then(data => {
      resolve(data);
    })
    .catch(error => {
      console.error('メール送信エラー:', error);
      reject(error);
    });
    */
  });
}

// グローバルに関数をエクスポート
window.sendContactEmail = sendContactEmail;
