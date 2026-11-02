# Deshi Bazaar — Manual Browser Test Checklist

**Date:** November 2, 2026  
**Status:** ⚠️ Playwright cannot run (system lacks browser dependencies, no sudo access)  
**Alternative:** Manual testing required

## How to Test

1. **Start local server:**
   ```bash
   cd /home/baribhuban/albar-consultancy-hq/deshi-bazaar
   python3 -m http.server 8080
   ```

2. **Open in browser:**
   - Desktop: http://localhost:8080/Deshi_Bazaar.html
   - Mobile: Use Chrome DevTools Device Mode (375x812)

3. **Run through checklist below**

---

## ✅ Desktop Tests (1280x900)

### Home View
- [ ] Page loads without console errors (F12 → Console)
- [ ] GSAP loaded: `typeof gsap` = "object"
- [ ] Hero heading fades in smoothly (not instant)
- [ ] Hero paragraph fades in after heading
- [ ] CTA buttons fade in
- [ ] Hero art (packs) scales in with bounce effect
- [ ] Trust badges (SF Express, Standard, Since 2024) fade in staggered
- [ ] Carousel auto-rotates every 4.8s (3 slides)
- [ ] Category buttons scale in when scrolled into view
- [ ] Featured product cards fade + scale in

### Shop View
- [ ] Click "Shop" in nav or "Shop now" button
- [ ] Product grid renders (should see 43 products initially)
- [ ] Cards fade + scale in on scroll
- [ ] Category chips filter products correctly
- [ ] Search bar filters by typing
- [ ] Sort dropdown works (Featured, Price low/high, A-Z)
- [ ] Click "+ Add" on a product → cart updates
- [ ] Cart pill bumps (scale animation) when adding
- [ ] Click product card → sheet opens with details
- [ ] Sheet pack image pops in
- [ ] Press Escape → sheet closes
- [ ] Click "Remove" in sheet → cart decrements

### Cart View
- [ ] Click cart pill or "Cart" tab
- [ ] Cart items show with correct quantities
- [ ] Step buttons (+/-) update quantities
- [ ] Delivery speed cards toggle (SF Express vs Standard)
- [ ] Delivery charge updates based on weight
- [ ] Total updates correctly
- [ ] Coupon code field visible (if coupons exist)
- [ ] "Checkout" button enabled

### Checkout View
- [ ] Click "Checkout"
- [ ] Form fields render (name, phone, WeChat, province, city, address)
- [ ] Payment radios: WeChat Pay, Alipay, Bank transfer
- [ ] **QR images load** (critical!):
  - [ ] WeChat Pay selected → wechat_qr.png visible (green QR)
  - [ ] Alipay selected → alipay_qr.png visible (blue QR)
  - [ ] Bank transfer → text only
- [ ] Click "Place order" without filling form → validation error shows
- [ ] Fill form, check terms, submit → order saved

### My Account View
- [ ] Click "Me" tab
- [ ] Profile form saves (name, phone, WeChat, address)
- [ ] Orders list shows (empty initially)
- [ ] Owner panel button visible

### Calculator View
- [ ] Click "Calc" tab
- [ ] Weight input updates delivery cost
- [ ] Build order: add products, see total
- [ ] "Use my cart" loads cart items
- [ ] "Add all to my cart" works

### Dopamine Kitchen (Play View)
- [ ] Click "Dopamine Kitchen" in promo notice (top bar, appears after 5s)
- [ ] Dish cards animate in
- [ ] Click "+ Add" on dishes
- [ ] Click "Order now" → rider animation plays
- [ ] After animation completes → "Delivered to your imagination!" screen
- [ ] Confetti animation plays

### Admin Panel
- [ ] Click "Me" → "Open owner panel"
- [ ] Enter PIN: `1234`
- [ ] Overview tab: stats render
- [ ] Products tab: product editor renders
- [ ] Orders tab: order list renders
- [ ] Settings tab: contact info, delivery rates, coupons
- [ ] Analytics tab: visits, clicks, expenses

