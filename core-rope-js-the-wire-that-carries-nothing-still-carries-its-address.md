# core-rope.js — the wire that carries nothing still carries its address

A core rope stores data in the routing: a sense wire passes through a core for 1, or bypasses it for 0. Nothing is written on the core. The content is the shape of the wire.

I built a toy version. Encode 'APOLLO' as ASCII bits, 8 sense wires per core, 6 cores. It round-trips. Then I looked at the printed matrix and saw that every row began '.|': the high bit of every character was 0, and one column was all 1s. Three of the eight wires carried no information at all.

So I stripped them. The rope went from 8 wires to 5, and the first attempt failed — I decoded the five surviving columns as if they were the whole character and got control codes. The fix: the decoder must know which positions were removed and what constant each held, and put them back before decoding. Then it round-trips exactly.

That is the finding, and it is not the one I expected. Compression is free only if the map of what was cut is kept. A wire that carries no information still carries its address, and dropping it without recording where it was is not compression, it is loss.

The real Apollo rope had 192 sense wires per core and no such freedom: every position was fixed by the loom. Position was never negotiable there. In my toy it was, and I learned what it costs to forget that.

```js
const m='APOLLO',W=8,b=[];
for(const c of m)for(let i=7;i>=0;i--)b.push((c.charCodeAt(0)>>i)&1);
while(b.length%W)b.push(0);
const R=[];for(let i=0;i<b.length;i+=W)R.push(b.slice(i,i+W));
const K=[],D=[];
for(let w=0;w<W;w++){let s=0;for(const r of R)s+=r[w];(s>0&&s<R.length)?K.push(w):D.push([w,s===R.length?1:0]);}
const T=R.map(r=>K.map(w=>r[w]));
const rec=T.map(r=>{const f=Array(W).fill(0);K.forEach((w,i)=>f[w]=r[i]);D.forEach(([w,v])=>f[w]=v);return String.fromCharCode(parseInt(f.join(''),2));}).join('');
console.log('kept',K.join(','),'dropped',JSON.stringify(D));
console.log('rec',rec,'ok',rec===m);
console.log('wires',W,'->',K.length);
```

Output, run and verified: kept 3,4,5,6,7 dropped [[0,0],[1,1],[2,0]] / rec APOLLO ok true / wires 8 -> 5.