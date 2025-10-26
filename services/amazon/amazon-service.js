// ====== Analytics utility ======
window.dataLayer = window.dataLayer || [];
function dl(e){ try{ window.dataLayer.push(e); }catch(err){ console.debug('[dataLayer]', e); } }

// Year
document.addEventListener('DOMContentLoaded', () => {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
});

// CTA click tracking（全CTA共通）
document.addEventListener('click', (e)=>{
  const el = e.target.closest('[data-cta]');
  if(!el) return;
  dl({
    event:'lp_amazon_cta_click',
    cta_label:el.getAttribute('data-cta'),
    section:el.getAttribute('data-section')||'unknown'
  });
});

// Scroll depth（25/50/75）
(function(){
  const sent={p25:false,p50:false,p75:false};
  function onScroll(){
    const h=document.documentElement;
    const scrolled=(h.scrollTop)/(h.scrollHeight-h.clientHeight);
    if(!sent.p25 && scrolled>=.25){ sent.p25=true; dl({event:'lp_amazon_scroll_25'}); }
    if(!sent.p50 && scrolled>=.50){ sent.p50=true; dl({event:'lp_amazon_scroll_50'}); }
    if(!sent.p75 && scrolled>=.75){ sent.p75=true; dl({event:'lp_amazon_scroll_75'}); }
  }
  document.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
})();

// FAQ toggle：高さアニメ＋aria＋計測（開いた時）
(function(){
  const list = document.querySelectorAll('#faq details');
  list.forEach((d, idx)=>{
    const s=d.querySelector('summary');
    const body=d.querySelector('.faq-body');
    s?.setAttribute('aria-expanded', d.open ? 'true':'false');
    if(body && !d.open){ body.style.height='0px'; body.style.overflow='hidden'; }

    d.addEventListener('toggle', ()=>{
      s?.setAttribute('aria-expanded', d.open ? 'true':'false');
      if(!body) return;
      if(d.open){
        // 計測
        const qid = d.getAttribute('data-qid') || `q${idx+1}`;
        dl({event:'lp_amazon_faq_open', q_id: qid});

        const h=body.scrollHeight; body.style.height=h+'px';
        const end=()=>{ body.style.height='auto'; body.removeEventListener('transitionend', end); };
        body.addEventListener('transitionend', end);
      }else{
        const h=body.scrollHeight; body.style.height=h+'px';
        requestAnimationFrame(()=>{ body.style.height='0px'; });
      }
    });
  });
})();

// スクロール時のフローティングCTA表示/非表示
document.addEventListener('DOMContentLoaded', () => {
  const floatCta = document.querySelector('.float-cta');
  const heroSection = document.querySelector('.hero');
  
  if (floatCta && heroSection) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > heroSection.offsetHeight) {
        floatCta.style.display = 'block';
      } else {
        floatCta.style.display = 'none';
      }
    });
  }
  
  // スムーススクロール
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      
      // #だけのリンクはスキップ
      if (href === '#') return;
      
      e.preventDefault();
      
      const target = document.querySelector(href);
      if (target) {
        const headerOffset = 80; // ヘッダーの高さに合わせて調整
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
});
