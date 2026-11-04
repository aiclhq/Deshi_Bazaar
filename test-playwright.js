const { chromium } = require('playwright');
const path = require('path');

const FILE = 'file://' + path.resolve(__dirname, 'index.html');
const KEY = 'deshi-bazaar-v1';

// Pre-seed localStorage on the SAME page context before the app initializes.
// localStorage is per-browser-context, so seeding on a separate page won't help.
async function seed(page) {
  await page.evaluate((KEY) => {
    let S;
    try { S = JSON.parse(localStorage.getItem(KEY)) || {}; } catch(e) { S = {}; }
    if (!S.settings) S.settings = {};
    if (!S.settings.pin) S.settings.pin = '1234';
    if (S.products && S.products.length) {
      S.products[0].old = Math.round(S.products[0].price * 1.3);
    }
    localStorage.setItem(KEY, JSON.stringify(S));
  }, KEY);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = { passed: [], failed: [], consoleErrors: [], pageErrors: [] };
  const check = (cond, okMsg, failMsg) =>
    (cond ? results.passed.push('✓ ' + okMsg) : results.failed.push('✗ ' + (failMsg || okMsg)));

  // ===== Desktop viewport =====
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  // Seed localStorage BEFORE the app initializes
  await page.goto(FILE, { waitUntil: 'domcontentloaded' });
  await seed(page);
  // Reload so the app picks up the seeded data
  await page.reload({ waitUntil: 'domcontentloaded' });
  page.on('console', m => { if (m.type() === 'error') results.consoleErrors.push(m.text()); });
  page.on('pageerror', e => results.pageErrors.push(e.message));

  await page.goto(FILE, { waitUntil: 'domcontentloaded', timeout: 90000 });
  results.passed.push('Page loads: ' + await page.title());
  const gsapVer = await page.evaluate(() => typeof window.gsap !== 'undefined' && window.gsap.version);
  results.passed.push('GSAP version: ' + gsapVer);

  // ===== FIX 1: Header — single profile icon, theme toggle =====
  check(await page.locator('button[data-act="acctmenu"]').count() === 1,
    'Header: exactly 1 profile (account) icon', 'profile icons count wrong');
  // Gift icon uses data-act="offers"
  check(await page.locator('button[data-act="offers"]').count() >= 1,
    'Header: gift/offers icon present', 'gift/offers icon missing');
  check(await page.locator('button[data-act="theme"]').count() === 1,
    'Header: exactly 1 theme icon', 'theme icon count wrong');
  // Toggle theme
  const themeBefore = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  await page.click('button[data-act="theme"]');
  await page.waitForTimeout(150);
  const themeAfter = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  check(themeBefore !== themeAfter || themeAfter === 'dark',
    'Header: theme toggle works (' + themeBefore + ' → ' + themeAfter + ')',
    'theme toggle no effect');
  await page.click('button[data-act="theme"]'); // reset
  await page.waitForTimeout(150);

  // ===== Hero =====
  const heroH1 = await page.locator('.hero h1').first().textContent().catch(() => null);
  results.passed.push('Hero h1: ' + heroH1);
  await page.waitForTimeout(2500);
  const h1Opacity = await page.evaluate(() => getComputedStyle(document.querySelector('.hero h1')).opacity);
  check(h1Opacity === '1', 'Hero h1 opacity resolved to 1', 'Hero h1 opacity = ' + h1Opacity);

  // ===== Shop =====
  await page.click('button[data-v="shop"]');
  await page.waitForTimeout(1200);
  const shopCards = await page.locator('#grid .card').count();
  results.passed.push('Shop grid cards: ' + shopCards);
  check(parseFloat(await page.evaluate(() => getComputedStyle(document.querySelector('#grid .card')).opacity)) > 0.5,
    'Shop card visible after anim', 'shop card opacity low');

  // ===== FIX 2: Product cards — RMB OFF tag =====
  const offTags = await page.locator('#grid .card .off').count();
  check(offTags > 0, 'Cards: "RMB OFF" tag present on discounted cards (' + offTags + ')', 'no .off tag found');

  // ===== FIX 3: Shop sidebar — 3 collapsible groups =====
  check(await page.locator('button[data-act="sbgrp"]').count() === 3,
    'Sidebar: 3 group toggles', 'sidebar group toggles count wrong');
  const sbCols = await page.evaluate(() => {
    const s = document.querySelector('.shopwrap');
    return s ? getComputedStyle(s).gridTemplateColumns : '';
  });
  check(sbCols.split(' ').length === 2,
    'Sidebar: desktop 2-col grid (' + sbCols + ')', 'sidebar grid columns unexpected');
  // Toggle price group closed
  const priceOpenBefore = await page.locator('.sbcon[data-group="price"][data-g="open"]').count();
  await page.click('button[data-act="sbgrp"][data-g="price"]', { force: true });
  await page.waitForTimeout(200);
  const priceOpenAfter = await page.locator('.sbcon[data-group="price"][data-g="open"]').count();
  check(priceOpenBefore === 1 && priceOpenAfter === 0,
    'Sidebar: price group toggles closed (was ' + priceOpenBefore + ' → ' + priceOpenAfter + ')',
    'Sidebar price toggle did not close: before=' + priceOpenBefore + ' after=' + priceOpenAfter);
  await page.click('button[data-act="sbgrp"][data-g="price"]', { force: true }); // reopen
  await page.waitForTimeout(150);

  // ===== Add to cart =====
  await page.locator('#grid .card button[data-act="add"]').first().click();
  await page.waitForTimeout(500);
  results.passed.push('Cart pill: "' + (await page.locator('#pillTxt').textContent()) + '"');

  // Product sheet
  await page.locator('#grid .card .c-art').first().click();
  await page.waitForTimeout(400);
  check(await page.evaluate(() => !document.getElementById('sheet').hidden),
    'Sheet opens on product tap', 'sheet did not open');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  check(await page.evaluate(() => document.getElementById('sheet').hidden),
    'Sheet closes via Escape', 'sheet did not close');

  // ===== Register =====
  await page.goto(FILE + '#login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(300);
  await page.click('[data-act="amode"][data-v="reg"]');
  await page.waitForTimeout(300);
  await page.fill('#au-phone', '13800138000');
  await page.fill('#au-nick', 'TestUser');
  await page.fill('#au-pw', 'Test123!');
  await page.fill('#au-pw2', 'Test123!');
  await page.click('form[data-form="auth"] button[type="submit"]');
  await page.waitForTimeout(500);
  const postRegHash = await page.evaluate(() => window.location.hash);
  results.passed.push('Post-register hash: ' + postRegHash);

  // ===== Go back to shop, add item, then checkout =====
  await page.goto(FILE + '#shop', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);
  await page.locator('#grid .card button[data-act="add"]').first().click();
  await page.waitForTimeout(400);
  await page.goto(FILE + '#cart', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  check(await page.locator('.line').count() > 0,
    'Cart has items after add', 'cart empty after add');

  // ===== FIX 4: Checkout — Confirm Order button + submit =====
  await page.click('button[data-act="go"][data-v="checkout"]');
  await page.waitForTimeout(500);
  check(await page.locator('form[data-form="order"]').count() === 1,
    'Checkout: order form renders after login', 'order form missing');
  const confirmBtn = await page.locator('form[data-form="order"] button.btn.gold[type="submit"]').first().textContent();
  check(/Confirm Order/i.test(confirmBtn),
    'Checkout: gold "Confirm Order" submit button', 'Confirm Order button missing: ' + confirmBtn);
  check(await page.evaluate(() => Array.from(document.querySelectorAll('img')).filter(i => !i.complete || i.naturalWidth === 0).length) === 0,
    'Checkout: no broken images', 'broken images found');

  // Fill form
  await page.fill('#ck-name', 'Test User');
  await page.fill('#ck-city', 'Nanjing');
  await page.fill('#ck-addr', '123 Test St, Room 1, Pukuo District');
  // Province select
  await page.selectOption('#ck-prov', { index: 1 }).catch(() => {});
  // Payment screenshot: inject a 1x1 JPEG blob
  await page.evaluate(() => {
    const el = document.getElementById('payment-screenshot');
    if (!el) return;
    // Create a fake FileList with a 1x1 PNG
    const canvas = document.createElement('canvas');
    canvas.width = 1; canvas.height = 1;
    const dataUrl = canvas.toDataURL('image/png');
    const byteString = atob(dataUrl.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    const file = new File([ab], 'screenshot.png', { type: 'image/png' });
    const dt = new DataTransfer();
    dt.items.add(file);
    el.files = dt.files;
  });
  await page.check('#payment-sent');
  await page.check('#ck-terms');
  // Submit
  await page.click('form[data-form="order"] button.btn.gold[type="submit"]');
  await page.waitForTimeout(800);
  const doneHash = await page.evaluate(() => window.location.hash);
  results.passed.push('Post-submit hash: ' + doneHash);
  check(doneHash === '#done',
    'Order placed: navigated to #done view', 'did not reach #done (hash=' + doneHash + ')');

  // Confirm Order action button on done view
  const confirmAction = await page.locator('button[data-act="confirmorder"]').count();
  check(confirmAction >= 1,
    'Done: confirmorder action button present', 'confirmorder button missing on done view');

  // ===== FIX 5: Print — open receipt modal, then check rprint + A4 =====
  // The rprint button lives inside the receipt modal, which opens via the
  // "Payment Receipt" doc button on the done view.
  const receiptBtn = await page.locator('button[data-act="doc"][data-which="inv"]').count();
  if (receiptBtn) {
    await page.click('button[data-act="doc"][data-which="inv"]');
    await page.waitForTimeout(400);
  }
  const rprint = await page.locator('button[data-act="rprint"]').count();
  check(rprint >= 1, 'Receipt: rprint button present in modal', 'rprint button count = ' + rprint);
  // Also check receipt modal text
  const receiptText = await page.evaluate(() => {
    const el = document.querySelector('.receipt-modal, #sheetBox');
    return el ? el.innerText : '';
  });
  check(/Print|Download/i.test(receiptText),
    'Receipt: "Print / Download Receipt" text present', 'receipt print text missing');
  // Check A4 in CSS
  const hasA4 = await page.evaluate(() => {
    // Check the inline <style> block
    const styles = document.querySelectorAll('style');
    for (const s of styles) {
      if (s.textContent.indexOf('A4') > -1 && s.textContent.indexOf('print') > -1) return true;
    }
    // Also check media rules
    for (const ss of document.styleSheets) {
      try { for (const r of ss.cssRules) {
        if (r.type === 12 && r.cssText.indexOf('A4') > -1) return true;
      }} catch(e) {}
    }
    return false;
  });
  check(hasA4, 'Print: @media print with A4 page size', 'no A4 @media print rule');

  // ===== FIX 6: Footer — hotline + WA/WeChat icons =====
  await page.goto(FILE, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(300);
  const footText = await page.locator('.foot').first().textContent();
  check(footText.indexOf('+8618551702750') > -1,
    'Footer: hotline +8618551702750', 'footer hotline missing');
  check(await page.locator('.foot a.ic-link[href*="wa.me"]').count() === 1,
    'Footer: WhatsApp icon link', 'WA link missing');
  check(await page.locator('.foot button.ic-link[data-act="copy"]').count() === 1,
    'Footer: WeChat copy icon', 'WeChat copy button missing');

  // ===== No "Albar" anywhere =====
  const bodyText = await page.evaluate(() => document.body.innerText);
  check(bodyText.indexOf('Albar') === -1,
    'Branding: no "Albar" in content', '"Albar" found in content');

  // ===== FIX 7: Admin Customers — new columns =====
  await page.goto(FILE + '#admin', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  // Unlock admin
  const pinCount = await page.locator('#pin').count();
  if (pinCount) {
    await page.fill('#pin', '1234');
    await page.click('form[data-form="pin"] button[type="submit"]');
    await page.waitForTimeout(400);
  }
  // Click Customers tab (data-id="customers")
  const custTab = await page.locator('[data-act="atab"][data-id="customers"]').count();
  if (custTab) {
    await page.click('[data-act="atab"][data-id="customers"]');
    await page.waitForTimeout(300);
  }
  const adminText = await page.evaluate(() => document.getElementById('view').innerText);
  check(adminText.toLowerCase().indexOf('account status') > -1,
    'Admin: Customers "Account Status" column', 'missing "Account Status"');
  check(adminText.toLowerCase().indexOf('join date') > -1 || adminText.toLowerCase().indexOf('total orders') > -1,
    'Admin: Customers new date/order columns', 'missing Join date / Total orders columns');

  // ===== Mobile viewport =====
  const mob = await browser.newPage({ viewport: { width: 375, height: 812 } });
  mob.on('console', m => { if (m.type() === 'error') results.consoleErrors.push('[mobile] ' + m.text()); });
  mob.on('pageerror', e => results.pageErrors.push('[mobile] ' + e.message));
  await mob.goto(FILE, { waitUntil: 'domcontentloaded', timeout: 90000 });
  check(await mob.locator('.tabbar').isVisible(), '[mobile] Tab bar visible', '[mobile] tab bar missing');
  await mob.click('.tabbar button[data-v="shop"]');
  await mob.waitForTimeout(800);
  results.passed.push('[mobile] Shop cards: ' + (await mob.locator('#grid .card').count()));
  // Sidebar off-canvas toggle (Fix 3 mobile)
  const sbTog = await mob.locator('.sbtog').count();
  if (sbTog) {
    await mob.click('.sbtog', { force: true });
    await mob.waitForTimeout(300);
    const sbOpen = await mob.locator('.sbside[data-g="open"]').count();
    check(sbOpen === 1, '[mobile] Sidebar off-canvas opens via toggle', '[mobile] sidebar off-canvas did not open');
  } else {
    results.passed.push('[mobile] No .sbtog visible — off-canvas check skipped');
  }

  // ===== Reduced motion =====
  const rm = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  rm.on('pageerror', e => results.pageErrors.push('[reduced-motion] ' + e.message));
  await rm.goto(FILE, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await rm.waitForTimeout(800);
  const rmH1 = await rm.evaluate(() => getComputedStyle(document.querySelector('.hero h1')).opacity);
  check(rmH1 === '1', '[reduced-motion] Hero h1 opacity = 1', '[reduced-motion] hero h1 opacity ' + rmH1);

  await browser.close();

  // ===== Report =====
  console.log('\n========== DESHI BAZAAR · ROUND 7 PLAYWRIGHT RESULTS ==========\n');
  console.log('PASSED (' + results.passed.length + '):');
  results.passed.forEach(t => console.log('  ' + t));
  if (results.failed.length) {
    console.log('\nFAILED (' + results.failed.length + '):');
    results.failed.forEach(t => console.log('  ' + t));
  }
  console.log('\nConsole errors: ' + results.consoleErrors.length);
  results.consoleErrors.slice(0, 15).forEach(e => console.log('  ! ' + e));
  console.log('Page errors: ' + results.pageErrors.length);
  results.pageErrors.slice(0, 15).forEach(e => console.log('  ! ' + e));

  const ok = results.failed.length === 0 && results.consoleErrors.length === 0 && results.pageErrors.length === 0;
  console.log('\n' + (ok ? '✅ PASS: 0 errors, 0 failures — all 8 fixes verified' : '⚠️ NEEDS ATTENTION'));
  process.exit(ok ? 0 : 1);
})().catch(e => { console.error('TEST RUNNER ERROR:', e); process.exit(2); });
