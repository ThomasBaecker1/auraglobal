const catalog=[
  {title:'E-Bikes',type:'Kategorie',href:'/e-bikes.html',tags:'ebike e-bike fahrrad bike city mobilität'},
  {title:'TENWAYS Vergleich',type:'Vergleich',href:'/tenways.html',tags:'tenways cgo600 cgo600 pro cgo800s city pendeln komfort'},
  {title:'TENWAYS CGO600',type:'Produkt',href:'/tenways.html#cgo600',tags:'tenways leicht city ebike'},
  {title:'TENWAYS CGO600 Pro',type:'Produkt',href:'/tenways.html#cgo600-pro',tags:'tenways pendler reichweite akku'},
  {title:'TENWAYS CGO800S',type:'Produkt',href:'/tenways.html#cgo800s',tags:'tenways komfort durchstieg federgabel'},
  {title:'URWAHN',type:'Vergleich',href:'/urwahn.html',tags:'urwahn stadtfuchs waldwiesel urban gravel ebike'},
  {title:'OutIn Nano vs Mino',type:'Vergleich',href:'/outin.html',tags:'outin nano mino espresso kaffee portable reise camping'},
  {title:'DEKVIO Leder & Reise',type:'Partner',href:'/dekvio.html',tags:'dekvio leder tasche rucksack reise laptop work travel'}
];

function getHits(query){
  const q=query.trim().toLowerCase();
  if(!q) return [];
  return catalog
    .map(item=>{
      const hay=(item.title+' '+item.tags).toLowerCase();
      const score=(item.title.toLowerCase().startsWith(q)?3:0)+(item.title.toLowerCase().includes(q)?2:0)+(hay.includes(q)?1:0);
      return {...item,score};
    })
    .filter(x=>x.score>0)
    .sort((a,b)=>b.score-a.score)
    .slice(0,6);
}

function initSearch(){
  const input=document.querySelector('[data-search]');
  const out=document.querySelector('[data-results]');
  if(!input||!out) return;
  const button=input.closest('.searchbox')?.querySelector('button');

  function render(q){
    const hits=getHits(q);
    if(!q.trim()){out.style.display='none';return hits;}
    out.innerHTML=hits.length
      ?hits.map(x=>`<a class="result" href="${x.href}"><b>${x.title}</b><small>${x.type}</small></a>`).join('')
      :'<div class="result"><b>Noch nicht im Katalog</b><small>Weitere Kategorien folgen laufend.</small></div>';
    out.style.display='block';
    return hits;
  }

  function go(){
    const hits=render(input.value);
    if(hits.length===1) window.location.href=hits[0].href;
  }

  input.addEventListener('input',e=>render(e.target.value));
  input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();go()}});
  button?.addEventListener('click',go);

  document.addEventListener('click',e=>{
    if(!out.contains(e.target)&&e.target!==input&&e.target!==button) out.style.display='none';
  });

  document.querySelectorAll('[data-query]').forEach(el=>el.addEventListener('click',()=>{
    input.value=el.dataset.query||'';
    render(input.value);
    input.focus();
    document.getElementById('search')?.scrollIntoView({behavior:'smooth',block:'center'});
  }));
}

function initReveal(){
  if(!('IntersectionObserver' in window)) return;
  const els=[...document.querySelectorAll('.card,.world,.feed-row,.stage-card,.choice,.feature,.stat,.cta-banner')];
  els.forEach(el=>{el.style.opacity='.001';el.style.transform='translateY(16px)'});
  const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.style.transition='opacity .5s ease, transform .5s ease, border-color .25s ease';
      entry.target.style.opacity='1';
      entry.target.style.transform='translateY(0)';
      io.unobserve(entry.target);
    }
  }),{threshold:.08});
  els.forEach(el=>io.observe(el));
}

document.addEventListener('DOMContentLoaded',()=>{initSearch();initReveal();});