### Reduced Motion
- [ ] In DevTools: Rendering → Emulate CSS prefers-reduced-motion: reduce
- [ ] Reload page
- [ ] Hero elements appear instantly (no fade/slide)
- [ ] Cards appear instantly (no stagger)
- [ ] No errors in console

### Dark Mode
- [ ] In DevTools: Rendering → Emulate CSS prefers-color-scheme: dark
- [ ] Reload page
- [ ] Dark background (#0c1711)
- [ ] Light text (#e6f0e8)
- [ ] Green buttons (#1e9a58)
- [ ] No contrast issues

---

## ✅ Mobile Tests (375x812, iPhone X/11/12)

### Navigation
- [ ] Bottom tab bar visible (Home, Shop, Cart, Calc, Me)
- [ ] Active tab highlighted with green underline
- [ ] Cart badge shows count
- [ ] Mini cart bar appears at bottom on home/shop views

### Home View
- [ ] Hero fits without horizontal scroll
- [ ] Category grid: 2 columns
- [ ] Product cards: 2 columns
- [ ] Touch targets ≥44px (buttons, chips)

### Shop View
- [ ] Search bar + sort dropdown stack vertically
- [ ] Category chips scroll horizontally
- [ ] Product grid: 2 columns
- [ ] Add/Remove buttons easy to tap

### Cart View
- [ ] Two-column layout stacks to single column
- [ ] Delivery speed cards stack
- [ ] Checkout button full width

### Checkout View
- [ ] Form fields full width
- [ ] Payment radios easy to tap
- [ ] QR images scale to fit screen
- [ ] Place order button full width

---

## ✅ Console Error Check

Open DevTools Console (F12), reload page, check for:
- [ ] No `Uncaught TypeError` errors
- [ ] No `Uncaught ReferenceError` errors
- [ ] No `Cannot read property 'X' of undefined` errors
- [ ] No 404s for images (especially QR codes)
- [ ] No CORS errors for GSAP CDN

Expected console output (info only, not errors):
```
[GSAP] registered
[ScrollTrigger] registered
```

---

## ✅ QR Code Verification

Critical for production deployment:

1. **File check:**
   ```bash
   ls -lh /home/baribhuban/albar-consultancy-hq/deshi-bazaar/img/
   ```
   Expected:
   ```
   -rw-r--r-- wechat_qr.png (3-4 KB)
   -rw-r--r-- alipay_qr.png (1-2 KB)
   ```

2. **Browser check:**
   - Open http://localhost:8080/img/wechat_qr.png directly
   - Should see green QR code (456x456)
   - Open http://localhost:8080/img/alipay_qr.png directly
   - Should see blue QR code (328x328)

3. **Checkout integration:**
   - Go to checkout
   - Select "WeChat Pay"
   - QR image visible, not broken image icon
   - Select "Alipay"
   - QR image visible, not broken image icon

---

## 📊 Results Template

```
Test Date: ___________
Browser: ___________ (Chrome/Firefox/Safari, version)
Device: Desktop / Mobile

PASSED: ___ / ___
FAILED: ___ / ___
SKIPPED: ___ / ___

Console Errors: [ ] None  [ ] Some (list below)
Broken Images: [ ] None  [ ] Some (list URLs)

Notes:
_________________________________
_________________________________
_________________________________

Tester: ___________
Status: [ ] Ready for production  [ ] Needs fixes
```

---

## 🚨 Critical Issues (Block Production)

- [ ] QR images don't load (404 or broken)
- [ ] Console errors prevent page load
- [ ] Checkout form doesn't submit
- [ ] Cart doesn't update
- [ ] GSAP causes infinite loop or crash

## ⚠️ Medium Issues (Fix Before Launch)

- [ ] Animations don't respect reduced-motion
- [ ] Dark mode has contrast issues
- [ ] Mobile layout broken (horizontal scroll)
- [ ] Touch targets too small (<44px)

## ✅ Minor Issues (Nice-to-Fix)

- [ ] Animation timing feels off
- [ ] Color contrast could be better
- [ ] Typos in copy

---

**Tested by:** ___________  
**Date:** ___________  
**Sign-off:** [ ] Approved for production  [ ] Rejected, needs fixes
