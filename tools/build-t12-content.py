#!/usr/bin/env python3
"""Generate the T12 Christian content pack from public-domain BSB and KJV text.

The small curriculum and permanent opaque IDs are checked in. Chapter JSON is
downloaded from the Free Use Bible API and cached outside the repository so a
rerun is deterministic after the first fetch.
"""
from __future__ import annotations

import json
import re
import secrets
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CURRICULUM = ROOT / "data/christian-curriculum.json"
IDS = ROOT / "data/t12-passage-ids.json"
PACK = ROOT / "data/christian.js"
PROVENANCE = ROOT / "data/text-sources-christian.js"
CACHE = Path("/tmp/scripture-quest-t12-bible")
API = "https://bible.helloao.org/api"
BOOK_IDS = {
    "Genesis":"GEN", "Deuteronomy":"DEU", "Joshua":"JOS", "Psalm":"PSA",
    "Proverbs":"PRO", "Isaiah":"ISA", "Jeremiah":"JER", "Micah":"MIC",
    "Matthew":"MAT", "Mark":"MRK", "Luke":"LUK", "John":"JHN", "Acts":"ACT",
    "Romans":"ROM", "1 Corinthians":"1CO", "2 Corinthians":"2CO", "Galatians":"GAL",
    "Ephesians":"EPH", "Philippians":"PHP", "Colossians":"COL", "1 Timothy":"1TI",
    "2 Timothy":"2TI", "Hebrews":"HEB", "James":"JAS", "1 Peter":"1PE", "1 John":"1JN"
}
TRANSLATIONS = {"bsb":"BSB", "kjv":"eng_kjv"}


def fetch(translation: str, book: str, chapter: int) -> dict:
    CACHE.mkdir(parents=True, exist_ok=True)
    path = CACHE / f"{translation}-{book}-{chapter}.json"
    if not path.exists():
        url = f"{API}/{translation}/{book}/{chapter}.json"
        subprocess.run(["curl", "--fail", "--location", "--silent", "--show-error",
                        "--output", str(path), url], check=True)
    return json.loads(path.read_text())


def parse_ref(ref: str) -> tuple[str, int, int, int]:
    match = re.fullmatch(r"(.+?) (\d+):(\d+)(?:[–-](\d+))?", ref)
    if not match:
        raise ValueError(f"Unsupported reference: {ref}")
    book, chapter, first, last = match.groups()
    return book, int(chapter), int(first), int(last or first)


def verse_text(verse: dict) -> str:
    parts = []
    for item in verse.get("content", []):
        if isinstance(item, str):
            parts.append(item)
        elif isinstance(item, dict) and isinstance(item.get("text"), str):
            parts.append(item["text"])
    text = " ".join(part.strip() for part in parts if part.strip()).strip()
    return re.sub(r"\s+([,.;:!?…’”\"'])", r"\1", text)


def passage_text(payload: dict, first: int, last: int) -> str:
    verses = {item["number"]: verse_text(item) for item in payload["chapter"]["content"]
              if item.get("type") == "verse"}
    missing = [number for number in range(first, last + 1) if number not in verses]
    if missing:
        raise ValueError(f"Missing verses {missing}")
    return " ".join(verses[number] for number in range(first, last + 1))


def text_hash(text: str) -> str:
    a, b = 0x811c9dc5, 0x01000193
    for char in text:
        code = ord(char)
        a ^= code
        a = (a * 0x01000193) & 0xffffffff
        b = (b + code) & 0xffffffff
        b = (b * 0x85ebca6b) & 0xffffffff
        b ^= b >> 13
    return f"fnv1a:{a:08x}{b:08x}:{len(text)}"


def js(value) -> str:
    return json.dumps(value, ensure_ascii=False, indent=2)


