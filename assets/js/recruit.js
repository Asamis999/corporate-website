/**
 * 採用ページ用JavaScript
 */

// 代表プロフィールモーダル
function openModal() {
    document.getElementById('profileModal').style.display = 'block';
}

function closeModal() {
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
            const resume = document.getElementById('app-resume').files[0];
            const career = document.getElementById('app-career').files[0];
            const motivation = document.getElementById('app-motivation').files[0];
            
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
        });
    }
});

function handleFileSelect(event, displayId) {
    const file = event.target.files[0];
    const displayElement = document.getElementById(displayId);
    
    if (file) {
        // ファイルサイズチェック（10MB）
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            alert('ファイルサイズが大きすぎます。10MB以下のファイルを選択してください。');
            event.target.value = '';
            displayElement.classList.remove('active');
            return;
        }
        
        // PDFチェック
        if (file.type !== 'application/pdf') {
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
