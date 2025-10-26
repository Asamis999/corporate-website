// 制作までの流れページ用JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // FAQのトグル機能
    const faqItems = document.querySelectorAll('.faq-question');
    
    faqItems.forEach(item => {
        item.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const icon = this.querySelector('.toggle-icon');
            
            if (answer.style.maxHeight) {
                answer.style.maxHeight = null;
                icon.textContent = '+';
            } else {
                answer.style.maxHeight = answer.scrollHeight + 'px';
                icon.textContent = '-';
            }
            
            // 他のアイテムを閉じる（オプション）
            // document.querySelectorAll('.faq-answer').forEach(el => {
            //     if (el !== answer) {
            //         el.style.maxHeight = null;
            //         el.previousElementSibling.querySelector('.toggle-icon').textContent = '+';
            //     }
            // });
        });
    });
});
