(() => {
  'use strict';
  const body = document.body;
  const button = document.querySelector('[data-mobile-filter-toggle]');
  if (button) {
    button.addEventListener('click', () => {
      const open = !body.classList.contains('ag-filters-open');
      body.classList.toggle('ag-filters-open', open);
      button.setAttribute('aria-expanded', String(open));
      button.querySelector('[data-filter-label]').textContent = open ? 'Filter schließen' : 'Filter & Sortierung';
      if (open) document.querySelector('[data-product-query]')?.focus({preventScroll:true});
    });
  }
  const nav = document.querySelector('.ag-mobile-dock');
  if (nav) {
    nav.querySelectorAll('a[href^="#"]').forEach(link=>{
      link.addEventListener('click', e=>{
        const target=document.querySelector(link.getAttribute('href'));
        if(!target)return;
        e.preventDefault();
        target.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'});
      });
    });
  }
})();