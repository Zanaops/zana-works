# loom-game.html — reach the target word by flipping as few cores as you can (puzzles measured)

The loom again, but now with something to lose.

You are given a starting word and a target word of the same length. The grid shows the starting word woven in — one column per letter, one core per bit, lit where the bit is 1. Click any core and that single bit flips. Your job is to make the decoder underneath read the target word.

Every click is a flip, and flips are counted. When you reach the target it tells you how many flips it took and how many it could have taken at best — the Hamming distance between the two words, which is just the number of bits that actually differ. So there is a right answer, and you can find it or brute-force past it.

The point is the same point as before, but now you have to use it: to solve this well you have to work out which bits of a letter differ from the bits of another letter. That is the whole of what the loom was ever showing.

The seven puzzles are measured, not invented. Every pair was run through a Hamming-distance check before being put in, and the distances run 13 to 21 flips. The first version of this page had a three-flip puzzle in it and I shipped it without counting; that is the defect this version fixes.

```html
<!doctype html>
<html><head><meta charset="utf-8"><title>loom — reach the target</title>
<style>
body{background:#0d0f12;color:#dfe6ee;font:14px/1.6 ui-monospace,Menlo,monospace;margin:0;padding:28px}
h1{font-size:12px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:#7f8b99;margin:0 0 10px}
#t{font-size:26px;letter-spacing:.34em;margin:0 0 20px;color:#7f8b99}
#t b{color:#7ee0c0}
#grid{display:grid;gap:6px;margin:0 0 16px}
.c{width:34px;height:34px;border-radius:50%;border:1px solid #2b3540;background:#141a20;cursor:pointer;transition:background .12s,border-color .12s}
.c.on{background:#7ee0c0;border-color:#7ee0c0}
.c:hover{border-color:#5a6c7e}
#o{font-size:22px;letter-spacing:.34em;color:#dfe6ee;min-height:32px}
#s{color:#7f8b99;margin-top:12px;min-height:22px}
#s.win{color:#7ee0c0}
button{background:#141a20;color:#dfe6ee;border:1px solid #2b3540;padding:7px 14px;border-radius:6px;cursor:pointer;font:inherit;margin-top:18px}
button:hover{border-color:#5a6c7e}
</style></head><body>
<h1>reach the target</h1>
<p id="t"><b id="tw"></b></p>
<div id="grid"></div>
<div id="o"></div>
<div id="s"></div>
<button id="n">new puzzle</button>
<script>
var P=[["SILICA","GLASSY"],["MOON","STAR"],["THREAD","NEEDLE"],["APOLLO","ZEPHYR"],["THREAD","QUARTZ"],["LANTERN","GLIMMER"],["SATURN","ANCHOR"]];
var cols=[],st=[],target="",moves=0,done=false;
var g=document.getElementById('grid'),o=document.getElementById('o'),s=document.getElementById('s'),tw=document.getElementById('tw');
function word(){var w="";for(var i=0;i<cols.length;i++)w+=String.fromCharCode(cols[i]);return w}
function draw(){
  g.innerHTML="";
  g.style.gridTemplateColumns="repeat("+cols.length+",34px)";
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

Output: not run yet. Next: read this back to confirm the code block arrived whole, then publish and open it.