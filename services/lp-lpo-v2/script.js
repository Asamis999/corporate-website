(function () {
  const faqItems = [
    {
      q: 'どのくらいの期間で制作できますか?',
      a: 'プランによって異なりますが、簡易LPで2週間〜、通常LPで3週間〜が目安となります。'
    },
    {
      q: 'Shopify以外のプラットフォームでも対応できますか?',
      a: '可能です。WordPress、BASE、STORESなど各種プラットフォームに対応しています。'
    },
    {
      q: 'LPの素材（商品画像や文章）がない場合でも依頼できますか?',
      a: '可能です。ライティングや撮影ディレクションも含めて対応できます。'
    },
    {
      q: '公開後の修正対応はしてもらえますか?',
      a: '改善支援プランにて継続的なLPO支援が可能です。'
    },
    {
      q: '広告運用だけの依頼も可能ですか?',
      a: '可能です。まずは現状のLPを拝見し、最適なプランをご提案します。'
    }
  ];

  const faqList = document.getElementById('faq-list');
  if (!faqList) return;

  faqItems.forEach(({ q, a }) => {
    const item = document.createElement('div');
    item.className = 'faq-item';

    const question = document.createElement('button');
    question.type = 'button';
    question.className = 'faq-question';
    question.setAttribute('aria-expanded', 'false');

    const qText = document.createElement('span');
    qText.className = 'faq-q';
    qText.textContent = q;

    const icon = document.createElement('span');
    icon.className = 'faq-icon';
    icon.textContent = '+';

    question.appendChild(qText);
    question.appendChild(icon);

    const answer = document.createElement('div');
    answer.className = 'faq-answer';
    answer.hidden = true;
    answer.textContent = a;

    question.addEventListener('click', () => {
      const expanded = question.getAttribute('aria-expanded') === 'true';
      question.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      icon.textContent = expanded ? '+' : '−';
      answer.hidden = expanded;
    });

    item.appendChild(question);
    item.appendChild(answer);
    faqList.appendChild(item);
  });
})();
