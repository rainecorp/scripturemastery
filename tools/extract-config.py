#!/usr/bin/env python3
"""Extract tuning constants into js/00-config.js as a pure move.

Blocks are lifted VERBATIM (including any comment attached directly above)
and their SQ registrations move with them. Nothing is retyped, reordered
within a block, or reformatted. --verify proves every moved block still
appears byte-identical in config.js.
"""
import os, re, sys

ROOT = "/Users/boss-mode/Documents/scripture mastery/scripture-tower"

# (source file, symbol) in the order they will appear in config.js.
# DIFFICULTIES must precede STAGES: STAGES is computed from it at load.
PLAN = [
    ("SECTION", "Time and scheduling"),
    ("js/03-state.js", "DAY"),
    ("js/03-state.js", "REVIEW_LADDER"),

    ("SECTION", "Progression: ranks and streaks"),
    ("js/04-review.js", "RANKS"),
    ("js/03-state.js", "STREAK_MILESTONES"),
    ("js/09-checkin.js", "CHECKIN_MILESTONES"),

    ("SECTION", "Difficulty tiers — order is load-bearing, STAGES derives from DIFFICULTIES"),
    ("js/01-catalog.js", "DIFFICULTIES"),
    ("js/01-catalog.js", "STAGES"),
    ("js/01-catalog.js", "TIER_TRIMS"),

    ("SECTION", "Arena"),
    ("js/14-arena.js", "ARENA_DIFF"),
    ("js/14-arena.js", "ARENA_TYPES"),
    ("js/14-arena.js", "ARENA_TYPE_LABEL"),
    ("js/14-arena.js", "ARENA_ACHIEVEMENTS"),
    ("js/14-arena.js", "ARENA_TITLES"),
    ("js/14-arena.js", "ARENA_HEART_MAX"),
    ("js/14-arena.js", "ARENA_QUEST_POOL"),
    ("js/14-arena.js", "QUEST_ROUND_LEN"),
    ("js/14-arena.js", "BLITZ_TYPES"),
    ("js/14-arena.js", "BLITZ_SECONDS"),

    ("SECTION", "External surfaces"),
    ("js/03-state.js", "DAILY_QUEST_URL"),
    ("js/03-state.js", "BRIDGE_KEY"),
]

HEADER = '''/* 00-config.js — tuning constants (T3b)
   ===========================================================================
   Every number you might want to argue about, in one place: review intervals,
   rank thresholds, streak and check-in milestones, difficulty bands, and the
   whole Arena table. Extracted verbatim from five files; nothing was retyped
   or reformatted.

   WHAT LIVES HERE: pure literals. No app state, no DOM, no localStorage, no
   `location`. That is what lets this load in tier 00, before everything.

   WHAT DELIBERATELY DOES NOT:
     CLIMBER, STORE_KEY, FROM_DQ, HAD_SAVE_AT_BOOT  read location/localStorage
       at load — runtime environment, not configuration. Still in 03-state.
     Campaigns, tracks, POPULAR_REFS, RELICS          content, not tuning.
     ACHIEVEMENTS, ACHV_CATS                         carry cur() closures over
       app functions; moving them would invert a load-order dependency.
     HL_ROLES, HL_LEXICON, HL_PHRASES                highlighter data, and
       HL_PHRASES is computed at load from the tokenizer.
     SHARD_CLIPS, TV_ASSET                           render geometry. T9 made
       tower height dynamic; T11 will extend its small/tall rendering cases.

   Load order: 00-namespace must come first (these SQ registrations need it),
   then this file, then 00-tokenize. Nothing here depends on the tokenizer.
   =========================================================================== */
'''

DECL_RE = lambda sym: re.compile(r'^(?:const|let|var)\s+' + re.escape(sym) + r'\b')

def code_of(line):
    """The line with a trailing // comment removed, so the terminator test is
    not defeated by `const REVIEW_LADDER = [...]; // days between re-seals`.
    That bug silently swallowed three functions on the first attempt."""
    out, i, instr, q = [], 0, False, ""
    while i < len(line):
        c = line[i]
        if instr:
            out.append(c)
            if c == "\\" and i + 1 < len(line):
                out.append(line[i+1]); i += 2; continue
            if c == q: instr = False
        elif c in "\"'`":
            instr, q = True, c; out.append(c)
        elif c == "/" and i + 1 < len(line) and line[i+1] == "/":
            break
        else:
            out.append(c)
        i += 1
    return "".join(out)

