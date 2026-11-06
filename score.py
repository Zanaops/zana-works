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
