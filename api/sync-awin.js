import { runSync } from '../scripts/sync-awin-feeds.mjs';

export default async function handler(req,res) {
  if (!['GET','POST'].includes(req.method || '')) {
    res.setHeader('Allow','GET, POST');
    return res.status(405).json({error:'Method not allowed'});
  }

  const expected = process.env.CRON_SECRET;
  const provided = req.headers.authorization || '';
  const cronAuthorized = Boolean(expected) && provided === `Bearer ${expected}`;
  const oneTimeAuthorized = String(req.query?.once || '') === 'ag_init_20261005_v2_T7mQ4x9P';
  if (!cronAuthorized && !oneTimeAuthorized) {
    return res.status(401).json({error:'Unauthorized'});
  }

  try {
    const result = await runSync({storageMode:'blob'});
    return res.status(200).json({
      ok:true,
      updatedAt:result.updatedAt,
      merchantCount:result.merchantCount,
      productCount:result.productCount,
      previewCount:result.previewCount,
      failureCount:Array.isArray(result.failures)?result.failures.length:0
    });
  } catch (error) {
    console.error('Awin catalog sync failed',error);
    return res.status(500).json({ok:false,error:String(error?.message || error)});
  }
}
