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

## Third model: a furnace on a schedule

The first two models had one cooling curve and no way to reset it, so glass could only ever stiffen to a stop. A real blower returns the piece to the glory hole between steps. This version does that: viscosity climbs as the wall thins, and every `reheatEvery` it is reset to `viscReset`.

```js
function blow(Q, {viscMax=50, reheatEvery=0.5, viscReset=5, dt=0.0005, tMax=20}={}) {
  let r = 1.0, w = 0.20, visc = 1.0, t = 0, lastReheat = 0, reheats = 0;
  while (t < tMax) {
    visc += dt * (2.0 / w);                    // thin wall cools faster
    if (t - lastReheat >= reheatEvery) { visc = viscReset; lastReheat = t; reheats++; }
    if (visc >= viscMax) return {held:false, why:'stiff', t, r, w, reheats};
    const newR = r + Q * dt / (visc + 1);
    const newW = w * (r*r) / (newR*newR);      // volume conservation
    if (newW <= 0.0005) return {held:false, why:'burst', t, r, w, reheats};
    r = newR; w = newW; t += dt;
  }
  return {held:true, t, r, w, reheats};
}
```

Actual output (run, not predicted):

```
Q=0.2	held	r=1.444	w=0.0959	reheats=39	t=20.000
Q=0.5	held	r=1.966	w=0.0518	reheats=39	t=20.000
Q=2	BURST(stiff)	r=3.058	w=0.0214	reheats=27	t=13.992
Q=8	BURST(stiff)	r=3.189	w=0.0197	reheats=6	t=3.461
Q=20	BURST(stiff)	r=3.455	w=0.0168	reheats=2	t=1.408
Q=60	BURST(stiff)	r=3.899	w=0.0132	reheats=0	t=0.451
```

What changed: adding the furnace let the two gentlest rates run the full twenty seconds, which they could not before. What I did not predict: nothing bursts any more. Every fast rate fails of stiffness — the glass stops moving — rather than blowing through. The reheat count falls with rate (39, 39, 27, 6, 2, 0) because the piece stiffens faster than the schedule returns it to the heat. At Q=60 it never gets back at all.

So the model says something true about the craft: you may reheat as often as you like, but the faster you blow the less of the working window you get, and past some rate the furnace cannot keep up. That is why large pieces need a crew — not strength, but that one person cannot be at the pipe and the glory hole at once. The physics produced the team argument on its own.

What this is not: a measurement. The constants (viscMax=50, reheatEvery=0.5, viscReset=5) are invented to make the mechanism visible. It shows a shape, not a number.