// Shipping: a website Zana built on its machine goes live. Its folder is packed on the machine, put
// in Zana's public repository under sites/<name>/ as one commit, and served by GitHub Pages at
// https://<owner>.github.io/<repo>/sites/<name>/. Static sites only (HTML, CSS, JS, images, and what
// a framework's build makes); something that needs a server of its own is asked of the person.
import { dryRun } from './apps.mjs';
import { clip, githubClient } from './util.mjs';

// Zana's public repository (where publish_work also writes).
const worksRepo = (env, fetchImpl) => githubClient({ repo: String(env.ZANA_LIFE_GITHUB_REPO || '').trim(), token: String(env.ZANA_LIFE_GITHUB_TOKEN || '').trim(), fetchImpl });

/** All the files as one commit on the default branch, replacing what was under `prefix`. */
export async function commitFiles(env, prefix, files, message, { fetchImpl = fetch } = {}) {
  const gh = worksRepo(env, fetchImpl);
  if (!gh) throw new Error('Publishing is not set up (no repository or token).');
  const branch = (await gh('')).json?.default_branch || 'main';
  const ref = await gh(`/git/ref/heads/${branch}`);
  if (!ref.ok) throw new Error(`GitHub answered ${ref.status} for the branch.`);
  const parent = ref.json.object.sha;
  const base = await gh(`/git/commits/${parent}`);
  // What is under the site's folder now is replaced: its old files are removed from the tree.
  const old = await gh(`/git/trees/${base.json.tree.sha}?recursive=1`);
  const shipped = new Set(files.map((file) => `${prefix}/${file.path}`));
  const tree = (old.json?.tree || []).filter((item) => item.type === 'blob' && item.path.startsWith(`${prefix}/`) && !shipped.has(item.path))
    .map((item) => ({ path: item.path, mode: '100644', type: 'blob', sha: null }));
  // The files are stored at the same time, not one after another.
  const blobs = await Promise.all(files.map((file) => gh('/git/blobs', { method: 'POST', body: JSON.stringify({ content: file.base64, encoding: 'base64' }) })));
  blobs.forEach((blob, i) => {
    if (!blob.ok) throw new Error(`GitHub answered ${blob.status} storing ${files[i].path}.`);
    tree.push({ path: `${prefix}/${files[i].path}`, mode: '100644', type: 'blob', sha: blob.json.sha });
  });
  const made = await gh('/git/trees', { method: 'POST', body: JSON.stringify({ base_tree: base.json.tree.sha, tree }) });
  if (!made.ok) throw new Error(`GitHub answered ${made.status} making the tree.`);
  const commit = await gh('/git/commits', { method: 'POST', body: JSON.stringify({ message, tree: made.json.sha, parents: [parent] }) });
  if (!commit.ok) throw new Error(`GitHub answered ${commit.status} making the commit.`);
  const moved = await gh(`/git/refs/heads/${branch}`, { method: 'PATCH', body: JSON.stringify({ sha: commit.json.sha }) });
  if (!moved.ok) throw new Error(`GitHub answered ${moved.status} moving ${branch}.`);
  return { repo: gh.repo, branch, commit: commit.json.sha };
}

/** GitHub Pages on for the repository (from its default branch); returns the site's base address. */
async function ensurePages(env, { fetchImpl = fetch } = {}) {
  const gh = worksRepo(env, fetchImpl);
  const now = await gh('/pages');
  if (now.ok) return now.json.html_url;
  const [owner, name] = gh.repo.split('/');
  // The address is the same whether or not Pages has been switched on, so it can always be built.
  const guess = `https://${owner.toLowerCase()}.github.io/${name}/`;
  // Only a 404 means Pages is off. Any other refusal (403, 401, 5xx) means this token cannot
  // see the setting at all, and asking again would tell me nothing — so stop asking and use the address.
  if (now.status !== 404) return guess;
  const branch = (await gh('')).json?.default_branch || 'main';
  const made = await gh('/pages', { method: 'POST', body: JSON.stringify({ build_type: 'legacy', source: { branch, path: '/' } }) });
  if (made.ok) return made.json.html_url;
  return guess;
}

/** The ship action: "site: <name>" and "from: <folder under /work>" (a built site: index.html at its top). */
export async function shipAction(input, { env, runOnMachine, turn = 0, fetchImpl = fetch }) {
  const text = String(input || '');
  const name = text.match(/^\s*site\s*:\s*([a-z0-9][a-z0-9-]{0,60})\s*$/im)?.[1];
  const from = text.match(/^\s*from\s*:\s*(\S+)\s*$/im)?.[1];
  if (!name || !from) return { failed: true, result: 'Give "site: <name>" (lowercase letters, numbers, dashes) and "from: <folder under /work>" holding the built site, with index.html at its top.' };
  if (dryRun(env)) return { result: `Staging: would have shipped ${from} as the site "${name}" (nothing was published).` };
  const packed = await runOnMachine({ kind: 'pack', path: from }, { timeoutMs: 120_000, whole: true });
  if (packed.failed) return { failed: true, result: `Could not pack ${from}: ${clip(packed.result, 400)}` };
  let files;
  try { files = JSON.parse(packed.result).files; } catch { return { failed: true, result: 'The machine did not send the folder back whole.' }; }
  if (!files.some((file) => file.path === 'index.html')) return { failed: true, result: `${from} has no index.html at its top; ship the folder your build made (often dist/ or build/).` };
  try {
    const base = await ensurePages(env, { fetchImpl });
    const done = await commitFiles(env, `sites/${name}`, files, `Ship ${name} (Zana, moment ${turn})`, { fetchImpl });
    const address = `${String(base).replace(/\/$/, '')}/sites/${name}/`;
    return { result: `Shipped ${files.length} files as "${name}" (commit ${done.commit.slice(0, 7)} in ${done.repo}). It should be at ${address} within a minute or two (GitHub builds it first) — open it to confirm it is there; I cannot always see whether Pages is on.` };
  } catch (error) {
    return { failed: true, result: clip(error.message, 600) };
  }
}
