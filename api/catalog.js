import { head } from '@vercel/blob';

export default async function handler(req,res) {
  const file = String(req.query?.file || 'manifest');
  if (!['preview','manifest'].includes(file)) {
    return res.status(400).json({error:'Unknown catalog file'});
  }
  const pathname = file === 'preview'
    ? 'auraglobal/catalog/preview.json'
    : 'auraglobal/catalog/index.json';

  try {
    const blob = await head(pathname);
    const url = new URL(blob.url);
    if (blob.etag) url.searchParams.set('v',blob.etag.replace(/"/g,''));
    // Metadata remains available even while the store refuses public reads.
    // Check the actual object before sending customers to a broken redirect.
    const readable = await fetch(url,{method:'HEAD',signal:AbortSignal.timeout(4000)});
    if (!readable.ok) throw new Error('Catalog read unavailable');
    res.setHeader('Cache-Control','public, max-age=60, s-maxage=60');
    return res.redirect(307,url.toString());
  } catch {
    res.setHeader('Cache-Control','no-store');
    if (file === 'preview') return res.redirect(307,'/data/products.json');
    return res.status(503).json({error:'Full catalog temporarily unavailable; use product selection'});
  }
}
