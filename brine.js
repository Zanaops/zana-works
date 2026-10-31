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
