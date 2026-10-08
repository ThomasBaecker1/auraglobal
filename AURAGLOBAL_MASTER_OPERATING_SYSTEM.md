# AURAGLOBAL · MASTER OPERATING SYSTEM
**Version 2026-10-08 | Business architecture & execution priorities**

**North star:** sustainably approved affiliate commission **after** paid acquisition, content and platform cost — not page count, clicks or vanity metrics.

**Scope:** Awin only. Do not enroll in other affiliate networks unless the business owner explicitly reverses this constraint.

**Reality check:** The website can be developed and deployed now, but neither first-order timing nor Google search rankings are controllable. Awin commissions require real buyer orders and Awin confirmation. Never report earnings inferred only from Google Ads clicks.

---

## 0. System map: the flywheel

`Customer question → relevant discovery channel → exact-intent landing page → validated helpful comparison → in-program Awin partner offer → tracked outbound click → real merchant checkout → Awin approval → clean EPC/unit economics → reinvest in profitable winner → build adjacent decision page`

Supporting components:
- **Demand sensing:** Google Ads search-term reports (connected), Search Console once connected, SEO SERPs, merchant emails and seasonal calendars.
- **Own discovery:** homepage search, /produkte.html full-product finder, /match.html human-need advisor.
- **Commerce layer:** approved Awin deals only, direct deep links to the specific products, accurate caveats and clear sponsorship disclosures.
- **Attribution:** original source/landing/campaign click refs on Awin outbound; actual Awin Orders & approved commission are the source of truth.
- **Data reliability:** daily Awin feed synchronization, fallback curated routes, expiry-aware offers, automated GitHub integrity tests, Vercel production deployment.
- **Growth distribution:** buyer-intent SEO; controlled **generic non-brand search** where explicitly permitted; high-quality Shorts/UGC creative repurposed across permitted social networks, once accounts are connected.

## 1. Priorities by commercial impact

| Tier | Workstream | Why it matters | Done condition |
|---|---|---|---|
| P0 | Track the first real order | Without an Awin conversion source, all growth claims are assumptions | Awin shows a transaction tied to our publisher ID, merchant, order value, click ref |
| P0 | TENWAYS purchase path | Written permission for generic, non-brand Google Ads, 8% special commission negotiated through 2026 (check rate in Awin), prominent 2026-10-25 offer | A buyer can click exact product from relevant landing and reach the intended TENWAYS page; offer is accurate |
| P0 | Block wasted searches | Broad keywords can leak spend into unrelated branded models | Paid search query report reviewed; mismatched terms excluded safely |
| P0 | Clear product availability/accuracy | Fake stock or incorrect prices destroys trust | Pricing either fresh from authoritative source or omitted with “Preis beim Anbieter prüfen” |
| P1 | Search Console & GA4 connection | Critical visibility into indexation, search demand and landing effectiveness | Verified property and events observed |
| P1 | Content that solves a *unique* buyer problem | Organic search competes on genuine usefulness, not page farming | Original research, real comparisons and sources with review dates |
| P1 | Original Shorts distribution | Low-cost repeated exposure and brand memory | Native accounts authenticated, first three motion/voice-led videos published, retention measured |
| P1 | Partner approval / feed pipeline | No approved affiliate offer means no valid partner commission | Reconciled joined Awin advertisers, product feeds, actual active merchant links |
| P2 | Evergreen comparison templates | Scale only winning conversion patterns | Conversion-positive template repeated to second advertiser/category |
| P2 | Partnerships & authority | Trusted third-party discovery and repeat traffic | Legitimate earned links, collaborations and opted-in distribution, no paid link spam |
| P3 | Consumer app / account system | Premature until repeat usage and unit economics proven | Only develop once existing funnel generates predictable approved commission |

## 2. Baseline & instrumentation

Current checks: October 2026 Google Ads search campaigns for E-Bike, portable espresso, secondhand fashion. Awin order data are not directly connected to this chat. Some October Awin clicks were self-tests.

