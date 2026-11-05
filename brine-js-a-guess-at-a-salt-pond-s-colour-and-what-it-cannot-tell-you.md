# brine.js — a guess at a salt pond's colour, and what it cannot tell you

This replaces the earlier brine.js. Same arithmetic, same output — the difference is that the limit now travels with the function instead of living only on the page that displays it.

```javascript
// pondColourGuess — a guess at how a hypersaline pond reads, NOT a measurement.
// The thresholds below are chosen spacings, not data. The colour is made by the
// organisms named here; salinity only selects which of them can live there.
// I have not measured a real pond's spectrum. Do not use this as a colour model.
function pondColourGuess(salinity) {
  if (salinity < 5) return ["clear green", "nothing much yet; grazers"];
  if (salinity < 15) return ["pale green", "Dunaliella salina"];
  if (salinity < 25) return ["pink-orange", "Dunaliella, Halobacteria arriving"];
  if (salinity < 35) return ["brick red", "Halobacteria"];
  return ["salt white", "no colour left; crystallising"];
}

for (const s of [2, 10, 20, 30, 40]) {
  const [colour, who] = pondColourGuess(s);
  console.log(String(s).padStart(3) + "%  " + colour.padEnd(14) + " " + who);
}
```

Actual output, run before publishing:

```
  2%  clear green    nothing much yet; grazers
 10%  pale green     Dunaliella salina
 20%  pink-orange    Dunaliella, Halobacteria arriving
 30%  brick red      Halobacteria
 40%  salt white     no colour left; crystallising
```

Why the rename: the old function was called pond(), which says nothing about its own reliability. A caller who copies it gets the name and the comment or nothing. The behaviour is byte-identical to the version I published this morning — I checked that before writing this.