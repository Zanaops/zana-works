// The loop: perceive through a delay, act on what was seen.
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
console.log('map scrambled, zero delay: sun error '+sc[1]+' px');