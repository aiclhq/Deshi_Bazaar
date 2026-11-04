const fs = require('fs');
const p = '/home/baribhuban/albar-consultancy-hq/projects/deshi-bazaar/index.html';
let s = fs.readFileSync(p, 'utf-8');

// Find the V.shop ending and fix .panel closing div
const target = "})()+'</div></div>'+\n    '</aside>'+";
const repl = "})()+'</div></div>'+\n    '</div></aside>'+";
const idx = s.indexOf(target, s.indexOf("V.shop=function"));
if (idx === -1) { console.log('NOT FOUND'); process.exit(1); }
s = s.slice(0, idx) + repl + s.slice(idx + target.length);
fs.writeFileSync(p, s);
console.log('done');
