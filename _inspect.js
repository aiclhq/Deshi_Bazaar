const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto('file:///home/baribhuban/albar-consultancy-hq/projects/deshi-bazaar/index.html', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForTimeout(1000);
  await p.click('button[data-v="shop"]');
  await p.waitForTimeout(1500);
  const info = await p.evaluate(() => {
    const sw = document.querySelector('.shopwrap');
    const grid = document.querySelector('#grid');
    const foot = document.querySelector('.foot');
    const cbar = document.querySelector('.copyrightbar');
    const cs = (el) => el ? getComputedStyle(el) : null;
    return {
      shopwrapChildren: Array.from(sw.children).map(c => ({ cls: c.className, w: c.offsetWidth, gridCol: cs(c).gridColumn })),
      shopmain: { w: document.querySelector('.shopmain').offsetWidth, gridCol: cs(document.querySelector('.shopmain')).gridColumn },
      grid: { w: grid.offsetWidth, cols: cs(grid).gridTemplateColumns, cards: grid.querySelectorAll('.card').length },
      foot: foot ? { w: foot.offsetWidth, parent: foot.parentElement.className, x: Math.round(foot.getBoundingClientRect().x), y: Math.round(foot.getBoundingClientRect().y) } : null,
      cbar: cbar ? { w: cbar.offsetWidth, parent: cbar.parentElement.className, y: Math.round(cbar.getBoundingClientRect().y) } : null,
      gridBottom: Math.round(grid.getBoundingClientRect().bottom),
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await b.close();
})().catch(e => { console.error(e.message); process.exit(1); });
