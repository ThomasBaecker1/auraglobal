(() => {
'use strict';
const data=window.AURA_MATCH_DATA;
const root=document.querySelector('[data-aura-match]');
if(!root || !data || !Array.isArray(data.categories)||!Array.isArray(data.offers))return;
const $=s=>root.querySelector(s);
const $$=s=>[...root.querySelectorAll(s)];
const nodes={
 first:$('[data-step="1"]'),second:$('[data-step="2"]'),
 cats:$('[data-match-categories]'),intents:$('[data-match-intents]'),
 next:$('[data-match-next]'),prev:$('[data-match-prev]'),
 search:$('[data-match-results]'),products:$('[data-match-products]'),
 title:$('[data-match-title]'),summary:$('[data-match-summary]'),
 question:$('[data-match-question]'),side:$('[data-match-side]'),
 progress:document.querySelector('[data-match-progress]'),
 share:$('[data-match-share]'),shareInfo:$('[data-match-share-info]'),
 reset:$('[data-match-reset]'),guide:$('[data-match-guide]')
};
const cleaned=(v)=>String(v??'').trim();
const esc=s=>cleaned(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const validGuide=u=>typeof u==='string' && /^\/[a-z0-9-]+\.html$/.test(u);
const validAffiliate=u=>{
 try{
  const p=new URL(u);
  return p.protocol==='https:'&&(['awin1.com','www.awin1.com'].includes(p.hostname))&&p.searchParams.get('awinaffid')==='3076553';
 }catch{return false}
};
const validPicture=u=>{
 try {const x=new URL(u);return x.protocol==='https:'&&(x.hostname==='www.tenways.com'||x.hostname==='de.outin.com')}catch{return false}
};
function record(name,details={}){
  try{window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:name,category:state.category,need:state.need,...details})}catch{}
}
const urlParams=new URLSearchParams(location.search);
const firstCategory=data.categories.find(x=>x.id===urlParams.get('category'))||null;
let state={category:firstCategory?.id||null,need:null,step:1};
if(firstCategory&&firstCategory.intent?.some(x=>x.id===urlParams.get('need'))){state.need=urlParams.get('need');state.step=3}
function getCategory(){return data.categories.find(c=>c.id===state.category)}
function setProgress(){
 if(nodes.progress)nodes.progress.style.width=(state.step===1?'34%':state.step===2?'67%':'100%');
}
function cards(){
 nodes.cats.innerHTML=data.categories.map(cat=>'<button type="button" class="am-cat" data-category="'+esc(cat.id)+'" aria-pressed="'+String(state.category===cat.id)+'">'+
 '<span class="am-cat-icon" aria-hidden="true">'+esc(cat.icon)+'</span><strong>'+esc(cat.label)+'</strong><small>'+esc(cat.lead)+'</small></button>').join('');
 nodes.next.disabled=!state.category;
}
function priorities(){
 const c=getCategory();
 if(!c)return;
 nodes.question.textContent=c.question;
 nodes.intents.innerHTML=c.intent.map(need=>'<button type="button" class="am-intent" data-need="'+esc(need.id)+'" aria-pressed="'+String(state.need===need.id)+'">'+
 '<strong>'+esc(need.label)+'</strong><span>'+esc(need.explain)+'</span></button>').join('');
 const continueBtn=$('[data-match-finish]');
 if(continueBtn)continueBtn.disabled=!state.need;
}
function side(){
 const c=getCategory();
 const title=state.step===1?'Finde zuerst die passende Produktwelt.':state.step===2?'Ein Kriterium statt hundert Filter.':'Klare Gründe. Keine Fantasie-Bewertungen.';
 const points=state.step===1
  ?['Sechs kuratierte Produktwelten','Nur bereits eingebundene Awin-Partner','Keine Kontoanmeldung erforderlich']
  :state.step===2
  ?['Du wählst deinen wichtigsten Einsatz','Die Reihenfolge richtet sich nach dieser Priorität','Maßgeblich bleibt der Preis beim Anbieter']
  :['Herstellerangaben statt erfundene Tests','Partnerlinks sind gekennzeichnet','Den Guide gibt es vor jedem Shop-Klick'];
 nodes.side.innerHTML='<div class="am-kicker">AURAGLOBAL · KLARHEIT</div><h3>'+esc(title)+'</h3><p>'+
 (c?'Aktuelle Auswahl: '+esc(c.label)+'. ':'')+
 'AuraMatch trifft keine automatischen Kaufentscheidungen, sondern zeigt die wichtigsten nächsten Prüfungen.</p>'+
 '<ul class="am-side-list">'+points.map((x,i)=>'<li><b>'+String(i+1).padStart(2,'0')+'</b><span>'+esc(x)+'</span></li>').join('')+'</ul>';
}
function step(next,focus=true){
 state.step=next;
 nodes.first.hidden=next!==1;nodes.first.classList.toggle('am-hide',next!==1);
 nodes.second.hidden=next!==2;nodes.second.classList.toggle('am-hide',next!==2);
 nodes.search.hidden=next!==3;nodes.search.classList.toggle('am-hide',next!==3);
 setProgress();side();
 if(next===1)cards();
 if(next===2)priorities();
 if(next===3)results();
 if(focus){
  const node=next===1?nodes.first:next===2?nodes.second:nodes.search;
  if(node){node.setAttribute('tabindex','-1');node.focus({preventScroll:true});node.scrollIntoView({behavior:'smooth',block:'start'})}
 }
}
function ranked(){
 const list=data.offers.filter(o=>o.category===state.category&&validAffiliate(o.href));
 return list.map((o,index)=>({...o,_order:index,_matched:Array.isArray(o.tags)&&o.tags.includes(state.need)}))
 .sort((a,b)=>Number(b._matched)-Number(a._matched)||a._order-b._order).slice(0,3);
}
function results(){
 const c=getCategory();
 if(!c)return;
 const selected=c.intent.find(i=>i.id===state.need)||c.intent[0];
 const list=ranked();
 nodes.title.textContent=c.label+': passend zur Priorität '+selected.label;
 nodes.summary.textContent='Kuratierte Modelle und Shops für „'+selected.label+'“. Keine eigenen Produkttests und keine garantierten Bestände oder Preise. Das vorderste Ergebnis passt anhand der genannten Merkmale am ehesten zur Auswahl.';
 const icons={bike:'🚲',coffee:'☕',pets:'🐈',power:'🔋',office:'🖥️',fashion:'✨'};
 nodes.products.innerHTML=list.map((p,i)=>{
  const image=validPicture(p.photo)?'<img alt="'+esc(p.title)+' – Herstellerabbildung" loading="lazy" decoding="async" src="'+esc(p.photo)+'">':'<span class="am-no-photo" aria-hidden="true">'+esc(icons[p.category]||'✦')+'</span>';
  const why=p._matched ? p.reason : 'Weitere Variante in dieser Kategorie – Details auf der Vergleichsseite prüfen.';
  return '<article class="am-product'+(i===0&&p._matched?' am-primary-match':'')+'">'+
   '<div class="am-product-media">'+image+'<small>'+(i===0&&p._matched?'PRIORITÄT PASST':'WEITERE OPTION')+'</small></div>'+
   '<div class="am-product-body"><span class="am-product-brand">'+esc(p.merchant)+' · '+esc(p.badge)+'</span>'+
   '<h3>'+esc(p.title)+'</h3><p class="am-product-reason">'+esc(why)+'</p>'+
   '<ul class="am-product-notes">'+(Array.isArray(p.notes)?p.notes:[]).map(n=>'<li>'+esc(n)+'</li>').join('')+'</ul>'+
   '<div class="am-product-actions"><a class="am-buy" href="'+esc(p.href)+'" rel="sponsored noopener" target="_blank" data-match-buy="'+esc(p.id)+'">Shop-Preis prüfen ↗</a>'+
   (validGuide(p.guide)?'<a class="am-compare" href="'+esc(p.guide)+'">Kaufhilfe lesen →</a>':'')+
   '<button type="button" class="am-wish-toggle" data-wish-button="'+esc(p.id)+'" aria-pressed="false">♡ Merken</button>'+
   '</div><small class="am-product-disclosure">Anzeige / Partnerlink · Konditionen beim Anbieter prüfen.</small></div></article>';
 }).join('');
 window.dispatchEvent(new Event('ag:wishlist-changed'));
 if(!list.length)nodes.products.innerHTML='<p>Für diese Auswahl sind gerade keine kuratierten Angebote hinterlegt. Prüfe die zugehörige Kaufberatung.</p>';
 if(nodes.guide){nodes.guide.href=validGuide(c.guide)?c.guide:'/kaufberatung.html';nodes.guide.textContent='Ratgeber '+c.label+' →'}
 const q=new URL(location.href);q.searchParams.set('category',state.category);q.searchParams.set('need',state.need);
 if(history.replaceState)history.replaceState(null,'',q.pathname+q.search);
 record('aura_match_results',{result_count:list.length,matched:list.filter(o=>o._matched).length});
}
nodes.cats.addEventListener('click',e=>{
 const el=e.target.closest('[data-category]');if(!el||!nodes.cats.contains(el))return;
 if(!data.categories.find(c=>c.id===el.dataset.category))return;
 state.category=el.dataset.category;state.need=null;cards();side();
 record('aura_match_category');
});
nodes.intents.addEventListener('click',e=>{
 const el=e.target.closest('[data-need]');if(!el||!nodes.intents.contains(el))return;
 const c=getCategory();
 if(!c?.intent.some(i=>i.id===el.dataset.need))return;
 state.need=el.dataset.need;priorities();record('aura_match_need');
});
nodes.next.addEventListener('click',()=>{if(state.category)step(2)});
nodes.prev.addEventListener('click',()=>step(1));
$('[data-match-finish]')?.addEventListener('click',()=>{if(state.need)step(3)});
nodes.reset?.addEventListener('click',()=>{state={category:null,need:null,step:1};const q=new URL(location.href);q.searchParams.delete('category');q.searchParams.delete('need');if(history.replaceState)history.replaceState(null,'',q.pathname+q.search);step(1)});
nodes.share?.addEventListener('click',async()=>{
 const u=new URL(location.href);u.searchParams.set('category',state.category);u.searchParams.set('need',state.need);u.searchParams.set('utm_source','share');u.searchParams.set('utm_medium','match');u.searchParams.set('utm_campaign','aura_match');
 try{
  if(typeof navigator.share==='function'){await navigator.share({title:'Mein AuraMatch',text:'Das könnte zu meiner Nutzung passen:',url:u.href})}
  else if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(u.href);nodes.shareInfo.textContent='Vergleichslink kopiert!'}
  else{nodes.shareInfo.textContent='Kopiere den Link aus der Adressleiste.'}
  record('aura_match_share');
 }catch(err){if(err?.name!=='AbortError')nodes.shareInfo.textContent='Link konnte nicht geteilt werden.'}
});
nodes.products.addEventListener('click',e=>{
 const a=e.target.closest('[data-match-buy]');if(a)record('aura_match_outbound',{offer_id:a.dataset.matchBuy});
});
step(state.step,false);
})();
