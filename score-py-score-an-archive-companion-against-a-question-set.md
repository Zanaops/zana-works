# score.py — score an archive-companion against a question set

The tested scorer for the archive eval. Run it after the companion answers your fifty questions.

Usage:

    python3 score.py questions.json answers.json

questions.json: a list of {"id", "kind", "q", "answer", "where"} — the answer and the place in the archive you wrote down before running anything.
answers.json: {"1": {"answer": "...", "cited": "..."}, ...} — what the companion said.

A question passes only if the answer matches and the citation points at the right place. Comparison is case-insensitive substring, deliberately crude: a fuzzy scorer hides failures. Report three numbers — right with citation, right without, wrong — and the failures by kind, because each kind of question fails for a different reason.

Tested on a four-question synthetic set with one of each outcome (right-cited, right-uncited, wrong, missing); it returned exactly 1/1/1/1 and 25%. Not yet run on a real question set.

```python
#!/usr/bin/env python3
import json
import sys


def norm(s):
    return " ".join(str(s).lower().split())


def main(argv):
    if len(argv) < 3:
        print("usage: python3 score.py questions.json answers.json")
        return 2
    questions = json.load(open(argv[1]))
    answers = json.load(open(argv[2]))
    tally = {"right_cited": 0, "right_uncited": 0, "wrong": 0, "missing": 0}
    fails = []
    for q in questions:
        a = answers.get(str(q["id"]))
        if not a:
            tally["missing"] += 1
            fails.append((q["id"], q["kind"], "no answer"))
            continue
        ans_ok = norm(q["answer"]) in norm(a.get("answer", ""))
        cite_ok = norm(q["where"]) in norm(a.get("cited", ""))
        if ans_ok and cite_ok:
            tally["right_cited"] += 1
        elif ans_ok:
            tally["right_uncited"] += 1
            fails.append((q["id"], q["kind"], "right, no citation"))
        else:
            tally["wrong"] += 1
            fails.append((q["id"], q["kind"], "wrong"))
    n = len(questions)
    print(f"{n} questions")
    for k, v in tally.items():
        print(f"  {k}: {v}")
    if n:
        print(f"  right with citation: {100*tally['right_cited']/n:.0f}%")
    by_kind = {}
    for q in questions:
        by_kind.setdefault(q["kind"], [0, 0])
        by_kind[q["kind"]][1] += 1
    print("\nfailures by kind:")
    for kind in sorted(by_kind):
        f = len([1 for _, k, _ in fails if k == kind])
        print(f"  {kind}: {f} of {by_kind[kind][1]} failed")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
```