/* AuraGlobal first-party privacy-minded wishlist.
   Persists only anonymous curated offer IDs on the device, not names or email. */
(() => {
'use strict';
const KEY='aura_saved_offers_v1';
const registry=window.AURA_MATCH_DATA;
const isValidId=id=>Array.isArray(registry?.offers)&&registry.offers.some(o=>o.id===id);
let mem=[];
try{
 const candidate=JSON.parse(localStorage.getItem(KEY)||'[]');
 if(Array.isArray(candidate))mem=[...new Set(candidate.filter(isValidId).slice(0,30))];
}catch{}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const offer=id=>registry.offers.find(x=>x.id===id);
const save=()=>{
 try{localStorage.setItem(KEY,JSON.stringify(mem));return true}
 catch{return false}
};
const event=(action,id)=>{
 window.dataLayer=window.dataLayer||[];
 window.dataLayer.push({event:'aura_wishlist_'+action,offer_id:id,items_count:mem.length});
 window.dispatchEvent(new CustomEvent('ag:wishlist-changed',{detail:{action,id,count:mem.length}}));
};
const api={
 all:()=>[...mem],
 has:id=>mem.includes(id),
 count:()=>mem.length,
 toggle(id){
  if(!isValidId(id))return false;
  const before=mem.includes(id);
  if(before)mem=mem.filter(v=>v!==id);
  else mem=[id,...mem].slice(0,30);
  save();event(before?'remove':'add',id);
  return !before;
 }
};
window.AURA_WISHLIST=api;
function refresh(){
 document.querySelectorAll('[data-wish-button]').forEach(b=>{
  const yes=api.has(b.dataset.wishButton);
  b.setAttribute('aria-pressed',String(yes));
  b.textContent=yes?'✓ Gemerkt':'♡ Merken';
  b.setAttribute('aria-label',(yes?'Aus Merkliste entfernen: ':'Auf Merkliste setzen: ')+(offer(b.dataset.wishButton)?.title||'Produkt'));
 });
 document.querySelectorAll('[data-wishlist-count]').forEach(x=>{x.textContent=String(api.count())});
}
document.addEventListener('click',e=>{
 const button=e.target.closest?.('[data-wish-button]');
 if(button){e.preventDefault();api.toggle(button.dataset.wishButton);refresh()}
});
window.addEventListener('ag:wishlist-changed',refresh);
function renderSavedPage(){
 const root=document.querySelector('[data-wishlist-list]');
 if(!root)return;
 const items=api.all().map(offer).filter(Boolean);
 const empty=document.querySelector('[data-wishlist-empty]');
 const count=document.querySelector('[data-wishlist-message]');
 if(count)count.textContent=items.length?items.length+' gemerkte Kaufoption'+(items.length===1?'':'en'):'Noch keine Angebote gespeichert';
 if(empty)empty.hidden=items.length>0;
 if(!items.length){root.innerHTML='';return}
 root.innerHTML=items.map(o=>{
  const pic=o.photo&&/^https:\/\/(www\.tenways\.com|de\.outin\.com)\//.test(o.photo)
   ?'<img loading="lazy" decoding="async" src="'+esc(o.photo)+'" alt="'+esc(o.title)+' – Herstellerfoto">'
   :'<span class="am-no-photo" aria-hidden="true">✦</span>';
  const goodUrl=/^https:\/\/www\.awin1\.com\/cread\.php\?/.test(o.href)&&o.href.includes('awinaffid=3076553');
  return '<article class="am-product"><div class="am-product-media">'+pic+'<small>'+esc(o.badge)+'</small></div>'+
    '<div class="am-product-body"><span class="am-product-brand">'+esc(o.merchant)+'</span>'+
    '<h3>'+esc(o.title)+'</h3><p class="am-product-reason">'+esc(o.reason)+'</p>'+
    '<ul class="am-product-notes">'+(o.notes||[]).map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul>'+
    '<div class="am-product-actions">'+(goodUrl?'<a class="am-buy" target="_blank" rel="sponsored noopener" href="'+esc(o.href)+'">Preis beim Anbieter prüfen ↗</a>':'')+
    '<a class="am-compare" href="'+esc(o.guide)+'">Kaufhilfe lesen →</a>'+
    '<button type="button" class="am-wish-toggle" data-wish-button="'+esc(o.id)+'" aria-pressed="true">✓ Gemerkt</button>'+
    '</div><small class="am-product-disclosure">Werbung / Partnerlink · Preise und Verfügbarkeit direkt im Shop prüfen.</small></div></article>';
 }).join('');
 refresh();
}
window.addEventListener('ag:wishlist-changed',renderSavedPage);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{refresh();renderSavedPage()});
else{refresh();renderSavedPage()}
})();
