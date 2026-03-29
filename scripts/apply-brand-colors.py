#!/usr/bin/env python3
"""Map legacy hex + rgba to brand tokens. Run: python3 scripts/apply-brand-colors.py"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKIP_DIRS = {"node_modules", ".next", ".git"}

# (prefix, old_hex, new_token) — optional /opacity preserved
HEX_MAP = [
    ("text", "09b24e", "brand-teal"),
    ("bg", "09b24e", "brand-teal"),
    ("border", "09b24e", "brand-teal"),
    ("ring", "09b24e", "brand-teal"),
    ("from", "09b24e", "brand-teal"),
    ("to", "09b24e", "brand-teal"),
    ("via", "09b24e", "brand-teal"),
    ("shadow", "09b24e", "brand-teal"),
    ("text", "2e5d7b", "brand-navy"),
    ("bg", "2e5d7b", "brand-navy"),
    ("border", "2e5d7b", "brand-navy"),
    ("ring", "2e5d7b", "brand-navy"),
    ("from", "2e5d7b", "brand-navy"),
    ("to", "2e5d7b", "brand-navy"),
    ("via", "2e5d7b", "brand-navy"),
    ("text", "078a3b", "brand-teal"),
    ("bg", "078a3b", "brand-teal"),
]

RGBA_SUBS = [
    ("rgba(46,93,123,", "rgba(33,73,137,"),
    ("rgba(9,178,78,", "rgba(85,197,147,"),
]

FIXED = [
    (r"hover:bg-\[#234a60\]", "hover:bg-brand-navy-muted"),
    (r"hover:bg-\[#1e4a63\]", "hover:bg-brand-navy-muted"),
    (r"hover:bg-\[#078a3b\]", "hover:bg-brand-teal-hover"),
    (r"text-\[#1e3a4f\]", "text-brand-navy"),
    (r"bg-\[#0d2a3e\]", "bg-brand-navy"),
    (r"from-\[#0d2a3e\]", "from-brand-navy"),
    (r"to-\[#0d4a2a\]", "to-brand-teal"),
    (r"via-\[#0bc557\]", "via-brand-green"),
    (r"bg-\[#2e5d7b\]/85", "bg-brand-navy/85"),
]


def sub_hex_classes(text: str) -> str:
    for prefix, hx, token in HEX_MAP:
        # e.g. text-[#09b24e] or text-[#09b24e]/80 or text-[#09b24e]/[0.05]
        pat = rf"{prefix}-\[#({hx})\](/[^\s'\"]+)?"
        def repl(m: re.Match) -> str:
            op = m.group(2) or ""
            return f"{prefix}-{token}{op}"

        text = re.sub(pat, repl, text, flags=re.IGNORECASE)
    return text


def should_process(p: Path) -> bool:
    if any(part in SKIP_DIRS for part in p.parts):
        return False
    return p.suffix in {".tsx", ".ts", ".css", ".jsx"}


def main() -> None:
    n = 0
    for path in ROOT.rglob("*"):
        if not path.is_file() or not should_process(path):
            continue
        text = path.read_text(encoding="utf-8")
        orig = text
        for a, b in FIXED:
            text = re.sub(a, b, text)
        text = sub_hex_classes(text)
        for a, b in RGBA_SUBS:
            text = text.replace(a, b)
        if text != orig:
            path.write_text(text, encoding="utf-8")
            n += 1
            print(path.relative_to(ROOT))

    print(f"Updated {n} files.")


if __name__ == "__main__":
    main()
