# A Serverless API Can Return 200 OK and Still Be 22 Days Out of Date

*A reproducible debugging case study from AuraGlobal, a self-built affiliate comparison site. Observations made on 27 October 2026; not a client engagement.*

## The misleading success signal

A product finder can look healthy at the HTTP layer while quietly serving obsolete data. On 27 October, I inspected the public `/api/catalog` endpoint of my own Vercel-hosted site. It responded with HTTP 200 and a valid JSON document. But the document told a different story:

| Signal | Observed value |
| --- | --- |
| HTTP status | 200 |
| `updatedAt` | `2026-10-05T13:11:35.160Z` |
| `source` | `awin-product-feed-fallback` |
| `catalogStatus` | `preview-fallback` |
| `merchantCount` | 26 |
| `productCount` | 2,255 |
| `truncatedForRuntime` | `true` |

Those 2,255 products were **not evidence of a successful new import**. They were a snapshot from 5 October. A green uptime check alone would have missed the distinction.

## Trace the response path, not just the status code

The site's [catalog handler](https://github.com/ThomasBaecker1/auraglobal/blob/main/api/catalog.js) first tries to locate the current catalog in Vercel Blob. If a public Blob URL is readable, it redirects there. If not, it tries an authenticated Blob SDK read. If neither path works, it redirects to a bundled static snapshot, with a source header indicating the fallback.

That is a reasonable availability strategy: shoppers should not receive a blank page because a feed is unavailable. But a successful fallback is not a successful synchronization. Following redirects hides that distinction unless the JSON itself carries provenance.

The [sync endpoint](https://github.com/ThomasBaecker1/auraglobal/blob/main/api/sync-awin.js) invokes a feed importer. The importer intentionally refuses to overwrite a working catalog with an empty result. This protects the last known snapshot, but it also means that **freshness must be monitored separately from availability**.

The Vercel runtime error summary showed a failed sync at `2026-10-27T05:13:58Z`, with the message `Refusing to publish empty Awin catalog after feed failures.` That message establishes the outcome, not the underlying cause. Without the upstream feed responses and environment configuration, it would be wrong to blame a particular credential, network hop, or CSV parser.

## A minimal freshness check

The following Node.js script makes the stale-data condition explicit. It does not need access to affiliate credentials:

```js
const endpoint = 'https://auraglobal.vercel.app/api/catalog';
const response = await fetch(endpoint, { redirect: 'follow' });

if (!response.ok) {
  throw new Error(`Catalog unavailable: HTTP ${response.status}`);
}

const catalog = await response.json();
const updated = Date.parse(catalog.updatedAt);
const ageHours = (Date.now() - updated) / 3_600_000;

if (!Number.isFinite(ageHours) || ageHours < 0) {
  throw new Error('Catalog has a missing or invalid update timestamp');
}

const isLiveFeed = catalog.source === 'awin-product-feed';
const isFresh = ageHours <= 48;

console.log({
  source: catalog.source,
  ageHours: Math.round(ageHours),
  productCount: catalog.productCount,
  isLiveFeed,
  isFresh
});

if (!isLiveFeed || !isFresh) {
  process.exitCode = 1;
}
```

This is a **proposed monitoring check**, not a claim that the production site already runs it. The 48-hour threshold is an example policy; a merchant's feed cadence may justify a different threshold. The essential requirement is to make the policy explicit.

## Two different decisions need two different health checks

For **visitor availability**, the static snapshot is preferable to an empty interface, provided product prices and availability are not presented as freshly verified. For **publishing new offers**, the same snapshot is insufficient: promotional claims and current prices need confirmation from the merchant or a verified fresh feed.

I would monitor three independent outcomes:

1. **HTTP availability:** does the endpoint respond with parseable JSON?
2. **Catalog provenance and age:** is the source a live import, and is `updatedAt` within the agreed freshness window?
3. **Sync completion:** did the scheduled job finish with nonzero verified products, and what upstream errors occurred?

Only the third check can help diagnose the feed importer. The first two can already prevent a misleading “all systems green” dashboard.

## What I learned

A fallback is not a bug. An **unlabelled** fallback is a product-quality risk. The strongest low-risk improvement is often not another retry or a more aggressive timeout: it is a small, independently testable freshness signal, coupled with honest UI language when the data is old.

**Scope note:** This is a first-hand technical writing sample about my own project. It does not imply prior client work, a resolved feed outage, measured conversion gains, or verified affiliate sales.
