# AuraGlobal.net domain cutover — prepared, NOT activated

This branch prepares AuraGlobal.net as the canonical domain. **Do not merge while auraglobal.net is serving a Squarespace 'Coming Soon' page.** Preserve the live auraglobal.vercel.app alias until DNS, SSL, and end-to-end page tests pass.

As inspected on 2026-10-15:
- Vercel project: `auraglobal` (`prj_ceFCbUS4as4qLUwFOWpVxlwEharR`)
- Both `auraglobal.net` and `www.auraglobal.net` are already attached and verified in Vercel, but third-party DNS points to Squarespace parking.
- Vercel's **current live** project settings redirect apex `auraglobal.net` -> `www.auraglobal.net` with 308. To use the requested apex as canonical, reverse this.
- Nameservers: `ns-cloud-c1..c4.googledomains.com` (managed externally, likely via Squarespace Domains). Not writable from the Vercel integration.

## Required DNS edits at the authoritative DNS host (external)
Retain unrelated MX, TXT, CAA, SPF, DKIM and other mail/verification records. Change **website routing records only**, removing conflicting Squarespace parking A/CNAME entries.

| Host | Type | Target |
| --- | --- | --- |
| @ | A | 216.198.79.1 |
| @ | A | 64.29.17.1 |
| www | CNAME | f11f0f0e6b4f07b4.vercel-dns-017.com |

These were Vercel's rank-1 recommended DNS values for the project as of 2026-10-15; re-check in Vercel before editing in case the recommendations change.

After propagation verify Vercel domain configurations report `misconfigured: false`, both hosts respond with the correct AuraGlobal HTML (not Squarespace), valid TLS, and a deep-link route like `/eonon.html` works.

## Required Vercel domain settings
1. Remove existing apex `auraglobal.net` -> `www.auraglobal.net` redirect.
2. Set `auraglobal.net` to serve the production deployment directly.
3. Redirect `www.auraglobal.net` -> `auraglobal.net` using 308.
4. Ensure `auraglobal.vercel.app` still remains attached until this PR is merged.

## Cutover
- After DNS and domain settings are verified, merge this PR and deploy its `main` commit to production.
- This PR updates exact `https://auraglobal.vercel.app` references across site pages, XML sitemap, RSS feed, and `robots.txt`.
- Vercel redirects requests whose host is `auraglobal.vercel.app` to the corresponding `.net` path via host-conditional 308 only after merging.
- Confirm: 200 at https://auraglobal.net/; 200 at https://auraglobal.net/eonon.html; 308 at old .vercel.app URL and at www; sitemap and canonical URLs reference apex; no loops.
- Update Google Search Console with new domain and sitemap; update the website URL in the Awin publisher profile and review merchant terms; update future partner outreach and social profile links.
- Recheck Awin affiliate journeys, clickrefs, current campaigns, and privacy/consent links before scaling paid traffic.

## Safe rollback
Keep the original Git commit `4db36925eccfde97156573e203f1f38bbfb5342d` as the pre-migration baseline. If DNS breaks, revert external DNS and Vercel project-domain redirects first, and revert this PR's migration commit; keep `auraglobal.vercel.app` serving traffic until recovered.
