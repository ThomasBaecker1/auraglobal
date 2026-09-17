const catalog=[
  {title:'E-Bikes',type:'Kategorie',href:'/e-bikes.html',tags:'ebike e-bike fahrrad bike city'},
  {title:'TENWAYS CGO600',type:'Produkt',href:'/tenways.html#cgo600',tags:'tenways leicht city ebike'},
  {title:'TENWAYS CGO600 Pro',type:'Produkt',href:'/tenways.html#cgo600-pro',tags:'tenways pendler reichweite'},
  {title:'TENWAYS CGO800S',type:'Produkt',href:'/tenways.html#cgo800s',tags:'tenways komfort ebike'},
  {title:'TENWAYS Vergleich',type:'Vergleich',href:'/tenways.html',tags:'tenways vergleich'},
  {title:'URWAHN',type:'Vergleich',href:'/urwahn.html',tags:'urwahn stadfuchs waldwiesel'},
  {title:'Haushalt & Reinigung',type:'Bald verfügbar',href:'#worlds',tags:'staubsauger dyson reinigung haushalt'},
  {title:'Home Office',type:'Bald verfügbar',href:'#worlds',tags:'tisch stuhl monitor setup'},
  {title:'Smartphones',type:'Bald verfügbar',href:'#worlds',tags:'smartphone handy samsung iphone'}
];
function initSearch(){const input=document.querySelector('[data-search]'),out=document.querySelector('[data-results]');if(!input||!out)return;function render(q){q=q.trim().toLowerCase();if(!q){out.style.display='none';return;}const hits=catalog.filter(x=>(x.title+' '+x.tags).toLowerCase().includes(q)).slice(0,6);out.innerHTML=hits.length?hits.map(x=>`<a class="result" href="${x.href}"><b>${x.title}</b><small>${x.type}</small></a>`).join(''):`<div class="result"><b>Noch nicht im Katalog</b><small>Wir bauen laufend neue Kategorien.</small></div>`;out.style.display='block';}input.addEventListener('input',e=>render(e.target.value));document.addEventListener('click',e=>{if(!out.contains(e.target)&&e.target!==input)out.style.display='none'});document.querySelectorAll('[data-query]').forEach(b=>b.addEventListener('click',()=>{input.value=b.dataset.query;render(input.value);input.focus()}));}
function initReveal(){const els=[...document.querySelectorAll('.card,.world,.feed-row,.stage-card,.choice')];if(!('IntersectionObserver'in window))return;els.forEach(el=>{el.style.opacity='.001';el.style.transform='translateY(18px)'});const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.style.transition='opacity .5s ease, transform .5s ease, border-color .25s ease';e.target.style.opacity='1';e.target.style.transform='translateY(0)';io.unobserve(e.target)}}),{threshold:.08});els.forEach(el=>io.observe(el));}
document.addEventListener('DOMContentLoaded',()=>{initSearch();initReveal();});
