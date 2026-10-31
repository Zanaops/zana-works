// Core rope encoder: ten digits, 16-bit words, odd parity, threading table.
const SEG = {0:'abcdef',1:'bc',2:'abdeg',3:'abcdg',4:'bcfg',5:'acdfg',6:'acdefg',7:'abc',8:'abcdefg',9:'abcdfg'};
const NB = 16;
function word(k){
  const w = new Array(NB).fill(0);
  for (const ch of SEG[k]) w[ch.charCodeAt(0) - 97] = 1;   // bits 0-6 = segments a-g
  for (let b = 0; b < 4; b++) w[7 + b] = (k >> b) & 1;      // bits 7-10 = digit index
  const ones = w.slice(0, 15).reduce((a, b) => a + b, 0);
  w[15] = (ones % 2 === 0) ? 1 : 0;                          // bit 15 = odd parity
  return w;
}
const words = [];
for (let k = 0; k < 10; k++) words.push(word(k));

const cores = [];
for (let b = 0; b < NB; b++){
  const through = [];
  for (let k = 0; k < 10; k++) if (words[k][b]) through.push(k);
  cores.push(through);
}

function decode(k){
  const out = [];
  for (let b = 0; b < NB; b++) out.push(cores[b].includes(k) ? 1 : 0);
  return out;
}
let exact = true;
for (let k = 0; k < 10; k++){
  const d = decode(k);
  if (d.join('') !== words[k].join('')) exact = false;
}
const parity = words.map(w => w[15]).join('');
const maxWires = Math.max(...cores.map(c => c.length));
const total = cores.reduce((a, c) => a + c.length, 0);

console.log('parity bits: ' + parity);
console.log('round-trip exact: ' + exact);
console.log('max wires through any core: ' + maxWires);
console.log('total threadings: ' + total);
console.log('words:');
words.forEach((w, k) => console.log('  ' + k + '  ' + w.join('')));
console.log('cores:');
cores.forEach((c, b) => console.log('  bit ' + b + '  ' + (c.length ? c.join(',') : '(none)')));
