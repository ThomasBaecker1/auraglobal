/**
 * AuraGlobal all-page static integrity audit.
 * Run: node scripts/audit-site-health.mjs
 * Scans EVERY published HTML file, not only URLs in sitemap.xml.
 * Never fetches external URLs or handles customer data.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const day = new Date().toISOString().slice(0, 10);
const pages = fs.readdirSync(root).filter(p => p.endsWith('.html')).sort();
const failures = [], warnings = [];
const stats = { checkedAt: day, pages: 0, htmlTags: 0, inspectedLinks: 0,
  internalLinks: 0, externalLinks: 0, affiliateLinks: 0, imageRefs: 0,
  scriptRefs: 0, styleRefs: 0, fragmentLinks: 0, activeDatedDeals: 0 };

function attribute(tag, key) {
  const match = tag.match(new RegExp('\\b' + key + '\\s*=\\s*(["\'])(.*?)\\1','i'));
  return match ? match[2].replace(/&amp;/gi, '&') : '';
}
function localFile(url) {
  const value = url.split(/[?#]/)[0];
  const relative = decodeURIComponent(value).replace(/^\/+/, '');
  return path.join(root, relative);
}
const website = 'https://auraglobal.vercel.app';
for (const page of pages) {
  const src = fs.readFileSync(path.join(root, page), 'utf8');
  const identifiers = new Set([...src.matchAll(/\bid\s*=\s*(["'])(.*?)\1/gi)].map(m => m[2]));
  stats.pages++;
  const tags = [...src.matchAll(/<(a|link|img|script|source|iframe)\b[^>]*>/gi)];
  for (const hit of tags) {
    const tag = hit[0], type = hit[1].toLowerCase();
    const url = attribute(tag, type === 'a' || type === 'link' ? 'href' : 'src')
      || (type === 'source' ? attribute(tag, 'srcset').split(/\s+/)[0] : '');
    if (!url) continue;
    stats.htmlTags++;
    stats.inspectedLinks++;
    if (type === 'img') stats.imageRefs++;
    if (type === 'script') stats.scriptRefs++;
    if (type === 'link' && /stylesheet/i.test(tag)) stats.styleRefs++;
    if (/^(?:mailto:|tel:|data:|javascript:)/i.test(url)) continue;
    if (url.startsWith('#')) {
      stats.fragmentLinks++;
      const anchor = url.slice(1);
      if (anchor && !identifiers.has(anchor)) failures.push(page + ': missing local anchor #' + anchor);
      continue;
    }
    let parsed;
    try { parsed = new URL(url, website + '/' + page); }
    catch { failures.push(page + ': malformed URL ' + url.slice(0,100)); continue; }
    if (!['https:', 'http:'].includes(parsed.protocol)) continue;
    if (parsed.hostname !== 'auraglobal.vercel.app' && parsed.hostname !== 'www.auraglobal.net' && parsed.hostname !== 'auraglobal.net') {
      stats.externalLinks++;
      if (/^(?:www\.)?awin1\.com$/i.test(parsed.hostname)) stats.affiliateLinks++;
      continue;
    }
    stats.internalLinks++;
    const local = parsed.pathname === '/' ? 'index.html' : parsed.pathname.replace(/^\//,'');
    const absolute = localFile(local);
    if (!absolute.startsWith(root + path.sep) || !fs.existsSync(absolute)) {
      failures.push(page + ': target missing ' + parsed.pathname);
      continue;
    }
    if (parsed.hash && local === page && !identifiers.has(decodeURIComponent(parsed.hash.slice(1)))) {
      failures.push(page + ': missing same-page anchor ' + parsed.hash);
    }
    if (parsed.hostname !== 'auraglobal.vercel.app') {
      warnings.push(page + ': links to still-unverified custom domain ' + parsed.hostname);
    }
  }
  const deals = [...src.matchAll(/\bdata-deal-end\s*=\s*(["'])(\d{4}-\d\d-\d\d)\1/gi)];
  for (const deal of deals) {
    if (deal[2] < day) failures.push(page + ': expired offer remains in public HTML, ended ' + deal[2]);
    else stats.activeDatedDeals++;
  }
}
const summary = { ...stats, failureCount: failures.length, warningCount: warnings.length,
  failures: failures.slice(0, 120), warnings: warnings.slice(0, 80) };
console.log(JSON.stringify(summary, null, 2));
if (failures.length) process.exitCode = 1;
