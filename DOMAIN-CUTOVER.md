# AuraGlobal.net domain cutover — prepared, NOT activated

This branch prepares AuraGlobal.net as the canonical domain. **Do not merge while auraglobal.net is serving a Squarespace 'Coming Soon' page.** Preserve the live auraglobal.vercel.app alias until DNS, SSL, and end-to-end page tests pass.

As inspected on 2026-10-15:
- Vercel project: `auraglobal` (`prj_ceFCbUS4as4qLUwFOWpVxlwEharR`)
- Both `auraglobal.net` and `www.auraglobal.net` are attached and verified in Vercel, but third-party DNS points to Squarespace parking. Live requests still return the Squarespace placeholder.
- Vercel's current project-domain setting redirects apex `auraglobal.net` -> `www.auraglobal.net` with 308. Reverse this after confirming the external DNS cutover, then set `www.auraglobal.net` -> `auraglobal.net` with 308.
- Nameservers: `ns-cloud-c1..c4.googledomains.com` (managed externally, likely via Squarespace Domains). They are not writable from the Vercel integration.
- Vercel's domain-config API currently reports `misconfigured: true`; it recommends apex A record `76.76.21.21` and `www` CNAME `cname.vercel-dns.com.`. Re-check these values in Vercel immediately before editing.

## Required DNS edits at the authoritative DNS host (external)
Retain unrelated MX, TXT, CAA, SPF, DKIM and other mail/verification records. Change **website routing records only**, removing conflicting Squarespace parking A/CNAME entries.

| Host | Type | Target |
| --- | --- | --- |
| @ | A | 76.76.21.21 |
| www | CNAME | cname.vercel-dns.com |

Do not add an apex CNAME. If Vercel presents different current values in its domain configuration during the cutover, follow those live values and update this checklist.

After propagation verify Vercel domain configurations report `misconfigured: false`, both hosts respond with the correct AuraGlobal HTML (not Squarespace), valid TLS, and a deep-link route like `/eonon.html` works.

## Required Vercel domain settings
1. Remove existing apex `auraglobal.net` -> `www.auraglobal.net` redirect.
2. Set `auraglobal.net` to serve the production deployment directly.
3. Redirect `www.auraglobal.net` -> `auraglobal.net` using 308.
4. Ensure `auraglobal.vercel.app` remains attached until this PR is merged and verified.

## Cutover
- After DNS and domain settings are verified, merge this PR and deploy its `main` commit to production.
- This PR updates exact `https://auraglobal.vercel.app` references across site pages, XML sitemap, RSS feed, and `robots.txt`.
- Vercel redirects requests whose host is `auraglobal.vercel.app` to the corresponding `.net` path via host-conditional 308 only after merging.
- Confirm: 200 at https://auraglobal.net/; 200 at https://auraglobal.net/eonon.html; 308 at old .vercel.app URL and at www; sitemap and canonical URLs reference apex; no loops.
- Update Google Search Console with new domain and sitemap; update the website URL in the Awin publisher profile and review merchant terms; update future partner outreach and social profile links.
- Recheck Awin affiliate journeys, clickrefs, current campaigns, and privacy/consent links before scaling paid traffic.

## Safe rollback
Keep the original Git commit `4db36925eccfde97156573e203f1f38bbfb5342d` as the pre-migration baseline. If DNS breaks, revert external DNS and Vercel project-domain redirects first, and revert this PR's migration commit; keep `auraglobal.vercel.app` serving traffic until recovered.
