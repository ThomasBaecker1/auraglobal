(() => {
  'use strict';

  const cfg = window.AURA_INTENT_CONFIG || {};
  const $ = (s) => document.querySelector(s);
  const grid = $('[data-intent-grid]');
  const count = $('[data-intent-count]');
  const meta = $('[data-intent-meta]');
  const norm = (v) => String(v ?? '').trim();
  const fold = (v) => norm(v).toLocaleLowerCase('de-DE').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const esc = (s) => norm(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const money = (v,currency='EUR') => {
    const n = Number(v);
    if (!Number.isFinite(n) || n <= 0) return '';
    try { return new Intl.NumberFormat('de-DE',{style:'currency',currency,maximumFractionDigits:2}).format(n); }
    catch { return n.toFixed(2)+' €'; }
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

  function getAttribution() {
    const params = new URLSearchParams(location.search);
    const incoming = {};
    ['utm_source','utm_medium','utm_campaign','utm_term','gclid'].forEach(k=>{
      const v = norm(params.get(k));
      if (v) incoming[k] = v.slice(0,120);
    });
    try {
      if (Object.keys(incoming).length) sessionStorage.setItem('ag_attribution',JSON.stringify(incoming));
      return JSON.parse(sessionStorage.getItem('ag_attribution') || '{}') || {};
    } catch { return incoming; }
  }

  const attribution = getAttribution();

  function attributedUrl(raw,p) {
    if (!urlOk(raw)) return raw;
    try {
      const u = new URL(raw,location.origin);
      if (!/awin1\.com$/i.test(u.hostname) && !/\.awin1\.com$/i.test(u.hostname)) return raw;
      const source = slugRef(attribution.utm_source || (attribution.gclid ? 'google' : 'direct'),16);
      const campaign = slugRef(attribution.utm_campaign || cfg.slug || 'intent',22);
      const term = slugRef(attribution.utm_term || cfg.slug || '',18);
      const product = slugRef(p?.id || 'product',24);
      u.searchParams.set('clickref',['ag',source,campaign,term,product].filter(Boolean).join('_').slice(0,90));
      return u.toString();
    } catch { return raw; }
  }

  function productText(p) {
    return fold([p.name,p.brand,p.merchant,p.category,p.categoryRaw,p.description,p.keywords].filter(Boolean).join(' '));
  }

  function scoreProduct(p) {
    if (p.inStock === false) return -999;
    const text = productText(p);
    const merchantId = String(p.merchantId || '');
    let score = Number(p.qualityScore || 0);

    const include = (cfg.includeTerms || []).map(fold).filter(Boolean);
    for (const term of include) {
      if (!term) continue;
      if (fold(p.name).includes(term)) score += 8;
      else if (fold(p.category).includes(term)) score += 6;
      else if (text.includes(term)) score += 3;
    }

    if ((cfg.merchantIds || []).map(String).includes(merchantId)) score += 12;
    if ((cfg.preferredMerchants || []).some(m=>fold(p.merchant).includes(fold(m)))) score += 8;

    const price = Number(p.price);
    if (Number.isFinite(price) && price > 0) {
      score += 2;
      if (cfg.maxPrice) score += price <= cfg.maxPrice ? 9 : -30;
      if (cfg.minPrice) score += price >= cfg.minPrice ? 3 : -10;
    } else if (cfg.maxPrice || cfg.minPrice) {
      score -= 2;
    }

    if (urlOk(p.image)) score += 2;
    if (norm(p.internalUrl)) score += 2;
    return score;
  }

  function matchProduct(p) {
    const text = productText(p);
    const include = (cfg.includeTerms || []).map(fold).filter(Boolean);
    const merchantMatch = (cfg.merchantIds || []).map(String).includes(String(p.merchantId || '')) ||
      (cfg.preferredMerchants || []).some(m=>fold(p.merchant).includes(fold(m)));
    const termMatch = include.length ? include.some(t=>text.includes(t)) : true;

    const price = Number(p.price);
    if (cfg.maxPrice && Number.isFinite(price) && price > cfg.maxPrice) return false;
    if (cfg.minPrice && Number.isFinite(price) && price < cfg.minPrice) return false;

    return merchantMatch || termMatch;
  }

  function reason(p) {
    const reasons = [];
    const price = Number(p.price);
    if (cfg.maxPrice && Number.isFinite(price) && price > 0 && price <= cfg.maxPrice) reasons.push('liegt im gesetzten Budget');
    if ((cfg.merchantIds || []).map(String).includes(String(p.merchantId || ''))) reasons.push('kommt aus einem passenden Partnerfeed');
    if (Number(p.qualityScore || 0) >= 7) reasons.push('hat besonders vollständige Feed-Daten');
    if (norm(p.internalUrl)) reasons.push('hat bereits einen AuraGlobal-Guide');
    return (reasons.length ? reasons.slice(0,2).join(' und ') : 'passt sprachlich und thematisch zu dieser Suche') + '.';
  }

  function card(p,index) {
    const img = urlOk(p.image) ? p.image : '/favicon.svg';
    const price = money(p.price,p.currency);
    const outbound = urlOk(p.url) ? attributedUrl(p.url,p) : '#';
    const internal = norm(p.internalUrl);
    return '<article class="intent-card">'+
      '<div class="intent-card-media"><img loading="lazy" decoding="async" src="'+esc(img)+'" alt="'+esc(p.name)+'"><span class="intent-card-badge">Treffer '+String(index+1).padStart(2,'0')+'</span></div>'+
      '<div class="intent-card-body">'+
      '<div class="intent-card-meta"><span>'+esc(p.merchant)+'</span><span>'+esc(p.category || 'Produkt')+'</span></div>'+
      '<h3>'+esc(p.name)+'</h3>'+
      '<p>'+esc(reason(p))+'</p>'+
      '<div class="intent-price">'+(price ? esc(price) : '<span>Preis beim Anbieter prüfen</span>')+'</div>'+
      '<div class="intent-card-actions">'+
      '<a class="intent-buy" href="'+esc(outbound)+'" target="_blank" rel="sponsored noopener" data-intent-affiliate="'+esc(p.id)+'" data-merchant="'+esc(p.merchant)+'">Angebot prüfen ↗</a>'+
      (internal ? '<a class="intent-guide-link" href="'+esc(internal)+'">AuraGlobal Guide →</a>' : '')+
      '</div><small class="intent-disclosure">Anzeige · Preise und Verfügbarkeit können sich beim Anbieter ändern.</small>'+
      '</div></article>';
  }

  function trackLinks() {
    document.querySelectorAll('[data-intent-affiliate]').forEach(a=>{
      a.addEventListener('click',()=>{
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event:'affiliate_click',
          source:'intent_landing',
          landing_page:cfg.slug,
          product_id:a.dataset.intentAffiliate,
          merchant:a.dataset.merchant,
          utm_source:attribution.utm_source,
          utm_campaign:attribution.utm_campaign,
          utm_term:attribution.utm_term,
          gclid:attribution.gclid
        });
      },{once:true});
    });
  }

  async function init() {
    if (!grid) return;
    try {
      const res = await fetch('/data/products.json',{cache:'no-store'});
      if (!res.ok) throw new Error('catalog unavailable');
      const payload = await res.json();
      const products = Array.isArray(payload.products) ? payload.products : [];
      const ranked = products
        .filter(matchProduct)
        .map(p=>({p,score:scoreProduct(p)}))
        .filter(x=>x.score > 0)
        .sort((a,b)=>b.score-a.score || (Number(a.p.price)||Number.MAX_SAFE_INTEGER)-(Number(b.p.price)||Number.MAX_SAFE_INTEGER))
        .slice(0,Number(cfg.limit || 12))
        .map(x=>x.p);

      if (count) count.textContent = ranked.length ? ranked.length+' aktuelle Treffer' : 'Noch keine sicheren Treffer';
      if (meta) {
        const d = payload.updatedAt ? new Date(payload.updatedAt) : null;
        const stamp = d && !Number.isNaN(d.valueOf()) ? d.toLocaleString('de-DE',{dateStyle:'medium',timeStyle:'short'}) : 'aktuell';
        meta.textContent = 'Awin-Produktfeeds · Datenstand '+stamp;
      }

      if (!ranked.length) {
        grid.innerHTML = '<div class="intent-empty">Im aktuellen Partnerkatalog gibt es für diese genaue Kombination noch keinen sicheren Treffer. AuraGlobal zeigt bewusst nichts Erfundenes. <a href="/produkte.html">Gesamten Produktfinder öffnen →</a></div>';
      } else {
        grid.innerHTML = ranked.map(card).join('');
      }

      trackLinks();

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event:'intent_landing_view',
        landing_page:cfg.slug,
        result_count:ranked.length,
        utm_source:attribution.utm_source,
        utm_campaign:attribution.utm_campaign,
        utm_term:attribution.utm_term,
        gclid:attribution.gclid
      });
    } catch {
      grid.innerHTML = '<div class="intent-empty">Der Produktkatalog wird gerade synchronisiert. <a href="/produkte.html">Zum Produktfinder →</a></div>';
      if (count) count.textContent = 'Katalog wird synchronisiert';
    }
  }

  init();
})();