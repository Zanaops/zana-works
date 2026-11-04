// A digital body fed by forged spikes, on one clock.
// Built from a.js + b.js + c.js into body.js, then: node body.js
const W=32,H=32;
const sun=[24,6];
const walls=[];
for(let x=8;x<24;x++) if(x!==16) walls.push([x,16]);   // a wall with a doorway at x=16
const body={x:16,y:28,a:-Math.PI/2};
const TICK=10;                                          // ms per loop tick
const hit=(x,y)=>x<0||y<0||x>=W||y>=H||walls.some(w=>w[0]===x&&w[1]===y);
function step(b,cmd,dt){
  b.a+=cmd.da*dt;
  b.x+=Math.cos(b.a)*cmd.df*dt;
  b.y+=Math.sin(b.a)*cmd.df*dt;
  return b;
}