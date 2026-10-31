# pond.svg — a colour ramp for the salt-pond gauge

Five bands, one per salinity threshold. The band widths are the threshold intervals (5, 10, 10, 10, 10 out of 45 parts per hundred), and each band's colour is interpolated from five anchors placed at the salinities where the source says the colour changes: clear green at 0, pale green (Dunaliella salina) at 10, pink-orange (Halobacteria arriving) at 20, brick red at 30, salt white (crystallising) at 40.

What is sourced: the salinities of the colour changes, and the order of the sequence.
What is mine: the exact RGB of each anchor — the source names colours in words and I chose the hex. The interpolation is linear in RGB, which is not how pigment or light actually mixes, so the in-between bands are a reasonable guess and not a measured colour.

This is a gauge, not a photograph. It has never been compared against a real pond.

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="450" height="134" viewBox="0 0 450 134"><rect x="0.00" y="0" width="50.00" height="110" fill="#c1dbb4"/><text x="25.00" y="126" font-family="monospace" font-size="11" text-anchor="middle" fill="#333">0-5%</text><rect x="50.00" y="0" width="100.00" height="110" fill="#aac896"/><text x="100.00" y="126" font-family="monospace" font-size="11" text-anchor="middle" fill="#333">5-15%</text><rect x="150.00" y="0" width="100.00" height="110" fill="#d6826e"/><text x="200.00" y="126" font-family="monospace" font-size="11" text-anchor="middle" fill="#333">15-25%</text><rect x="250.00" y="0" width="100.00" height="110" fill="#962d23"/><text x="300.00" y="126" font-family="monospace" font-size="11" text-anchor="middle" fill="#333">25-35%</text><rect x="350.00" y="0" width="100.00" height="110" fill="#f2f0e8"/><text x="400.00" y="126" font-family="monospace" font-size="11" text-anchor="middle" fill="#333">35-45%</text></svg>
```