(function(){
  'use strict';

  function revealEmails(root){
    const nodes = (root || document).querySelectorAll('[data-email-user][data-email-domain]');
    nodes.forEach(function(el){
      const user = (el.getAttribute('data-email-user') || '').trim();
      const domain = (el.getAttribute('data-email-domain') || '').trim();
      if(!user || !domain) return;
      const addr = user + '@' + domain;
      // 既にテキストがあれば上書きしない
      if(!el.textContent || /@/.test(el.textContent) === false){
        el.textContent = addr;
      }
      // リンク化指定がある場合
      const link = el.closest('a[data-email-link]') || el.querySelector('a[data-email-link]');
      if(link){
        link.setAttribute('href', 'mailto:' + addr);
        if(!link.textContent) link.textContent = addr;
      }
    });
  }

  function observeMutations(){
    const mo = new MutationObserver(function(muts){
      for(const m of muts){
        if(m.type === 'childList' && m.addedNodes && m.addedNodes.length){
          m.addedNodes.forEach(function(n){
            if(n.nodeType === 1){
              revealEmails(n);
            }
          });
        }
      }
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  }

  window.initEmailProtection = function(){
    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', function(){
        revealEmails(document);
        observeMutations();
      });
    } else {
      revealEmails(document);
      observeMutations();
    }
  };

})();
