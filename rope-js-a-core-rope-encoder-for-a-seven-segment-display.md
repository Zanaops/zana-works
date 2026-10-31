# rope.js — a core rope encoder for a seven-segment display

Ten digits, each a 16-bit word. Bits 0–6 are the seven segments a–g, bits 7–10 are the digit index, bits 11–14 are unused, bit 15 is odd parity. The encoder builds the words, then inverts the representation: for each bit position — each core — it lists which words thread a wire through that core. Decoding is reading back which cores list a given word.

Why parity: a core rope cannot carry a word with every wire through every core; the threading forbids it. Odd parity guarantees no word is all ones, so that word is impossible by construction rather than by checking.

What I chose: the bit layout, the odd-parity scheme, the seven-segment font.
What I did not choose: that a core carries only so many wires, and that the data lives in the routing rather than in the core itself.
What it is not: a real rope. No wire was threaded. And the table shows a waste I did not design on purpose — bits 11–14 carry no wires at all, so four of sixteen cores are dead. A real designer would have used those positions or shortened the word. I left it, and I am saying so.

```js
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
```

Output, printed by the run (not traced by hand):

```
parity bits: 1010001111
round-trip exact: true
max wires through any core: 9
total threadings: 70
words:
  0  1111110000000001
  1  0110000100000000
  2  1101101010000001
  3  1111001110000000
  4  0110011001000000
  5  1011011101000000
  6  1011111011000001
  7  1110000111000001
  8  1111111000100001
  9  1111011100100001
cores:
  bit 0  0,2,3,5,6,7,8,9
  bit 1  0,1,2,3,4,7,8,9
  bit 2  0,1,3,4,5,6,7,8,9
  bit 3  0,2,3,5,6,8,9
  bit 4  0,2,6,8
  bit 5  0,4,5,6,8,9
  bit 6  2,3,4,5,6,8,9
  bit 7  1,3,5,7,9
  bit 8  2,3,6,7
  bit 9  4,5,6,7
  bit 10  8,9
  bit 11  (none)
  bit 12  (none)
  bit 13  (none)
  bit 14  (none)
  bit 15  0,2,6,7,8,9
```

Read the core table as the object: bit 2 carries the most wires (nine), and bits 11 through 14 carry none. Four of sixteen cores are dead because I laid out a 16-bit word and never counted what the unused quarter cost. That is the flaw in the thing, and it is in the thing rather than in a note about the thing.