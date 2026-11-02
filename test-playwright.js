const { chromium } = require('playwright');
const path = require('path');

const FILE = 'file://' + path.resolve(__dirname, 'Deshi_Bazaar.html');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = { passed: [], failed: [], consoleErrors: [], pageErrors: [] };

  // ===== Desktop viewport =====
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on('console', m => { if (m.type() === 'error') results.consoleErrors.push(m.text()); });
  page.on('pageerror', e => results.pageErrors.push(e.message));

  await page.goto(FILE, { waitUntil: 'networkidle', timeout: 30000 });
  results.passed.push('Page loads: ' + await page.title());

  // 1. GSAP loaded
  const gsapLoaded = await page.evaluate(() => typeof window.gsap !== 'undefined' && window.gsap.version);
  results.passed.push('GSAP version: ' + gsapLoaded);

  // 2. ScrollTrigger registered
  const stLoaded = await page.evaluate(() => !!(window.gsap && window.gsap.globalTimeline));
  results.passed.push('GSAP global timeline active: ' + stLoaded);

  // 3. Home view renders
  const heroH1 = await page.locator('.hero h1').first().textContent().catch(() => null);
  results.passed.push('Hero h1: ' + heroH1);

  const cardCount = await page.locator('.card').count();
  results.passed.push('Featured cards rendered: ' + cardCount);

  const catCount = await page.locator('.cat').count();
  results.passed.push('Category buttons: ' + catCount);

  // 4. Wait for GSAP hero animation to finish, check it resolved to visible state
  await page.waitForTimeout(2500);
  const h1Opacity = await page.evaluate(() => {
    const h1 = document.querySelector('.hero h1');
    return getComputedStyle(h1).opacity;
  });
  if (h1Opacity === '1') results.passed.push('Hero h1 opacity resolved to 1 after GSAP: ' + h1Opacity);
  else results.failed.push('Hero h1 opacity stuck at: ' + h1Opacity);

  const artOpacity = await page.evaluate(() => {
    const a = document.querySelector('.hero-art');
    return a ? getComputedStyle(a).opacity : 'missing';
  });
  if (artOpacity === '1') results.passed.push('Hero-art opacity resolved to 1: ' + artOpacity);
  else results.failed.push('Hero-art opacity stuck at: ' + artOpacity);

  // 5. Navigate to shop, check grid animates in (cards visible)
  await page.click('button[data-v="shop"]');
  await page.waitForTimeout(1200);
  const shopCards = await page.locator('#grid .card').count();
  results.passed.push('Shop grid cards: ' + shopCards);
  const shopCardVisible = await page.evaluate(() => {
    const c = document.querySelector('#grid .card');
    return c ? getComputedStyle(c).opacity : 'none';
  });
  if (parseFloat(shopCardVisible) > 0.5) results.passed.push('Shop card opacity after anim: ' + shopCardVisible);
  else results.failed.push('Shop card opacity low after anim: ' + shopCardVisible);

  // 6. Add product to cart, check pill updates + bump
  const addBtn = page.locator('#grid .card button[data-act="add"]').first();
  await addBtn.click();
  await page.waitForTimeout(600);
  const pillTxt = await page.locator('#pillTxt').textContent();
  results.passed.push('Cart pill after add: "' + pillTxt + '"');
  const tabBdg = await page.locator('#tabBdg').textContent();
  results.passed.push('Tab badge: "' + tabBdg + '"');

  // 7. Open product sheet
  await page.locator('#grid .card .c-art').first().click();
  await page.waitForTimeout(600);
  const sheetVisible = await page.evaluate(() => {
    const s = document.getElementById('sheet');
    return s && !s.hidden;
  });
  if (sheetVisible) results.passed.push('Sheet opened');
  else results.failed.push('Sheet did not open');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  const sheetClosed = await page.evaluate(() => document.getElementById('sheet').hidden);
  if (sheetClosed) results.passed.push('Sheet closed via Escape');
  else results.failed.push('Sheet did not close via Escape');

  // 8. Cart view
  await page.click('button[data-v="cart"]');
  await page.waitForTimeout(800);
  const cartLines = await page.locator('.line').count();
  results.passed.push('Cart lines: ' + cartLines);

  // 9. Checkout + QR images
  await page.click('[data-v="checkout"]');
  await page.waitForTimeout(800);
  const qrCount = await page.locator('img[src*="qr.png"]').count();
  results.passed.push('QR images on checkout: ' + qrCount);
  const brokenImgs = await page.evaluate(() =>
    Array.from(document.querySelectorAll('img')).filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src));
  if (brokenImgs.length === 0) results.passed.push('No broken images');
  else results.failed.push('Broken images: ' + brokenImgs.join(', '));

  // 10. Form validation
  await page.locator('form[data-form="order"] button[type="submit"]').click();
  await page.waitForTimeout(400);
  const errTxt = await page.locator('#ck-err').textContent();
  if (errTxt) results.passed.push('Validation error shown: "' + errTxt + '"');
  else results.failed.push('No validation error on empty submit');

  // ===== Mobile viewport =====
  const mob = await browser.newPage({ viewport: { width: 375, height: 812 } });
  mob.on('console', m => { if (m.type() === 'error') results.consoleErrors.push('[mobile] ' + m.text()); });
  mob.on('pageerror', e => results.pageErrors.push('[mobile] ' + e.message));
  await mob.goto(FILE, { waitUntil: 'networkidle', timeout: 30000 });
  const tabbar = await mob.locator('.tabbar').isVisible();
  if (tabbar) results.passed.push('[mobile] Tab bar visible');
  else results.failed.push('[mobile] Tab bar not visible');
  await mob.click('.tabbar button[data-v="shop"]');
  await mob.waitForTimeout(800);
  const mCards = await mob.locator('#grid .card').count();
  results.passed.push('[mobile] Shop cards: ' + mCards);
  await mob.waitForTimeout(1500);

  // ===== Reduced motion viewport =====
  const rm = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  rm.on('console', m => { if (m.type() === 'error') results.consoleErrors.push('[reduced-motion] ' + m.text()); });
  rm.on('pageerror', e => results.pageErrors.push('[reduced-motion] ' + e.message));
  await rm.goto(FILE, { waitUntil: 'networkidle', timeout: 30000 });
  await rm.waitForTimeout(800);
  const rmH1Opacity = await rm.evaluate(() => getComputedStyle(document.querySelector('.hero h1')).opacity);
  if (rmH1Opacity === '1') results.passed.push('[reduced-motion] Hero h1 opacity = 1 (no GSAP entrance)');
  else results.failed.push('[reduced-motion] Hero h1 opacity: ' + rmH1Opacity);

  await browser.close();

  console.log('\n========== DESHI BAZAAR PLAYWRIGHT RESULTS ==========\n');
  console.log('PASSED (' + results.passed.length + '):');
  results.passed.forEach(t => console.log('  ✓ ' + t));
  if (results.failed.length) {
    console.log('\nFAILED (' + results.failed.length + '):');
    results.failed.forEach(t => console.log('  ✗ ' + t));
  }
  console.log('\nConsole errors: ' + results.consoleErrors.length);
  results.consoleErrors.slice(0, 10).forEach(e => console.log('  ! ' + e));
  console.log('Page errors: ' + results.pageErrors.length);
  results.pageErrors.slice(0, 10).forEach(e => console.log('  ! ' + e));

  const ok = results.failed.length === 0 && results.consoleErrors.length === 0 && results.pageErrors.length === 0;
  console.log('\n' + (ok ? '✅ PASS: 0 errors, 0 failures' : '⚠️ NEEDS ATTENTION'));
  process.exit(ok ? 0 : 1);
})().catch(e => { console.error('TEST RUNNER ERROR:', e); process.exit(2); });
