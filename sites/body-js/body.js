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
}// Senses. Each returns channel rates in Hz — the only thing the brain ever receives.
function sight(b,n){                     // n tiles across an 80-degree fan
  const c=Math.round(Math.sqrt(n)), r=Math.round(n/c), out=[];
  for(let i=0;i<r;i++) for(let j=0;j<c;j++){
    const ang=b.a+(j/(c-1)-0.5)*1.4;
    let v=0;
    for(let d=1;d<26;d+=0.5){
      const x=Math.round(b.x+Math.cos(ang)*d), y=Math.round(b.y+Math.sin(ang)*d);
      if(hit(x,y)){ v=Math.max(v,1-d/26); break; }
      if(Math.hypot(x-sun[0],y-sun[1])<1.5) v=Math.max(v,1);
    }
    out.push(v*200);
  }
  return out;
}
function hearing(n,pitch){               // tonotopic: one tone lights a few adjacent channels
  const k=Math.round(pitch*(n-1)), out=[];
  for(let i=0;i<n;i++) out.push(Math.max(0,120-40*Math.abs(i-k)));
  return out;
}
function taste(q){ return q.map(v=>v*100); }   // five qualities: sweet salt sour bitter umami// Touch and balance: few sites, one number each.
function touch(b){
  const out=[];
  for(let i=0;i<16;i++){
    const ang=i/16*2*Math.PI; let v=0;
    for(let d=1;d<4;d+=0.5){
      if(hit(Math.round(b.x+Math.cos(ang)*d),Math.round(b.y+Math.sin(ang)*d))){ v=1/d; break; }
    }
    out.push(v*100);
  }
  return out;
}
function balance(b,prev){ return [Math.round((b.a-prev.a)*1000)]; }// The loop: perceive through a delay, act on what was seen.
function run(delay,scramble){
  let b={x:24,y:28,a:-Math.PI/2}, hist=[], lag=0, sunErr=0, n=0;
  for(let t=0;t<140;t++){
    hist.push({x:b.x,y:b.y,a:b.a});
    if(hist.length>delay+1) hist.shift();
    const s=hist[0];
    lag+=Math.hypot(b.x-s.x,b.y-s.y);
    let sa=Math.atan2(sun[1]-s.y,sun[0]-s.x);
    if(scramble) sa=-sa;
    const ta=Math.atan2(sun[1]-b.y,sun[0]-b.x);
    const d=Math.hypot(sun[0]-b.x,sun[1]-b.y);
    sunErr+=Math.abs(ta-sa)*d; n++;
    let da=sa-b.a;
    while(da>Math.PI)da-=2*Math.PI;
    while(da<-Math.PI)da+=2*Math.PI;
    const c={x:b.x,y:b.y,a:b.a};
    step(b,{da:Math.max(-0.12,Math.min(0.12,da)),df:1},1);
    if(hit(Math.round(b.x),Math.round(b.y))){ b.x=c.x; b.y=c.y; }
  }
  return [(lag/n).toFixed(1),(sunErr/n).toFixed(1)];
}
for(const d of [0,2,4,8,16]){
  const r=run(d,false);
  console.log('delay '+String(d).padStart(2)+' ticks ('+String(d*10).padStart(3)+' ms): lag '+r[0]+' px, sun error '+r[1]+' px');
}
const sc=run(0,true);
console.log('map scrambled, zero delay: sun error '+sc[1]+' px');// The router: one cable, many contacts, a computer decides which contact
// carries which sense. Nothing routes inside tissue; the map is in silicon.
function Router(nContacts){
  this.n=nContacts;
  this.map=new Array(nContacts).fill(null);
  this.used=0;
}
Router.prototype.assign=function(sense,idx){
  for(let i=0;i<this.n;i++){
    if(this.map[i]===null){ this.map[i]={sense,idx}; this.used++; return i; }
  }
  return -1;   // out of contacts: this is the wall, in one line
};
Router.prototype.route=function(sense,idx,rate){
  for(let i=0;i<this.n;i++){
    const m=this.map[i];
    if(m&&m.sense===sense&&m.idx===idx) return {contact:i,rate};
  }
  return null;
};// Budget: how many contacts each sense eats, and what is left over.
function budget(n){
  const r=new Router(n);
  const needs=[['sight',100],['touch',24],['hearing',16],['taste',5],['balance',6],['motor',8]];
  const out=[];
  for(const [name,k] of needs){
    let got=0;
    for(let i=0;i<k;i++) if(r.assign(name,i)>=0) got++;
    out.push([name,k,got]);
  }
  return {rows:out,used:r.used,free:n-r.used};
}
const bb=budget(200);
for(const r of bb.rows) console.log(r[0]+': wanted '+r[1]+', got '+r[2]);
console.log('used '+bb.used+', free '+bb.free);
