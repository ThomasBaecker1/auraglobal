import fs from 'node:fs/promises';
import path from 'node:path';
import { createGunzip, gunzipSync } from 'node:zlib';
import { Readable } from 'node:stream';
import { StringDecoder } from 'node:string_decoder';
import { pathToFileURL } from 'node:url';

const FEED_LIST_URL = process.env.AWIN_DATAFEED_LIST_URL;
const API_KEY_INPUT = process.env.AWIN_DATAFEED_API_KEY;
const API_KEY = API_KEY_INPUT && !/^https?:\/\//i.test(API_KEY_INPUT) ? API_KEY_INPUT : '';
const PUBLISHER_ID = process.env.AWIN_PUBLISHER_ID || '3076553';

function optionalLimit(name) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : Infinity;
}

const MAX_PRODUCTS = optionalLimit('AWIN_MAX_PRODUCTS');
const MAX_PER_MERCHANT = optionalLimit('AWIN_MAX_PER_MERCHANT');
const CHUNK_SIZE = Math.max(100, Number(process.env.AWIN_CHUNK_SIZE || 1000));
const PREVIEW_PER_MERCHANT = Math.max(12, Number(process.env.AWIN_PREVIEW_PER_MERCHANT || 48));
const OUTPUT = path.resolve('data/products.json');
const CATALOG_DIR = path.resolve('data/catalog');
const MANIFEST_OUTPUT = path.join(CATALOG_DIR,'index.json');

function getListUrl() {
  if (!FEED_LIST_URL && !API_KEY_INPUT) {
    throw new Error('Missing AWIN_DATAFEED_LIST_URL or AWIN_DATAFEED_API_KEY.');
  }
  return FEED_LIST_URL || (/^https?:\/\//i.test(API_KEY_INPUT || '')
    ? API_KEY_INPUT
    : `https://ui.awin.com/productdata-darwin-download/publisher/${encodeURIComponent(PUBLISHER_ID)}/${encodeURIComponent(API_KEY)}/1/feedList`);
}

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

