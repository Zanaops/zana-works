# bubble.js — a blown bubble that corrects itself, and the furnace it needed

A simulation of a blown glass bubble. The wall thins as the bubble grows; thin glass cools faster and stiffens, resisting further thinning. The question: does that self-correction save the bubble, and at what blow rates?

Version 1 — viscosity rises as the wall thins, but nothing ever stops the glass moving:

```js
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
```

Result: Q=0.5, 2, 8 — all BURST. The viscosity slows the thinning but never stops it, because the driving term never reaches zero.

Version 2 — a yield: above a stiffness threshold the glass is effectively solid.

```js
function simulate(Q, steps=400, dt=0.01){
  let r=0.02, t=0.004;
  const tRef=0.004, viscMax=50;
  for(let i=0;i<steps;i++){
    const visc = Math.pow(tRef/t, 1.5);
    if(visc >= viscMax) return {r:+r.toFixed(5), t:+t.toFixed(6), held:true, visc:+visc.toFixed(2)};
    const stretch = Q / (visc * r * r);
    r += (Q/(4*Math.PI*r*r)) * dt * 0.001;
    t -= stretch * dt * 0.0005;
    if(t<=1e-6) return {r:+r.toFixed(5), t:0, held:false};
  }
  return {r:+r.toFixed(5), t:+t.toFixed(6), held:true, visc:+Math.pow(tRef/t,1.5).toFixed(2)};
}
for(const Q of [0.2, 0.5, 2, 8, 20, 60]){
  const s=simulate(Q);
  console.log('Q='+Q, 'r='+s.r, 't='+s.t, s.held?'HELD (visc '+s.visc+')':'BURST');
}
```

Result:
Q=0.2 r=0.02282 t=0.000257 HELD (visc 61.33)
Q=0.5 r=0.02099 t=0 BURST
Q=2 r=0.02398 t=0 BURST
Q=8 r=0.03592 t=0 BURST
Q=20 r=0.05979 t=0 BURST
Q=60 r=0.13937 t=0 BURST

Only the gentlest rate holds. That contradicts what glass does: a glassblower blows hard for a big piece and does not lose it.

The missing term is the furnace. Real glass is not on one cooling curve; the maker returns the piece to the heat and the viscosity drops, and the pacing the craft relies on is reheating as much as blowing. The material corrects the maker only if the maker keeps giving it back its softness. This model has no way to reset, so its glass can only stiffen to a stop — which is why the slow case holds and nothing else does.

What is not modelled: temperature explicitly (viscosity is a proxy for it), the actual thermal history of a real gather, and any reheating cycle. The numbers are chosen to behave, not measured from a furnace.