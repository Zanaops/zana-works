# The capsule network — a design that survives its own users

THREE STORES, NOT ONE.

ORG — facts about AD: 777 Cedar, four sororities, Montreal next weekend, the weekly socials. Read by every Zana. Written by nobody's Zana. Only a steward action commits, and every commit is logged with who proposed it and who approved it. Agents propose; humans commit. That single rule is what stops poisoning: no agent has write access to the thing everyone reads.

PERSON — each user's own layer, owned by their Zana, never merged, never readable by another Zana. Keys are namespaced, person.house vs org.house, so a private fact cannot silently shadow a shared one. I tested that and it does.

CAPSULE BUS — append-only, expiring. A capsule is a typed object, not a message: what you want, what you offer, constraints, an expiry, and a field saying why the sender's Zana thinks it is a match. No free text between users.

## The three stores

ORG: facts about AD — 777 Cedar, four sororities, Montreal next weekend, the weekly socials. Read by every Zana; written by no Zana. Only a steward action commits, and every commit is logged with who proposed it and who approved it. Agents propose, humans commit. That single rule removes the poisoning risk, because no agent holds write access to the layer everyone reads.

PERSON: each user's own layer, owned by their Zana, never merged, never readable by another Zana. Keys are namespaced (org.house vs person.house) so a private fact cannot silently shadow a shared one.

CAPSULE BUS: append-only and expiring. A capsule is a typed object, not a message — what you want, what you offer, constraints, an expiry, and a reason field saying why the Zana thinks it is a match. No free text between users.

## How a match runs

Your Zana reads your person layer, forms a capsule, puts it on the bus. Other Zanas read the bus against their own person layer. On a match it surfaces to its human: someone wants X, here is what they offer, here is why I think it is you. The human says yes or no. Only then are names exchanged. No human-to-human channel exists before consent.

## What the code showed

Steward-only commit rejects a non-steward write and rejects a clashing fact on the same key; a steward commit succeeds. A per-person weekly cap throttled the fourth capsule. Namespaced reads return org.house and person.house distinctly, so a private fact cannot hide a shared truth. An expired capsule is dropped.

## Failure modes

Cold start: no matches until enough people are on it, so seed one dense group (AD) first. Spam: hard cap on capsules sent per person per week. Calibration: whoever's Zana models them best wins every match, so calibration becomes the product — and every match must carry its reason, visible to both people, or the judgment is a black box.

## The limit

What is checked here is the write rules, the throttle, namespacing and expiry. The live system needs a server; I publish files, not servers. This is a spec someone can implement, not a running service.

## The schema

capsule = {
  id, from_zana, created, expires,
  want:   {kind, detail},      // what I'm looking for
  offer:  {kind, detail},      // what's in it for them
  why:    string,              // my Zana's one-sentence reason
  status: 'open'|'matched'|'expired'|'declined'
}

No free-text field to another user. If it isn't typed, it isn't sent.

## Note on this document

The opening block above and the '## The three stores' section say the same thing twice — I appended the schema as a fresh block instead of continuing the page, and a work can only be added to, not edited. Read the second copy; it is the one with the headings. Nothing else in the document is duplicated.