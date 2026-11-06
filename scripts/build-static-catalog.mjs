import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

// Publish every product feed already joined in Awin. The sync pipeline groups
// multiple feeds for the same advertiser and selects the strongest German feed.
const catalogDir = path.resolve('data/catalog');
const manifestPath = path.join(catalogDir, 'index.json');
const previewPath = path.resolve('data/products.json');

if (!process.env.AWIN_DATAFEED_API_KEY && !process.env.AWIN_DATAFEED_LIST_URL) {
  console.log('Awin build refresh skipped: no datafeed credential in this environment.');
} else {
  const previous = JSON.parse(await fs.readFile(manifestPath, 'utf8'));

  // A failure must never replace the last working catalog with empty or
  // partially processed data. All backups remain inside ephemeral build storage.
  const backupDir = await fs.mkdtemp(path.join(os.tmpdir(), 'auraglobal-catalog-'));
  await fs.cp(catalogDir, path.join(backupDir, 'catalog'), { recursive: true });
  await fs.copyFile(previewPath, path.join(backupDir, 'products.json'));
  try {
    const { runSync } = await import('./sync-awin-feeds.mjs');
    const result = await runSync({ storageMode: 'filesystem', merchantAllowlist: null });
    const expectedMerchants = Number(result.eligibleMerchantCount) || result.merchantCount;
    const minimumMerchants = Math.max(2, Math.ceil(expectedMerchants * 0.9));
    const minimumProducts = Math.max(500, Math.floor((previous.productCount || 0) * 0.5));
    if (result.merchantCount < minimumMerchants || result.productCount < minimumProducts) {
      throw new Error('Catalog refresh below joined-feed coverage threshold.');
    }
    console.log('Awin build catalog refreshed: ' + result.merchantCount
      + '/' + expectedMerchants + ' joined merchants, ' + result.productCount + ' products.');
  } catch {
    await fs.rm(catalogDir, { recursive: true, force: true });
    await fs.cp(path.join(backupDir, 'catalog'), catalogDir, { recursive: true });
    await fs.copyFile(path.join(backupDir, 'products.json'), previewPath);
    console.warn('Awin catalog refresh unavailable or below coverage threshold; retained last published static catalog.');
  } finally {
    await fs.rm(backupDir, { recursive: true, force: true });
  }
}
