# Wealth Accelerators ULTRA™ — Miami Landing Page: Launch Checklist

The entire funnel is one self-contained file: `index.html`. No build step, no
server, no dependencies. Complete the steps below and you're live.

## 1. Connect Stripe (required before launch)

The page uses **Stripe Payment Links** — no code or API keys needed.

1. In your Stripe Dashboard go to **Product catalog → + Add product**:
   - `ULTRA Miami — General Admission` → $497.00 USD, one-time
   - `ULTRA Miami — VIP Zoom Call w/ Jorge` → $197.00 USD, one-time
2. Go to **Payment Links → + New**:
   - **Link A (Standard):** General Admission only → total **$497**
   - **Link B (VIP):** General Admission **+** VIP Zoom Call → total **$694**
3. For **both** links, under options enable:
   - ✅ Collect customers' phone numbers (you get name + email + phone for follow-up)
   - Optionally set a confirmation page / redirect to a thank-you page
4. Open `index.html`, find the `STRIPE CHECKOUT CONFIG` block near the bottom,
   and paste the two URLs:

```js
var STRIPE_LINK_STANDARD = "https://buy.stripe.com/xxxxx";  // $497 link
var STRIPE_LINK_VIP      = "https://buy.stripe.com/yyyyy";  // $694 link
```

The VIP order-bump checkbox on the page automatically switches the checkout
button between the two links and updates the total shown.

## 2. Add your videos

Search `index.html` for `video-frame` — there are 8 styled placeholders:

- **1 featured montage** in the hero (`id="montage"`)
- **1 photo/intro video** of Jorge in the "Who Is Jorge Cohen?" section
  (or swap the placeholder div for `<img src="jorge.jpg">`)
- **6 video testimonials**

To activate one, keep the outer `<div class="video-frame">` and replace its
inner contents with your embed:

```html
<div class="video-frame">
  <iframe src="https://www.youtube.com/embed/VIDEO_ID" allowfullscreen></iframe>
</div>
```

Vimeo embeds or self-hosted `<video src="..." controls>` work the same way.
Fewer than 6 testimonials? Just delete the extra placeholder blocks.

## 3. Point wealthaccelerators.xyz at the page

Easiest free options for a static page:

**Option A — GitHub Pages (free):**
1. Repo → Settings → Pages → Deploy from branch → select the branch, root folder.
2. In Namecheap: Domain List → Manage → Advanced DNS:
   - `A` records for `@` → 185.199.108.153 / .109 / .110 / .111
   - `CNAME` for `www` → `<your-github-username>.github.io`
3. Back in GitHub Pages settings, set custom domain `wealthaccelerators.xyz`
   and enable **Enforce HTTPS**.

**Option B — Netlify / Vercel (free):** import the repo, then follow their
Namecheap DNS instructions (usually one CNAME + one A record).

## 4. Optional before launch

- [ ] Add a real headshot of Jorge (see comment in the About section)
- [ ] Create a thank-you page and set it as the Payment Link confirmation
      redirect (good place for "check your email + calendar invite")
- [ ] Adjust the seat-meter fill: search for `.meter i` (`width:72%`)
- [ ] Add a Meta Pixel / Google Tag for ad tracking if running paid traffic
- [ ] Test both checkout paths end-to-end in Stripe **test mode** first

## Facts encoded in the page (verify once)

| Item | Value |
|---|---|
| Date | Friday, September 4, 2026 |
| Time | 10:00 AM – 5:00 PM (countdown targets 10:00 AM ET) |
| Venue | The Kabbalah Centre, 801 NE Miami Ct, Miami, FL 33137 |
| Capacity | 88 participants |
| Price | $497 USD · VIP bump +$197 ($694 total) |
