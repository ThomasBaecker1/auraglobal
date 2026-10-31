(() => {
  'use strict';
  const input = document.getElementById('brand-filter');
  if (!input) return;
  const cards = [...document.querySelectorAll('.directory-card')];
  const groups = [...document.querySelectorAll('[data-group]')];
  const buttons = [...document.querySelectorAll('[data-brand-category]')];
  const count = document.getElementById('brand-count');
  const empty = document.getElementById('directory-empty');
  const normalize = value => String(value).toLocaleLowerCase('de-DE')
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  const index = cards.map(card => ({ card, hay: normalize((card.dataset.search || '') + ' ' + card.textContent), group: card.closest('[data-group]')?.id }));
  const params = new URLSearchParams(location.search);
  let category = buttons.some(button => button.dataset.brandCategory === params.get('category')) ? params.get('category') : 'all';
  input.value = params.get('q') || '';

  function apply() {
    const words = normalize(input.value).split(/\s+/).filter(Boolean);
    let visible = 0;
    for (const item of index) {
      const show = (category === 'all' || item.group === category) && words.every(word => item.hay.includes(word));
      item.card.hidden = !show;
      item.card.style.display = show ? 'flex' : 'none';
      if (show) visible++;
    }
    for (const group of groups) group.hidden = ![...group.querySelectorAll('.directory-card')].some(card => !card.hidden);
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.brandCategory === category));
    count.textContent = String(visible);
    empty.style.display = visible ? 'none' : 'block';
    const url = new URL(location.href);
    input.value.trim() ? url.searchParams.set('q', input.value.trim()) : url.searchParams.delete('q');
    category !== 'all' ? url.searchParams.set('category', category) : url.searchParams.delete('category');
    history.replaceState(null, '', url.pathname + url.search + url.hash);
  }
  input.addEventListener('input', apply);
  for (const button of buttons) button.addEventListener('click', () => { category = button.dataset.brandCategory; apply(); });
  document.getElementById('reset-brand-filter')?.addEventListener('click', () => { category = 'all'; input.value = ''; apply(); input.focus(); });
  apply();
})();
