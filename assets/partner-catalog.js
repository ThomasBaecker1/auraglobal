(() => {
  'use strict';
  const root = document.querySelector('[data-partner-catalog]');
  if (!root) return;
  const input = root.querySelector('[data-partner-search]');
  const mainInput = document.querySelector('[data-product-query]');
  const category = root.querySelector('[data-partner-category]');
  const status = root.querySelector('[data-partner-status]');
  const grid = root.querySelector('[data-partner-grid]');
  const more = root.querySelector('[data-partner-more]');
  const empty = root.querySelector('[data-partner-empty]');
  let entries = [];
  let expanded = false;

  const clean = value => String(value || '').trim();
  const fold = value => clean(value).toLocaleLowerCase('de-DE')
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const esc = value => clean(value).replace(/[&<>"']/g, char => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[char]));

  function isAllowedLink(href) {
    if (/^\/[a-z0-9-]+\.html$/.test(href)) return href !== '/krankenkasseninfo.html';
    try {
      const u = new URL(href);
      return u.protocol === 'https:' && u.hostname === 'www.awin1.com'
        && u.pathname === '/cread.php'
        && u.searchParams.get('awinaffid') === '3076553'
        && /^\d+$/.test(u.searchParams.get('awinmid') || '');
    } catch { return false; }
  }

  function render() {
    const q = fold(input.value);
    const terms = q.split(/\s+/).filter(Boolean);
    const selected = category.value;
    const filtered = entries.filter(item => (selected === 'all' || item.group === selected)
      && terms.every(term => item.search.includes(term)
        || (term === 'iphone' && /\b(smartphone|handy|mobiltelefon|apple)\b/.test(item.search))
        || (term === 'laptop' && /\b(notebook|computer)\b/.test(item.search))));
    const visible = expanded || terms.length || selected !== 'all' ? filtered : filtered.slice(0, 8);
    grid.innerHTML = visible.map(item => {
      const external = item.external;
      const rel = external ? ' target="_blank" rel="sponsored noopener noreferrer"' : '';
      const label = external ? 'Zum britischen Partnershop ↗' : 'Kaufberatung &amp; Shopzugang →';
      return '<article class="ag-partner-item">'
        + '<div class="ag-partner-kind">'+esc(item.groupLabel)+(external ? ' · UK' : '')+'</div>'
        + '<h3>'+esc(item.name)+'</h3>'
        + '<p>'+esc(item.description)+'</p>'
        + '<a href="'+esc(item.href)+'"'+rel+'>'+label+'</a>'
        + '</article>';
    }).join('');
    const totals = entries.length;
    status.textContent = totals+' verlinkte Awin-Partnerprogramme · '+filtered.length+' passende Marken'
      + (filtered.length !== visible.length ? ' · '+visible.length+' angezeigt' : '');
    empty.hidden = filtered.length > 0;
    more.hidden = expanded || filtered.length <= 8 || terms.length > 0 || selected !== 'all';
    more.setAttribute('aria-expanded', String(expanded));
  }

  async function init() {
    try {
      const res = await fetch('/marken.html', {cache:'no-store', signal:AbortSignal.timeout(10000)});
      if (!res.ok) throw new Error('directory unavailable');
      const page = new DOMParser().parseFromString(await res.text(), 'text/html');
      entries = [...page.querySelectorAll('a.directory-card')].map(card => {
        const href = clean(card.getAttribute('href')).replace(/&amp;/g, '&');
        if (!isAllowedLink(href)) return null;
        const name = clean(card.querySelector('h3')?.textContent);
        const group = clean(card.closest('[data-group]')?.id) || 'andere';
        const groupLabel = clean(card.closest('[data-group]')?.querySelector('h2')?.textContent) || 'Partner';
        const description = clean(card.querySelector('p')?.textContent);
        const keywords = clean(card.getAttribute('data-search'));
        if (!name) return null;
        return {name,group,groupLabel,description,href,external:href.startsWith('https://'),
          search:fold([name,groupLabel,description,keywords].join(' '))};
      }).filter(Boolean);
      if (!entries.length) throw new Error('no partner programmes');
      entries.sort((a,b) => a.name.localeCompare(b.name,'de'));
      const options = [...new Map(entries.map(item => [item.group,item.groupLabel])).entries()]
        .sort((a,b) => a[1].localeCompare(b[1],'de'));
      category.innerHTML = '<option value="all">Alle Partnerkategorien</option>'
        + options.map(([id,label])=>'<option value="'+esc(id)+'">'+esc(label)+'</option>').join('');
      input.disabled = false;
      category.disabled = false;
      input.value = mainInput?.value.trim() || new URLSearchParams(location.search).get('q') || '';
      render();
    } catch (error) {
      status.textContent = 'Partnerübersicht vorübergehend nicht geladen.';
      grid.innerHTML = '<p>Alle Marken und Vergleichsseiten sind weiterhin erreichbar: <a href="/marken.html">Partnerübersicht öffnen →</a></p>';
      more.hidden = true;
    }
  }

  input.addEventListener('input', () => { expanded = false; render(); });
  mainInput?.addEventListener('input', () => { input.value = mainInput.value; category.value = 'all'; expanded = false; if(entries.length)render(); });
  document.addEventListener('ag:catalog-search', event => { input.value = event.detail?.query || ''; category.value = 'all'; expanded = false; if (entries.length) render(); });
  document.addEventListener('ag:product-search', event => {
    const query = clean(event.detail?.query);
    if (input.value !== query) input.value = query;
    category.value = 'all';
    expanded = false;
    if (entries.length) render();
  });
  category.addEventListener('change', () => { expanded = false; render(); });
  more.addEventListener('click', () => { expanded = true; render(); });
  init();
})();
