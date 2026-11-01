function star(c, F) {
  if (F <= 0) return c > 0 ? 1 : 0;
  return Math.min(1, c / F);
}
for (const c of [2, 5, 10]) {
  const row = [];
  for (const F of [10, 25, 50, 100, 200]) {
    row.push('F=' + F + ':' + star(c, F).toFixed(2));
  }
  console.log('c=' + c + '  ' + row.join('  '));
}
