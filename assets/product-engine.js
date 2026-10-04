(() => {
  'use strict';

  const state = {
    products: [],
    filtered: [],
    query: '',
    merchant: 'all',
    category: 'all',
    sort: 'relevance',
    visible: 24,
    attribution: {}
  };

  const $ = (s) => document.querySelector(s);
  const els = {
    grid: $('[data-product-grid]'),
    query: $('[data-product-query]'),
    heroForm: $('[data-hero-search-form]'),
    heroQuery: $('[data-hero-search]'),
    merchant: $('[data-product-merchant]'),
    category: $('[data-product-category]'),
    sort: $('[data-product-sort]'),
    count: $('[data-product-count]'),
    meta: $('[data-feed-meta]'),
    empty: $('[data-product-empty]'),
    more: $('[data-product-more]'),
    catalog: $('#katalog'),
    assistant: $('#frag-auraglobal'),
    assistantForm: $('[data-assistant-form]'),
    assistantInput: $('[data-assistant-input]'),
    assistantOutput: $('[data-assistant-output]'),
    assistantVoice: $('[data-assistant-voice]')
  };

  const norm = (v) => String(v ?? '').trim();
  const fold = (v) => norm(v).toLocaleLowerCase('de-DE')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const esc = (s) => norm(s).replace(/[&<>"']/g, (c) => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));

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

  const urlOk = (s) => {
    try {
      const u = new URL(s, location.origin);
      return u.protocol === 'https:' || u.protocol === 'http:';
    } catch { return false; }
  };

  function slugRef(v,max=28) {
    return fold(v).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,max);
  }

  function captureAttribution() {
    const params = new URLSearchParams(location.search);
    const keys = ['utm_source','utm_medium','utm_campaign','utm_term','gclid'];
    const incoming = {};
    keys.forEach(k=>{
      const value = norm(params.get(k));
      if (value) incoming[k] = value.slice(0,120);
    });

    try {
      if (Object.keys(incoming).length) sessionStorage.setItem('ag_attribution',JSON.stringify(incoming));
      state.attribution = JSON.parse(sessionStorage.getItem('ag_attribution') || '{}') || {};
    } catch {
      state.attribution = incoming;
    }
  }

  function attributedUrl(raw,p) {
    if (!urlOk(raw)) return raw;
    try {
      const u = new URL(raw,location.origin);
      if (!/awin1\.com$/i.test(u.hostname) && !/\.awin1\.com$/i.test(u.hostname)) return raw;
      const source = slugRef(state.attribution.utm_source || (state.attribution.gclid ? 'google' : 'direct'),16);
      const campaign = slugRef(state.attribution.utm_campaign || 'organic',22);
      const term = slugRef(state.attribution.utm_term || '',18);
      const product = slugRef(p?.id || 'product',24);
      const ref = ['ag',source,campaign,term,product].filter(Boolean).join('_').slice(0,90);
      u.searchParams.set('clickref',ref);
      return u.toString();
    } catch {
      return raw;
    }
  }

  function savings(p) {
    const price = Number(p.price);
    const old = Number(p.oldPrice);
    if (!Number.isFinite(price) || !Number.isFinite(old) || price <= 0 || old <= price) return null;
    return Math.round((1 - price / old) * 100);
  }

  function searchable(p) {
    return fold([p.name,p.brand,p.merchant,p.category,p.description,p.keywords].filter(Boolean).join(' '));
  }

  function syncUrl() {
    const url = new URL(location.href);
    const set = (key, value, emptyValue = 'all') => {
      if (!value || value === emptyValue) url.searchParams.delete(key);
      else url.searchParams.set(key,value);
    };
    set('q',state.query,'');
    set('shop',state.merchant);
    set('category',state.category);
    set('sort',state.sort,'relevance');
    history.replaceState({},'',url.pathname + (url.searchParams.toString() ? '?' + url.searchParams.toString() : '') + url.hash);
  }

  function apply({updateUrl = true} = {}) {
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
        const aGuide = norm(a.internalUrl) ? 1 : 0;
        const bGuide = norm(b.internalUrl) ? 1 : 0;
        const aImage = urlOk(a.image) ? 1 : 0;
        const bImage = urlOk(b.image) ? 1 : 0;
        const aPrice = Number(a.price) > 0 ? 1 : 0;
        const bPrice = Number(b.price) > 0 ? 1 : 0;
        return bGuide - aGuide || bImage - aImage || bPrice - aPrice || norm(a.name).localeCompare(norm(b.name),'de');
      });
    }

    state.filtered = rows;
    render();
    if (updateUrl) syncUrl();
  }

  function card(p) {
    const price = money(p.price,p.currency);
    const old = money(p.oldPrice,p.currency);
    const save = savings(p);
    const img = urlOk(p.image) ? p.image : '/favicon.svg';
    const outbound = urlOk(p.url) ? attributedUrl(p.url,p) : '#';
    const internal = norm(p.internalUrl);
    const guideBadge = internal ? '<span class="pf-guide">AuraGlobal Guide</span>' : '';
    const source = internal
      ? '<a class="pf-detail" href="'+esc(internal)+'" data-guide-product="'+esc(p.id)+'">Vorher vergleichen →</a>'
      : '';
    const priceBlock = price
      ? '<div class="pf-price"><strong>'+esc(price)+'</strong>'+(old?'<del>'+esc(old)+'</del>':'')+'</div>'
      : '<div class="pf-price"><span>Aktuellen Preis beim Anbieter prüfen</span></div>';
    const badge = save && save > 0 ? '<span class="pf-sale">-'+save+' %</span>' : '';

    return '<article class="pf-card" data-product-card>'+
      '<div class="pf-image"><img loading="lazy" decoding="async" src="'+esc(img)+'" alt="'+esc(p.name)+'">'+badge+guideBadge+'</div>'+
      '<div class="pf-body"><div class="pf-topline"><span>'+esc(p.merchant)+'</span><span>'+esc(p.category || 'Produkt')+'</span></div>'+
      '<h2>'+esc(p.name)+'</h2>'+
      '<p>'+esc(p.description || 'Produktdetails, Verfügbarkeit und aktuellen Preis direkt beim Anbieter prüfen.')+'</p>'+
      priceBlock+
      '<div class="pf-actions">'+
      '<a class="pf-buy" href="'+esc(outbound)+'" target="_blank" rel="sponsored noopener" data-affiliate-product="'+esc(p.id)+'" data-affiliate-merchant="'+esc(p.merchant)+'">Zum Angebot ↗</a>'+
      source+
      '</div><small class="pf-note">Anzeige · Produktdaten und Verfügbarkeit können sich beim Anbieter ändern.</small></div>'+
      '</article>';
  }

  function render() {
    if (!els.grid) return;
    const shown = state.filtered.slice(0,state.visible);
    els.grid.innerHTML = shown.map(card).join('');
    if (els.count) {
      const label = state.filtered.length === 1 ? 'Produkt' : 'Produkte';
      els.count.textContent = state.filtered.length.toLocaleString('de-DE') + ' ' + label + (state.query ? ' für „'+state.query+'“' : '');
    }
    if (els.empty) els.empty.hidden = state.filtered.length !== 0;
    if (els.more) els.more.hidden = state.visible >= state.filtered.length;
    bindResultTracking();
  }

  function bindResultTracking() {
    document.querySelectorAll('[data-affiliate-product]').forEach((a) => {
      if (a.dataset.trackingBound) return;
      a.dataset.trackingBound = '1';
      a.addEventListener('click', () => {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'affiliate_click',
          source: a.dataset.source || 'product_finder',
          product_id: a.dataset.affiliateProduct,
          merchant: a.dataset.affiliateMerchant,
          query: state.query,
          utm_source: state.attribution.utm_source,
          utm_campaign: state.attribution.utm_campaign,
          utm_term: state.attribution.utm_term,
          gclid: state.attribution.gclid
        });
      });
    });

    document.querySelectorAll('[data-guide-product]').forEach((a) => {
      if (a.dataset.trackingBound) return;
      a.dataset.trackingBound = '1';
      a.addEventListener('click', () => {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'internal_comparison_click',
          source: a.dataset.source || 'product_finder',
          product_id: a.dataset.guideProduct,
          query: state.query
        });
      });
    });
  }

  function fillSelect(el, values, label) {
    if (!el) return;
    el.innerHTML = '<option value="all">'+label+'</option>' + values.map(v => '<option value="'+esc(v)+'">'+esc(v)+'</option>').join('');
  }

  function setQuery(value,{scroll=false}={}) {
    state.query = norm(value);
    state.visible = 24;
    if (els.query) els.query.value = state.query;
    if (els.heroQuery) els.heroQuery.value = state.query;
    apply();
    if (scroll && els.catalog) els.catalog.scrollIntoView({behavior:'smooth',block:'start'});
  }

  const STOPWORDS = new Set([
    'ich','will','mochte','möchte','brauche','suche','such','mir','mich','fur','für','ein','eine','einen','einer',
    'der','die','das','den','dem','des','mit','und','oder','aber','auch','was','welches','welcher','welche','bitte',
    'gib','zeig','finde','finden','am','im','in','auf','zum','zur','von','bei','es','ist','soll','sollte','sein',
    'moglichst','möglichst','gutes','gute','guten','produkt','produkte'
  ]);

  const INTENT_SYNONYMS = [
    {re:/\b(e[- ]?bike|ebike|fahrrad|rad)\b/i, terms:['e-bike','ebike','bike','fahrrad','tenways','urwahn','dotblue']},
    {re:/\b(sneaker|schuh|schuhe|jordan|adidas|nike)\b/i, terms:['sneaker','schuh','jordan','adidas','nike','house-of-sneakers']},
    {re:/\b(kaffee|espresso|kaffeemaschine|coffee)\b/i, terms:['kaffee','espresso','coffee','outin','nespresso']},
    {re:/\b(powerstation|solar|camping|strom)\b/i, terms:['powerstation','solar','allpowers','camping','energie']},
    {re:/\b(katze|kater|hund|haustier|futterautomat|trinkbrunnen|pet)\b/i, terms:['pet','katze','hund','petlibro','futter','brunnen']},
    {re:/\b(schmuck|ring|kette|armband|jewelry)\b/i, terms:['schmuck','ring','kette','armband','jewelry','ophelia']},
    {re:/\b(schreibtisch|homeoffice|buro|büro|desk)\b/i, terms:['schreibtisch','desk','desktronic','office','buro']},
    {re:/\b(rasen|garten|gartengerat|gartengerät|maher|mäher)\b/i, terms:['rasen','garten','rasendoktor','maher','mäher']},
    {re:/\b(porzellan|geschirr|teller|tasse)\b/i, terms:['porzellan','geschirr','teller','tasse','porzellantreff']},
    {re:/\b(fashion|mode|kleidung|jacke|hose|shirt)\b/i, terms:['fashion','mode','kleidung','momox']}
  ];

  function parseAmount(raw) {
    if (!raw) return null;
    const cleaned = raw.replace(/\s/g,'').replace(/\.(?=\d{3}(?:\D|$))/g,'').replace(',','.');
    const n = Number(cleaned);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  function parseIntent(query) {
    const q = fold(query);
    const upperMatch = q.match(/(?:unter|bis|max(?:imal)?|hochstens|höchstens|nicht mehr als)\s*(\d[\d.\s]*(?:,\d+)?)/i);
    const lowerMatch = q.match(/(?:ab|mindestens|min\.?)[\s:]*(\d[\d.\s]*(?:,\d+)?)/i);
    const maxPrice = upperMatch ? parseAmount(upperMatch[1]) : null;
    const minPrice = lowerMatch ? parseAmount(lowerMatch[1]) : null;
    const cheap = /\b(gunstig|günstig|billig|preis[- ]?leistung|sparsam|budget)\b/i.test(q);
    const premium = /\b(premium|luxus|hochwertig|beste|bestes|besten)\b/i.test(q);

    const rawTokens = q.split(/[^a-z0-9äöüß-]+/i)
      .map(t=>t.trim())
      .filter(t=>t.length > 1 && !STOPWORDS.has(t) && !/^\d+$/.test(t));

    const terms = new Set(rawTokens);
    for (const group of INTENT_SYNONYMS) {
      if (group.re.test(q)) group.terms.forEach(t=>terms.add(fold(t)));
    }

    return {query:norm(query), q, maxPrice, minPrice, cheap, premium, terms:[...terms]};
  }

  function productScore(p,intent) {
    const name = fold(p.name);
    const brand = fold(p.brand);
    const merchant = fold(p.merchant);
    const category = fold(p.category);
    const desc = fold(p.description);
    const whole = [name,brand,merchant,category,desc].join(' ');
    let score = 0;
    let matched = 0;

    for (const term of intent.terms) {
      if (!term) continue;
      let hit = false;
      if (name.includes(term)) { score += 8; hit = true; }
      if (category.includes(term)) { score += 6; hit = true; }
      if (brand.includes(term) || merchant.includes(term)) { score += 5; hit = true; }
      if (!hit && desc.includes(term)) { score += 2; hit = true; }
      if (hit) matched++;
    }

    const price = Number(p.price);
    const hasPrice = Number.isFinite(price) && price > 0;

    if (intent.maxPrice) {
      if (hasPrice && price <= intent.maxPrice) score += 8;
      else if (hasPrice && price > intent.maxPrice) score -= 20;
      else score -= 2;
    }
    if (intent.minPrice) {
      if (hasPrice && price >= intent.minPrice) score += 3;
      else if (hasPrice && price < intent.minPrice) score -= 5;
    }
    if (intent.cheap && hasPrice) score += Math.max(0, 5 - Math.log10(price + 1));
    if (intent.premium && norm(p.internalUrl)) score += 2;

    if (urlOk(p.image)) score += 1.5;
    if (hasPrice) score += 1.5;
    if (norm(p.internalUrl)) score += 2.5;
    if (p.inStock === false) score -= 100;

    return {score,matched,whole};
  }

  function recommendationReason(p,intent,rank) {
    const reasons = [];
    const price = Number(p.price);
    if (intent.maxPrice && Number.isFinite(price) && price > 0 && price <= intent.maxPrice) {
      reasons.push('liegt innerhalb deines Budgets');
    }
    if (intent.cheap && Number.isFinite(price) && price > 0) reasons.push('hat einen konkreten Preis im Feed');
    if (norm(p.internalUrl)) reasons.push('hat bereits einen AuraGlobal-Vergleich');
    if (urlOk(p.image)) reasons.push('liefert vollständige Produktdaten');
    if (!reasons.length) reasons.push('passt sprachlich am stärksten zu deiner Anfrage');
    const lead = rank === 0 ? 'Stärkster Match' : rank === 1 ? 'Alternative' : 'Weitere passende Option';
    return lead+': '+reasons.slice(0,2).join(' und ')+'.';
  }

  function assistantCard(p,intent,index) {
    const price = money(p.price,p.currency);
    const img = urlOk(p.image) ? p.image : '/favicon.svg';
    const outbound = urlOk(p.url) ? p.url : '#';
    const internal = norm(p.internalUrl);
    return '<article class="ag-rec">'+
      '<div class="ag-rec-rank">0'+(index+1)+'</div>'+
      '<div class="ag-rec-img"><img loading="lazy" decoding="async" src="'+esc(img)+'" alt="'+esc(p.name)+'"></div>'+
      '<div class="ag-rec-copy"><small>'+esc(p.merchant)+' · '+esc(p.category || 'Produkt')+'</small>'+
      '<h3>'+esc(p.name)+'</h3>'+
      '<p>'+esc(recommendationReason(p,intent,index))+'</p>'+
      '<div class="ag-rec-bottom">'+
      '<strong>'+(price ? esc(price) : 'Preis beim Anbieter')+'</strong>'+
      '<div class="ag-rec-actions">'+
      (internal?'<a href="'+esc(internal)+'" data-guide-product="'+esc(p.id)+'" data-source="ask_auraglobal">Vergleich →</a>':'')+
      '<a class="ag-rec-buy" href="'+esc(outbound)+'" target="_blank" rel="sponsored noopener" data-affiliate-product="'+esc(p.id)+'" data-affiliate-merchant="'+esc(p.merchant)+'" data-source="ask_auraglobal">Angebot ↗</a>'+
      '</div></div></div></article>';
  }

  function askAuraGlobal(query,{scroll=true}={}) {
    if (!els.assistantOutput) return;
    const intent = parseIntent(query);
    if (!intent.query) return;

    if (els.assistantInput) els.assistantInput.value = intent.query;
    if (els.heroQuery) els.heroQuery.value = intent.query;

    const ranked = state.products
      .map(p=>({p,...productScore(p,intent)}))
      .filter(x=>x.score > 3 && x.matched > 0)
      .sort((a,b)=>b.score-a.score || (Number(a.p.price)||Number.MAX_SAFE_INTEGER)-(Number(b.p.price)||Number.MAX_SAFE_INTEGER))
      .slice(0,3);

    const budgetText = intent.maxPrice ? ' · Budget bis '+money(intent.maxPrice,'EUR') : '';
    if (!ranked.length) {
      els.assistantOutput.innerHTML =
        '<div class="ag-answer-head"><span>AuraGlobal Beta</span><h3>Dafür habe ich im aktuellen Katalog noch keinen starken Treffer.</h3>'+
        '<p>Das ist genau die Art Anfrage, die AuraGlobal langfristig lösen soll. Aktuell durchsuchen wir 25 Awin-Partnerwelten; weitere Kategorien kommen schrittweise dazu.</p></div>'+
        '<button class="ag-show-catalog" type="button" data-assistant-catalog>Gesamten Katalog ansehen →</button>';
    } else {
      els.assistantOutput.innerHTML =
        '<div class="ag-answer-head"><span>AuraGlobal Beta'+esc(budgetText)+'</span>'+
        '<h3>Das sind aktuell die stärksten Matches zu „'+esc(intent.query)+'“.</h3>'+
        '<p>Die Beta gewichtet Suchbegriffe, Kategorie, Budget, verfügbare Produktdaten und vorhandene AuraGlobal-Guides. Sie ist noch keine vollständige KI-Beratung.</p></div>'+
        '<div class="ag-rec-grid">'+ranked.map((x,i)=>assistantCard(x.p,intent,i)).join('')+'</div>'+
        '<button class="ag-show-catalog" type="button" data-assistant-catalog>Alle passenden Produkte im Katalog →</button>';
    }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event:'ask_auraglobal',
      query:intent.query,
      max_price:intent.maxPrice || undefined,
      result_count:ranked.length
    });

    const catalogButton = els.assistantOutput.querySelector('[data-assistant-catalog]');
    catalogButton?.addEventListener('click',()=>{
      const compact = intent.terms.find(t=>t.length>2) || intent.query;
      setQuery(compact,{scroll:true});
    });

    bindResultTracking();
    if (scroll && els.assistant) els.assistant.scrollIntoView({behavior:'smooth',block:'start'});
  }

  function setupVoice() {
    if (!els.assistantVoice) return;
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      els.assistantVoice.hidden = true;
      return;
    }

    const recognition = new Recognition();
    recognition.lang = 'de-DE';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    els.assistantVoice.addEventListener('click',()=>{
      els.assistantVoice.classList.add('is-listening');
      els.assistantVoice.setAttribute('aria-label','Ich höre zu');
      try { recognition.start(); } catch {}
    });

    recognition.addEventListener('result',(e)=>{
      const text = e.results?.[0]?.[0]?.transcript || '';
      if (els.assistantInput) els.assistantInput.value = text;
      askAuraGlobal(text);
    });
    recognition.addEventListener('end',()=>{
      els.assistantVoice.classList.remove('is-listening');
      els.assistantVoice.setAttribute('aria-label','Anfrage sprechen');
    });
    recognition.addEventListener('error',()=>{
      els.assistantVoice.classList.remove('is-listening');
    });
  }

  function bind() {
    els.query?.addEventListener('input', (e) => {
      state.query = e.target.value;
      state.visible = 24;
      apply();
    });

    els.heroForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const value = els.heroQuery?.value || '';
      if (value.split(/\s+/).filter(Boolean).length >= 3) askAuraGlobal(value);
      else setQuery(value,{scroll:true});
    });

    els.assistantForm?.addEventListener('submit',(e)=>{
      e.preventDefault();
      askAuraGlobal(els.assistantInput?.value || '');
    });

    document.querySelectorAll('[data-assistant-example]').forEach((button)=>{
      button.addEventListener('click',()=>{
        const value = button.dataset.assistantExample || button.textContent;
        if (els.assistantInput) els.assistantInput.value = value;
        askAuraGlobal(value);
      });
    });

    document.querySelectorAll('[data-quick-search]').forEach((button) => {
      button.addEventListener('click', () => setQuery(button.dataset.quickSearch || button.textContent,{scroll:true}));
    });

    document.querySelectorAll('[data-video-load]').forEach((button) => {
      button.addEventListener('click', () => {
        const id = norm(button.dataset.videoLoad);
        if (!/^[A-Za-z0-9_-]{6,20}$/.test(id)) return;
        const frame = document.createElement('iframe');
        frame.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0&modestbranding=1';
        frame.title = 'AuraGlobal Produktvideo';
        frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        frame.referrerPolicy = 'strict-origin-when-cross-origin';
        frame.allowFullscreen = true;
        button.replaceWith(frame);
      }, {once:true});
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

    setupVoice();
  }

  function readInitialState() {
    const params = new URLSearchParams(location.search);
    state.query = norm(params.get('q'));
    state.merchant = norm(params.get('shop')) || 'all';
    state.category = norm(params.get('category')) || 'all';
    state.sort = norm(params.get('sort')) || 'relevance';
  }

  async function init() {
    readInitialState();
    captureAttribution();
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

      if (!merchants.includes(state.merchant)) state.merchant = 'all';
      if (!categories.includes(state.category)) state.category = 'all';
      if (!['relevance','price-asc','price-desc','merchant'].includes(state.sort)) state.sort = 'relevance';

      if (els.query) els.query.value = state.query;
      if (els.heroQuery) els.heroQuery.value = state.query;
      if (els.merchant) els.merchant.value = state.merchant;
      if (els.category) els.category.value = state.category;
      if (els.sort) els.sort.value = state.sort;

      if (els.meta) {
        const d = payload.updatedAt ? new Date(payload.updatedAt) : null;
        const stamp = d && !Number.isNaN(d.valueOf()) ? d.toLocaleString('de-DE',{dateStyle:'medium',timeStyle:'short'}) : 'wird aufgebaut';
        const sourceLabel = payload.source === 'awin-product-feed' ? 'Awin-Feed' : 'Startkatalog';
        els.meta.textContent = sourceLabel+' · Datenstand '+stamp+' · '+merchants.length+' Shops · '+state.products.length.toLocaleString('de-DE')+' Produkte';
      }

      apply({updateUrl:false});

      if (state.query && state.query.split(/\s+/).filter(Boolean).length >= 3) {
        askAuraGlobal(state.query,{scroll:false});
      }
    } catch (err) {
      if (els.meta) els.meta.textContent = 'Produktkatalog wird gerade synchronisiert.';
      if (els.empty) els.empty.hidden = false;
      if (els.assistantOutput) {
        els.assistantOutput.innerHTML = '<div class="ag-answer-head"><span>AuraGlobal Beta</span><h3>Der Produktkatalog wird gerade synchronisiert.</h3><p>Versuch es gleich noch einmal.</p></div>';
      }
    }
  }

  init();
})();