const catalog=[
  {title:'E-Bikes',type:'Kategorie',href:'/e-bikes.html',tags:'ebike e-bike fahrrad bike city mobilität'},
  {title:'TENWAYS Vergleich',type:'Vergleich',href:'/tenways.html',tags:'tenways cgo600 cgo600 pro cgo800s city pendeln komfort'},
  {title:'TENWAYS CGO600',type:'Produkt',href:'/tenways.html#cgo600',tags:'tenways leicht city ebike'},
  {title:'TENWAYS CGO600 Pro',type:'Produkt',href:'/tenways.html#cgo600-pro',tags:'tenways pendler reichweite akku'},
  {title:'TENWAYS CGO800S',type:'Produkt',href:'/tenways.html#cgo800s',tags:'tenways komfort durchstieg federgabel'},
  {title:'URWAHN',type:'Vergleich',href:'/urwahn.html',tags:'urwahn stadtfuchs waldwiesel urban gravel ebike'},
  {title:'OutIn Nano vs Mino',type:'Vergleich',href:'/outin.html',tags:'outin nano mino espresso kaffee portable reise camping'},
  {title:'DEKVIO Leder & Reise',type:'Partner',href:'/dekvio.html',tags:'dekvio leder tasche rucksack reise laptop work travel'},
  {title:'PETLIBRO Smart Pet',type:'Vergleich',href:'/petlibro.html',tags:'petlibro futterautomat katze feeder smart pet granary'},
  {title:'Paper & Sons Rucksäcke',type:'Vergleich',href:'/paper-sons.html',tags:'paper sons rucksack laptop kraftpapier vegan nachhaltig'},
  {title:'Pizza Party Öfen',type:'Kaufberatung',href:'/pizza-party.html',tags:'pizza party pizzaofen ardore emozione ispirazione outdoor'},
  {title:'Ophelia Eternity Schmuck',type:'Kaufberatung',href:'/ophelia.html',tags:'ophelia eternity schmuck ring diamanten lab grown jewelry'},
  {title:'WAU Beauty Tech',type:'Kaufberatung',href:'/wau.html',tags:'wau beauty tech led maske mira gesichtspflege'},
  {title:'The Vintage Realm Möbel',type:'Kaufberatung',href:'/vintage-realm.html',tags:'vintage realm möbel reclaimed wood stuhl tisch furniture'},
  {title:'momox fashion',type:'Partner',href:'/momox-fashion.html',tags:'momox fashion mode secondhand kleidung schuhe accessoires nachhaltig'},
  {title:'NORMA24',type:'Partner',href:'/norma24.html',tags:'norma24 haus garten freizeit diy werkzeug wohnen'},
  {title:'Rasendoktor',type:'Kaufberatung',href:'/rasendoktor.html',tags:'rasendoktor rasen garten dünger rasenpflege saat'},
  {title:'LUNZO',type:'Partner',href:'/lunzo.html',tags:'lunzo shopping wohnen haushalt lifestyle angebote'},
  {title:'Vorteilshop',type:'Partner',href:'/vorteilshop.html',tags:'vorteilshop wohnen haushalt freizeit alltag angebote'}
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
      :'<a class="result" href="#discover"><b>Noch nicht im Katalog</b><small>Alle live Vergleiche ansehen →</small></a>';
    out.style.display='block';
    return hits;
  }

  function go(){
    const query=input.value.trim();
    if(!query){
      document.getElementById('discover')?.scrollIntoView({behavior:'smooth',block:'start'});
      return;
    }
    const hits=render(query);
    if(hits.length) window.location.href=hits[0].href;
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

document.addEventListener('DOMContentLoaded',()=>{initSearch();});

function initMobileCompareBar(){
  const bar=document.querySelector('.mobile-compare-bar');
  const target=document.querySelector('#discover');
  if(!bar||!target||!('IntersectionObserver' in window)) return;
  const observer=new IntersectionObserver(entries=>{
    const entry=entries[0];
    bar.classList.toggle('is-hidden',entry.isIntersecting);
  },{threshold:.12});
  observer.observe(target);
}

document.addEventListener('DOMContentLoaded',()=>{initMobileCompareBar();});


function initVideos(){
  document.querySelectorAll('[data-youtube]').forEach(card=>{
    card.addEventListener('click',()=>{
      if(card.classList.contains('is-playing')) return;
      const id=card.dataset.youtube;
      if(!id) return;
      const iframe=document.createElement('iframe');
      iframe.src='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(id)+'?autoplay=1&rel=0';
      iframe.title=card.getAttribute('aria-label')||'Produktvideo';
      iframe.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen=true;
      iframe.loading='lazy';
      card.classList.add('is-playing');
      card.appendChild(iframe);
    },{once:true});
  });
}
document.addEventListener('DOMContentLoaded',initVideos);


function initRailControls(){
  const rail=document.querySelector('[data-live-rail]');
  const prev=document.querySelector('[data-rail-prev]');
  const next=document.querySelector('[data-rail-next]');
  if(!rail||!prev||!next) return;

  const step=()=>{
    const card=rail.querySelector('.card');
    if(!card) return Math.max(280,rail.clientWidth*.75);
    return card.getBoundingClientRect().width+16;
  };

  const sync=()=>{
    const max=rail.scrollWidth-rail.clientWidth-2;
    prev.disabled=rail.scrollLeft<=2;
    next.disabled=rail.scrollLeft>=max;
  };

  prev.addEventListener('click',()=>rail.scrollBy({left:-step(),behavior:'smooth'}));
  next.addEventListener('click',()=>rail.scrollBy({left:step(),behavior:'smooth'}));
  rail.addEventListener('scroll',()=>requestAnimationFrame(sync),{passive:true});
  window.addEventListener('resize',sync,{passive:true});
  sync();
}
document.addEventListener('DOMContentLoaded',initRailControls);


function initAffiliateClickTracking(){
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[rel~="sponsored"]');
    if(!link) return;
    let destination='';
    try{
      const url=new URL(link.href,window.location.href);
      destination=url.hostname;
    }catch{}
    const payload={
      event:'affiliate_click',
      affiliate_destination:destination,
      affiliate_url:link.href,
      affiliate_text:(link.textContent||'').trim().slice(0,120),
      page_path:window.location.pathname
    };
    window.dataLayer=window.dataLayer||[];
    window.dataLayer.push(payload);
    if(typeof window.gtag==='function'){
      window.gtag('event','affiliate_click',{
        event_category:'affiliate',
        event_label:destination,
        link_url:link.href,
        link_text:payload.affiliate_text
      });
    }
  },{capture:true});
}
document.addEventListener('DOMContentLoaded',initAffiliateClickTracking);
