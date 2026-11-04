const fs = require('fs');
const p = '/home/baribhuban/albar-consultancy-hq/projects/deshi-bazaar/index.html';
let s = fs.readFileSync(p, 'utf-8');

// Inside V.shop, the aside's <div class="panel"> is never closed before </aside>
// Current: '...}</div></div>' +\n    '</aside>'+
// Need:     '...}</div></div>' +\n    '</div></aside>'+
// The extra </div> closes .panel

const shopStart = s.indexOf("V.shop=function");
const target = "})()+'</div></div>'+\n    '</aside>'+";
const repl = "})()+'</div></div>'+\n    '</div></aside>'+";

// Find the exact location in V.shop
const idx = s.indexOf(target, shopStart);
if (idx === -1) {
  // Debug: show what's actually there
  const ctx = s.slice(shopStart, shopStart + 15000);
  const asideIdx = ctx.indexOf('</aside>');
  console.log('Context around aside close:');
  console.log(JSON.stringify(ctx.slice(asideIdx - 100, asideIdx + 100)));
  process.exit(1);
}

s = s.slice(0, idx) + repl + s.slice(idx + target.length);
fs.writeFileSync(p, s);
console.log('done - added </div> to close .panel inside aside');
