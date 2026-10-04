import fs from 'node:fs/promises';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';

const FEED_LIST_URL = process.env.AWIN_DATAFEED_LIST_URL;
const API_KEY_INPUT = process.env.AWIN_DATAFEED_API_KEY;
const API_KEY = API_KEY_INPUT && !/^https?:\/\//i.test(API_KEY_INPUT) ? API_KEY_INPUT : '';
const PUBLISHER_ID = process.env.AWIN_PUBLISHER_ID || '3076553';
const MAX_PRODUCTS = Number(process.env.AWIN_MAX_PRODUCTS || 50000);
const MAX_PER_MERCHANT = Number(process.env.AWIN_MAX_PER_MERCHANT || 3000);
const MAX_FEED_PRODUCTS = Number(process.env.AWIN_MAX_FEED_PRODUCTS || 100000);
const OUTPUT = path.resolve('data/products.json');

if (!FEED_LIST_URL && !API_KEY_INPUT) {
  console.error('Missing AWIN_DATAFEED_LIST_URL or AWIN_DATAFEED_API_KEY.');
  process.exit(1);
}

const listUrl = FEED_LIST_URL || (/^https?:\/\//i.test(API_KEY_INPUT || '') ? API_KEY_INPUT : `https://ui.awin.com/productdata-darwin-download/publisher/${encodeURIComponent(PUBLISHER_ID)}/${encodeURIComponent(API_KEY)}/1/feedList`);

const INTERNAL_GUIDES = {
  '24089':'/paper-sons.html',
  '123708':'/vintage-realm.html',
  '124878':'/wau.html',
  '67914':'/allpowers.html',
  '125144':'/anthbot.html',
  '128211':'/ophelia.html',
  '127821':'/outin.html',
  '114336':'/house-of-sneakers.html',
  '72399':'/tenways.html',
  '11346':'/momox-fashion.html',
  '11352':'/vorteilshop.html',
  '11429':'/porzellantreff.html',
  '13633':'/nespresso.html',
  '14188':'/rameder.html',
  '16937':'/shifter.html',
  '26999':'/rasendoktor.html',
  '30917':'/norma24.html',
  '68034':'/urwahn.html',
  '77942':'/petlibro.html',
  '81425':'/mediakos.html',
  '99887':'/desktronic.html',
  '114194':'/raibu.html',
  '115541':'/dotblue.html',
  '119967':'/delst.html',
  '127589':'/braingood.html'
};

function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n') { row.push(field.replace(/\r$/, '')); rows.push(row); row = []; field = ''; }
    else field += ch;
  }
  if (field.length || row.length) { row.push(field.replace(/\r$/, '')); rows.push(row); }
  return rows.filter(r => r.some(v => String(v).trim() !== ''));
}

function records(text) {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => String(h).replace(/^\uFEFF/,'').trim());
  return rows.slice(1).map(row => Object.fromEntries(headers.map((h,i)=>[h, row[i] ?? ''])));
}

function pick(obj, names) {
  const keys = Object.keys(obj);
  for (const name of names) {
    const key = keys.find(k => k.toLowerCase() === name.toLowerCase());
    if (key && String(obj[key] ?? '').trim()) return String(obj[key]).trim();
  }
  return '';
}

