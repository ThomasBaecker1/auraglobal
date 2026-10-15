import { get, head } from '@vercel/blob';
import { Readable } from 'node:stream';

// Awin product feeds may live in a restricted Vercel Blob store. Public-URL
// redirects work only if its CDN allows anonymous reads. If not, try serving
// the verified JSON through the authenticated Blob SDK before falling back
// to the last repository snapshot.
const FALLBACK = Object.freeze({
  preview:'/data/products.json',
  manifest:'/data/catalog/index.json'
});
const BLOB_PATHS = Object.freeze({
  preview:'auraglobal/catalog/preview.json',
  manifest:'auraglobal/catalog/index.json'
});

function safeFallback(res,file) {
  if (res.headersSent) return res.end();
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-AuraGlobal-Catalog-Source','static-fallback');
  return res.redirect(307,FALLBACK[file]);
}

export default async function handler(req,res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow','GET, HEAD');
    return res.status(405).json({error:'Method not allowed'});
  }
  const file = String(req.query?.file || 'manifest');
  if (!Object.hasOwn(BLOB_PATHS,file)) return res.status(400).json({error:'Unknown catalog file'});
  const pathname = BLOB_PATHS[file];

  // Cheap, cacheable fast path for normally public blobs.
  try {
    const meta = await head(pathname);
    const url = new URL(meta.url);
    if (meta.etag) url.searchParams.set('v',meta.etag.replace(/"/g,''));
    const ok = await fetch(url,{method:'HEAD',signal:AbortSignal.timeout(3500)});
    if (ok.ok) {
      res.setHeader('Cache-Control','public, max-age=60, s-maxage=60');
      res.setHeader('X-AuraGlobal-Catalog-Source','blob-redirect');
      return res.redirect(307,url.toString());
    }
  } catch {
    // A missing/publicly unreadable blob must not break the product finder.
  }

  // Private stores need an authenticated read. Only the two fixed catalog
  // paths are exposed here; no user-controlled paths or credentials leak.
  if (req.method === 'GET') {
    for (const access of ['private','public']) {
      try {
        const blob = await get(pathname,{access,useCache:true});
        if (blob?.statusCode !== 200 || !blob.stream) continue;
        res.setHeader('Content-Type','application/json; charset=utf-8');
        res.setHeader('Cache-Control','public, max-age=60, s-maxage=60');
        res.setHeader('X-AuraGlobal-Catalog-Source','blob-stream');
        if (blob.blob?.etag) res.setHeader('ETag',blob.blob.etag);
        await new Promise((resolve,reject)=>{
          const source = Readable.fromWeb(blob.stream);
          source.once('error',reject);
          res.once('error',reject);
          res.once('finish',resolve);
          source.pipe(res);
        });
        return;
      } catch (error) {
        // If the response started, never attempt a second response.
        if (res.headersSent) {
          console.error('Awin catalog stream interrupted',String(error?.message||error));
          return res.destroy();
        }
      }
    }
  }
  return safeFallback(res,file);
}
