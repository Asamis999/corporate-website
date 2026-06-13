// モーダル関連の機能を管理するスクリプト

/**
 * モーダル初期化関数 - 全ページで利用可能
 */
window.initContactModal = function() {
  console.log('モーダル初期化関数実行');
  
  // モーダル要素の存在確認と取得
  const modal = document.getElementById('contact-modal');
  if (!modal) {
    console.error('モーダル要素が見つかりません');
    return;
  }
  
  // モーダル要素を見つけたらスタイルを確実に設定
  console.log('モーダル要素を見つけました', modal);
  
  // モーダルの初期スタイルを確実に設定
  modal.style.display = 'none';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.zIndex = '9999';
  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  modal.style.overflow = 'auto';
  
  // モーダル表示用CSSがあるか確認し、なければ追加
  if (!document.querySelector('link[href*="modal.css"]')) {
    const modalCssLink = document.createElement('link');
    modalCssLink.rel = 'stylesheet';
    modalCssLink.type = 'text/css';
    modalCssLink.href = '/assets/css/modal.css';
    document.head.appendChild(modalCssLink);
    console.log('モーダルCSSを追加しました');
  }
  
  // モーダルを開くグローバル関数
  window.openContactModal = function() {
    // モーダル要素を再取得（DOM変更に対応するため）
    const modalElement = document.getElementById('contact-modal');
    
    if (modalElement) {
      // モーダルスタイルを明示的に設定
      modalElement.style.display = 'block';
      modalElement.style.position = 'fixed';
      modalElement.style.top = '0';
      modalElement.style.left = '0';
      modalElement.style.width = '100%';
      modalElement.style.height = '100%';
      modalElement.style.zIndex = '9999';
      modalElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      modalElement.style.overflow = 'auto';
      
      // 背景スクロールを無効化
      document.body.style.overflow = 'hidden';
      
      console.log('モーダルを開きました');
    } else {
      console.error('モーダル要素が見つかりません（開く操作）');
    }
  };
  
  // モーダルを閉じる関数
  window.closeModal = function() {
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = ''; // スクロール復活
    } else {
      console.error('モーダル要素が見つかりません (閉じる操作)');
    }
  };
  
  // モーダル外をクリックした時にモーダルを閉じる
  window.addEventListener('click', function(event) {
    if (event.target === modal) {
      closeModal();
    }
  });
  
  // Escキーを押した時にモーダルを閉じる
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      closeModal();
    }
  });
  
  console.log('モーダル初期化完了');
};

// ページ読み込み時に自動実行
document.addEventListener('DOMContentLoaded', function() {
  // モーダル初期化
  window.initContactModal();
  
  // フォームの送信処理
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(event) {
      event.preventDefault();
      
      // バリデーション
      if (validateForm()) {
        sendFormData();
      }
    });
  }
  
  // フォーム検証関数
  function validateForm() {
    let isValid = true;
    const requiredFields = contactForm.querySelectorAll('[required]');
    let firstInvalidField = null;
    
    // エラーメッセージをクリア
    const errorMessages = contactForm.querySelectorAll('.error-message');
    errorMessages.forEach(message => message.remove());
    
    // 入力フィールドのエラースタイルをクリア
    const formFields = contactForm.querySelectorAll('input, select, textarea');
    formFields.forEach(field => field.classList.remove('error'));
    
    // 必須フィールドのチェック
    requiredFields.forEach(field => {
      let fieldValid = true;

      // checkbox / radio は value ではなく checked で判定
      if (field.type === 'checkbox' || field.type === 'radio') {
        fieldValid = field.checked;
      } else {
        fieldValid = !!field.value && !!field.value.trim();
      }

      if (!fieldValid) {
        isValid = false;
        field.classList.add('error');

        if (!firstInvalidField) {
          firstInvalidField = field;
        }
        
        // エラーメッセージの追加
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = '必須項目です';
        field.parentNode.appendChild(errorMessage);
      }
    });
    
    // メールアドレスの形式チェック
    const emailField = document.getElementById('email');
    if (emailField && emailField.value.trim() && !validateEmail(emailField.value)) {
      isValid = false;
      emailField.classList.add('error');

      if (!firstInvalidField) {
        firstInvalidField = emailField;
      }
      
      const errorMessage = document.createElement('div');
      errorMessage.className = 'error-message';
      errorMessage.textContent = '有効なメールアドレスを入力してください';
      emailField.parentNode.appendChild(errorMessage);
    }

    // エラーがある場合は先頭へフォーカスし、簡易アラート
    if (!isValid) {
      if (firstInvalidField && typeof firstInvalidField.focus === 'function') {
        firstInvalidField.focus();
      }
      alert('必須項目を入力（選択）してください。');
    }
    
    return isValid;
  }
  
  // メールアドレス検証関数
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
  
  // フォームデータ送信関数
  function sendFormData() {
    const formData = new FormData(contactForm);
    const submitButton = contactForm.querySelector('.btn-submit');

    // Netlify Formsに認識させるため form-name を補完
    if (!formData.get('form-name')) {
      const formName = contactForm.getAttribute('name') || 'contact';
      formData.append('form-name', formName);
    }
    
    // 送信ボタンを非活性化
    submitButton.disabled = true;
    submitButton.textContent = '送信中...';

    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
      params.append(key, value);
    }

    const actionUrl = contactForm.getAttribute('action') || window.location.pathname || '/';

    fetch(actionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    })
      .then(() => {
        // 送信成功
        submitButton.textContent = '送信完了！';

        window.alert('送信が完了しました。\n\nお問い合わせありがとうございます。内容を確認次第、担当者からご連絡いたします。');

        // 送信成功メッセージ
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = 'お問い合わせありがとうございます。内容を確認次第、担当者からご連絡いたします。';
        successMessage.style.color = '#28a745';
        successMessage.style.marginTop = '15px';
        successMessage.style.textAlign = 'center';
        contactForm.appendChild(successMessage);

        // フォームをクリア
        contactForm.reset();

        // 3秒後にモーダルを閉じる
        setTimeout(() => {
          closeModal();
          submitButton.disabled = false;
          submitButton.textContent = '内容を送信する';

          // 成功メッセージを削除
          successMessage.remove();
        }, 3000);
      })
      .catch(error => {
        // エラー時の処理
        console.error('フォーム送信エラー:', error);
        submitButton.textContent = 'エラーが発生しました';

        // エラーメッセージ
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = '送信に失敗しました。時間をおいて再度お試しください。';
        errorMessage.style.color = '#dc3545';
        errorMessage.style.marginTop = '15px';
        errorMessage.style.textAlign = 'center';
        contactForm.appendChild(errorMessage);

        // 5秒後にボタンを元に戻す
        setTimeout(() => {
          submitButton.disabled = false;
          submitButton.textContent = '内容を送信する';

          // エラーメッセージを削除
          errorMessage.remove();
        }, 5000);
      });
  }
});
