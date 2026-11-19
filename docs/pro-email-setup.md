# Pro email: contact@abdellahkachani.tech

Goal: a real mailbox on your domain for the site and for replies to clients.
(Cold outreach will use a **second** domain later, so this one keeps a clean reputation.)

Your DNS is managed at the registrar where you bought the `.tech` domain
(nameservers `tech-domains.*.orderbox-dns.com`). Today the domain has **no MX record**,
so nothing can receive email yet.

## 1. Pick a provider (5 min)

| | Zoho Mail | Google Workspace |
|---|---|---|
| Cost | Has had a free plan (web + mobile app only) and a cheap paid "Mail Lite" plan; check zoho.com/mail/zohomail-pricing.html | Paid per user per month; check workspace.google.com/pricing |
| Good for | Starting at zero cost | Gmail interface, best deliverability |

If money is tight, start with Zoho. You can move later.

## 2. Create the account

Sign up with the domain `abdellahkachani.tech` and create the user `contact`.
The provider will ask you to prove you own the domain by adding a **TXT** (or CNAME) record. Add it in the registrar's DNS panel exactly as shown, then click "Verify".

## 3. Add these DNS records in the registrar panel

**Don't delete anything that already exists.** The records pointing the site to Vercel (A / CNAME) and
the `google-site-verification` TXT must stay.

### If you chose Zoho (`.com` region; use `zoho.eu` values if your account is in the EU region)

| Type | Host | Value | Priority |
|---|---|---|---|
| MX | @ | `mx.zoho.com` | 10 |
| MX | @ | `mx2.zoho.com` | 20 |
| MX | @ | `mx3.zoho.com` | 50 |
| TXT | @ | `v=spf1 include:zohomail.com ~all` | |
| TXT | (given by Zoho, e.g. `zmail._domainkey`) | DKIM key copied from Zoho → Email Authentication → DKIM | |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:contact@abdellahkachani.tech` | |

### If you chose Google Workspace

| Type | Host | Value | Priority |
|---|---|---|---|
| MX | @ | `smtp.google.com` | 1 |
| TXT | @ | `v=spf1 include:_spf.google.com ~all` | |
| TXT | `google._domainkey` | DKIM key from Admin console → Apps → Gmail → Authenticate email | |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:contact@abdellahkachani.tech` | |

Rules:
- Only **one** SPF record (`v=spf1 …`) may exist on `@`. If one is already there, merge them.
- Some panels want `@` left blank, or the full name `abdellahkachani.tech`. Both mean the root.
- DNS changes take from a few minutes up to a few hours.

## 4. Test

1. From your Gmail, send a message to `contact@abdellahkachani.tech`, then reply from it.
2. Go to https://www.mail-tester.com, send an email from `contact@` to the address it shows, and aim for **9/10 or more**.
3. In the received message, open "Show original" and check that **SPF, DKIM and DMARC all say PASS**.

## 5. Tell Claude it works

Then `contactEmail` in `lib/site.ts` gets switched to `contact@abdellahkachani.tech`.
The site's mailto links and Google structured data update with it. Until then, the site keeps
the school address so no message gets lost.

After a few weeks with no problems, you can tighten DMARC to `p=quarantine`.
