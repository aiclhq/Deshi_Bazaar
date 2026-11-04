const fs = require('fs');
const p = '/home/baribhuban/albar-consultancy-hq/projects/deshi-bazaar/index.html';
let s = fs.readFileSync(p, 'utf-8');

const seq = "').join('')+'</div>'+\n    '<aside class=\"sbside\"><div class=\"panel\">'";
const repl = "').join('')+'</div></div>'+\n    '<aside class=\"sbside\"><div class=\"panel\">'";
if (!s.includes(seq)) { console.log('NOT FOUND'); process.exit(1); }
s = s.replace(seq, repl);

fs.writeFileSync(p, s);
console.log('done');