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

  async function readCatalogChunk(response) {
    const bytes = new Uint8Array(await response.arrayBuffer());
    // Inspect the bytes: HTTP Content-Encoding may already have decompressed
    // the response, while .json.gz objects have no such header.
    if (bytes[0] === 0x1f && bytes[1] === 0x8b) {
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
      return new Response(stream).json();
    }
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  async function catalogFetch(primary,fallback) {
    const expected = primary.includes('manifest') ? 'merchants' : 'products';
    async function read(url) {
      const res = await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(8000)});
      if (!res.ok) throw new Error('Catalog unavailable');
      const payload = await res.clone().json();
      if (!Array.isArray(payload?.[expected])) throw new Error('Invalid catalog payload');
      return res;
    }
    const results = await Promise.allSettled([read(primary),read(fallback)]);
    const candidates = results.filter(r=>r.status === 'fulfilled').map(r=>r.value);
    if (!candidates.length) throw new Error('Catalog unavailable');
    if (expected === 'products' && candidates.length > 1) {
      const dates = await Promise.all(candidates.map(async res=>Date.parse((await res.clone().json()).updatedAt) || 0));
      return candidates[dates[1] > dates[0] ? 1 : 0];
    }
    return candidates[0];
  }

  function availableProducts(rows) {
    const seen = new Set();
    return (Array.isArray(rows) ? rows : []).filter(p => {
      if (!p?.id || String(p.merchantId) === '68034' || p.inStock === false || !urlOk(p.url)) return false;
      let destination;
      try {
        const link = new URL(p.url,location.origin);
        destination = link.searchParams.get('ued') || link.href;
        const target = new URL(destination);
        target.searchParams.delete('clickref');
        destination = target.href;
      } catch { return false; }
      const key = [p.merchantId,destination,p.currency || 'EUR'].join('|');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

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
    if (cfg.slug === 'e-bike-unter-2000') {
      const name = fold(p.name);
      // A mention of bikes in accessory descriptions is not a complete E-bike.
      const completeBike = /\be[ -]?bike\b|\be[ -]?klapprad\b|\be[ -]?dreirad\b|\bpedelec\b|\btenways (?:cgo|ago)/.test(name);
      const accessory = /ersatz|wechselakku|sattel|schlauch|schutzblech|tasche|bike bag|trager|garage|pumpe|endmontage|kennzeichen|pedale|lenkerhandgriff/.test(name);
      if (!completeBike || accessory) return false;
    }
    const include = (cfg.includeTerms || []).map(fold).filter(Boolean);
    const merchantMatch = (cfg.merchantIds || []).map(String).includes(String(p.merchantId || '')) ||
      (cfg.preferredMerchants || []).some(m=>fold(p.merchant).includes(fold(m)));
    const termMatch = include.length ? include.some(t=>text.includes(t)) : true;

    const price = Number(p.price);
    // A budget landing must never claim an unpriced product is under budget.
    if ((cfg.maxPrice || cfg.minPrice) && (!Number.isFinite(price) || price <= 0)) return false;
    if (cfg.maxPrice && price > cfg.maxPrice) return false;
    if (cfg.minPrice && price < cfg.minPrice) return false;

    return cfg.requireTerm ? termMatch : (merchantMatch || termMatch);
  }

  function rankProducts(rows) {
    const ranked = availableProducts(rows)
      .filter(matchProduct)
      .map(p=>({p,score:scoreProduct(p)}))
      .filter(x=>x.score > 0)
      .sort((a,b)=>b.score-a.score || (Number(a.p.price)||Infinity)-(Number(b.p.price)||Infinity));
    const models = new Map();
    for (const {p} of ranked) {
      // TENWAYS names separate the model/edition from colour and size with commas.
      // Preserve editions and other merchants' complete names; never merge by fuzzy text.
      const model = String(p.merchantId) === '72399' ? norm(p.name).split(',')[0].trim() : norm(p.name);
      const key = [p.merchantId,fold(model),p.currency || 'EUR'].join('|');
      const existing = models.get(key);
      if (!existing) models.set(key,{...p,displayName:model,variantCount:1});
      else {
        const variantCount = existing.variantCount + 1;
        if (Number(p.price) < Number(existing.price)) models.set(key,{...p,displayName:model,variantCount});
        else existing.variantCount = variantCount;
      }
    }
    return [...models.values()].slice(0,Number(cfg.limit || 12));
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
      '<h3>'+esc(p.displayName || p.name)+'</h3>'+
      '<p>'+esc(reason(p))+'</p>'+
      (p.variantCount > 1 ? '<p>'+esc(p.variantCount+' Varianten im Katalog. Verlinkte Auswahl: '+p.name+'. Andere Größen, Farben und Preise im Shop prüfen.')+'</p>' : '')+
      '<div class="intent-price">'+(price ? (p.variantCount > 1 ? 'Ab ' : '')+esc(price) : '<span>Preis beim Anbieter prüfen</span>')+'</div>'+
      '<div class="intent-card-actions">'+
      '<a class="intent-buy" href="'+esc(outbound)+'" target="_blank" rel="sponsored noopener" data-intent-affiliate="'+esc(p.id)+'" data-merchant="'+esc(p.merchant)+'">Angebot prüfen ↗</a>'+
      (internal ? '<a class="intent-guide-link" href="'+esc(internal)+'">AuraGlobal Guide →</a>' : '')+
      '</div><small class="intent-disclosure">Anzeige · Preise und Verfügbarkeit können sich beim Anbieter ändern.</small>'+
      '</div></article>';
  }

  function usefulFallback(reason) {
    // Never make up a product price when a live feed is temporarily unavailable.
    const links = {
      'e-bike-unter-2000':[
        ['TENWAYS E-Bikes nach Einsatz vergleichen','/tenways.html'],
        ['DOTBLUE Falt-E-Bikes ansehen','/dotblue.html']
      ],
      'portable-espressomaschine-camping':[
        ['OutIn Nano & Mino vergleichen','/outin.html'],
        ['Kaffee für unterwegs entdecken','/kaffee.html']
      ]
    };
    const choices = links[String(cfg.slug)] || [['Alle Kaufberatungen ansehen','/kaufberatung.html']];
    return '<div class="intent-empty"><strong>'+esc(reason)+'</strong>'+
      '<p>Die Vergleichsseiten helfen dir trotzdem weiter. Preise und Verfügbarkeit bitte direkt beim jeweiligen Anbieter prüfen.</p>'+
      '<div class="intent-fallback-links">'+choices.map(([label,href])=>'<a href="'+esc(href)+'">'+esc(label)+' →</a>').join('')+'</div></div>';
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
      const [previewRes,manifestRes] = await Promise.all([
        catalogFetch('/api/catalog?file=preview','/data/products.json'),
        catalogFetch('/api/catalog?file=manifest','/data/catalog/index.json').catch(()=>null)
      ]);
      if (!previewRes.ok) throw new Error('catalog unavailable');
      const payload = await previewRes.json();
      const candidateManifest = manifestRes?.ok ? await manifestRes.json() : null;
      const manifest = candidateManifest && (Date.parse(candidateManifest.updatedAt) || 0) >= (Date.parse(payload.updatedAt) || 0) ? candidateManifest : null;
      const byId = new Map((Array.isArray(payload.products) ? payload.products : []).map(p=>[String(p.id),p]));

      // Show the usable selection before waiting for optional full-catalog chunks.
      function renderSelection() {
        const ranked = rankProducts([...byId.values()]);
        if (count) count.textContent = ranked.length ? ranked.length+' aktuelle Modelle' : 'Noch keine sicheren Treffer';
        grid.innerHTML = ranked.length ? ranked.map(card).join('') : usefulFallback('Im aktuellen Partnerfeed ist gerade kein sicher passendes Angebot mit diesen Kriterien verfügbar.');
        trackLinks();
        return ranked;
      }
      renderSelection();

      if (Array.isArray(manifest?.merchants)) {
        const targetIds = new Set((cfg.merchantIds || []).map(String));
        const targetNames = (cfg.preferredMerchants || []).map(fold).filter(Boolean);
        const relevant = manifest.merchants.filter(m =>
          targetIds.has(String(m.merchantId || '')) ||
          targetNames.some(name=>fold(m.merchant).includes(name))
        );

        const paths = [...new Set(relevant.flatMap(m=>Array.isArray(m.chunks)?m.chunks:[]))];
        for (let i=0; i<paths.length; i+=3) {
          const chunks = await Promise.allSettled(paths.slice(i,i+3).map(async path=>{
            const res = await fetch(path,{cache:'no-store',signal:AbortSignal.timeout(8000)});
            if (!res.ok) return [];
            const chunk = await readCatalogChunk(res);
            return Array.isArray(chunk.products) ? chunk.products : [];
          }));
          for (const result of chunks) {
            if (result.status !== 'fulfilled') continue;
            for (const product of result.value) if (product?.id) byId.set(String(product.id),product);
          }
          renderSelection();
        }
      }

      const products = availableProducts([...byId.values()]);
      const ranked = renderSelection();

      if (meta) {
        const d = payload.updatedAt ? new Date(payload.updatedAt) : null;
        const stamp = d && !Number.isNaN(d.valueOf()) ? d.toLocaleString('de-DE',{dateStyle:'medium',timeStyle:'short'}) : 'aktuell';
        const total = Number(manifest?.productCount || payload.productCount || products.length);
        meta.textContent = (manifest ? 'Produktkatalog · Stand ' : 'Produktauswahl · Stand ')+stamp+' · '+total.toLocaleString('de-DE')+' Produkte';
      }

      if (!ranked.length) {
        grid.innerHTML = usefulFallback('Im aktuellen Partnerfeed ist gerade kein sicher passendes Angebot mit diesen Kriterien verfügbar.');
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
      grid.innerHTML = usefulFallback('Der Produktkatalog wird gerade synchronisiert.');
      if (count) count.textContent = 'Katalog wird synchronisiert';
    }
  }

  init();
})();