**Primary scoreboard (daily / trailing 7 days):**
1. Total real sessions and qualified sessions by landing page, `utm_source`, campaign and channel; exclude developer QA.
2. Affiliate outbounds (distinct from sessions) and affiliate outbound rate = qualifying outbounds / qualified sessions.
3. True Awin tracked clicks, tracked orders, gross tracked commissions and **approved** commissions.
4. Reversal / cancellation rate by merchant and commission adjustment history.
5. Spend by campaign, CPC, click-to-outbound cost, cost per **approved** sale, and approved commission **minus** acquisition cost.
6. Search Console impressions, indexed pages, non-brand organic clicks and CTR; social 3-second retention, avg view duration, website profile-link visits.
7. Feed freshness, merchant approval status, link health, mobile Core Web Vitals and failed deployments.

**Required operating discipline:**
- Label Awin tracking refs by traffic source + landing page + merchant; no identity tracking or false precision.
- Never equate an Ads conversion of zero with zero Awin sales. Verify Awin separately.
- Do not claim an Awin order is earned commission until approval/reversal status is clear.
- Retain original publisher ID `3076553`; affiliate clicks must go through permitted Awin links.
- Awin custom tracking must not accidentally break the deep-link `ued` target, and no PII in clickrefs.
- With current Vercel environment custom-event analytics API returned 402; do not upgrade plan without owner approval. Prefer configured GA4 or an explicitly approved privacy-compliant alternative.

## 3. Acquisition factory: three independent channels

### 3A. Google Ads — tight, controlled, buyer-intent
- TENWAYS confirmed in an email that **generic non-brand** Google Ads are permitted provided brand keywords are avoided. This is a **merchant-specific** authorization. It does not confer rights to bid on OutIn, other merchant brands or competitors.
- E-Bike campaign: exact/phrase terms tied to actual offering, avoid unrelated specific third-party models. After each data review add **targeted** negatives; don't block generic purchase intent.
- Ad must promise exactly what the landing page delivers. Sale CTA, actual eligible model, coupon disclaimers and expiration date must remain synced.
- Don't raise the daily budget before verified post-click outbounds and Awin orders. Paid test budgets remain constrained.
- Reassess creative at source-level, not only impressions; 'sushi bike' research queries can generate traffic but not necessarily shoppers who buy TENWAYS.
- Stop stale date-limited ad copy or replace after offer expiry; JS hiding a sale on the website is not enough to prevent inaccurate **Google ad** text after October 25.
- Never automatically publish a new ad creative, increase spend or change campaign status without approval.

### 3B. SEO — editorial moat, not mass-produced doorway pages
- Pillars: Electric mobility, Coffee & Outdoor, Smart Pet, Energy & Camping, Homeoffice, Sustainable Fashion & Books.
- For each pillar build an evidence-rich flagship page: observable specs, meaningful use-case comparisons, decision checklist, linked sources, clear limitations and merchant route.
- Create *new* pages only when they answer distinct search intent. Helpful calculators, compatibility checkers, selection flowcharts and side-by-side product tables beat generic 'top 10' AI copies.
- Publish product pictures only when brand/media licensing allows; avoid misleading stock photos as if depicting a tested product.
- Shared template structure: 60-word answer upfront → one strong visual explanation → criteria with source → honest disadvantages → 2–4 directly relevant offers → context and FAQ → dated review method.
- Search Console: verify property, submit sitemap, see actual indexation reasons and query clusters; do not assume indexation because a URL appears in sitemap.
- Respect Google guidance on people-first content, scaled content abuse, affiliate added value, canonical and technical performance.
- Navigation: /match.html provides guided selection, /produkte.html full filtering and /kaufberatung.html human research.

