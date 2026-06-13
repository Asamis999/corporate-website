/**
 * 採用ページ用JavaScript
 */

// 代表プロフィールモーダル
function openProfileModal() {
    document.getElementById('profileModal').style.display = 'block';
}

function closeProfileModal() {
    document.getElementById('profileModal').style.display = 'none';
}

// 書類選考モーダル
function openApplicationModal() {
    document.getElementById('applicationModal').style.display = 'block';
}

function closeApplicationModal() {
    document.getElementById('applicationModal').style.display = 'none';
}

// 質問フォームモーダル
function openQuestionModal() {
    document.getElementById('questionModal').style.display = 'block';
}

function closeQuestionModal() {
    document.getElementById('questionModal').style.display = 'none';
}

// フォーム送信処理
function handleQuestionSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone') || '未記入',
        category: formData.get('category'),
        message: formData.get('message')
    };
    
    // カテゴリーのラベル取得
    const categoryLabels = {
        'job': '業務内容について',
        'condition': '雇用条件について',
        'process': '選考プロセスについて',
        'culture': '社風・働き方について',
        'other': 'その他'
    };
    
    // メール本文作成
    const subject = encodeURIComponent('【採用ページ】お問い合わせ - ' + data.name);
    const body = encodeURIComponent(
        '■お名前\n' + data.name + '\n\n' +
        '■メールアドレス\n' + data.email + '\n\n' +
        '■電話番号\n' + data.phone + '\n\n' +
        '■お問い合わせ種別\n' + categoryLabels[data.category] + '\n\n' +
        '■お問い合わせ内容\n' + data.message
    );
    
    // メールクライアントを開く
    window.location.href = `mailto:acreate.team@gmail.com?subject=${subject}&body=${body}`;
    
    // モーダルを閉じる
    setTimeout(() => {
        alert('メールクライアントが起動します。\nメールを送信してください。');
        closeQuestionModal();
        event.target.reset();
    }, 500);
}

function buildRecruitFormConfirmText(formData) {
    const entries = [];
    for (const [key, value] of formData.entries()) {
        if (key === 'bot-field') continue;
        if (key === 'form-name') continue;
        if (value instanceof File) {
            if (value && value.name) {
                entries.push([key, value.name]);
            }
            continue;
        }
        entries.push([key, String(value)]);
    }
    return entries
        .filter(([_, v]) => v && v.trim() !== '')
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n');
}

function buildRecruitFormFieldsForEmail(formData) {
    const fields = [];
    for (const [key, value] of formData.entries()) {
        if (key === 'bot-field') continue;
        if (key === 'form-name') continue;
        if (value instanceof File) {
            if (value && value.name) {
                fields.push({ key, value: value.name });
            }
            continue;
        }
        const v = String(value || '').trim();
        if (!v) continue;
        fields.push({ key, value: v });
    }
    return fields;
}

async function sendRecruitAutoReplyEmail({ toEmail, formName, fields }) {
    if (!toEmail) return;

    await fetch('/.netlify/functions/send-recruit-confirmation', {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            toEmail,
            formName,
            fields
        })
    });
}

async function submitNetlifyFormWithPopup(form, { afterSuccess } = {}) {
    const formData = new FormData(form);
    const formName = form.getAttribute('name') || formData.get('form-name');

    if (!formData.get('form-name') && formName) {
        formData.append('form-name', formName);
    }

    const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
    const originalDisabled = submitButton ? submitButton.disabled : false;
    if (submitButton) submitButton.disabled = true;

    try {
        const action = form.getAttribute('action') || window.location.pathname;
        const res = await fetch(action, {
            method: 'POST',
            body: formData
        });

        if (!res.ok) {
            throw new Error(`Form submit failed: ${res.status}`);
        }

        const toEmail = String(formData.get('email') || '').trim();
        const fields = buildRecruitFormFieldsForEmail(formData);
        try {
            await sendRecruitAutoReplyEmail({
                toEmail,
                formName,
                fields
            });
        } catch (e) {
            console.error(e);
        }

        const confirmText = buildRecruitFormConfirmText(formData);
        window.alert(`送信が完了しました。\n\n【送信内容】\n${confirmText}`);

        if (typeof afterSuccess === 'function') {
            afterSuccess();
        }
    } catch (e) {
        window.alert('送信に失敗しました。時間をおいて再度お試しください。');
        console.error(e);
    } finally {
        if (submitButton) submitButton.disabled = originalDisabled;
    }
}

