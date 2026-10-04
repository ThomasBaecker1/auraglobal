(() => {
  'use strict';

  const state = {
    products: [],
    filtered: [],
    query: '',
    merchant: 'all',
    category: 'all',
    sort: 'relevance',
    visible: 24
  };

  const $ = (s) => document.querySelector(s);
  const els = {
    grid: $('[data-product-grid]'),
    query: $('[data-product-query]'),
    merchant: $('[data-product-merchant]'),
    category: $('[data-product-category]'),
    sort: $('[data-product-sort]'),
    count: $('[data-product-count]'),
    meta: $('[data-feed-meta]'),
    empty: $('[data-product-empty]'),
    more: $('[data-product-more]')
  };

  const norm = (v) => String(v ?? '').trim();
  const fold = (v) => norm(v).toLocaleLowerCase('de-DE')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const money = (value, currency = 'EUR') => {
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) return '';
    try {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: currency || 'EUR',
        maximumFractionDigits: 2
      }).format(n);
    } catch {
      return n.toFixed(2) + ' €';
    }
  };

  const esc = (s) => norm(s).replace(/[&<>"']/g, (c) => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));

  const urlOk = (s) => {
    try {
      const u = new URL(s, location.origin);
      return u.protocol === 'https:' || u.protocol === 'http:';
    } catch { return false; }
  };

  function savings(p) {
    const price = Number(p.price);
    const old = Number(p.oldPrice);
    if (!Number.isFinite(price) || !Number.isFinite(old) || price <= 0 || old <= price) return null;
    return Math.round((1 - price / old) * 100);
  }

  function searchable(p) {
    return fold([p.name,p.brand,p.merchant,p.category,p.description,p.keywords].filter(Boolean).join(' '));
  }

  function apply() {
    const q = fold(state.query);
    let rows = state.products.filter((p) => {
      if (state.merchant !== 'all' && norm(p.merchant) !== state.merchant) return false;
      if (state.category !== 'all' && norm(p.category) !== state.category) return false;
      if (q && !searchable(p).includes(q)) return false;
      return p.inStock !== false;
    });

    if (state.sort === 'price-asc') {
      rows.sort((a,b) => (Number(a.price)||Number.MAX_SAFE_INTEGER) - (Number(b.price)||Number.MAX_SAFE_INTEGER));
    } else if (state.sort === 'price-desc') {
      rows.sort((a,b) => (Number(b.price)||-1) - (Number(a.price)||-1));
    } else if (state.sort === 'merchant') {
      rows.sort((a,b) => norm(a.merchant).localeCompare(norm(b.merchant),'de'));
    } else {
      rows.sort((a,b) => {
        const aPrice = Number(a.price) > 0 ? 1 : 0;
        const bPrice = Number(b.price) > 0 ? 1 : 0;
        return bPrice - aPrice || norm(a.name).localeCompare(norm(b.name),'de');
      });
    }

    state.filtered = rows;
    render();
  }

  function card(p) {
    const price = money(p.price,p.currency);
    const old = money(p.oldPrice,p.currency);
    const save = savings(p);
    const img = urlOk(p.image) ? p.image : '/favicon.svg';
    const outbound = urlOk(p.url) ? p.url : '#';
    const internal = norm(p.internalUrl);
    const source = internal ? '<a class="pf-detail" href="'+esc(internal)+'">AuraGlobal-Vergleich ansehen →</a>' : '';
    const priceBlock = price
      ? '<div class="pf-price"><strong>'+esc(price)+'</strong>'+(old?'<del>'+esc(old)+'</del>':'')+'</div>'
      : '<div class="pf-price"><span>Preis beim Anbieter prüfen</span></div>';
    const badge = save && save > 0 ? '<span class="pf-sale">-'+save+' %</span>' : '';
    return '<article class="pf-card" data-product-card>'+
      '<div class="pf-image"><img loading="lazy" decoding="async" src="'+esc(img)+'" alt="'+esc(p.name)+'">'+badge+'</div>'+
      '<div class="pf-body"><div class="pf-topline"><span>'+esc(p.merchant)+'</span><span>'+esc(p.category || 'Produkt')+'</span></div>'+
      '<h2>'+esc(p.name)+'</h2>'+
      '<p>'+esc(p.description || 'Produktdetails und aktuellen Preis direkt beim Anbieter prüfen.')+'</p>'+
      priceBlock+
      '<div class="pf-actions">'+
      '<a class="pf-buy" href="'+esc(outbound)+'" target="_blank" rel="sponsored noopener" data-affiliate-product="'+esc(p.id)+'" data-affiliate-merchant="'+esc(p.merchant)+'">Angebot prüfen ↗</a>'+
      source+
      '</div><small class="pf-note">Anzeige · Produktdaten können sich beim Anbieter ändern.</small></div>'+
      '</article>';
  }

  function render() {
    if (!els.grid) return;
    const shown = state.filtered.slice(0,state.visible);
    els.grid.innerHTML = shown.map(card).join('');
    if (els.count) els.count.textContent = state.filtered.length.toLocaleString('de-DE') + ' Produkte';
    if (els.empty) els.empty.hidden = state.filtered.length !== 0;
    if (els.more) els.more.hidden = state.visible >= state.filtered.length;

    document.querySelectorAll('[data-affiliate-product]').forEach((a) => {
      a.addEventListener('click', () => {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'affiliate_click',
          source: 'product_finder',
          product_id: a.dataset.affiliateProduct,
          merchant: a.dataset.affiliateMerchant
        });
      }, {once:true});
    });
  }

  function fillSelect(el, values, label) {
    if (!el) return;
    el.innerHTML = '<option value="all">'+label+'</option>' + values.map(v => '<option value="'+esc(v)+'">'+esc(v)+'</option>').join('');
  }

  function bind() {
    els.query?.addEventListener('input', (e) => {
      state.query = e.target.value;
      state.visible = 24;
      apply();
    });
    els.merchant?.addEventListener('change', (e) => {
      state.merchant = e.target.value;
      state.visible = 24;
      apply();
    });
    els.category?.addEventListener('change', (e) => {
      state.category = e.target.value;
      state.visible = 24;
      apply();
    });
    els.sort?.addEventListener('change', (e) => {
      state.sort = e.target.value;
      apply();
    });
    els.more?.addEventListener('click', () => {
      state.visible += 24;
      render();
    });
  }

  async function init() {
    bind();
    try {
      const res = await fetch('/data/products.json', {cache:'no-store'});
      if (!res.ok) throw new Error('Produktdaten nicht erreichbar');
      const payload = await res.json();
      state.products = Array.isArray(payload.products) ? payload.products : [];
      const merchants = [...new Set(state.products.map(p => norm(p.merchant)).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'de'));
      const categories = [...new Set(state.products.map(p => norm(p.category)).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'de'));
      fillSelect(els.merchant,merchants,'Alle Shops');
      fillSelect(els.category,categories,'Alle Kategorien');
      if (els.meta) {
        const d = payload.updatedAt ? new Date(payload.updatedAt) : null;
        const stamp = d && !Number.isNaN(d.valueOf()) ? d.toLocaleString('de-DE',{dateStyle:'medium',timeStyle:'short'}) : 'wird aufgebaut';
        els.meta.textContent = 'Datenstand: '+stamp+' · '+state.products.length.toLocaleString('de-DE')+' Produkte · '+merchants.length+' Shops';
      }
      apply();
    } catch (err) {
      if (els.meta) els.meta.textContent = 'Produktkatalog wird gerade synchronisiert.';
      if (els.empty) els.empty.hidden = false;
    }
  }

  init();
})();