### 3C. Shorts — actual video, not animated brochures
- Require real licensed footage or original shooting, natural speech, crisp subtitles and correct platform-native 9:16 framing.
- Hook before logo, new visual beat roughly every 2–4 seconds, one answer per video, direct value demonstrated on AuraGlobal itself.
- Three content flywheels: (1) surprising but mathematically honest E-Bike electricity costs, (2) battery-removal difference in commuter city bikes, (3) the three questions of portable espresso.
- Profile-link destination `/start.html` with UTM by network (YouTube description URLs are not clickable in Shorts). Social accounts and publishing connectors require user authentication.
- A/B the first 2 seconds only; use first-3s hold and profile/site traffic to decide winners.
- Publish responsibly; never say we tested physical hardware we never handled.
- Current Runway workspace has no video credits / accessible video models; do not burn money without owner consent.

## 4. On-site premium experience architecture

1. **Discover:** fast searchable homepage with true count of displayed partner worlds, a clear high-intent commercial hero and AuraMatch entry.
2. **Choose:** AuraMatch asks category + one priority, shows 2–3 relevant **existing Awin linked** options with reason, drawback/check and source page. No fake rating, stock or price.
3. **Compare:** contextual comparison table, true spec/price differences, mobile-friendly cards, clear benefits and tradeoffs. Products are not ranked by unverified “best” claims.
4. **Act:** one salient actual merchant deep-link CTA, visible ad disclosure, no deceptive urgency. No dead-end when product feed is down.
5. **Measure:** track funnel events responsibly; tie approved Awin conversions back to outbound source if data is available.
6. **Return:** shareable calculator and AuraMatch result URLs; add newsletter later only with GDPR-compliant double opt-in, consent and valuable repeat content.
7. **Proof:** high-trust method and sources, current dates, working legal pages and transparent affiliate relationships.

## 5. Merchant operations (Awin only)

The affiliate merchant is the unit of commerce, not the raw number of applications.
- Track status: `applied → pending → approved → links/feeds verified → live → outbounds → tracked order → approved commission → scale`.
- Do not say 'approved' for every displayed brand card; the homepage can count **published brand worlds** separately from truly connected Awin-feed shops.
- Daily Awin feed sync via `/api/sync-awin`, authenticated by cron secret; no credential ever in public pages or tool output.
- Prefer official product-level deep links over generic shops and correct any destination changes.
- Before promoting any named merchant via paid search, read *that merchant's* own restrictions; TENWAYS permission is not portable.
- Signed/official advertiser assets, a truthful expiry date and safe sponsorship wording are prerequisites for discount banners.
- Merchants with zero applicable in-program offers are editorial only, not counted as Awin conversion opportunities.
- First commission focus: validate one product/merchant/category at a time; winning pattern expands later.

## 6. Guardrails & conversion math

**Contribution / approved order** = net approved Awin commission - paid media attributable to acquisition - incremental processing/production costs. Ad spend doesn't equal profit and a sale before approval isn't cash available.

**Conversion funnel:** `10,000 impressions → clicks → landing sessions → outbound affiliate clicks → advertiser orders → approved commissions`. At each arrow measure the actual percentage, then identify the largest drop-off. Avoid assuming one CTR/CVR benchmark is universal.

**Decision rules:**
- If campaign spends and search terms poorly match real products: fix keyword intent and ad promise first.
- If landing has relevant visitors but low outbound clicks: optimize relevance, clarity, offer and visibility.
- If outbounds exist but no Awin tracked clicks: verify tracking chain and link permissions before raising spend.
- If clicks exist but no orders: assess offer price/value, trust, merchant checkout friction, delays and statistical uncertainty.
- If approved Awin EPC is positive yet below acquisition cost: do **not** scale paid media; improve unit economics first.
- If approved Awin EPC beats full acquisition cost with repeatable data, run small controlled budget experiments, never jump to an arbitrary 10× budget.
- For active promotions, schedule dated expiry checks; coupon claims have to be reconfirmed with advertiser.

## 7. Next 7 days: execution queue

