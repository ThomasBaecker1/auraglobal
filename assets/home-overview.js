/* Homepage market overview: count only rendered partners, enrich with joined Awin feeds. */
(() => {
'use strict';
const grid=document.querySelector('[data-live-partner-grid]');
if(!grid)return;
const fmt=n=>Number(n).toLocaleString('de-DE');
const normal=v=>String(v||'').toLocaleLowerCase('de-DE').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/&/g,'und').replace(/[^a-z0-9]/g,'');
const text=(selector,value)=>document.querySelectorAll(selector).forEach(el=>{el.textContent=String(value)});
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
function publishCounts(){
  const cards=[...grid.querySelectorAll('.equal-card')];
  text('[data-live-partners]',fmt(cards.length));
  const visible=cards.filter(card=>!card.hidden).length;
  text('[data-visible-partners]',fmt(visible));
  text('[data-partner-filter-info]',visible===cards.length?'Alle Produktwelten auf dieser Seite':'Passende Produktwelten');
}
publishCounts();
document.addEventListener('ag:partner-filtered',publishCounts);
async function fetchJson(url) {
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),8000);
  try{const r=await fetch(url,{cache:'no-store',signal:controller.signal});if(!r.ok)throw new Error('feed not available');return await r.json()}
  finally{clearTimeout(timer)}
}
async function expandCatalog(){
  let manifest;
  try{manifest=await fetchJson('/api/catalog?file=manifest')}
  catch{return}
  if(!Array.isArray(manifest?.merchants))return;
  // Awin feed merchants are not the same as public brand-directory cards.
  // Count only merchants with a real product feed in the joined-program manifest.
  const feedMerchants=Array.isArray(manifest.merchants)
    ?manifest.merchants.filter(m=>Number(m.productCount)>0&&String(m.merchantId)!=='68034').length
    :0;
  if(feedMerchants>0)text('[data-live-programs]',fmt(feedMerchants));
  const count=Number(manifest.productCount);
  if(Number.isFinite(count)&&count>0){
    text('[data-live-products]',fmt(count));
    const hint=document.querySelector('[data-catalog-stamp]');
    if(hint && manifest.updatedAt){
      const d=new Date(manifest.updatedAt);
      if(!Number.isNaN(d.getTime()))hint.title='Zuletzt aktualisiert: '+d.toLocaleString('de-DE');
    }
  }
  const cards=[...grid.querySelectorAll('.equal-card')];
  const hrefs=new Set(cards.map(c=>c.getAttribute('href')));
  const names=new Set(cards.map(c=>normal(c.querySelector('.equal-logo b')?.textContent || c.getAttribute('aria-label') || '')));
  const pending=(manifest.merchants||[]).filter(m=>{
    if(!m||Number(m.productCount)<=0||String(m.merchantId)==='68034')return false;
    if(m.internalUrl && hrefs.has(m.internalUrl))return false;
    const name=normal(m.merchant).replace(/(deat|de|at|ch)$/,'');
    if([...names].some(n=>n===name || (name.length>5 && n.length>5 && (n.startsWith(name)||name.startsWith(n)))))return false;
    names.add(name);return true;
  });
  if(!pending.length)return;
  let previewProducts=[];
  try{const p=await fetchJson('/api/catalog?file=preview');if(Array.isArray(p.products))previewProducts=p.products}catch{}
  const photos=new Map();
  for(const p of previewProducts){if(p.image && !photos.has(String(p.merchantId)))photos.set(String(p.merchantId),p.image)}
  const colors=['equal-green','equal-blue','equal-purple','equal-orange','equal-cyan','equal-pink'];
  for(const [i,m] of pending.entries()){
    const name=String(m.merchant||'Partner').trim();
    const num=Number(m.productCount);
    const href=m.internalUrl&&/^\/[a-z0-9-]+\.html$/i.test(m.internalUrl)
      ?m.internalUrl:'/produkte.html?shop='+encodeURIComponent(name);
    const category=Array.isArray(m.categories)&&m.categories[0]?String(m.categories[0]):'Produkte';
    const image=photos.get(String(m.merchantId));
    const card=document.createElement('a');
    card.className='equal-card ag-feed-card '+colors[i%colors.length];
    card.href=href;card.setAttribute('aria-label',name+' entdecken');
    card.dataset.tags='';card.dataset.deal='0';
    const img=image?'<img class="equal-photo" src="'+esc(image)+'" alt="'+esc(name)+' – aktuelle Produkte" loading="lazy" decoding="async">':'';
    card.innerHTML='<div class="equal-media">'+img+'<div class="equal-tint"></div></div>'+
      '<div class="equal-top"><span class="equal-logo"><b>'+esc(name)+'</b></span></div>'+
      '<div class="equal-copy"><small>'+esc(category)+'</small><strong>'+esc(name)+'</strong>'+
      '<span>'+fmt(num)+' Produkte entdecken und vergleichen.</span><em>Produkte ansehen →</em></div>';
    grid.appendChild(card);
  }
  document.dispatchEvent(new Event('ag:partners-updated'));
  publishCounts();
}
expandCatalog().catch(()=>{});
})();