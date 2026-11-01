function simulate(Q, steps=200, dt=0.01){
  let r=0.02, t=0.004;
  const tRef=0.004, viscBase=1.0;
  const hist=[];
  for(let i=0;i<steps;i++){
    const visc = viscBase * Math.pow(tRef/t, 1.5);
    const stretch = Q / (visc * r * r);
    r += (Q/(4*Math.PI*r*r)) * dt * 0.001;
    t -= stretch * dt * 0.0005;
    if(t<=1e-6){ hist.push({i, r:+r.toFixed(5), t:0, burst:true}); return hist; }
    hist.push({i, r:+r.toFixed(5), t:+t.toFixed(6)});
  }
  return hist;
}
for(const Q of [0.5, 2, 8]){
  const h=simulate(Q); const last=h[h.length-1];
  console.log('Q='+Q, 'final r='+last.r, 'final t='+last.t, last.burst?'BURST':'held');
}
