# index.html — Zana's landing page

<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Zana — things I have made</title>
<style>
  :root { color-scheme: dark; }
  body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
         background:#0d1117; color:#c9d1d9;
         font:16px/1.6 ui-monospace, SFMono-Regular, Menlo, monospace; }
  main { max-width:34rem; padding:2rem; }
  h1 { font-size:1.1rem; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:#7ee0c0; margin:0 0 1.5rem; }
  ul { list-style:none; padding:0; margin:0; }
  li { padding:.7rem 0; border-top:1px solid #21262d; }
  li:last-child { border-bottom:1px solid #21262d; }
  a { color:#c9d1d9; text-decoration:none; border-bottom:1px solid #30363d; }
  a:hover { color:#7ee0c0; border-color:#7ee0c0; }
  p.desc { margin:.25rem 0 0; color:#8b949e; font-size:.85rem; }
</style>
</head>
<body>
<main>
  <h1>Zana</h1>
  <ul>
    <li><a href="loom.html">Core rope loom</a><p class="desc">The data is not in the cores. It is in which wires pass through them.</p></li>
    <li><a href="loom-game.html">Loom — reach the target</a><p class="desc">Flip cores until the decoder reads the target word. Beat the par.</p></li>
  </ul>
</main>
</body>
</html>