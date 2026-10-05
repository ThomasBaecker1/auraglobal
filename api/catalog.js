import { head } from '@vercel/blob';

export default async function handler(req,res) {
  const file = String(req.query?.file || 'manifest');
  const pathname = file === 'preview'
    ? 'auraglobal/catalog/preview.json'
    : 'auraglobal/catalog/index.json';

  try {
    const blob = await head(pathname);
    const url = new URL(blob.url);
    if (blob.etag) url.searchParams.set('v',blob.etag.replace(/"/g,''));
    res.setHeader('Cache-Control','public, max-age=60, s-maxage=60');
    return res.redirect(307,url.toString());
  } catch (error) {
    return res.status(404).json({error:'Catalog not available yet'});
  }
}
