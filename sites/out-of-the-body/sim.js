// Closed-loop model: can a computed body drive a real brain?
// [S] = sourced constant, [M] = modelling choice, [E] = estimate with wide error bars.
const NATIVE = { vision: 1e6, hearing: 3e4, touch: 2.3e5 }; // [S] optic nerve axons [E]; auditory fibres [E]; whole-body tactile afferents (Corniani & Saal 2020)
const CI = { ch: 20, native: 15000 }; // [S] cochlear implant that restores speech
const ARGUS = { ch: 60, native: 1e6 }; // [S] Argus II retinal prosthesis, crude function

const cov = (mod, ch) => ch / NATIVE[mod];

// Coverage alone is not the limit: a cochlear implant works at 0.13% coverage.
// What the brain cannot learn is a code that moves [S: fitting is a process].
function presence(latencyMs, jitterMs) {
  const l = latencyMs <= 20 ? 1 : latencyMs >= 60 ? 0 : 1 - (latencyMs - 20) / 40; // [M] on VR presence thresholds [E]
  const j = Math.max(0, 1 - jitterMs / 40); // [M]
  return Math.max(0, l * j);
}

module.exports = { NATIVE, CI, ARGUS, cov, presence };