// ファイル選択時の処理とフォーム送信処理
document.addEventListener('DOMContentLoaded', function() {
    // 履歴書
    const resumeInput = document.getElementById('app-resume');
    if (resumeInput) {
        resumeInput.addEventListener('change', function(e) {
            handleFileSelect(e, 'resume-file-name');
        });
    }
    
    // 職務経歴書
    const careerInput = document.getElementById('app-career');
    if (careerInput) {
        careerInput.addEventListener('change', function(e) {
            handleFileSelect(e, 'career-file-name');
        });
    }
    
    // 志望動機書
    const motivationInput = document.getElementById('app-motivation');
    if (motivationInput) {
        motivationInput.addEventListener('change', function(e) {
            handleFileSelect(e, 'motivation-file-name');
        });
    }
    
    // 応募フォーム送信前のバリデーション
    const applicationForm = document.getElementById('applicationForm');
    if (applicationForm) {
        applicationForm.addEventListener('submit', function(event) {
            // Netlify Formsが送信を処理するため、preventDefault()は基本不要
            // 送信前のバリデーションのみ実行
            const resumeInput = document.getElementById('app-resume');
            const careerInput = document.getElementById('app-career');
            const motivationInput = document.getElementById('app-motivation');

            const resume = resumeInput ? resumeInput.files[0] : null;
            const career = careerInput ? careerInput.files[0] : null;
            const motivation = motivationInput ? motivationInput.files[0] : null;

            // 既存の新卒ページ（/recruit/）向け：3ファイルが存在する場合のみ必須チェックを行う
            if (resumeInput && careerInput && motivationInput) {
                if (!resume || !career || !motivation) {
                    event.preventDefault();
                    alert('すべての必須書類（履歴書、職務経歴書、志望動機書）を添付してください。');
                    return false;
                }

                // ファイルサイズチェック（各10MB）
                const maxSize = 10 * 1024 * 1024;
                if (resume.size > maxSize || career.size > maxSize || motivation.size > maxSize) {
                    event.preventDefault();
                    alert('各ファイルのサイズは10MB以下にしてください。');
                    return false;
                }
            }
        });

        applicationForm.addEventListener('submit', function(event) {
            if (event.defaultPrevented) return;
            event.preventDefault();
            submitNetlifyFormWithPopup(applicationForm, {
                afterSuccess: () => {
                    closeApplicationModal();
                    applicationForm.reset();
                    // ファイル名表示をまとめてリセット（別職種ページの差分にも対応）
                    applicationForm.querySelectorAll('.file-name').forEach((el) => {
                        el.classList.remove('active');
                        el.textContent = '';
                    });
                }
            });
        });
    }

    const questionForm = document.querySelector('form.question-form[name="recruit-question"], form[name="recruit-question"].question-form');
    if (questionForm) {
        questionForm.addEventListener('submit', function(event) {
            if (event.defaultPrevented) return;
            event.preventDefault();
            submitNetlifyFormWithPopup(questionForm, {
                afterSuccess: () => {
                    closeQuestionModal();
                    questionForm.reset();
                }
            });
        });
    }

    // 任意ファイル入力（ページ追加を前提とした汎用処理）
    document.querySelectorAll('input[type="file"][data-file-name-target]').forEach((input) => {
        input.addEventListener('change', (e) => {
            const targetId = input.getAttribute('data-file-name-target');
            if (!targetId) return;
            handleFileSelect(e, targetId);
        });
    });
});

function handleFileSelect(event, displayId) {
    const file = event.target.files[0];
    const displayElement = document.getElementById(displayId);
    if (!displayElement) return;
    
    if (file) {
        // ファイルサイズチェック（10MB）
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            alert('ファイルサイズが大きすぎます。10MB以下のファイルを選択してください。');
            event.target.value = '';
            displayElement.classList.remove('active');
            return;
        }
        
        // accept=".pdf" の場合のみPDFチェック（ページごとの差分に対応）
        const accept = String(event.target.getAttribute('accept') || '').toLowerCase();
        if (accept.includes('.pdf') && file.type !== 'application/pdf') {
            alert('PDF形式のファイルを選択してください。');
            event.target.value = '';
            displayElement.classList.remove('active');
            return;
        }
        
        displayElement.innerHTML = '<i class="fas fa-file-pdf"></i> ' + file.name + ' (' + formatFileSize(file.size) + ')';
        displayElement.classList.add('active');
    } else {
        displayElement.classList.remove('active');
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}


// モーダル外クリックで閉じる
window.onclick = function(event) {
    const profileModal = document.getElementById('profileModal');
    const applicationModal = document.getElementById('applicationModal');
    const questionModal = document.getElementById('questionModal');
    
    if (event.target == profileModal) {
        profileModal.style.display = 'none';
    }
    if (event.target == applicationModal) {
        applicationModal.style.display = 'none';
    }
    if (event.target == questionModal) {
        questionModal.style.display = 'none';
    }
}

// スムーススクロール
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '#profileModal') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
});
