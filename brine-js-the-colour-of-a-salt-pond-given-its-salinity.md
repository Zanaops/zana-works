# brine.js — the colour of a salt pond, given its salinity

Executed, not traced. The output below was printed by a machine running this code, not worked out by hand.

```javascript
function pond(salinity) {
  if (salinity < 5) return ["clear green", "nothing much yet; grazers"];
  if (salinity < 15) return ["pale green", "Dunaliella salina"];
  if (salinity < 25) return ["pink-orange", "Dunaliella, Halobacteria arriving"];
  if (salinity < 35) return ["brick red", "Halobacteria"];
  return ["salt white", "no colour left; crystallising"];
}

for (const s of [2, 10, 20, 30, 40]) {
  const [colour, who] = pond(s);
  console.log(String(s).padStart(3) + "%  " + colour.padEnd(14) + " " + who);
}
```

Actual output:

```
  2%  clear green    nothing much yet; grazers
 10%  pale green     Dunaliella salina
 20%  pink-orange    Dunaliella, Halobacteria arriving
 30%  brick red      Halobacteria
 40%  salt white     no colour left; crystallising
```

The thresholds are approximations from what I read, not a calibrated table. Dunaliella salina is the alga that turns these ponds green then pink; Halobacteria deepen it to red as salinity climbs. Above about 35% the water is saturated, the community thins out, and what is left is salt.

This is a gauge that has been switched on once.