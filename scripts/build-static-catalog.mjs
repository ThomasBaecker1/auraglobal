import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

// Build-time, no-Blob fallback: refresh only merchants already present in
// the published catalog. New Awin partners still require manual approval.
const catalogDir = path.resolve('data/catalog');
const manifestPath = path.join(catalogDir, 'index.json');
const previewPath = path.resolve('data/products.json');

if (!process.env.AWIN_DATAFEED_API_KEY && !process.env.AWIN_DATAFEED_LIST_URL) {
  console.log('Awin build refresh skipped: no datafeed credential in this environment.');
} else {
  const previous = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const approvedExistingIds = [...new Set((previous.merchants || [])
    .map(merchant => String(merchant.merchantId || '').trim())
    .filter(id => /^\d+$/.test(id)))];
  if (approvedExistingIds.length < 2) {
    throw new Error('Existing catalog allowlist unavailable; refusing unreviewed merchant publication.');
  }

  // A failure must never replace the last working catalog with empty or
  // partially processed data. All backups remain inside ephemeral build storage.
  const backupDir = await fs.mkdtemp(path.join(os.tmpdir(), 'auraglobal-catalog-'));
  await fs.cp(catalogDir, path.join(backupDir, 'catalog'), { recursive: true });
  await fs.copyFile(previewPath, path.join(backupDir, 'products.json'));
  process.env.AWIN_ALLOWED_MERCHANT_IDS = approvedExistingIds.join(',');
  try {
    const { runSync } = await import('./sync-awin-feeds.mjs');
    const result = await runSync({ storageMode: 'filesystem' });
    const minimumMerchants = Math.ceil(approvedExistingIds.length * 0.7);
    const minimumProducts = Math.max(500, Math.floor((previous.productCount || 0) * 0.5));
    if (result.merchantCount < minimumMerchants || result.productCount < minimumProducts) {
      throw new Error('Catalog refresh below existing coverage threshold.');
    }
    console.log('Awin build catalog refreshed: ' + result.merchantCount
      + ' existing merchants, ' + result.productCount + ' products.');
  } catch {
    await fs.rm(catalogDir, { recursive: true, force: true });
    await fs.cp(path.join(backupDir, 'catalog'), catalogDir, { recursive: true });
    await fs.copyFile(path.join(backupDir, 'products.json'), previewPath);
    console.warn('Awin build refresh unavailable; retained last published static catalog.');
  } finally {
    await fs.rm(backupDir, { recursive: true, force: true });
  }
}
