/**
 * AuraGlobal: affiliate-link & curated discovery integrity check.
 * No external HTTP calls, logins, network checks or provider credentials.
 * Run: node scripts/audit-affiliates.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors=[], warnings=[], counts={pages:0,awinLinks:0,offers:0,categories:0};
const exists=p=>fs.existsSync(path.join(root,p));
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const parseAttr=(tag,name)=>{const m=tag.match(new RegExp('\\b'+name+'\\s*=\\s*(["\\\'])(.*?)\\1','i'));return m?.[2]||''};
function validateAffiliate(raw,where){
  const normalized=String(raw||'').replace(/&amp;/gi,'&');
  let u;
  try{u=new URL(normalized)}catch{errors.push(where+': malformed affiliate URL');return false}
  if(u.protocol!=='https:' || !['www.awin1.com','awin1.com'].includes(u.hostname)){
    errors.push(where+': affiliate destination is not HTTPS Awin');return false;
  }
  // Awin deep links use awinaffid; original awclick shop links use id.
  const publisher=u.searchParams.get('awinaffid') || (u.pathname==='/awclick.php' ? u.searchParams.get('id') : null);
  if(publisher!=='3076553'){
    errors.push(where+': missing or different publisher id');return false;
  }
  if(!u.searchParams.get('awinmid')&&!u.searchParams.get('mid')){
    warnings.push(where+': check missing merchant id');
  }
  counts.awinLinks++;
  return true;
}

const manifest=read('sitemap.xml');
const pages=[...manifest.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
if(!pages.length)errors.push('No sitemap URLs');
for(const link of pages){
  let u;try{u=new URL(link)}catch{errors.push('Malformed sitemap URL '+link);continue}
  if(u.hostname!=='auraglobal.vercel.app'){errors.push('Wrong sitemap hostname '+link);continue}
  const local=u.pathname==='/'?'index.html':decodeURIComponent(u.pathname).replace(/^\//,'');
  if(local.includes('..')||!exists(local)){errors.push('Sitemap path missing '+local);continue}
  counts.pages++;
  const html=read(local);
  const anchors=[...html.matchAll(/<a\b[^>]*>/gi)].map(m=>m[0]);
  for(const anchor of anchors){
    const href=parseAttr(anchor,'href').replace(/&amp;/gi,'&');
    if(!/awin1\.com/i.test(href))continue;
    const rel=parseAttr(anchor,'rel').toLowerCase();
    validateAffiliate(href,local);
    if(!rel.split(/\s+/).includes('sponsored'))warnings.push(local+': Awin link without rel=sponsored');
  }
  const styleUrls=[...html.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi)].map(m=>parseAttr(m[0],'href'));
  const scripts=[...html.matchAll(/<script\b[^>]*src=["']([^"']+)["'][^>]*>/gi)].map(m=>m[1]);
  for(const res of [...styleUrls,...scripts]){
    if(!res.startsWith('/'))continue;
    const localAsset=res.split(/[?#]/)[0].replace(/^\//,'');
    if(!exists(localAsset))warnings.push(local+': missing local CSS/JS asset '+localAsset);
  }
}
if(!pages.some(x=>x.endsWith('/match.html')))errors.push('AuraMatch missing from sitemap');
if(!exists('assets/aura-match-data.js')||!exists('assets/aura-match.js')||!exists('assets/aura-match.css'))errors.push('AuraMatch resources missing');
else{
 const script=read('assets/aura-match-data.js');
 const sandbox={window:{}};
 try{vm.runInNewContext(script,sandbox,{timeout:1000})}
 catch(e){errors.push('AuraMatch data fails to evaluate: '+e.message)}
 const data=sandbox.window.AURA_MATCH_DATA;
 if(!data||!Array.isArray(data.categories)||!Array.isArray(data.offers))errors.push('Malformed AuraMatch data');
 else{
  counts.offers=data.offers.length;counts.categories=data.categories.length;
  const ids=new Set;
  for(const o of data.offers){
    if(ids.has(o.id))errors.push('Duplicate offer id: '+o.id);
    ids.add(o.id);
    validateAffiliate(o.href,'AuraMatch:'+o.id);
    if(!data.categories.some(c=>c.id===o.category))errors.push('Unknown category for '+o.id);
    if(!/^\/[a-z0-9-]+\.html$/.test(o.guide)||!exists(o.guide.slice(1)))warnings.push('Missing guide for '+o.id);
  }
  for(const c of data.categories){
    if(!Array.isArray(c.intent)||!c.intent.length)errors.push('Category lacks priorities '+c.id);
    for(const i of c.intent||[]){
      if(!data.offers.some(o=>o.category===c.id&&Array.isArray(o.tags)&&o.tags.includes(i.id)))
        errors.push('No eligible offer for '+c.id+':'+i.id);
    }
  }
 }
 try{new Function(read('assets/aura-match.js'))}catch(e){errors.push('AuraMatch JS syntax: '+e.message)}
}

// Site-wide link and conversion-path audit: all top-level published HTML files.
// The daily CI report now covers the full site, not just the sitemap subset.
const siteHtml=fs.readdirSync(root).filter(name=>/\.html$/i.test(name));
const auditDate=new Date().toISOString().slice(0,10);
counts.siteHtmlPages=siteHtml.length;
counts.siteLinksChecked=0;
counts.siteAffiliateLinks=0;
counts.siteBrokenLocalRefs=0;
counts.siteBrokenFragments=0;
counts.siteExpiredDealMarkers=0;
counts.sitePagesMissingFromSitemap=0;
const sitemapLocal=new Set(pages.map(u=>{
  try{const x=new URL(u);return x.pathname==='/'?'index.html':decodeURIComponent(x.pathname).replace(/^\//,'')}
  catch{return ''}
}));
for(const file of siteHtml){
  const html=read(file);
  if(file!=='404.html'&&!sitemapLocal.has(file)){
    counts.sitePagesMissingFromSitemap++;
    warnings.push('Not in sitemap: '+file);
  }
  const ids=new Set([...html.matchAll(/\bid\s*=\s*(["'])(.*?)\1/gi)].map(x=>x[2]));
  const references=[...html.matchAll(/<(?:a|img|link|script|source)\b[^>]*>/gi)].map(x=>x[0]);
  const seenIssues=new Set();
  for(const tag of references){
    const href=parseAttr(tag,'href')||parseAttr(tag,'src');
    if(!href)continue;
    counts.siteLinksChecked++;
    const u=href.replace(/&amp;/gi,'&');
    if(/(?:awin1\.com|tidd\.ly)/i.test(u))counts.siteAffiliateLinks++;
    if(u.startsWith('/')&&!u.startsWith('//')){
      const loc=u.split(/[?#]/)[0].replace(/^\//,'')||'index.html';
      let decoded=loc;try{decoded=decodeURIComponent(loc)}catch{}
      if(!exists(decoded)&&!seenIssues.has('l:'+decoded)){
        seenIssues.add('l:'+decoded);
        counts.siteBrokenLocalRefs++;
        warnings.push(file+': local destination missing '+decoded);
      }
    }
    if(u.startsWith('#')&&u.length>1){
      const id=u.substring(1);
      if(!ids.has(id)&&!seenIssues.has('f:'+id)){
        seenIssues.add('f:'+id);
        counts.siteBrokenFragments++;
        warnings.push(file+': fragment anchor missing #'+id);
      }
    }
  }
  for(const d of html.matchAll(/data-deal-end\s*=\s*(["'])(\d{4}-\d{2}-\d{2})\1/gi)){
    if(d[2]<auditDate){
      counts.siteExpiredDealMarkers++;
      warnings.push(file+': expired offer marker '+d[2]+' (confirm whether hidden or stale)');
    }
  }
}

console.log(JSON.stringify({checkedAt:new Date().toISOString(),...counts,errorCount:errors.length,warningCount:warnings.length,errors,warnings:warnings.slice(0,30)},null,2));
if(errors.length)process.exitCode=1;