function number(v) {
  if (v == null || v === '') return null;
  const cleaned = String(v).replace(/[^0-9,.-]/g,'').replace(/,(?=\d{1,2}$)/,'.').replace(/,/g,'');
  const n = Number(cleaned);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function clean(v, max = 360) {
  return String(v ?? '')
    .replace(/<[^>]*>/g,' ')
    .replace(/&nbsp;/gi,' ')
    .replace(/&amp;/gi,'&')
    .replace(/&quot;/gi,'"')
    .replace(/&#39;/gi,"'")
    .replace(/\s+/g,' ')
    .trim()
    .slice(0,max);
}

function slug(v) {
  return clean(v,120).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80) || 'produkt';
}

function trackingUrl(raw, merchantId, productId) {
  const value = String(raw || '').trim();
  if (!/^https?:\/\//i.test(value)) return '';
  const ref = `ag_feed_${slug(merchantId)}_${slug(productId)}`.slice(0,90);

  if (/awin1\.com\/cread\.php|clickref=/i.test(value)) {
    if (/([?&])clickref=/i.test(value)) return value;
    return value + (value.includes('?') ? '&' : '?') + 'clickref=' + encodeURIComponent(ref);
  }

  const params = new URLSearchParams({
    awinmid: String(merchantId),
    awinaffid: String(PUBLISHER_ID),
    clickref: ref,
    ued: value
  });
  return 'https://www.awin1.com/cread.php?' + params.toString();
}

function isGerman(feed) {
  const lang = pick(feed,['Language','Locale','Primary Region']).toLowerCase();
  return /german|de_de|de-at|de-ch|\bde\b|germany|austria|switzerland/.test(lang);
}

function joined(feed) {
  const status = pick(feed,['Membership Status','Membership','Status']).toLowerCase().replace(/\s+/g,' ');
  return status === 'joined' || status === 'active';
}

async function fetchText(url) {
  const res = await fetch(url, {headers:{'user-agent':'AuraGlobal-Feed-Sync/2.0'}});
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get('content-type') || '';
  const gzip = /gzip/i.test(contentType) || /\.gz(?:$|\?)/i.test(url) || url.includes('/compression/gzip/');
  if (gzip) {
    try { return gunzipSync(buf).toString('utf8'); } catch {}
  }
  return buf.toString('utf8');
}

const listText = await fetchText(listUrl);
const feeds = records(listText).filter(joined);
if (!feeds.length) throw new Error('No joined Awin product feeds returned.');

const byMerchant = new Map();
for (const feed of feeds) {
  const id = pick(feed,['Advertiser ID','Merchant ID','merchant_id']) || pick(feed,['Advertiser Name','Merchant Name']);
  if (!byMerchant.has(id)) byMerchant.set(id,[]);
  byMerchant.get(id).push(feed);
}

const selected = [];
const skipped = [];
for (const [merchantId,group] of byMerchant.entries()) {
  const german = group.filter(isGerman);
  const candidates = german.length ? german : group;
  candidates.sort((a,b)=>(number(pick(a,['No of products','Products','Product Count']))||0)-(number(pick(b,['No of products','Products','Product Count']))||0));

  for (const feed of candidates) {
    const declared = number(pick(feed,['No of products','Products','Product Count']));
    if (declared && declared > MAX_FEED_PRODUCTS) {
      skipped.push({
        advertiserId: merchantId,
        advertiserName: pick(feed,['Advertiser Name','Merchant Name']),
        feedId: pick(feed,['Feed ID']),
        reason: `deferred_large_feed_${declared}`
      });
      continue;
    }
    selected.push(feed);
  }
}

const products = [];
const seen = new Set();
const perMerchant = new Map();
const failures = [];

for (const feed of selected) {
  if (products.length >= MAX_PRODUCTS) break;
  const feedUrlRaw = pick(feed,['URL','Download URL','Feed URL']);
  if (!feedUrlRaw) continue;
  const feedUrl = feedUrlRaw.replace('/adultcontent/1/','/adultcontent/0/');
  const advertiserId = pick(feed,['Advertiser ID','Merchant ID','merchant_id']);
  const advertiserName = pick(feed,['Advertiser Name','Merchant Name','merchant_name']) || 'Partner';

  if ((perMerchant.get(advertiserId) || 0) >= MAX_PER_MERCHANT) continue;

  try {
    const text = await fetchText(feedUrl);
    const rows = records(text);

    for (const row of rows) {
      if (products.length >= MAX_PRODUCTS) break;
      const count = perMerchant.get(advertiserId) || 0;
      if (count >= MAX_PER_MERCHANT) break;

      const productId = pick(row,['aw_product_id','merchant_product_id','product_id','id']);
      const name = clean(pick(row,['product_name','title','name']),180);
      const awDeep = pick(row,['aw_deep_link','tracking_url']);
      const merchantDeep = pick(row,['merchant_deep_link','deep_link','link']);
      const deep = awDeep || merchantDeep;
      if (!name || !deep) continue;

      const stockRaw = pick(row,['in_stock','stock_status','availability']).toLowerCase();
      if (/out of stock|out_of_stock|unavailable|false|^0$/.test(stockRaw)) continue;

      const key = `${advertiserId}:${productId || name}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const salePrice = number(pick(row,['sale_price','search_price','store_price']));
      const regularPrice = number(pick(row,['price','rrp_price','product_price_old','old_price','rrp']));
      const price = salePrice || regularPrice;
      const oldPrice = regularPrice && price && regularPrice > price ? regularPrice : null;
      const merchant = clean(pick(row,['merchant_name','advertiser_name']) || advertiserName,100);
      const category = clean(pick(row,['category_name','merchant_category','product_type','google_product_category']) || 'Weitere Produkte',100);
      const image = pick(row,['large_image','merchant_image_url','aw_image_url','image_link','image']);
      const brand = clean(pick(row,['brand_name','brand']) || merchant,100);
      const desc = clean(pick(row,['product_short_description','description']),360);
      const currency = clean(pick(row,['currency']) || 'EUR',8);
      const url = trackingUrl(deep, advertiserId, productId || name);
      if (!url) continue;

      products.push({
        id: `${slug(advertiserId)}-${slug(productId || name)}`,
        merchantId: advertiserId,
        merchant,
        brand,
        name,
        category,
        description: desc,
        price,
        oldPrice,
        currency,
        image,
        url,
        internalUrl: INTERNAL_GUIDES[String(advertiserId)] || '',
        inStock: true,
        lastUpdated: clean(pick(row,['last_updated','updated_at']),40) || new Date().toISOString()
      });
      perMerchant.set(advertiserId,count+1);
    }
    console.log(`Synced ${advertiserName}: ${perMerchant.get(advertiserId) || 0} products`);
  } catch (err) {
    failures.push({advertiserId, advertiserName, error:String(err?.message || err)});
    console.warn(`Feed failed for ${advertiserName}: ${err?.message || err}`);
  }
}

products.sort((a,b)=>a.merchant.localeCompare(b.merchant,'de') || a.name.localeCompare(b.name,'de'));
const merchantCount = new Set(products.map(p=>p.merchantId || p.merchant)).size;
const output = {
  version: 2,
  updatedAt: new Date().toISOString(),
  source: 'awin-product-feed',
  joinedFeedCount: feeds.length,
  selectedFeedCount: selected.length,
  merchantCount,
  productCount: products.length,
  skipped,
  failures,
  products
};

await fs.mkdir(path.dirname(OUTPUT),{recursive:true});
await fs.writeFile(OUTPUT,JSON.stringify(output,null,2)+'\n','utf8');
console.log(`Wrote ${products.length} products from ${merchantCount} merchants to ${OUTPUT}`);
if (!products.length) process.exitCode = 2;
