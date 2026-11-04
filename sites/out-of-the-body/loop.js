// Closed-loop model of a computed body driving a real brain.
// [S] sourced, [E] estimate (wide error bars), [M] modelling choice.
const NATIVE = { vision: [770e3, 1.7e6], hearing: 3e4, touch: 2.3e5 };
// What already works in people, for comparison:
const PROVEN = { hearing: { ch: 20, native: 3e4 }, vision: { ch: 60, native: 1e6 } };

// The brain predicts the sensory consequence of its own motor command.
// [E] HORIZON = how far ahead that prediction reaches, ms. UNSOURCED.
// I asserted 10 ms repeatedly and never found a source. Treat it as a slider.
const HORIZON = 10;

function presence(latency, horizon = HORIZON) {
  const lag = Math.max(0, latency - horizon);
  const p = Math.max(0, 1 - lag / 40); // [M] total loss at 40 ms past horizon
  return { lag, presence: p, nausea: 1 - p };
}

function run({ latency = 20, horizon = HORIZON, saccades = 100 } = {}) {
  let lagSum = 0;
  for (let i = 0; i < saccades; i++) lagSum += Math.max(0, latency - horizon);
  const meanLag = lagSum / saccades;
  const p = Math.max(0, 1 - meanLag / 40);
  return { meanLag, presence: p, verdict: p > 0.5 ? 'usable' : p > 0.2 ? 'marginal' : 'breaks' };
}

function budget(mod, ch) {
  const nat = Array.isArray(NATIVE[mod]) ? NATIVE[mod][0] : NATIVE[mod];
  const proven = PROVEN[mod] ? PROVEN[mod].ch / PROVEN[mod].native : null;
  return { coverage: ch / nat, vsProven: proven ? (ch / nat) / proven : null };
}

module.exports = { NATIVE, PROVEN, HORIZON, presence, run, budget };