function clean(v, max = 320) {
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

function validHttpUrl(v) {
  try {
    const u = new URL(String(v || '').trim());
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

function broadCategory({name='',brand='',merchant='',rawCategory=''}) {
  const text = clean([name,brand,merchant,rawCategory].join(' '),700).toLowerCase();
  const rules = [
    [/e-?bike|fahrrad|bike|cycling|urwahn|tenways|dotblue/, 'E-Bikes & Mobilität'],
    [/sneaker|schuh|shoe|jordan|adidas|nike|fashion|kleidung|bekleidung|apparel|momox/, 'Fashion & Sneaker'],
    [/kaffee|coffee|espresso|nespresso|outin/, 'Kaffee & Genuss'],
    [/powerstation|solar|strom|energie|allpowers/, 'Energie & Outdoor'],
    [/katze|hund|pet|haustier|futter|feeder|brunnen|petlibro/, 'Smart Pet'],
    [/schmuck|jewelry|ring|kette|armband|ophelia/, 'Schmuck'],
    [/schreibtisch|desk|office|büro|buro|desktronic/, 'Home Office'],
    [/rasen|garten|mäher|maher|rasendoktor/, 'Garten'],
    [/porzellan|geschirr|teller|tasse|porzellantreff/, 'Haushalt & Wohnen'],
    [/rameder|anhanger|anhänger|kupplung|automotive/, 'Auto & Zubehör'],
    [/shifter|simracing|gaming|cockpit/, 'Gaming'],
    [/mediakos|beauty|kosmetik|pflege/, 'Beauty & Pflege'],
    [/delst|kurs|weiterbildung|education|lernen/, 'Lernen & Weiterbildung']
  ];
  for (const [pattern,label] of rules) if (pattern.test(text)) return label;
  return clean(rawCategory,80) || 'Weitere Produkte';
}

function qualityScore(product) {
  let score = 0;
  if (validHttpUrl(product.image)) score += 3;
  if (Number(product.price) > 0) score += 3;
  if (clean(product.description).length >= 40) score += 2;
  if (clean(product.brand)) score += 1;
  if (clean(product.internalUrl)) score += 2;
  return score;
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

function joined(feed) {
  const status = pick(feed,['Membership Status','Membership','Status']).toLowerCase().replace(/\s+/g,' ');
  return status === 'joined' || status === 'active';
}

function isGerman(feed) {
  const lang = pick(feed,['Language','Locale','Primary Region']).toLowerCase();
  return /german|de_de|de-at|de-ch|\bde\b|germany|austria|switzerland/.test(lang);
}

function feedScore(feed) {
  let score = 0;
  if (isGerman(feed)) score += 100;
  const format = pick(feed,['Datafeed Format','Format']).toLowerCase();
  if (format === 'awin') score += 25;
  else if (format === 'google') score += 12;

  const name = pick(feed,['Feed Name','Product Datafeed Name','Product Feed Name']).toLowerCase();
  if (/deutsch|germany|\bde\b/.test(name)) score += 15;
  if (/\bat\b|austria/.test(name)) score -= 4;
  if (/uk|usa|english/.test(name)) score -= 8;

  const count = number(pick(feed,['No of products','Products','Product Count'])) || 0;
  score += Math.min(Math.log10(count + 1), 6);
  return score;
}

async function fetchText(url) {
  const res = await fetch(url, {headers:{'user-agent':'AuraGlobal-Feed-Sync/4.0'}});
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get('content-type') || '';
  const gzip = /gzip/i.test(contentType) || /\.gz(?:$|\?)/i.test(url) || url.includes('/compression/gzip/');
  if (gzip) {
    try { return gunzipSync(buf).toString('utf8'); } catch {}
  }
  return buf.toString('utf8');
}

async function openProductStream(url) {
  const res = await fetch(url, {headers:{'user-agent':'AuraGlobal-Feed-Sync/4.0'}});
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  if (!res.body) throw new Error('Feed response has no body.');

  const contentType = res.headers.get('content-type') || '';
  const gzip = /gzip/i.test(contentType) || /\.gz(?:$|\?)/i.test(url) || url.includes('/compression/gzip/');
  const source = Readable.fromWeb(res.body);
  return gzip ? source.pipe(createGunzip()) : source;
}

async function* csvRowsFromStream(stream) {
  const decoder = new StringDecoder('utf8');
  let row = [];
  let field = '';
  let quoted = false;
  let pendingQuote = false;

  function consume(text) {
    const completed = [];

    for (let index = 0; index < text.length; index++) {
      const ch = text[index];
      let reprocess = true;

      while (reprocess) {
        reprocess = false;

        if (quoted) {
          if (pendingQuote) {
            if (ch === '"') {
              field += '"';
              pendingQuote = false;
            } else {
              quoted = false;
              pendingQuote = false;
              reprocess = true;
            }
          } else if (ch === '"') {
            pendingQuote = true;
          } else {
            field += ch;
          }
        } else if (ch === '"') {
          quoted = true;
        } else if (ch === ',') {
          row.push(field);
          field = '';
        } else if (ch === '\n') {
          row.push(field.replace(/\r$/, ''));
          completed.push(row);
          row = [];
          field = '';
        } else {
          field += ch;
        }
      }
    }

    return completed;
  }

  try {
    for await (const chunk of stream) {
      for (const completed of consume(decoder.write(chunk))) yield completed;
    }
    for (const completed of consume(decoder.end())) yield completed;

    if (pendingQuote) {
      pendingQuote = false;
      quoted = false;
    }
    if (field.length || row.length) {
      row.push(field.replace(/\r$/, ''));
      yield row;
    }
  } finally {
    if (typeof stream.destroy === 'function' && !stream.destroyed) stream.destroy();
  }
}

async function* streamRecords(url) {
  const stream = await openProductStream(url);
  let headers = null;

  for await (const row of csvRowsFromStream(stream)) {
    if (!headers) {
      headers = row.map(h => String(h).replace(/^\uFEFF/,'').trim());
      continue;
    }
    if (!row.some(v => String(v).trim() !== '')) continue;
    yield Object.fromEntries(headers.map((h,i)=>[h, row[i] ?? '']));
  }
}

export async function runSync({storageMode=process.env.AWIN_STORAGE_MODE || 'filesystem'}={}) {
  const listUrl = getListUrl();
  const listText = await fetchText(listUrl);
  const allJoinedFeeds = records(listText).filter(joined);
  if (!allJoinedFeeds.length) throw new Error('No joined Awin product feeds returned.');
  
  // Every joined Awin merchant is eligible. INTERNAL_GUIDES is only used to add
  // AuraGlobal editorial guide links when we already have one; it must never
  // limit which merchants or products enter the catalog.
  const eligibleFeeds = allJoinedFeeds;
  
  const byMerchant = new Map();
  for (const feed of eligibleFeeds) {
    const id = pick(feed,['Advertiser ID','Merchant ID','merchant_id']);
    if (!byMerchant.has(id)) byMerchant.set(id,[]);
    byMerchant.get(id).push(feed);
  }
  
  const selected = [];
  for (const [merchantId, group] of byMerchant.entries()) {
    const german = group.filter(isGerman);
    const candidates = german.length ? german : group;
    candidates.sort((a,b) => feedScore(b) - feedScore(a));
    if (candidates[0]) selected.push(candidates[0]);
  }
  selected.sort((a,b) => pick(a,['Advertiser Name']).localeCompare(pick(b,['Advertiser Name']),'de'));
  
  const blobMode = storageMode === 'blob';
  let blobPut = null;
  if (blobMode) {
    ({put: blobPut} = await import('@vercel/blob'));
  } else {
    await fs.rm(CATALOG_DIR,{recursive:true,force:true});
    await fs.mkdir(CATALOG_DIR,{recursive:true});
  }
  
  const previewProducts = [];
  const perMerchant = new Map();
  const catalogMerchants = [];
  const allCategories = new Set();
  const failures = [];
  let totalProducts = 0;
  
  async function writeMerchantChunk(advertiserId, advertiserName, chunkIndex, rows) {
    if (!rows.length) return '';
    const fileName = 'chunk-' + String(chunkIndex).padStart(4,'0') + '.json';
    const payload = JSON.stringify({
      version: 1,
      merchantId: String(advertiserId),
      merchant: advertiserName,
      chunk: chunkIndex,
      productCount: rows.length,
      products: rows
    })+'\n';
  
    if (blobMode) {
      const blob = await blobPut(
        'auraglobal/catalog/' + slug(advertiserId) + '/' + fileName,
        payload,
        {
          access:'public',
          addRandomSuffix:false,
          allowOverwrite:true,
          cacheControlMaxAge:300,
          contentType:'application/json; charset=utf-8'
        }
      );
      return blob.url;
    }
  
    const dir = path.join(CATALOG_DIR,slug(advertiserId));
    await fs.mkdir(dir,{recursive:true});
    const filePath = path.join(dir,fileName);
    await fs.writeFile(filePath,payload,'utf8');
    return '/data/catalog/' + slug(advertiserId) + '/' + fileName;
  }
  
  function rememberPreview(list, product) {
    list.push(product);
    list.sort((a,b)=>(Number(b.qualityScore)||0)-(Number(a.qualityScore)||0) ||
      (Number(a.price)||Number.MAX_SAFE_INTEGER)-(Number(b.price)||Number.MAX_SAFE_INTEGER));
    if (list.length > PREVIEW_PER_MERCHANT) list.length = PREVIEW_PER_MERCHANT;
  }
  
  for (const feed of selected) {
    if (totalProducts >= MAX_PRODUCTS) break;
  
    const feedUrlRaw = pick(feed,['URL','Download URL','Feed URL']);
    if (!feedUrlRaw) continue;
  
    const feedUrl = feedUrlRaw.replace('/adultcontent/1/','/adultcontent/0/');
    const advertiserId = pick(feed,['Advertiser ID','Merchant ID','merchant_id']);
    const advertiserName = pick(feed,['Advertiser Name','Merchant Name','merchant_name']) || 'Partner';
    const feedId = pick(feed,['Feed ID']);
    const declaredProducts = number(pick(feed,['No of products','Products','Product Count']));
  
    try {
      let count = 0;
      let chunkIndex = 1;
      let chunk = [];
      const chunkPaths = [];
      const merchantPreview = [];
      const merchantCategories = new Set();
      const seen = new Set();
      let canonicalMerchant = advertiserName;
  
      for await (const row of streamRecords(feedUrl)) {
        if (totalProducts >= MAX_PRODUCTS || count >= MAX_PER_MERCHANT) break;
  
        const productId = pick(row,['aw_product_id','merchant_product_id','product_id','id']);
        const name = clean(pick(row,['product_name','title','name']),180);
        if (name.length < 3 || /^(test|unknown|n\/a|produkt)$/i.test(name)) continue;
        const awDeep = pick(row,['aw_deep_link','tracking_url']);
        const merchantDeep = pick(row,['merchant_deep_link','deep_link','link']);
        const deep = awDeep || merchantDeep;
        if (!name || !deep) continue;
  
        const stockRaw = pick(row,['in_stock','stock_status','availability']).toLowerCase();
        if (/out of stock|out_of_stock|unavailable|false|^0$/.test(stockRaw)) continue;
  
        const key = String(productId || name);
        if (seen.has(key)) continue;
        seen.add(key);
  
        const salePrice = number(pick(row,['sale_price','search_price','store_price']));
        const regularPrice = number(pick(row,['price','rrp_price','product_price_old','old_price','rrp']));
        const price = salePrice || regularPrice;
        const oldPrice = regularPrice && price && regularPrice > price ? regularPrice : null;
        const merchant = clean(pick(row,['merchant_name','advertiser_name']) || advertiserName,100);
        canonicalMerchant = merchant || canonicalMerchant;
        const rawCategory = clean(pick(row,['category_name','merchant_category','product_type','google_product_category']),160);
        const imageRaw = pick(row,['large_image','merchant_image_url','aw_image_url','image_link','image']);
        const image = validHttpUrl(imageRaw) ? imageRaw : '';
        const brand = clean(pick(row,['brand_name','brand']) || merchant,100);
        let desc = clean(pick(row,['product_short_description','description']),280);
        if (desc && clean(desc).toLowerCase() === name.toLowerCase()) desc = '';
        const category = broadCategory({name,brand,merchant,rawCategory});
        const keywords = clean([rawCategory,brand,merchant].filter(Boolean).join(' · '),240);
        const currency = clean(pick(row,['currency']) || 'EUR',8);
        const url = trackingUrl(deep, advertiserId, productId || name);
        if (!url) continue;
  
        const product = {
          id: `${slug(advertiserId)}-${slug(productId || name)}`,
          merchantId: advertiserId,
          merchant,
          brand,
          name,
          category,
          categoryRaw: rawCategory,
          description: desc,
          keywords,
          price,
          oldPrice,
          currency,
          image,
          url,
          internalUrl: INTERNAL_GUIDES[String(advertiserId)] || '',
          inStock: true,
          lastUpdated: clean(pick(row,['last_updated','updated_at']),40) || new Date().toISOString()
        };
        product.qualityScore = qualityScore(product);
  
        chunk.push(product);
        rememberPreview(merchantPreview,product);
        merchantCategories.add(category);
        allCategories.add(category);
        count++;
        totalProducts++;
  
        if (chunk.length >= CHUNK_SIZE) {
          const chunkPath = await writeMerchantChunk(advertiserId,canonicalMerchant,chunkIndex,chunk);
          if (chunkPath) chunkPaths.push(chunkPath);
          chunk = [];
          chunkIndex++;
        }
      }
  
      if (chunk.length) {
        const chunkPath = await writeMerchantChunk(advertiserId,canonicalMerchant,chunkIndex,chunk);
        if (chunkPath) chunkPaths.push(chunkPath);
      }
  
      if (count) {
        previewProducts.push(...merchantPreview);
        perMerchant.set(advertiserId,count);
        catalogMerchants.push({
          merchantId: String(advertiserId),
          merchant: canonicalMerchant,
          productCount: count,
          declaredProducts,
          categories: [...merchantCategories].sort((a,b)=>a.localeCompare(b,'de')),
          chunks: chunkPaths,
          internalUrl: INTERNAL_GUIDES[String(advertiserId)] || ''
        });
      }
  
      console.log(`Synced ${advertiserName}: ${count} products in ${chunkPaths.length} chunks (feed ${feedId || 'n/a'}, declared ${declaredProducts ?? 'n/a'})`);
    } catch (err) {
      failures.push({
        advertiserId,
        advertiserName,
        feedId,
        error:String(err?.message || err)
      });
      console.warn(`Feed failed for ${advertiserName}: ${err?.message || err}`);
    }
  }
  
  previewProducts.sort((a,b)=>a.merchant.localeCompare(b.merchant,'de') ||
    (Number(b.qualityScore)||0)-(Number(a.qualityScore)||0) ||
    a.name.localeCompare(b.name,'de'));
  catalogMerchants.sort((a,b)=>a.merchant.localeCompare(b.merchant,'de'));
  
  const updatedAt = new Date().toISOString();
  const merchantCount = catalogMerchants.length;
  const manifest = {
    version: 5,
    updatedAt,
    source: 'awin-product-feed',
    joinedFeedCount: allJoinedFeeds.length,
    eligibleFeedCount: eligibleFeeds.length,
    selectedFeedCount: selected.length,
    eligibleMerchantCount: byMerchant.size,
    merchantCount,
    productCount: totalProducts,
    previewCount: previewProducts.length,
    chunkSize: CHUNK_SIZE,
    maxProducts: Number.isFinite(MAX_PRODUCTS) ? MAX_PRODUCTS : null,
    maxPerMerchant: Number.isFinite(MAX_PER_MERCHANT) ? MAX_PER_MERCHANT : null,
    categories: [...allCategories].sort((a,b)=>a.localeCompare(b,'de')),
    failures,
    merchants: catalogMerchants
  };
  
  const output = {
    version: 5,
    updatedAt,
    source: 'awin-product-feed-preview',
    merchantCount,
    productCount: totalProducts,
    previewCount: previewProducts.length,
    manifest: '/data/catalog/index.json',
    failures,
    products: previewProducts
  };
  
  let manifestUrl = '/data/catalog/index.json';
  let previewUrl = '/data/products.json';
  
  if (blobMode) {
    const [manifestBlob,previewBlob] = await Promise.all([
      blobPut('auraglobal/catalog/index.json',JSON.stringify(manifest)+'\n',{
        access:'public',
        addRandomSuffix:false,
        allowOverwrite:true,
        cacheControlMaxAge:300,
        contentType:'application/json; charset=utf-8'
      }),
      blobPut('auraglobal/catalog/preview.json',JSON.stringify(output)+'\n',{
        access:'public',
        addRandomSuffix:false,
        allowOverwrite:true,
        cacheControlMaxAge:300,
        contentType:'application/json; charset=utf-8'
      })
    ]);
    manifestUrl = manifestBlob.url;
    previewUrl = previewBlob.url;
  } else {
    await fs.mkdir(path.dirname(OUTPUT),{recursive:true});
    await fs.writeFile(MANIFEST_OUTPUT,JSON.stringify(manifest,null,2)+'\n','utf8');
    await fs.writeFile(OUTPUT,JSON.stringify(output,null,2)+'\n','utf8');
  }
  
  console.log(`Wrote ${totalProducts} products from ${merchantCount} merchants into lazy-load catalog chunks; preview contains ${previewProducts.length} products.`);
  return {
    updatedAt,
    merchantCount,
    productCount: totalProducts,
    previewCount: previewProducts.length,
    failures,
    manifestUrl,
    previewUrl,
    storageMode
  };
  
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isCli) {
  const result = await runSync();
  if (!result.productCount) process.exitCode = 2;
}
