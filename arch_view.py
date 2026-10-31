// arch height 76.2 m; roofline angle assumed 1.43 deg
const ARCH_H = 76.2;
const ROOF_ANGLE = 1.43 * Math.PI / 180;

// At distance d (metres) from the arch, the roofline of Arlington House
// subtends angle ROOF_ANGLE. The arch subtends atan(ARCH_H / d).
// The arch blocks the sightline when its angular height exceeds the
// roofline's angular height at the same distance.
function archAngle(d) { return Math.atan(ARCH_H / d); }

// Break-even: arch angle equals roofline angle.
// atan(ARCH_H/d) = ROOF_ANGLE  =>  d = ARCH_H / tan(ROOF_ANGLE)
const BREAK_EVEN = ARCH_H / Math.tan(ROOF_ANGLE);
console.log('break-even distance (m):', BREAK_EVEN.toFixed(1));
console.log('break-even distance (km):', (BREAK_EVEN/1000).toFixed(2));

// Sensitivity: does the verdict survive a wrong roofline assumption?
for (const deg of [0.5, 1.0, 1.43, 2.0, 3.0]) {
  const a = deg * Math.PI / 180;
  const d = ARCH_H / Math.tan(a);
  console.log('roofline ' + deg + ' deg -> break-even ' + (d/1000).toFixed(2) + ' km');
}
