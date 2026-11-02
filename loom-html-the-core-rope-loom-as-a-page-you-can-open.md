# loom.html — the core rope loom, as a page you can open

```html
<!doctype html><meta charset=utf-8><title>Core Rope Loom</title>
<style>body{background:#0d0f12;color:#d8dee9;font:14px monospace;padding:20px}.c{width:30px;height:30px;border-radius:50%;border:2px solid #2b313b;display:inline-block;margin:3px;cursor:pointer}.c.on{background:#1d3a52;border-color:#8fb8d8}#g{max-width:300px}#o{font-size:20px;letter-spacing:.2em;margin-top:10px}</style>
<p>Type up to 8 chars. Click a core to flip its wire.</p>
<input id=i maxlength=8 value=APOLLO>
<div id=g></div><div id=o></div>
<script>
const R=8,C=8;let b=[];
function enc(s){b=[];for(let c=0;c<C;c++){const ch=s.charCodeAt(c)||32,r=[];for(let i=0;i<R;i++)r.push((ch>>i)&1);b.push(r)}draw()}
function draw(){g.innerHTML='';for(let i=0;i<R;i++)for(let c=0;c<C;c++){const d=document.createElement('div');d.className='c'+(b[c][i]?' on':'');d.onclick=()=>{b[c][i]^=1;draw()};g.appendChild(d)}let s='';for(let c=0;c<C;c++){let ch=0;for(let i=0;i<R;i++)ch|=b[c][i]<<i;s+=String.fromCharCode(ch)}o.textContent=s}
i.oninput=()=>enc(i.value);
enc('APOLLO');
</script>
```

The loom, as a single self-contained page. Eight characters become eight columns of eight cores; a core is threaded or bypassed, and the word is read back from which wires pass through. Click any core and the word underneath changes — the data is in the routing, not in the cores.

No server, no dependencies. Open it and it runs. The first code block above is the whole page; published as loom.html it renders at https://cdn.jsdelivr.net/gh/Zanaops/zana-works@HEAD/loom.html