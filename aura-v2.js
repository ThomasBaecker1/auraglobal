const catalog=[
  {title:"House of Sneakers",type:"Vergleich",href:"/house-of-sneakers.html",tags:"house of sneakers sneaker nike adidas jordan campus schuhe streetwear"},
  {title:'Alle Marken & Vergleiche',type:'Übersicht',href:'/marken.html',tags:'alle marken partner vergleiche übersicht katalog kategorien'},
  {title:'E-Bikes',type:'Kategorie',href:'/e-bikes.html',tags:'ebike e-bike fahrrad bike city mobilität'},
  {title:'TENWAYS Vergleich',type:'Vergleich',href:'/tenways.html',tags:'tenways cgo600 cgo600 pro cgo800s city pendeln komfort'},
  {title:'TENWAYS CGO600',type:'Produkt',href:'/tenways.html#cgo600',tags:'tenways leicht city ebike'},
  {title:'TENWAYS CGO600 Pro',type:'Produkt',href:'/tenways.html#cgo600-pro',tags:'tenways pendler reichweite akku'},
  {title:'TENWAYS CGO800S',type:'Produkt',href:'/tenways.html#cgo800s',tags:'tenways komfort durchstieg federgabel'},
  {title:'URWAHN',type:'Vergleich',href:'/urwahn.html',tags:'urwahn stadtfuchs waldwiesel urban gravel ebike'},
  {title:'OutIn Nano vs Mino',type:'Vergleich',href:'/outin.html',tags:'outin nano mino espresso kaffee portable reise camping'},
  {title:'DEKVIO Leder & Reise',type:'Partner',href:'/dekvio.html',tags:'dekvio leder tasche rucksack reise laptop work travel'},
  {title:'Haustiere & Smart Pet',type:'Kategorie',href:'/petlibro.html',tags:'haustier haustiere katze katzen tier futterautomat smart pet feeder'},
  {title:'PETLIBRO Smart Pet',type:'Vergleich',href:'/petlibro.html',tags:'petlibro futterautomat katze katzen haustier haustiere feeder smart pet granary'},
  {title:'Paper & Sons Rucksäcke',type:'Vergleich',href:'/paper-sons.html',tags:'paper sons rucksack laptop kraftpapier vegan nachhaltig'},
  {title:'Pizza Party Öfen',type:'Kaufberatung',href:'/pizza-party.html',tags:'pizza party pizzaofen ardore emozione ispirazione outdoor'},
  {title:'Ophelia Eternity Schmuck',type:'Kaufberatung',href:'/ophelia.html',tags:'ophelia eternity schmuck ring diamanten lab grown jewelry'},
  {title:'WAU Beauty Tech',type:'Kaufberatung',href:'/wau.html',tags:'wau beauty tech led maske mira gesichtspflege'},
  {title:'The Vintage Realm Möbel',type:'Kaufberatung',href:'/vintage-realm.html',tags:'vintage realm möbel reclaimed wood stuhl tisch furniture'},
  {title:'momox fashion',type:'Partner',href:'/momox-fashion.html',tags:'momox fashion mode secondhand kleidung schuhe accessoires nachhaltig'},
  {title:'NORMA24',type:'Partner',href:'/norma24.html',tags:'norma24 haus garten freizeit diy werkzeug wohnen'},
  {title:'Rasendoktor',type:'Kaufberatung',href:'/rasendoktor.html',tags:'rasendoktor rasen garten dünger rasenpflege saat'},
  {title:'LUNZO',type:'Partner',href:'/lunzo.html',tags:'lunzo shopping wohnen haushalt lifestyle angebote'},
  {title:'Vorteilshop',type:'Partner',href:'/vorteilshop.html',tags:'vorteilshop wohnen haushalt freizeit alltag angebote'},
  {title:'Kaffee & Espresso',type:'Kategorie',href:'/kaffee.html',tags:'kaffee espresso kaffeemaschine kapselmaschine kapsel zuhause unterwegs to go outdoor camping'},
  {title:'Nespresso ORIGINAL',type:'Vergleich',href:'/nespresso.html',tags:'nespresso kaffee kapselmaschine kaffeemaschine espresso essenza mini citiz pixie creatista original'},
  {title:'Kaffee zuhause oder unterwegs?',type:'Guide',href:'/kaffee.html',tags:'kaffee zuhause unterwegs nespresso outin nano mino espresso home to go reise camping'},
  {title:'Wohlbefinden & Nahrungsergänzung',type:'Kategorie',href:'/braingood.html',tags:'wohlbefinden wellness nahrungsergänzung supplement supplemente darm gehirn fokus energie'},
  {title:'braingood BioMe+ & BOOST+',type:'Vergleich',href:'/braingood.html',tags:'braingood biome biome+ boost boost+ darm gehirn fokus energie supplement nahrungsergänzung'},
  {"title": "DOTBLUE", "type": "Vergleich", "href": "/dotblue.html", "tags": "dotblue blaupunkt e-bike ebike faltbike klapprad henri emmi enno minna pendeln camping mobilität"},
  {"title": "ANTHBOT", "type": "Vergleich", "href": "/anthbot.html", "tags": "anthbot mähroboter rasenroboter rtk lidar garten rasen m5 m9 n8 genie pion"},
  {"title": "Rameder", "type": "Vergleich", "href": "/rameder.html", "tags": "rameder anhängerkupplung fahrradträger dachträger dachbox heckbox auto transport reise e-bike"},
  {"title": "ALLPOWERS", "type": "Vergleich", "href": "/allpowers.html", "tags": "allpowers powerstation solar generator camping notstrom backup offgrid r600 r1500 s2000 r4000 energie outdoor"},
  {"title": "SHIFTER", "type": "Vergleich", "href": "/shifter.html", "tags": "shifter smartphone tablet wearable notebook desktop smart home audio e-bike outlet technik elektronik"},
  {"title": "DeLSt", "type": "Vergleich", "href": "/delst.html", "tags": "delst deutsches elearning studieninstitut fernstudium weiterbildung ihk wirtschaft ki marketing vertrieb coaching management bildungsgutschein karriere"},
  {"title": "Desktronic", "type": "Vergleich", "href": "/desktronic.html", "tags": "desktronic homeone homepro schreibtisch höhenverstellbar homeoffice ergonomie arbeitsplatz"},
  {"title": "RAIBU", "type": "Vergleich", "href": "/raibu.html", "tags": "raibu nahrungsergänzung supplement energie fokus sport mentale balance wellness bundle"},
  {"title": "Mediakos", "type": "Vergleich", "href": "/mediakos.html", "tags": "mediakos vitamine kollagen kosmetik kräuterextrakte supplement beauty pflege bundles"},
  {"title": "Porzellantreff", "type": "Vergleich", "href": "/porzellantreff.html", "tags": "porzellantreff porzellan geschirr glaeser gläser besteck kochgeschirr tischkultur villeroy boch rosenthal riedel le creuset zwilling"}
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

  const closeResults=()=>{
    out.style.display='none';
    input.setAttribute('aria-expanded','false');
  };

  function render(q){
    const hits=getHits(q);
    if(!q.trim()){
      out.innerHTML='';
      closeResults();
      return hits;
    }
    const productFinderHref='/produkte.html?q='+encodeURIComponent(q.trim());
    out.innerHTML=hits.length
      ?hits.map(x=>`<a class="result" href="${x.href}"><span><b>${x.title}</b><small>${x.type}</small></span><i aria-hidden="true">→</i></a>`).join('')
      :`<a class="result" href="${productFinderHref}"><span><b>Im Produktfinder suchen</b><small>Produkte & Partnerwelten nach „${q.replace(/[<>&"]/g,'')}“ durchsuchen</small></span><i aria-hidden="true">→</i></a>`;
    out.style.display='block';
    input.setAttribute('aria-expanded','true');
    return hits;
  }

  function go(){
    const query=input.value.trim();
    if(!query){
      closeResults();
      document.getElementById('discover')?.scrollIntoView({behavior:'smooth',block:'start'});
      return;
    }
    const hits=render(query);
    window.dataLayer=window.dataLayer||[];
    window.dataLayer.push({event:'site_search',search_term:query,search_results:hits.length,page_path:window.location.pathname});
    if(typeof window.gtag==='function') window.gtag('event','search',{search_term:query});
    if(hits.length) window.location.href=hits[0].href;
    else window.location.href='/produkte.html?q='+encodeURIComponent(query);
  }

  input.addEventListener('input',e=>render(e.target.value));
  input.addEventListener('focus',()=>{if(input.value.trim()) render(input.value)});
  input.addEventListener('keydown',e=>{
    if(e.key==='Enter'){e.preventDefault();go()}
    if(e.key==='Escape'){e.preventDefault();closeResults();input.blur()}
    if(e.key==='ArrowDown'){
      const first=out.querySelector('.result');
      if(first&&out.style.display!=='none'){e.preventDefault();first.focus()}
    }
  });
  out.addEventListener('keydown',e=>{
    if(e.key==='Escape'){e.preventDefault();closeResults();input.focus()}
  });
  button?.addEventListener('click',go);

  document.addEventListener('click',e=>{
    if(!out.contains(e.target)&&e.target!==input&&e.target!==button) closeResults();
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
    const params=new URLSearchParams(window.location.search);
    const payload={
      event:'affiliate_click',
      affiliate_destination:destination,
      affiliate_url:link.href,
      affiliate_text:(link.textContent||'').trim().slice(0,120),
      page_path:window.location.pathname,
      traffic_source:params.get('utm_source')||'',
      traffic_medium:params.get('utm_medium')||'',
      traffic_campaign:params.get('utm_campaign')||''
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


function initAffiliateFooterNote(){
  const footer=document.querySelector('.footer, footer');
  if(!footer||footer.querySelector('.affiliate-footer-note')) return;
  const note=document.createElement('div');
  note.className='affiliate-footer-note';
  note.textContent='Anzeige: Bei einem Kauf über gekennzeichnete Links können wir eine Provision erhalten. Für dich entstehen keine Mehrkosten.';
  footer.appendChild(note);
}
document.addEventListener('DOMContentLoaded',initAffiliateFooterNote);


function initRelatedComparisons(){
  const path=window.location.pathname.replace(/\/$/,'')||'/';
  if(path==='/'||path==='/index.html'||document.querySelector('.ag-related')) return;

  const maps={
    '/tenways.html':[
      ['E-Bike Guide','/e-bikes.html','Reichweite, Komfort und Einsatz zuerst einordnen.','E-BIKES'],
      ['URWAHN','/urwahn.html','Urban Design und Gravel als Alternative ansehen.','MOBILITÄT'],
      ['Kaffee unterwegs','/kaffee.html','Mobile Produkte für Pendeln und Reise entdecken.','UNTERWEGS']
    ],
    '/urwahn.html':[
      ['E-Bike Guide','/e-bikes.html','City, Pendeln und Gravel direkt einordnen.','E-BIKES'],
      ['TENWAYS','/tenways.html','Drei City-E-Bikes nach Alltag vergleichen.','MOBILITÄT'],
      ['DEKVIO','/dekvio.html','Leder und Reise für urbanen Alltag entdecken.','STYLE']
    ],
    '/e-bikes.html':[
      ['TENWAYS','/tenways.html','CGO600, Pro und 800S direkt vergleichen.','CITY'],
      ['URWAHN','/urwahn.html','STADTFUCHS und WALDWIESEL einordnen.','URBAN'],
      ['Kaffee unterwegs','/kaffee.html','Für Pendeln, Reise und Outdoor weiterdenken.','LIFESTYLE']
    ],
    '/kaffee.html':[
      ['Nespresso ORIGINAL','/nespresso.html','Vier Maschinen für Zuhause einordnen.','ZUHAUSE'],
      ['OutIn Nano vs Mino','/outin.html','Portablen Espresso direkt vergleichen.','UNTERWEGS'],
      ['Outdoor Cooking','/pizza-party.html','Mehr Genuss für draußen entdecken.','GENUSS']
    ],
    '/nespresso.html':[
      ['Kaffee Guide','/kaffee.html','Zuhause vs. unterwegs in einem Blick.','KAFFEE'],
      ['OutIn','/outin.html','Portable Espresso-Alternativen vergleichen.','MOBIL'],
      ['Pizza Party','/pizza-party.html','Genuss-Setup für Outdoor-Abende.','GENUSS']
    ],
    '/outin.html':[
      ['Kaffee Guide','/kaffee.html','Stationär oder mobil zuerst einordnen.','KAFFEE'],
      ['Nespresso','/nespresso.html','Kompakte Maschinen für Zuhause ansehen.','ZUHAUSE'],
      ['E-Bike Guide','/e-bikes.html','Mobilität für Alltag und Ausflug vergleichen.','MOBILITÄT']
    ],
    '/petlibro.html':[
      ['NORMA24','/norma24.html','Praktische Produkte für Zuhause entdecken.','ZUHAUSE'],
      ['Vorteilshop','/vorteilshop.html','Alltagshelfer und Wohnideen ansehen.','ALLTAG'],
      ['braingood','/braingood.html','Wohlbefinden als nächste Produktwelt.','WELLNESS']
    ],
    '/braingood.html':[
      ['WAU Beauty Tech','/wau.html','Self-Care und Beauty-Tech einordnen.','SELF-CARE'],
      ['Vorteilshop','/vorteilshop.html','Wohlbefinden und Alltag weiter entdecken.','ALLTAG'],
      ['Ophelia','/ophelia.html','Schmuck und persönliche Geschenke entdecken.','STYLE']
    ],
    '/wau.html':[
      ['braingood','/braingood.html','Wellness-Produkte nach Alltag vergleichen.','WELLNESS'],
      ['Ophelia','/ophelia.html','Fine Jewelry und Geschenkideen.','STYLE'],
      ['momox fashion','/momox-fashion.html','Secondhand Mode weiter entdecken.','FASHION']
    ],
    '/momox-fashion.html':[
      ['Ophelia','/ophelia.html','Schmuck als Ergänzung zu deinem Look.','STYLE'],
      ['Paper & Sons','/paper-sons.html','Rucksäcke für Arbeit und Alltag.','ACCESSOIRES'],
      ['DEKVIO','/dekvio.html','Leder, Work und Reise entdecken.','TRAVEL']
    ],
    '/ophelia.html':[
      ['momox fashion','/momox-fashion.html','Secondhand Looks weiter entdecken.','FASHION'],
      ['WAU Beauty Tech','/wau.html','Beauty-Tech für Self-Care ansehen.','BEAUTY'],
      ['Paper & Sons','/paper-sons.html','Alltag und Accessoires weiterdenken.','ACCESSOIRES']
    ],
    '/paper-sons.html':[
      ['DEKVIO','/dekvio.html','Leder und Reise als Alternative.','WORK'],
      ['momox fashion','/momox-fashion.html','Secondhand Fashion entdecken.','STYLE'],
      ['LUNZO','/lunzo.html','Weitere Alltagsprodukte durchstöbern.','SHOPPING']
    ],
    '/dekvio.html':[
      ['Paper & Sons','/paper-sons.html','Rucksäcke für Work und Alltag vergleichen.','WORK'],
      ['momox fashion','/momox-fashion.html','Mode und Accessoires weiter entdecken.','STYLE'],
      ['OutIn','/outin.html','Für Reise und unterwegs weiterdenken.','TRAVEL']
    ],
    '/norma24.html':[
      ['Rasendoktor','/rasendoktor.html','Rasenpflege gezielter einordnen.','GARTEN'],
      ['Vorteilshop','/vorteilshop.html','Alltags- und Wohnprodukte entdecken.','ZUHAUSE'],
      ['Pizza Party','/pizza-party.html','Outdoor Cooking weiter entdecken.','OUTDOOR']
    ],
    '/rasendoktor.html':[
      ['NORMA24','/norma24.html','Haus, Garten und DIY weiter entdecken.','GARTEN'],
      ['Vorteilshop','/vorteilshop.html','Praktische Helfer für Zuhause.','ALLTAG'],
      ['Pizza Party','/pizza-party.html','Den Garten zum Genuss-Ort machen.','OUTDOOR']
    ],
    '/pizza-party.html':[
      ['NORMA24','/norma24.html','Outdoor- und Gartenprodukte entdecken.','GARTEN'],
      ['Kaffee Guide','/kaffee.html','Kaffee zuhause und unterwegs vergleichen.','GENUSS'],
      ['Vorteilshop','/vorteilshop.html','Mehr Produkte für Alltag und Freizeit.','FREIZEIT']
    ],
    '/lunzo.html':[
      ['Vorteilshop','/vorteilshop.html','Alltag und Wohnen weiter entdecken.','SHOPPING'],
      ['NORMA24','/norma24.html','Haus, Garten und DIY.','ZUHAUSE'],
      ['The Vintage Realm','/vintage-realm.html','Interior mit stärkerem Design-Fokus.','INTERIOR']
    ],
    '/vorteilshop.html':[
      ['LUNZO','/lunzo.html','Breites Shopping-Sortiment entdecken.','SHOPPING'],
      ['NORMA24','/norma24.html','Haus, Garten und Freizeit.','ZUHAUSE'],
      ['braingood','/braingood.html','Wohlbefinden gezielter vergleichen.','WELLNESS']
    ],
    '/vintage-realm.html':[
      ['Fine Interior Guide','/lunzo.html','Weitere Wohn- und Alltagswelten.','INTERIOR'],
      ['NORMA24','/norma24.html','Haus und Garten breiter entdecken.','ZUHAUSE'],
      ['Paper & Sons','/paper-sons.html','Design für Arbeit und Alltag.','DESIGN']
    ]
  };

  const items=maps[path];
  if(!items?.length) return;
  const footer=document.querySelector('.footer, footer');
  if(!footer) return;

  const section=document.createElement('section');
  section.className='section ag-related';
  section.innerHTML=`<div class="shell">
    <div class="section-head"><div><div class="kicker">Weiter entdecken</div><h2>Das könnte auch zu dir passen.</h2></div><p>Keine Sackgasse: spring direkt in die nächste passende Produktwelt.</p></div>
    <div class="ag-related-grid">${items.map(([title,href,copy,kicker])=>`
      <a class="ag-related-card" href="${href}">
        <small>${kicker}</small><b>${title}</b><span>${copy}</span><i>→</i>
      </a>`).join('')}
    </div>
  </div>`;
  footer.parentNode.insertBefore(section,footer);
}
document.addEventListener('DOMContentLoaded',initRelatedComparisons);


function initDealExpiry(){
  const cards=[...document.querySelectorAll('[data-deal-start],[data-deal-end]')];
  if(!cards.length) return;
  const today=new Intl.DateTimeFormat("sv-SE",{timeZone:"Europe/Berlin",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
  cards.forEach(card=>{
    const start=card.getAttribute('data-deal-start');
    const end=card.getAttribute('data-deal-end');
    if(start){
      if(today<start){ card.hidden=true; return; }
    }
    if(end){
      if(today>end){ card.remove(); return; }
    }
    card.hidden=false;
  });
  document.querySelectorAll('[data-deal-grid]').forEach(grid=>{
    const visible=[...grid.children].some(el=>!el.hidden);
    if(!visible) grid.closest('section')?.remove();
  });
}
document.addEventListener('DOMContentLoaded',initDealExpiry);


/* Sponsored UI cleanup + shopping-intent foundation */
function normalizeSponsoredLabels(){
  document.querySelectorAll('.adnote').forEach(el=>{ el.textContent='Anzeige'; });
  document.querySelectorAll('a').forEach(a=>{
    if((a.textContent||'').trim()==='Affiliate-Hinweis') a.textContent='Werbehinweis';
  });
  document.querySelectorAll('a[rel~="sponsored"]').forEach(link=>{
    const scope=link.closest('.stage-card,.card,.deal-card,.choice,.feature,.cta-banner,.brand-hero,.brand-hero-copy,article,section');
    if(!scope) return;
    if(!scope.querySelector('.adnote')){
      const n=document.createElement('div');
      n.className='adnote';
      n.textContent='Anzeige';
      const host=link.closest('.cta-row,.cta-actions')||link.parentElement;
      if(host?.parentElement) host.parentElement.insertBefore(n,host.nextSibling);
    }
  });
}
document.addEventListener('DOMContentLoaded',normalizeSponsoredLabels);

function initShoppingIntent(){
  const bar=document.querySelector('[data-shop-intent]');
  const grid=document.querySelector('.equal-grid');
  if(!bar||!grid) return;
  const cards=[...grid.querySelectorAll('.equal-card')];

  const tagMap={
    all:()=>true,
    deals:c=>c.dataset.deal==='1',
    tech:c=>(c.dataset.tags||'').includes('tech'),
    mobility:c=>(c.dataset.tags||'').includes('mobility'),
    home:c=>(c.dataset.tags||'').includes('home'),
    beauty:c=>(c.dataset.tags||'').includes('beauty'),
    food:c=>(c.dataset.tags||'').includes('food'),
    pet:c=>(c.dataset.tags||'').includes('pet'),
    career:c=>(c.dataset.tags||'').includes('career')
  };

  const apply=key=>{
    const test=tagMap[key]||tagMap.all;
    cards.forEach(card=>{ card.hidden=!test(card); });
    bar.querySelectorAll('[data-filter]').forEach(btn=>btn.classList.toggle('is-active',btn.dataset.filter===key));
  };

  bar.addEventListener('click',e=>{
    const btn=e.target.closest('[data-filter]');
    if(btn){
      apply(btn.dataset.filter);
      const payload={event:'shopping_intent',intent:btn.dataset.filter,page_path:window.location.pathname};
      window.dataLayer=window.dataLayer||[]; window.dataLayer.push(payload);
      if(typeof window.gtag==='function') window.gtag('event','shopping_intent',{intent:btn.dataset.filter});
    }
  });

  cards.forEach(card=>{
    card.addEventListener('click',()=>{
      const tags=(card.dataset.tags||'').split(' ').filter(Boolean);
      const partner=(card.querySelector('.equal-logo b')?.textContent||card.getAttribute('aria-label')||'').trim();
      window.dataLayer=window.dataLayer||[];
      window.dataLayer.push({event:'partner_interest',partner,tags:tags.join(','),page_path:window.location.pathname});
      if(typeof window.gtag==='function') window.gtag('event','partner_interest',{partner,interest_tags:tags.join(',')});
      if(!tags.length) return;
      try{
        const scores=JSON.parse(localStorage.getItem('ag_interest_scores')||'{}');
        tags.forEach(t=>scores[t]=(scores[t]||0)+1);
        localStorage.setItem('ag_interest_scores',JSON.stringify(scores));
      }catch{}
    });
  });

  const forYou=bar.querySelector('[data-for-you]');
  if(forYou){
    forYou.addEventListener('click',()=>{
      let scores={};
      try{scores=JSON.parse(localStorage.getItem('ag_interest_scores')||'{}')}catch{}
      const score=card=>(card.dataset.tags||'').split(' ').reduce((sum,t)=>sum+(scores[t]||0),0);
      cards.sort((a,b)=>score(b)-score(a)).forEach(card=>grid.appendChild(card));
      cards.forEach(card=>card.hidden=false);
      bar.querySelectorAll('[data-filter]').forEach(btn=>btn.classList.remove('is-active'));
      forYou.classList.add('is-active');
    });
  }
}
document.addEventListener('DOMContentLoaded',initShoppingIntent);
