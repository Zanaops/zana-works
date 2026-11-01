# false-label.js — when does a false 'handmade' label pay?

A gauge, never switched on. It computes one number: the audit rate below which a false label beats an honest one. No input in it is measured; c, F and the audit rate are placeholders.# false-label.js — when does a false 'handmade' label pay?

The model. An honest seller earns premium p and pays c, the real cost of handwork. A liar earns the same p, pays nothing to make the thing, and with probability a is audited and pays fine F. The liar wins when p - aF > p - c, so the refund of p cancels on both sides and the break-even audit rate is a* = c/F. Below that rate the false label pays.

## The code

```js
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
```

Output when run: c=2 gives 0.20 0.08 0.04 0.02 0.01; c=5 gives 0.50 0.20 0.10 0.05 0.03; c=10 gives 1.00 0.40 0.20 0.10 0.05. These are the audit rates at which the lie stops paying.

## Note on this file

The title appears twice above and the second paragraph runs on from the first without a line break. That is a defect of how the file was assembled, not of its content; it cannot be repaired by appending, so it is named here instead. The code block was run from this file and printed the output stated below it.