def main() -> None:
    curriculum = json.loads(CURRICULUM.read_text())
    ids = json.loads(IDS.read_text()) if IDS.exists() else {}
    existing: dict[str, str] = {}
    for name in ("passages.js", "articles-of-faith.js", "doctrinal-mastery.js"):
        authored = (ROOT / "data" / name).read_text()
        for passage_id, ref in re.findall(r'"id"\s*:\s*"(p_[0-9a-f]{8})"\s*,\s*"ref"\s*:\s*"([^"]+)"', authored):
            existing[ref] = passage_id
    rows: dict[str, dict] = {}
    source_records: dict[str, dict] = {}
    source_versions: dict[str, str] = {}

    for campaign in curriculum["campaigns"]:
        if len(campaign["passages"]) != 20:
            raise ValueError(f'{campaign["id"]} must contain exactly 20 passages')
        for ref, topic in campaign["passages"]:
            if ref in existing:
                ids[ref] = existing[ref]
            else:
                ids.setdefault(ref, "p_" + secrets.token_hex(4))
            row = rows.setdefault(ref, {"id": ids[ref], "ref": ref, "topic": topic, "texts": {}})
            if row["topic"] != topic:
                raise ValueError(f"Shared reference has conflicting topics: {ref}")
            book, chapter, first, last = parse_ref(ref)
            for key, translation in TRANSLATIONS.items():
                payload = fetch(translation, BOOK_IDS[book], chapter)
                text = passage_text(payload, first, last)
                row["texts"][key] = text
                source = payload.get("translation", {})
                source_versions[key] = source.get("sha256", source.get("name", translation))
                source_records[f'{ids[ref]}:{key}'] = {
                    "hash": text_hash(text),
                    "source": "Berean Standard Bible (public domain) via Free Use Bible API" if key == "bsb"
                              else "King James Version (public domain in the United States) via Free Use Bible API",
                    "verifiedAt": "2026-08-14",
                    "by": "generated directly from the API chapter JSON"
                }

    IDS.write_text(js(dict(sorted(ids.items()))) + "\n")
    ordered = list(rows.values())
    passage_ids = {row["ref"]: row["id"] for row in ordered}
    campaigns = []
    for order, item in enumerate(curriculum["campaigns"], 1):
        campaigns.append({
            "id": item["id"], "track": "christian", "name": item["name"],
            "shortName": item["shortName"], "subtitle": "Christian Scripture Memory",
            "towerArt": {"kit": item["kit"], "baseWidth": 640}, "hue": item["hue"],
            "soft": item["soft"], "icon": item["icon"], "tag": item["tag"],
            "order": order, "status": "active", "group": "christian",
            "passageIds": [passage_ids[ref] for ref, _ in item["passages"]]
        })
    track = {
        "id": "christian", "name": "Christian Scripture Memory",
        "defaultTranslation": "bsb", "translations": ["bsb", "kjv"],
        "campaignIds": [item["id"] for item in campaigns], "extraPacks": [],
        "startingCampaignId": "camp_christian_foundations"
    }
    novel = [row for row in ordered if row["ref"] not in existing]
    passage_meta = {
        row["id"]: {"texts": row["texts"], "topics": {"christian": row["topic"]}}
        for row in ordered if row["ref"] in existing
    }
    pack = {"id": "christian-starter", "version": "2026.08", "defaultTranslation": "bsb",
            "passages": novel, "campaigns": campaigns, "passageMeta": passage_meta, "track": track}
    PACK.write_text("/* Generated by tools/build-t12-content.py. */\nSQ.registerContentPack(" + js(pack) + ");\n")
    PROVENANCE.write_text(
        "/* Generated T12 BSB/KJV provenance. Source translation fingerprints: " +
        ", ".join(f"{k}={v}" for k, v in sorted(source_versions.items())) + " */\n" +
        "Object.assign(TEXT_SOURCES, " + js(dict(sorted(source_records.items()))) + ");\n"
    )
    print(f"Generated {len(ordered)} Christian references ({len(passage_meta)} shared identities, {len(novel)} novel), 6 campaigns × 20 memberships, and {len(source_records)} translation records.")


if __name__ == "__main__":
    main()
