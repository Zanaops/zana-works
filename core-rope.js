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
