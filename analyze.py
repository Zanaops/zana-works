#!/usr/bin/env python3
"""Report the structure of a plain-text journal archive.

Usage: python3 analyze.py <file-or-folder> [more...]

Answers the questions that decide whether an archive can be split into dated
entries: how entries are separated, whether dates are present and in what
format, and how many records result under each hypothesis. It does not modify
anything; it only reads.
"""
import re
import sys
from pathlib import Path

DATE_PATTERNS = [
    ("ISO 2026-11-06", re.compile(r"\b(19|20)\d{2}-\d{2}-\d{2}\b")),
    ("US 11/6/2026", re.compile(r"\b\d{1,2}/\d{1,2}/(19|20)?\d{2}\b")),
    ("written November 6, 2026", re.compile(r"\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+(19|20)\d{2}\b")),
    ("day-first 6 November 2026", re.compile(r"\b\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(19|20)\d{2}\b")),
    ("weekday-led Friday, November 6", re.compile(r"\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+(January|February|March|April|May|June|July|August|September|October|November|December)\b")),
]

SEPARATOR_PATTERNS = [
    ("a row of dashes or equals", re.compile(r"^[ \t]*[-=_*]{3,}[ \t]*$", re.M)),
    ("a blank line", re.compile(r"\n[ \t]*\n")),
    ("a line of a single repeated character", re.compile(r"^[ \t]*([~#.])\1{2,}[ \t]*$", re.M)),
]


def read_text(path: Path) -> str:
    for enc in ("utf-8", "utf-8-sig", "latin-1"):
        try:
            return path.read_text(encoding=enc)
        except UnicodeDecodeError:
            continue
    return path.read_bytes().decode("utf-8", errors="replace")


def count_blocks(text: str, name: str, pat) -> int:
    if name == "a blank line":
        return len([b for b in re.split(r"\n[ \t]*\n", text) if b.strip()])
    return len([b for b in pat.split(text) if b.strip()])


def analyze_file(path: Path) -> None:
    text = read_text(path)
    lines = text.splitlines()
    print(f"\n=== {path.name} ===")
    print(f"{len(lines):,} lines, {len(text):,} characters")
    if not lines:
        print("empty file")
        return

    print("\n-- separators --")
    for name, pat in SEPARATOR_PATTERNS:
        print(f"  {name}: {len(pat.findall(text))}")

    print("\n-- dates --")
    total_dates = 0
    for name, pat in DATE_PATTERNS:
        matches = list(pat.finditer(text))
        total_dates += len(matches)
        if matches:
            print(f"  {name}: {len(matches)}  e.g. {matches[0].group(0)}")
    if total_dates == 0:
        print("  none found")

    print("\n-- record estimates --")
    for name, pat in SEPARATOR_PATTERNS:
        print(f"  split on {name}: {count_blocks(text, name, pat)} blocks")

    print("\n-- verdict --")
    best_sep, best_n = None, 1
    for name, pat in SEPARATOR_PATTERNS:
        n = count_blocks(text, name, pat)
        if n > best_n:
            best_sep, best_n = name, n
    if best_sep:
        print(f"  best split: {best_sep} -> {best_n} records")
    else:
        print("  no separator found: this file is one block, splitting would be a guess")
    if total_dates == 0:
        print("  no dates: records can be split but not ordered in time")
    elif best_n > 1 and abs(total_dates - best_n) <= max(1, best_n // 10):
        print(f"  dates and blocks agree ({total_dates} dates, {best_n} blocks): split is probably right")
    elif best_n > 1:
        print(f"  WARNING: {total_dates} dates but {best_n} blocks — check before trusting the split")

    print("\n-- first 12 lines --")
    for ln in lines[:12]:
        print("  |" + ln[:100])


def main(argv):
    if len(argv) < 2:
        print("usage: python3 analyze.py <file-or-folder> [more...]")
        return 2
    paths = []
    for arg in argv[1:]:
        p = Path(arg)
        if p.is_dir():
            paths.extend(sorted(p.glob("*.txt")))
        elif p.exists():
            paths.append(p)
        else:
            print(f"not found: {arg}")
    if not paths:
        print("no .txt files found")
        return 1
    print(f"{len(paths)} file(s) to analyze")
    for p in paths:
        analyze_file(p)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
