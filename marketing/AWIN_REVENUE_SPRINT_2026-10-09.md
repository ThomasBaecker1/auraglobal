# AuraGlobal · Revenue Sprint · 9 October 2026

Objective: first independently verified Awin transaction and repeatable net-profit channel. All partnerships are Awin-only, publisher **3076553**.

## Evidence and constraints

- TENWAYS EU, advertiser 72399: written advertiser confirmation received 9 October 2026 that publisher 3076553 is on **8%** through December 2026, covering CGO600 and CGO600 Pro. Existing code `TENAFF30` is compatible with current advertised products, per Echo; merchant stated no specific exclusions at that time.
- TENWAYS suggested a possible **AURA30** €30 exclusive code. AuraGlobal replied requesting activation, dates, sale stacking and Awin eligibility. **Do not publish AURA30 as active until affirmative activation confirmation.**
- DOTBLUE eBIKE DE, advertiser 115541: advertiser Awin newsletter says **10%** on qualified transactions, and EMMI **€999 instead of €1599** in the promotion. Official manufacturer sale page independently showed €999 on 9 Oct 2026; an individual product page may show a different price and shipping extra. Direct visitors to the official sale landing and tell them to check at merchant.
- EcoFlow DE advertiser 51793 invitation received by email on 9 Oct. **Not accepted through Awin in this sprint**; terms and authenticated acceptance required.
- Google Ads daily extract (9 Oct partial): 8 clicks, €2.06, 288 impressions, zero recorded Ads conversions. Oct 6–9 aggregate at retrieval: 36 clicks, €15.05 cost, 1745 impressions, zero recorded Ads conversions. Ads conversions are NOT proof of actual Awin orders.
- Five irrelevant Google E-bike terms blocked Oct 9: `urtopia`, `devron`, `herkules` (phrase); `z20 pro evo`, `e bike hollandrad testsieger` (exact). Tool confirmed added to campaign 24319756041 and criteria data confirmed presence.
- Attempt to pause other two Google Ads campaigns was blocked by platform checks. Their campaign state must not be described as changed. No budgets were raised.

## Partner email operations — sent and verified

| Time | Advertiser/program | Recipient | Nature | Status |
|---|---|---|---|---|
| 9 Oct | Deruiz DE / Awin 66408 | affiliate@deruizebike.com | Application interest; 8% newcomer rate in public program; requested Awin onboarding, official assets and PPC rules | SENT, **not formally applied in Awin** |
| 9 Oct | CLOUVOU DE / Awin 111672 | sb@clouvou.de | Application interest; content-based ergonomic chair comparison and partner perks | SENT, **not formally applied in Awin** |
| 9 Oct | DOTBLUE / Awin 115541 | ticket@dotblue-ebike.de | Sales offer, current EMMI price, commission eligibility, PPC approval and exclusive bonus request | SENT, already approved program |
| 9 Oct | OutIn Germany / Awin 127821 | affiliate@outin.com | Current October rates, first-sale bonus, promo code and PPC written authorization | SENT, already approved program |
| 9 Oct | Die Kaffeefreunde DE / Awin 106033 | info@diekaffeefreunde.de | Application interest for recurring coffee-consumable vertical; contact requested to refer to affiliate team | SENT, **not formally applied in Awin** |
| 9 Oct | Fidelis DE+AT / Awin 116601 | hallo@fidelis.dog | Application interest for recurring pet-food category, referred to affiliate team | SENT, **not formally applied in Awin** |

These are targeted B2B partner emails; email is **not** the authenticated Awin `Apply` operation. Only Awin reporting can show actual pending/approved memberships. Do not send duplicate follow-up before a reasonable reply interval.

## Website changes deployed

- `/e-bike-unter-2000.html`: original non-commercial Blaupunkt placeholder became verified EMMI purchase card with Awin advertiser 115541, and a sale-page deep link.
- `/dotblue.html`: explicit EMMI offer banner with full ad disclosure and manufacturer sale page Awin deep link; retained source and price caveats.
- `/index.html`: dedicated DOTBLUE sale banner, auto-expiring Oct 16 as a conservative safety measure.
- `scripts/sync-awin-feeds.mjs`: mitigates recurring 300-second Vercel timeout by prioritizing high-intent merchant feeds, setting fetch deadlines, bounding run time, refusing to publish empty catalog, and publishing partial truthful manifest. The code was syntactically checked and deployed; **full successful cron synchronization has not been verified yet**.
- GitHub/Vercel production deployment for HEAD checked READY after these changes.

## Next best steps

1. **Awin authenticated sales report**: pull orders, clicks, programs, commission status, and clickrefs. Differentiate test clicks from real clicks. Cannot verify first commission from a Google Ads conversions column.
2. Confirm **AURA30** is activated and compatible with Awin; only then launch an exclusive campaign banner.
3. Check **DOTBLUE generic non-brand Google Ads permission** before actively promoting DOTBLUE via new paid keywords or ads. TENWAYS written permission does not transfer to DOTBLUE or OutIn.
4. If EcoFlow invitation is desirable, **read and accept the terms manually inside Awin** once Work/browser access is available.
5. Evaluate Google Ads with real Awin outbound/order signals; pause or adjust unproductive spend only with a valid, authorized action. Campaign status changes were attempted but not completed in this sprint.
6. Revisit official EMMI Sale price by Oct 16, and TENWAYS prices/expiration by Oct 25.
7. Follow up targeted publisher applications only if replies warrant it, log each approval before adding new sale links.

## Risks and controls

- Awin approvals ≠ sent email.
- Awin click ≠ order; order ≠ approved/paid commission.
- Promo pricing in partner emails can differ from a product-page default price; cite the correct manufacturer sale location and confirm checkout.
- No other affiliate networks were entered. No budgets increased. No fake urgency, client privacy data, fabricated product tests, or confirmed sale claims.
