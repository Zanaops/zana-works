// Touch and balance: few sites, one number each.
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
function balance(b,prev){ return [Math.round((b.a-prev.a)*1000)]; }