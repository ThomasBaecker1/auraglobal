// IndexNow is a notification to participating search engines, not a ranking service.
// Public proof-of-control key lives at /1f5509a2a06bc06907f86453f79e953e.txt.
// Never submit noindex, private, or external URLs. Only notify changed public HTML pages.
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

const host = 'auraglobal.vercel.app';
const origin = 'https://' + host;
const key = '1f5509a2a06bc06907f86453f79e953e';
const keyLocation = origin + '/' + key + '.txt';
const initial = ['','go-off.html','synbiotic-shield.html','e-bike-pendelrechner.html','e-bike-unter-2000.html','futterautomat-katze.html','kaufberatung.html','clouvou.html','prophete.html','krankenkasseninfo.html'];

function changedHtml() {
  try {
    const before = process.env.BEFORE_SHA || '';
    const after = process.env.GITHUB_SHA || 'HEAD';
    if(!/^[0-9a-f]{40}$/i.test(before) || /^0+$/.test(before)) return [];
    return execFileSync('git',['diff','--name-only',before,after],{encoding:'utf8'})
      .split('\n').map(x=>x.trim()).filter(x=>/^(?:[a-z0-9][a-z0-9-]*\.html)$/i.test(x));
  } catch (error) {
    console.log('Commit diff unavailable:',error.message);
    return [];
  }
}

const requested = new Set(changedHtml());
if(process.env.INDEXNOW_BOOTSTRAP === '1')initial.forEach(v=>requested.add(v || 'index.html'));
const files = Array.from(requested).filter(name => {
  if(!existsSync(name))return false;
  const html = readFileSync(name,'utf8');
  return !/<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)
      && !/<meta\b[^>]*content=["'][^"']*noindex[^"']*["'][^>]*name=["']robots/i.test(html);
});
const urls = files.map(name=>origin+'/'+(name==='index.html'?'':name));
if(!urls.length){console.log('No newly changed indexable HTML pages to submit.');process.exit(0);}
console.log('Preparing IndexNow notifications for:',urls);
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let keyReady=false;
for(let attempt=0;attempt<16;attempt++){
  try{
    const r=await fetch(keyLocation,{signal:AbortSignal.timeout(7000),headers:{'Cache-Control':'no-cache'}});
    if(r.ok && (await r.text()).trim()===key){keyReady=true;break;}
  }catch(err){console.log('Key validation pending:',err.message);}
  await sleep(5000);
}
if(!keyReady)throw new Error('Public IndexNow ownership key not yet visible on production.');
// Validate selected pages are actually serving 200 before submitting.
const good=[];
for(const url of urls){
  try{
    const response=await fetch(url,{method:'HEAD',signal:AbortSignal.timeout(10000)});
    if(response.ok)good.push(url); else console.log('Skip HTTP',response.status,url);
  }catch(err){console.log('Skip unreachable URL:',url,err.message);}
}
if(!good.length)throw new Error('No valid public URLs for IndexNow');
const response=await fetch('https://api.indexnow.org/indexnow',{
  method:'POST',
  headers:{'Content-Type':'application/json; charset=utf-8'},
  body:JSON.stringify({host,key,keyLocation,urlList:good}),
  signal:AbortSignal.timeout(25000)
});
console.log('IndexNow status:',response.status,'URLs notified:',good.length);
console.log('Engine response:',(await response.text()).slice(0,500));
if(![200,202].includes(response.status))process.exitCode=1;
