
const fs = require('node:fs');
(async () => {
const {head} = await import('@vercel/blob');
const getJSON = async name => {
  const object = await head('auraglobal/catalog/'+name);
  const response = await fetch(object.url);
  if(!response.ok) throw Error('Previous catalog unavailable: HTTP '+response.status);
  return response.json();
};
const oldManifest = await getJSON('index.json');
const oldPreview = await getJSON('preview.json');
let source = fs.readFileSync('scripts/sync-awin-feeds.mjs','utf8');
const marker = '  previewProducts.sort((a,b)=>';
if(!source.includes(marker))throw Error('Unexpected importer structure');
const preserve = `
  const failedIds = new Set(failures.map(f=>String(f.advertiserId)));
  const currentIds = new Set(catalogMerchants.map(m=>String(m.merchantId)));
  const retained = ${JSON.stringify(oldManifest.merchants||[])}.filter(m=>failedIds.has(String(m.merchantId)) && byMerchant.has(String(m.merchantId)) && !currentIds.has(String(m.merchantId)));
  const retainedIds = new Set(retained.map(m=>String(m.merchantId)));
  catalogMerchants.push(...retained);
  previewProducts.push(...${JSON.stringify(oldPreview.products||[])}.filter(p=>retainedIds.has(String(p.merchantId))));
  for(const m of retained) for(const category of m.categories||[]) allCategories.add(category);
  totalProducts = catalogMerchants.reduce((n,m)=>n+Number(m.productCount||0),0);
  if(!totalProducts) throw new Error('Empty import will not replace current catalog');
`;
source = source.replace(marker,preserve+marker);
fs.writeFileSync('scripts/.refresh-awin-once.mjs',source);
const {runSync} = await import('./scripts/.refresh-awin-once.mjs');
const result = await runSync({storageMode:'blob'});
console.log('AURAGLOBAL_IMPORT_RESULT '+JSON.stringify(result));
fs.unlinkSync('scripts/.refresh-awin-once.mjs');
})().catch(e=>{console.error(e);process.exit(1)});
