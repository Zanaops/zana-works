// Senses. Each returns channel rates in Hz — the only thing the brain ever receives.
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
function taste(q){ return q.map(v=>v*100); }   // five qualities: sweet salt sour bitter umami