| Priority | Deliverable | Verification |
|---|---|---|
| 1 | Finish AuraMatch integration across homepage, /produkte.html, guides, sitemap | Vercel production READY and links present |
| 2 | Integrity audit for valid Awin publisher links and dead internal routes | Daily GitHub Actions check passes |
| 3 | Confirm latest TENWAYS commission and valid rules inside Awin | Awin program profile shows current rate |
| 4 | Check CGO600 landing offer and code TENAFF30 on real checkout | Shop verification, no fabricated discount stacking |
| 5 | Connect Search Console and verify canonical site | Property verified + 0 obvious indexing blocks |
| 6 | Connect publishing/creator account(s), ship video v2 | 3 real Shorts published; links to /start.html tracked |
| 7 | Review paid search terms, negatives and ad approvals | Irrelevant model query spend materially reduced |
| 8 | Review feed cron, live preview and product fallback | Current catalog loads, matches offer/merchant, failure surfaced |
| 9 | Pull Awin click and order report | Separate test clicks and real traffic, identify first genuine order |
| 10 | Weekly founder report | Approved commission, spend, search organic clicks, top landing and next experiment |

## 8. 8–30 days: find repeatable winners

- Two high-intent verticals, not thirty at once. TENWAYS vs OutIn or PETLIBRO only if approved/viable.
- Test 5–10 original content angles per validated buyer problem; keep publishing cadence realistic.
- Compare paid vs organic vs social traffic to landing and Awin orders. Use actual commission data to decide.
- Build 1–2 genuinely original tools per pillar (range/energy calculator, coffee fit guide, pet feeding decision aid).
- Earn relevant backlinks via original tools, shareable comparisons and useful data. No bulk link schemes.
- Improve web performance systematically: responsive images, font restraint, minimal blocking scripts, lighthouse/mobile accessibility tests.
- Negotiate exposure/commission based on documented referrals/orders, not merely the size of a speculative future audience.

## 9. 31–90 days: scale the validated system

- Standardize one content-to-commerce template and one variant testing process, with quality gates.
- Partner automation: classify approval, validate status/deep links, sync feeds, monitor commission/rules, expire deals, export merchant-level performance.
- Build a centralized dashboard (qualified visits, outgoing Awin clicks, Awin approved orders, ad costs, EPC & contribution), only when reporting connectors and privacy choices permit.
- Expand by demonstrated potential, depth of products, commissions and real user intent—not to boast about a large directory.
- Invest in custom visual design and professional original imagery/creative once product-market signal is visible, not as substitute for it.
- Use repeat orders / evergreen niches / loyalty content for recurring revenue; avoid assuming high-ticket E-Bikes alone can fund stable monthly cashflow.

## 10. Source of truth and research

- Baymard product listing research: https://baymard.com/research/ecommerce-product-lists
- Baymard shopping search usability: https://baymard.com/research/ecommerce-search
- Baymard 2026 filters UX: https://baymard.com/blog/ecommerce-filter-ui
- Google people-first content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Google Search Essentials: https://developers.google.com/search/docs/essentials
- Google spam policies: https://developers.google.com/search/docs/essentials/spam-policies
- Awin publisher reporting: Awin logged-in interface is authoritative for credited transactions and approved commissions.
- TENWAYS arrangement: written email from TENWAYS team allowing generic, non-brand search and a negotiated 8% promotional CPA through end 2026; must validate actual account status/rate independently.

## 11. Execution transparency

- **Implemented** means committed and pushed to GitHub, with Vercel deployment confirmed Ready.
- **Live functional** needs a real mobile/browser test beyond deployment-ready status.
- **Tracked** means an event was *observed* in its reporting destination, not merely that `dataLayer.push` was called.
- **Profitable** requires approved commission minus attributable costs, not total click count.
- **Market leader** is not a declaration or milestone that can be guaranteed: it is the long-term result of repeatable value, conversion and distribution.

_Operating rule: Execute the highest-leverage verifiable next step; report concrete outputs and blockers; never claim background site work that is not actually scheduled or actioned._
