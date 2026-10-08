# AuraGlobal Growth OS
Last strategy review: 2026-10-08. **Awin only.** Objective: first independently verifiable commission and repeatable qualified traffic.

## The truth sources
- **Paid traffic**: Google Ads account campaign IDs: E-Bike `24319756041`; Espresso `24325080422`; Fashion `24325081919`. Do not infer Awin commissions from Google Ads conversions.
- **Affiliate clicks, approved programs, actual sales and commissions**: Awin publisher reporting. Some manual site QA clicks may have polluted Awin clicks before the tab-local `?ag_test=1` test mode.
- **Organic impressions, queries and indexed pages**: Google Search Console. Currently awaiting account connection / property verification. Sitemap: https://auraglobal.vercel.app/sitemap.xml; robots references it.
- **Social views/clicks**: native platforms or connected Metricool; track `utm_source`, `utm_medium=shorts`, `utm_campaign` plus `clickref` on Awin links.
- **Site engagement**: Vercel Analytics + first-party dataLayer events `awin_outbound_click`, `ebike_calculator_used`, `ebike_calculator_share`. Do not claim these are all registered in GA4 until GA4 is connected and measured.

## 7-day sprint (sequential, not all at once)
1. **Search term hygiene**: Remove clearly unrelated model-only queries via **negative exact-match keywords**. On Oct 8 eight researched exact negatives added to campaign `24319756041`. Avoid broad negatives that accidentally block shopping demand. Keep existing budget; optimize at current spend.
2. **Conversion QA**: Test landing page links via `?ag_test=1`; inspect affiliate destinations and product feeds without polluting Awin. Use direct verified partner offers as fallbacks; never invent availability or prices.
3. **Original value**: Drive visitors to E-Bike commute calculator, /e-bike-pendelrechner.html. It computes km, theoretical range and electricity-only costs from user inputs. Share results via URL with anonymous parameters.
4. **Search Console**: Connect and verify AuraGlobal property; submit sitemap; inspect coverage. Search engines may take days/weeks to discover new pages; submission is not an indexing guarantee.
5. **Short-form distribution**: Upload three original `720x1280` 9:16 MP4 Shorts to YouTube/Instagram/TikTok (accounts required). Pinned profile link should use UTM-tagged AuraGlobal entry page; YouTube Shorts description URLs are **not clickable**. Optional licensed platform music. Do not claim real product tests.
6. **Traffic analysis**: Weekly identify landing page x campaign combinations by genuine clicks, outbound Awin clicks and Awin tracked orders (separately from own QA tests). Promote winning *offers* not just highest impression pages.
7. **Scale**: Replicate validated content-first funnels across Coffee (OutIn), Pet (Petlibro), Power (Allpowers), Mobility (TENWAYS / DOTBLUE) with real joined Awin merchants, accurate feeds and fresh offer disclosures.

## Funnel and north-star metrics
- Qualified visits (non-self traffic), by campaign or organic/social source.
- Affiliate outbound click-through (real Awin outbound clicks / qualified visits) by landing page.
- Awin referred clicks, orders, approved commissions, reversal rate, EPC.
- Cost per outbound click and cost per approved order for paid marketing.
- Gross margin after marketing cost and content cost. **Never scale an ad campaign solely because of clicks or impressions.**

## Experiments to run
- E-Bike: existing under-2000 price landing vs commuter-use guide, but only route paid ads to the destination actually promised in its ad text. Coordinate campaign destination changes with account owner.
- Short 1: yearly electricity costs with explicit assumptions. Short 2: three buying mistakes. Short 3: espresso machine compatibility. Track individual `utm_campaign` names.
- Copy A/B: 'Preis beim Anbieter prüfen' vs 'Modelle vergleichen' for appropriate intent; do not fabricate urgency or discount.

## Measurement rules and stop conditions
- **Zero orders with <100 genuine qualified site sessions is inconclusive**, not proof of failure.
- Review budget before changing it; avoid increasing spend without authenticated Awin revenue.
- First sale: verify in Awin and wait for transaction approval before treating it as retained commission.
- SEO quality: run `node scripts/seo-audit.mjs`; scheduled GitHub Actions workflow `.github/workflows/seo-health.yml` on page changes and each morning.
- All affiliate links must carry affiliate disclosures; external prices are always subject to merchant confirmation.
- If Runway is connected but has no video credits, create and test light-weight motion-graphic videos without purchasing new credits. Professional voiceover / B-roll can be added when rights and budget allow.

## Next-account-connection dependencies
- Connect Search Console property via GSC Wizard or Windsor.ai; Google login / property verification must be completed by account owner.
- Connect social channels/Metricool to allow programmatic scheduling / publication. Do **not** claim videos have been posted before the posting platform confirms it.
- Connect GA4 if detailed attribution is needed beyond Vercel Analytics. Link GA4 key events only after test events are observed.
- Awin partner approvals, merchant offers and commissions require an authenticated Awin UI or an Awin reporting connector; currently only product-feed sync runs automatically.