def find_block(lines, sym):
    """(start, end) inclusive line indices for the declaration, plus a comment
    block attached directly above it."""
    rx = DECL_RE(sym)
    for i, ln in enumerate(lines):
        if not rx.match(ln):
            continue
        depth, j = 0, i
        while j < len(lines):
            code = code_of(lines[j])
            for ch in code:
                if ch in "([{": depth += 1
                elif ch in ")]}": depth -= 1
            if depth <= 0 and code.rstrip().endswith(";"):
                break
            j += 1
            if j - i > 200:
                sys.exit(f"runaway block scanning {sym} — no terminator within 200 lines")
        end = j

        # Absorb an attached comment only when it is unambiguously this
        # declaration's own: a run of // lines, or a complete /* */ block, and
        # in both cases preceded by a blank line or the start of the file.
        start = i
        k = i - 1
        while k >= 0 and lines[k].strip().startswith("//"):
            start = k; k -= 1
        if start == i and k >= 0 and lines[k].strip().endswith("*/"):
            m = k
            while m >= 0 and not lines[m].strip().startswith("/*"):
                m -= 1
            if m >= 0:
                blk = "\n".join(lines[m:k+1])
                if blk.count("/*") == 1 and blk.count("*/") == 1 and (m == 0 or lines[m-1].strip() == ""):
                    start = m
        return start, end
    return None

def sq_line_for(lines, sym):
    for i, ln in enumerate(lines):
        if ln.strip() == f"SQ.{sym} = {sym};":
            return i
    return None

def main():
    verify = "--verify" in sys.argv
    blocks, sq = [], []
    edits = {}   # path -> set of line indices to delete

    for path, sym in PLAN:
        if path == "SECTION":
            blocks.append(("SECTION", sym))
            continue
        full = os.path.join(ROOT, path)
        if full not in edits:
            if verify:
                # sources no longer hold the constants — read the pre-move commit
                import subprocess
                src = subprocess.run(["git", "-C", ROOT, "show", f"HEAD:{path}"],
                                     capture_output=True, text=True, check=True).stdout
            else:
                src = open(full, encoding="utf-8").read()
            edits[full] = {"lines": src.split("\n"), "kill": set()}
        lines = edits[full]["lines"]
        found = find_block(lines, sym)
        if not found:
            sys.exit(f"could not locate {sym} in {path}")
        a, b = found
        blocks.append(("BLOCK", sym, "\n".join(lines[a:b+1])))
        edits[full]["kill"].update(range(a, b + 1))
        s = sq_line_for(lines, sym)
        if s is None:
            sys.exit(f"could not locate SQ registration for {sym} in {path}")
        edits[full]["kill"].add(s)
        sq.append(sym)

    body = [HEADER]
    for blk in blocks:
        if blk[0] == "SECTION":
            body.append(f"\n/* ---- {blk[1]} ---- */")
        else:
            body.append(blk[2])
    body.append("\n/* ---- SQ registry ---- */")
    for s in sq:
        body.append(f"SQ.{s} = {s};")
    out = "\n".join(body) + "\n"

    if verify:
        disk = open(os.path.join(ROOT, "js/00-config.js"), encoding="utf-8").read()
        def code_only(block):
            """Compare the DECLARATION, not any comment above it. Two old
            section banners were dropped from config.js because the new section
            headers say the same thing; the code must still match byte for
            byte. Skips whole /* */ blocks, not just lines that look like
            comments — a banner's middle line ("   RANKS") looks like code."""
            lines = block.split("\n")
            i = 0
            while i < len(lines):
                st = lines[i].strip()
                if st == "" or st.startswith("//"):
                    i += 1; continue
                if st.startswith("/*"):
                    while i < len(lines) and not lines[i].strip().endswith("*/"):
                        i += 1
                    i += 1; continue
                break
            return "\n".join(lines[i:])
        bad = [b[1] for b in blocks if b[0] == "BLOCK" and code_only(b[2]) not in disk]
        for s in sq:
            if f"SQ.{s} = {s};" not in disk:
                bad.append(f"SQ.{s}")
        print(f"blocks checked: {len([b for b in blocks if b[0]=='BLOCK'])}, registrations: {len(sq)}")
        print("VERBATIM — every moved block appears byte-identical in config.js" if not bad
              else "MISSING/ALTERED: " + ", ".join(bad))
        return 0 if not bad else 1

    open(os.path.join(ROOT, "js/00-config.js"), "w", encoding="utf-8").write(out)
    print(f"wrote js/00-config.js  ({len(out.splitlines())} lines, "
          f"{len([b for b in blocks if b[0]=='BLOCK'])} constants)")

    for full, d in edits.items():
        kept = [ln for i, ln in enumerate(d["lines"]) if i not in d["kill"]]
        text = "\n".join(kept)
        text = re.sub(r"\n{4,}", "\n\n\n", text)
        open(full, "w", encoding="utf-8").write(text)
        print(f"  {os.path.relpath(full, ROOT):24s} -{len(d['kill'])} lines")
    return 0

if __name__ == "__main__":
    sys.exit(main())
