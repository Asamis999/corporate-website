/**
 * プログレッシブ型お問い合わせフォーム用JavaScript
 * ステップ遷移・動的表示のロジック実装
 *
 */

function encodeFormData(formData) {
  const params = new URLSearchParams();
  for (const [key, value] of formData.entries()) {
    params.append(key, value);
  }
  return params.toString();
}

document.addEventListener('DOMContentLoaded', function() {
  // モーダルが読み込まれた後に初期化
  initContactForm();
  
  // フォームの送信イベント
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', handleFormSubmit);
  }
});

/**
 * お問い合わせフォームの初期化
 */
function initContactForm() {
  // 目的選択に応じた詳細項目の表示切替
  const purposeSelect = document.getElementById('inquiry-purpose');
  if (purposeSelect) {
    purposeSelect.addEventListener('change', function() {
      // 前回選択の詳細項目を全て非表示
      const detailSections = document.querySelectorAll('.service-details');
      detailSections.forEach(section => {
        section.style.display = 'none';
      });
      
      // 選択した目的に応じた詳細項目を表示
      const selectedValue = this.value;
      if (selectedValue) {
        const targetDetails = document.getElementById(`details-${selectedValue}`);
        if (targetDetails) {
          targetDetails.style.display = 'block';
        }
      }
    });
  }
  
  console.log('プログレッシブフォーム初期化完了');
}

/**
 * ステップ間の移動処理
 * @param {number} currentStep 現在のステップ番号
 * @param {number} nextStep 次のステップ番号
 */
window.nextStep = function(currentStep, nextStep) {
  // バリデーション
  if (!validateStep(currentStep)) {
    return; // バリデーション失敗時は次に進まない
  }
  
  // 現在のステップを非アクティブに
  document.querySelector(`.step-content[id="step-${currentStep}"]`).classList.remove('active');
  document.querySelector(`.step[data-step="${currentStep}"]`).classList.remove('active');
  
  // 次のステップをアクティブに
  document.querySelector(`.step-content[id="step-${nextStep}"]`).classList.add('active');
  document.querySelector(`.step[data-step="${nextStep}"]`).classList.add('active');
  
  // スクロール位置を先頭に戻す
  document.querySelector('.modal-content').scrollTop = 0;
}

/**
 * 前のステップに戻る
 * @param {number} currentStep 現在のステップ番号
 * @param {number} prevStep 前のステップ番号
 */
window.prevStep = function(currentStep, prevStep) {
  // 現在のステップを非アクティブに
  document.querySelector(`.step-content[id="step-${currentStep}"]`).classList.remove('active');
  document.querySelector(`.step[data-step="${currentStep}"]`).classList.remove('active');
  
  // 前のステップをアクティブに
  document.querySelector(`.step-content[id="step-${prevStep}"]`).classList.add('active');
  document.querySelector(`.step[data-step="${prevStep}"]`).classList.add('active');
  
  // スクロール位置を先頭に戻す
  document.querySelector('.modal-content').scrollTop = 0;
}

/**
 * 各ステップのバリデーション
 * @param {number} stepNumber バリデーション対象のステップ番号
 * @returns {boolean} バリデーション結果
 */
function validateStep(stepNumber) {
  switch(stepNumber) {
    case 1:
      // ステップ1のバリデーション（目的選択）
      const purpose = document.getElementById('inquiry-purpose').value;
      if (!purpose) {
        alert('お問い合わせの目的を選択してください');
        return false;
      }
      
      // 希望内容（少なくとも1つ選択）
      const requestTypes = document.querySelectorAll('input[name="request-type[]"]:checked');
      if (requestTypes.length === 0) {
        alert('希望内容を少なくとも1つ選択してください');
        return false;
      }
      
      return true;
      
    case 2:
      // ステップ2は任意項目のみなのでバリデーションは不要
      return true;
      
    case 3:
      // ステップ3のバリデーションは送信ボタン時に自動的に行われる
      return true;
      
    default:
      return true;
  }
}

/**
 * フォーム送信処理
 * @param {Event} event 送信イベント
 */
function handleFormSubmit(event) {
  event.preventDefault();
  
  // 必須項目の検証（HTML5のrequired属性で行われる）
  
  // プライバシーポリシーに同意したか確認
  const privacyAgree = document.getElementById('privacy-agree');
  if (!privacyAgree.checked) {
    alert('プライバシーポリシーに同意してください');
    return;
  }
  
  // フォームデータ取得
  const formData = new FormData(event.target);

  // Netlify Formsに認識させるため form-name を補完
  if (!formData.get('form-name')) {
    const formName = event.target.getAttribute('name') || 'contact';
    formData.append('form-name', formName);
  }
  
  // 送信中表示
  document.querySelector('.btn-submit').textContent = '送信中...';
  document.querySelector('.btn-submit').disabled = true;
  
  fetch('/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: encodeFormData(formData)
  })
    .then(() => {
      showCompletionMessage();
    })
    .catch(error => {
      alert('送信に失敗しました。時間をおいて再度お試しください。');
      console.error('送信エラー:', error);

      // ボタンを元に戻す
      document.querySelector('.btn-submit').textContent = '送信する';
      document.querySelector('.btn-submit').disabled = false;
    });
}

/**
 * 送信完了メッセージの表示
 */
function showCompletionMessage() {
  // フォーム内容を非表示
  const formContent = document.getElementById('contact-form');
  formContent.innerHTML = '';
  
  // 完了メッセージを表示
  const completionMessage = document.createElement('div');
  completionMessage.className = 'completion-message';
  completionMessage.innerHTML = `
    <div class="success-icon">✓</div>
    <h3>お問い合わせありがとうございます</h3>
    <p>内容を確認の上、担当者より連絡いたします。</p>
    <p>通常、1営業日以内にご連絡いたします。</p>
    <div class="next-actions">
      <h4>次のステップ</h4>
      <a href="#" class="next-action-btn">日程調整カレンダーを開く</a>
      <a href="#" class="next-action-btn">資料をダウンロード</a>
    </div>
    <button type="button" class="btn-close" onclick="closeModal()">閉じる</button>
  `;
  
  formContent.appendChild(completionMessage);
}

// グローバル関数エクスポート
window.initContactForm = initContactForm;
