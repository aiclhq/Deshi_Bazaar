const { chromium } = require('playwright');
const fs = require('fs');
const DIR = '/home/baribhuban/albar-consultancy-hq/projects/deshi-bazaar/screenshots';
fs.mkdirSync(DIR, { recursive: true });
(async () => {
  const b = await chromium.launch({ headless: true });
  const tasks = [
    { dark: false, mobile: false, path: 'home-light' },
    { dark: true, mobile: false, path: 'home-dark' },
    { dark: false, mobile: false, path: 'shop-light', click: 'button[data-v="shop"]' },
    { dark: true, mobile: false, path: 'shop-dark', click: 'button[data-v="shop"]' },
  ];
  for (const t of tasks) {
    const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
    if (t.dark) await p.emulateMedia({ colorScheme: 'dark' });
    await p.goto('file:///home/baribhuban/albar-consultancy-hq/projects/deshi-bazaar/index.html', { waitUntil: 'domcontentloaded', timeout: 90000 });
    await p.waitForTimeout(1000);
    if (t.click) { await p.click(t.click); await p.waitForTimeout(1500); }
    await p.screenshot({ path: DIR + '/' + t.path + '.png', fullPage: true });
    console.log('saved ' + t.path);
    await p.close();
  }
  await b.close();
  console.log('screenshots done');
})().catch(e => { console.error(e.message); process.exit(1); });
