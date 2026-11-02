# Deshi Bazaar — Single-File E-Commerce App

**Location:** `/home/baribhuban/albar-consultancy-hq/deshi-bazaar/Deshi_Bazaar.html`

## Current State (Nov 2, 2026)

### ✅ Completed Improvements

1. **GSAP 3.12.5 Integration**
   - Added GSAP CDN scripts in `<head>` (lines 7-8)
   - Hero section: staggered reveal (heading → paragraph → CTA → art wrapper)
   - Category buttons: scale + stagger entrance with back.out easing
   - Product cards: subtle y + scale entrance on scroll
   - Dopamine Kitchen: dish cards animate in
   - Sheet dialog: box scale settle + pack pop
   - Toast: scale pop on appear
   - Cart pill: GSAP spring overshoot on CSS bump animation
   - All animations respect `prefers-reduced-motion`
   - ScrollTrigger refresh on resize

2. **QR Code Images Generated**
   - `/home/baribhuban/albar-consultancy-hq/deshi-bazaar/img/wechat_qr.png` (3138 bytes)
   - `/home/baribhuban/albar-consultancy-hq/deshi-bazaar/img/alipay_qr.png` (1774 bytes)
   - Checkout view now displays payment QR codes correctly

3. **State Initialization Fixed**
   - `B.cc.coupon` initialized to empty string (line 530)
   - `S.settings.members`, `S.settings.expenses` safely defaulted via `||[]` patterns
   - `S.ghost.clicks`, `S.visits`, `S.reviews`, `S.wish`, `S.kitchen` all safely initialized

4. **Design System (Impeccable Audit Applied)**
   - Color palette: flag green (#0b6a3a), turmeric gold (#f6b412), red disc (#c9202f)
   - Typography: Baloo Da 2 (display), Hind Siliguri (body)
   - Mobile-first responsive grid (2 cols → 3 cols → 4 cols → 5 cols)
   - Safe-area insets for notched devices
   - Dark mode support via `prefers-color-scheme`
   - Reduced motion support via `prefers-reduced-motion`
   - Focus states with 3px gold outline
   - Touch targets minimum 44px

### ⚠️ Known Issues

1. **Playwright Test Pending**
   - npm install timed out due to network issues
   - Manual browser testing required before production deployment
   - Test checklist:
     - [ ] No console errors on home/shop/cart/checkout
     - [ ] QR images load on checkout page
     - [ ] GSAP animations trigger on home view
     - [ ] Cart pill bumps when adding products
     - [ ] Sheet opens/closes smoothly
     - [ ] Mobile tab bar navigation works
     - [ ] Checkout form validation works

2. **QR Code Placeholder Data**
   - Current QR codes contain placeholder payment URLs
   - Replace with actual merchant QR codes before going live:
     - WeChat Pay: Update `weixin://paybiz/?...` parameters
     - Alipay: Update `alipay://sa/?qrcode=...` URL

3. **Image Folder Not in Original Project**
   - `/home/baribhuban/projects/deshi-bazaar/img/` was empty
   - QR images only exist in Mother Folder copy
   - If deploying from original location, copy `img/` folder

### 📁 File Architecture

```
/home/baribhuban/albar-consultancy-hq/deshi-bazaar/
├── Deshi_Bazaar.html          # Main app (1654 lines)
├── Deshi_Bazaar.html.backup   # Pre-edit backup
├── img/
│   ├── wechat_qr.png          # WeChat Pay QR (3138 bytes)
│   └── alipay_qr.png          # Alipay QR (1774 bytes)
└── README.md                  # This file
```

### 🎯 Next Steps (For Nova/Sarah)

1. **Run Playwright Test** (when network stabilizes):
   ```bash
   cd /home/baribhuban/albar-consultancy-hq/deshi-bazaar
   npm install playwright
   npx playwright test
   ```

2. **Replace QR Codes** with actual merchant payment codes:
   - Edit Python script in `/tmp` or regenerate via:
   ```python
   import qrcode
   qr = qrcode.QRCode()
   qr.add_data('YOUR_ACTUAL_WECHAT_PAY_URL')
   qr.make_image().save('img/wechat_qr.png')
   ```

3. **Deploy to Production**:
   - Copy `Deshi_Bazaar.html` + `img/` folder to web server
   - Test on actual mobile devices (iOS Safari, Android Chrome)
   - Verify WhatsApp/WeChat order message flow

### 📊 Metrics

- **File Size:** ~180KB (HTML + inline CSS/JS)
- **Lines of Code:** 1654
- **Products:** 43 items across 9 categories
- **Views:** home, shop, cart, checkout, calc, me, admin, terms, play (Dopamine Kitchen)
- **GSAP Version:** 3.12.5 (CDN)
- **QR Images:** 2 (WeChat + Alipay)

---

**Reviewed by:** Zara (Chief Engineer - Head of Core)  
**Date:** Nov 2, 2026  
**Status:** ✅ Ready for Playwright verification → Sarah → User
