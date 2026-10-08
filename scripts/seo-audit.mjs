/**
 * AuraGlobal static SEO health check.
 * No network calls, tokens, analytics credentials or external dependencies.
 * Run locally: node scripts/seo-audit.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const xml = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replace(/&amp;/g,'&'));
const errors=[],warnings=[],pages=[];
const has=(text,re)=>re.test(text);
for(const link of urls){
 let url;try{url=new URL(link)}catch{errors.push('Invalid URL in sitemap: '+link);continue;}
 if(url.hostname!=='auraglobal.vercel.app'){errors.push('Unexpected sitemap hostname: '+link);continue;}
 const pathname=decodeURIComponent(url.pathname);
 const filename=pathname==='/' ? 'index.html' : pathname.replace(/^\//,'');
 if(filename.includes('..')||path.isAbsolute(filename)){errors.push('Unsafe path: '+filename);continue;}
 const full=path.join(ROOT,filename);
 if(!fs.existsSync(full)){errors.push('Sitemap target missing: '+filename);continue;}
 const html=fs.readFileSync(full,'utf8');
 const title=html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || '';
 const desc=html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)/i)?.[1] || '';
 const canon=html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)/i)?.[1]||'';
 if(!title)errors.push('Title missing: '+filename);
 if(!desc)warnings.push('Description missing: '+filename);
 if(!canon)warnings.push('Canonical missing: '+filename);
 else if(canon!==link)warnings.push('Canonical differs from sitemap: '+filename);
 if(/<h1\b/i.test(html)===false)warnings.push('H1 missing: '+filename);
 if(/awin1\.com/i.test(html)&&!/rel=["'][^"']*sponsored/i.test(html))warnings.push('Check advertising disclosures: '+filename);
 pages.push({file:filename,title,description:!!desc,canonical:!!canon});
}
if(!urls.length)errors.push('No URLs found in sitemap.');
if(new Set(urls).size!==urls.length)errors.push('Duplicate URLs in sitemap.');
const result={generatedAt:new Date().toISOString(),checkedPages:pages.length,sitemapUrls:urls.length,errorCount:errors.length,warningCount:warnings.length,errors,warnings};
console.log(JSON.stringify(result,null,2));
if(errors.length)process.exitCode=1;
