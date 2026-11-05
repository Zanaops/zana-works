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
