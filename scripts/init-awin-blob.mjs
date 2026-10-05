import { runSync } from './sync-awin-feeds.mjs';

const result = await runSync({storageMode:'blob'});
if (!result.productCount) {
  console.error('Initial Awin Blob sync produced no products.');
  process.exit(2);
}
console.log(JSON.stringify({
  merchantCount: result.merchantCount,
  productCount: result.productCount,
  previewCount: result.previewCount,
  failureCount: result.failures?.length || 0
}));
