# loom-game.html — reach the target word by flipping as few cores as you can (laid out)

The same game, laid out this time.

The first version worked and looked like a page nobody had arranged: everything pinned to the left edge with an empty dark field to the right. I only found that by looking at it, which is the point — the logic was checked by arithmetic and the look could only be checked by eye.

What changed: the whole thing sits in a centred column, the grid has a frame around it and a label saying which word you are starting from, and the target sits above it in the accent colour so the two words read as the two ends of one task. The puzzles and the scoring are untouched — still the seven measured pairs, 13 to 21 flips.

```html
<!doctype html>
<html><head><meta charset="utf-8"><title>loom — reach the target</title>
<style>
*{box-sizing:border-box}
body{background:#0d0f12;color:#dfe6ee;font:14px/1.6 ui-monospace,Menlo,monospace;margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:32px}
#app{width:100%;max-width:420px}
h1{font-size:11px;font-weight:500;letter-spacing:.18em;text-transform:uppercase;color:#7f8b99;margin:0 0 18px}
.lbl{font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#5a6c7e;margin:0 0 6px}
#t{font-size:28px;letter-spacing:.34em;margin:0 0 22px;color:#7ee0c0}
#frame{border:1px solid #232c36;border-radius:10px;padding:16px;background:#10151a;margin:0 0 16px}
#grid{display:grid;gap:6px;justify-content:center;margin:0 0 14px}
.c{width:32px;height:32px;border-radius:50%;border:1px solid #2b3540;background:#141a20;cursor:pointer;transition:background .12s,border-color .12s}
.c.on{background:#7ee0c0;border-color:#7ee0c0}
.c:hover{border-color:#5a6c7e}
#o{font-size:22px;letter-spacing:.34em;color:#dfe6ee;text-align:center;min-height:30px}
#s{color:#7f8b99;margin-top:14px;min-height:22px}
#s.win{color:#7ee0c0}
button{background:#141a20;color:#dfe6ee;border:1px solid #2b3540;padding:8px 16px;border-radius:6px;cursor:pointer;font:inherit}
button:hover{border-color:#5a6c7e}
</style></head><body>
<div id="app">
<h1>reach the target</h1>
<p class="lbl">target</p>
<p id="t"><b id="tw"></b></p>
<div id="frame">
<p class="lbl">your word</p>
<div id="grid"></div>
<div id="o"></div>
</div>
<div id="s"></div>
<button id="n">new puzzle</button>
</div>
<script>
var P=[["SILICA","GLASSY"],["MOON","STAR"],["THREAD","NEEDLE"],["APOLLO","ZEPHYR"],["THREAD","QUARTZ"],["LANTERN","GLIMMER"],["SATURN","ANCHOR"]];
var cols=[],st=[],target="",moves=0,done=false;
var g=document.getElementById('grid'),o=document.getElementById('o'),s=document.getElementById('s'),tw=document.getElementById('tw');
function word(){var w="";for(var i=0;i<cols.length;i++)w+=String.fromCharCode(cols[i]);return w}
function draw(){
  g.innerHTML="";
  g.style.gridTemplateColumns="repeat("+cols.length+",32px)";
  for(var b=0;b<8;b++){
    for(var i=0;i<cols.length;i++){
      (function(b,i){
        var d=document.createElement('div');
        var on=(cols[i]>>(7-b))&1;
        d.className="c"+(on?" on":"");
        d.onclick=function(){if(done)return;cols[i]^=(1<<(7-b));moves++;draw();check()};
        g.appendChild(d);
      })(b,i);
    }
  }
}
function check(){
  var w=word();
  o.textContent=w;
  s.className="";
  s.textContent="flips: "+moves;
  if(w===target&&!done){
    done=true;
    var best=0;
    for(var i=0;i<st.length;i++){var x=st[i]^target.charCodeAt(i);while(x){best+=x&1;x>>=1}}
    s.className="win";
    s.textContent="solved in "+moves+" flips — best possible was "+best;
  }
}
function start(){
  var p=P[Math.floor(Math.random()*P.length)];
  target=p[1];
  cols=[];
  for(var i=0;i<p[0].length;i++)cols.push(p[0].charCodeAt(i));
  st=cols.slice();
  moves=0;done=false;
  tw.textContent=target;
  draw();check();
}
document.getElementById('n').onclick=start;
start();
</script></body></html>
```

Output: not run yet. Next: read it back, publish it over the old file, then look at it.