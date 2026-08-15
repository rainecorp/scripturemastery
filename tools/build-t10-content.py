#!/usr/bin/env python3
"""Build the checked-in T10 Seminary packs from official Church pages.

This is an audit/generation tool, not part of the shipped app. It downloads
the official Doctrinal Mastery reference-and-phrase table plus the linked
scripture chapters, extracts exact verse text, reuses T9 IDs for exact
reference matches, and preserves generated IDs through data/t10-passage-ids.json.

Run from the repository root:
  python3 tools/build-t10-content.py
"""

from __future__ import annotations

import hashlib
import html
import json
import re
import secrets
import subprocess
import urllib.parse
from collections import defaultdict
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CORE_URL = (
    "https://www.churchofjesuschrist.org/study/manual/"
    "doctrinal-mastery-core-document-2023/"
    "doctrinal-mastery-passages-and-key-phrases?lang=eng"
)
ORIGIN = "https://www.churchofjesuschrist.org"
CACHE = Path("/tmp/scripture-quest-t10-official")
IDS_PATH = ROOT / "data/t10-passage-ids.json"
SOURCE_PATH = ROOT / "data/doctrinal-mastery-source.json"

COURSE_IDS = {
    "Old Testament": "ot",
    "New Testament": "nt",
    "Book of Mormon": "bom",
    "Doctrine and Covenants and Church History": "dc",
}

CAMPAIGNS = {
    "ot": {
        "id": "camp_dm_ot", "track": "seminary",
        "name": "The Tabernacle Tower", "shortName": "Old Testament / Pearl of Great Price",
        "subtitle": "Doctrinal Mastery · Current", "towerArt": {"kit": "tabernacle-tower", "baseWidth": 640},
        "hue": "#f59e0b", "soft": "rgba(245,158,11,.22)", "icon": "🔥",
        "tag": "Covenants, prophets, and the promised Messiah.", "order": 1,
        "status": "active", "group": "doctrinal",
    },
    "nt": {
        "id": "camp_dm_nt", "track": "seminary",
        "name": "The Jerusalem Tower", "shortName": "New Testament",
        "subtitle": "Doctrinal Mastery · Current", "towerArt": {"kit": "jerusalem-temple-tower", "baseWidth": 640},
        "hue": "#38bdf8", "soft": "rgba(56,189,248,.22)", "icon": "🕊️",
        "tag": "Walk with Christ through His gospel and grace.", "order": 2,
        "status": "active", "group": "doctrinal",
    },
    "bom": {
        "id": "camp_dm_bom", "track": "seminary",
        "name": "The Ancient America Tower", "shortName": "Book of Mormon",
        "subtitle": "Doctrinal Mastery · Current", "towerArt": {"kit": "ancient-america-temple", "baseWidth": 640},
        "hue": "#34d399", "soft": "rgba(52,211,153,.22)", "icon": "🌴",
        "tag": "Hold the rod. Climb to the tree.", "order": 3,
        "status": "active", "group": "doctrinal",
    },
    "dc": {
        "id": "camp_dm_dc", "track": "seminary",
        "name": "The Restoration Tower", "shortName": "Doctrine and Covenants / Church History",
        "subtitle": "Doctrinal Mastery · Current", "towerArt": {"kit": "restoration-temple", "baseWidth": 585},
        "hue": "#a78bfa", "soft": "rgba(167,139,250,.22)", "icon": "✨",
        "tag": "Hear the Lord's voice in the latter days.", "order": 4,
        "status": "active", "group": "doctrinal",
    },
}


def normalize_space(value: str) -> str:
    return re.sub(r"\s+", " ", value.replace("\xa0", " ")).strip()


def normalize_ref(value: str) -> str:
    value = normalize_space(value)
    return value.replace("Doctrine and Covenants ", "D&C ")


def fetch(url: str) -> str:
    CACHE.mkdir(parents=True, exist_ok=True)
    key = hashlib.sha256(url.encode()).hexdigest() + ".html"
    path = CACHE / key
    if not path.exists():
        subprocess.run([
            "curl", "--fail", "--location", "--silent", "--show-error",
            "--user-agent", "ScriptureQuestContentAudit/1.0", "--output", str(path), url,
        ], check=True)
    return path.read_text(encoding="utf-8")


class CoreParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.heading = False
        self.heading_text: list[str] = []
        self.course: str | None = None
        self.in_p = False
        self.p_text: list[str] = []
        self.ref: str | None = None
        self.href: str | None = None
        self.rows: list[dict[str, str]] = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "h2":
            self.heading = True
            self.heading_text = []
        elif tag == "p" and self.course in COURSE_IDS:
            self.in_p = True
            self.p_text = []
            self.ref = None
            self.href = None
        elif tag == "a" and self.in_p and "scripture-ref" in attrs.get("class", "").split():
            self.href = attrs.get("href")

    def handle_data(self, data):
        if self.heading:
            self.heading_text.append(data)
        if self.in_p:
            self.p_text.append(data)
            if self.href and self.ref is None:
                # The scripture-ref anchor is the first meaningful text in each row.
                candidate = normalize_space("".join(self.p_text))
                if re.search(r"\d+:\d", candidate):
                    self.ref = candidate

    def handle_endtag(self, tag):
        if tag == "h2" and self.heading:
            title = normalize_space("".join(self.heading_text))
            self.course = title if title in COURSE_IDS else None
            self.heading = False
        elif tag == "p" and self.in_p:
            text = normalize_space("".join(self.p_text))
            if self.ref and self.href and text.startswith(self.ref):
                phrase = text[len(self.ref):].lstrip(" :")
                self.rows.append({
                    "course": COURSE_IDS[self.course],
                    "ref": normalize_ref(self.ref),
                    "keyPhrase": phrase,
                    "href": self.href,
                })
            self.in_p = False


class VerseParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.current: int | None = None
        self.skip_depth = 0
        self.parts: list[str] = []
        self.verses: dict[int, str] = {}

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        classes = attrs.get("class", "").split()
        if tag == "p" and "verse" in classes and re.fullmatch(r"p\d+", attrs.get("id", "")):
            self.current = int(attrs["id"][1:])
            self.parts = []
            self.skip_depth = 0
        elif self.current is not None and (
            (tag == "span" and "verse-number" in classes) or
            (tag == "sup" and "marker" in classes)
        ):
            self.skip_depth += 1
        elif self.current is not None and self.skip_depth:
            self.skip_depth += 1

    def handle_endtag(self, tag):
        if self.current is not None and self.skip_depth:
            self.skip_depth -= 1
        elif tag == "p" and self.current is not None:
            value = normalize_space("".join(self.parts))
            self.verses[self.current] = re.sub(r"^¶\s*", "", value)
            self.current = None

    def handle_data(self, data):
        if self.current is not None and not self.skip_depth:
            self.parts.append(data)


def parse_reference(ref: str) -> list[int]:
    match = re.match(r"^.*?\s+\d+:(.+)$", ref)
    if not match:
        raise ValueError(f"Cannot parse reference: {ref}")
    verses: list[int] = []
    for part in match.group(1).split(","):
        range_match = re.fullmatch(r"\s*(\d+)(?:[–—-](\d+))?\s*", part)
        if not range_match:
            raise ValueError(f"Cannot parse verse range: {ref}")
        start = int(range_match.group(1))
        end = int(range_match.group(2) or start)
        if end < start:
            lead = str(start)[: len(str(start)) - len(str(end))]
            end = int(lead + str(end))
        verses.extend(range(start, end + 1))
    return verses


def chapter_url(href: str) -> str:
    absolute = urllib.parse.urljoin(ORIGIN, html.unescape(href))
    parsed = urllib.parse.urlsplit(absolute)
    return urllib.parse.urlunsplit((parsed.scheme, parsed.netloc, parsed.path, "lang=eng", ""))


def text_for(row: dict[str, str], cache: dict[str, dict[int, str]]) -> str:
    url = chapter_url(row["href"])
    if url not in cache:
        parser = VerseParser()
        parser.feed(fetch(url))
        cache[url] = parser.verses
    numbers = parse_reference(row["ref"])
    missing = [number for number in numbers if number not in cache[url]]
    if missing:
        raise RuntimeError(f"Missing verses {missing} for {row['ref']} at {url}")
    return " ".join(cache[url][number] for number in numbers)


def retired_passages() -> dict[str, dict[str, str]]:
    source = (ROOT / "data/passages.js").read_text(encoding="utf-8")
    pattern = re.compile(
        r'"id"\s*:\s*("(?:\\.|[^"\\])*")\s*,\s*'
        r'"ref"\s*:\s*("(?:\\.|[^"\\])*")\s*,\s*'
        r'"topic"\s*:\s*("(?:\\.|[^"\\])*")\s*,\s*'
        r'"texts"\s*:\s*\{\s*"lds2013"\s*:\s*("(?:\\.|[^"\\])*")\s*\}',
        re.S,
    )
    result = {}
    for match in pattern.finditer(source):
        passage_id, ref, topic, text = (json.loads(value) for value in match.groups())
        result[ref] = {"id": passage_id, "topic": topic, "text": text}
    if len(result) != 100:
        raise RuntimeError(f"Expected 100 retired passages, parsed {len(result)}")
    return result


def load_ids() -> dict[str, str]:
    return json.loads(IDS_PATH.read_text()) if IDS_PATH.exists() else {}


def opaque_id(used: set[str]) -> str:
    while True:
        candidate = "p_" + secrets.token_hex(4)
        if candidate not in used:
            used.add(candidate)
            return candidate


def js(value) -> str:
    # Generated content stays reviewable in git; one 40 KB line would hide the
    # exact passage or phrase that changed on a future source refresh.
    return json.dumps(value, ensure_ascii=False, indent=2)


def topic_for(phrase: str) -> str:
    value = phrase.translate(str.maketrans("", "", "“”\"[]"))
    return value[0].upper() + value[1:] if value else "Doctrinal Mastery"


def fnv_hash(text: str) -> str:
    # Match js/00-verify.js over UTF-16 code units, including astral chars.
    encoded = text.encode("utf-16-le")
    units = [encoded[i] | (encoded[i + 1] << 8) for i in range(0, len(encoded), 2)]
    a, b = 0x811C9DC5, 0x01000193
    for code in units:
        a ^= code
        a = (a * 0x01000193) & 0xFFFFFFFF
        b = (b + code) & 0xFFFFFFFF
        b = (b * 0x85EBCA6B) & 0xFFFFFFFF
        b ^= b >> 13
    return f"fnv1a:{a:08x}{b:08x}:{len(units)}"


def write_dm(rows, retired, ids, official_text):
    novel = []
    passage_meta = {}
    courses = defaultdict(list)
    for row in rows:
        ref = row["ref"]
        if ref in retired:
            passage_id = retired[ref]["id"]
            if retired[ref]["text"] != official_text[ref]:
                raise RuntimeError(f"Stored retired text differs from the official page for shared passage {ref}")
        else:
            passage_id = ids[ref]
            novel.append({
                "id": passage_id,
                "ref": ref,
                "topic": topic_for(row["keyPhrase"]),
                "keyPhrase": row["keyPhrase"],
                "texts": {"lds2013": official_text[ref]},
                "source": "builtin",
            })
        passage_meta[passage_id] = {"keyPhrase": row["keyPhrase"]}
        courses[row["course"]].append(passage_id)

    lines = [
        "/* doctrinal-mastery.js — official 2023 Doctrinal Mastery pack (T10)",
        "   Generated by tools/build-t10-content.py from the official Core Document.",
        "   IDs are persisted in data/t10-passage-ids.json; never derive them from text. */",
        "const DOCTRINAL_MASTERY_PASSAGES = " + js(novel) + ";",
        "const DOCTRINAL_MASTERY_CAMPAIGNS = " + js([
            {**CAMPAIGNS[key], "passageIds": courses[key]} for key in ("ot", "nt", "bom", "dc")
        ]) + ";",
        "const DOCTRINAL_MASTERY_META = " + js(passage_meta) + ";",
        "SQ.registerContentPack({",
        '  id:"seminary-doctrinal-mastery-2023",',
        '  track:{id:"seminary",name:"Seminary — Doctrinal Mastery",',
        '    campaignIds:["camp_dm_ot","camp_dm_nt","camp_dm_bom","camp_dm_dc","camp_aof","camp_retired_ot","camp_retired_nt","camp_retired_bom","camp_retired_dc"],',
        '    defaultTranslation:"lds2013",startingCampaignId:"camp_dm_bom",extraPacks:["seminary-articles-of-faith","seminary-retired-scripture-mastery"]},',
        "  passages:DOCTRINAL_MASTERY_PASSAGES,",
        "  campaigns:DOCTRINAL_MASTERY_CAMPAIGNS,",
        "  passageMeta:DOCTRINAL_MASTERY_META",
        "});",
        "",
    ]
    (ROOT / "data/doctrinal-mastery.js").write_text("\n".join(lines), encoding="utf-8")


def write_articles(ids, chapter_cache):
    row = {
        "href": "/study/scriptures/pgp/a-of-f/1?lang=eng",
        "ref": "Articles of Faith 1:1",
    }
    url = chapter_url(row["href"])
    if url not in chapter_cache:
        parser = VerseParser()
        parser.feed(fetch(url))
        chapter_cache[url] = parser.verses
    passages = []
    for number in range(1, 14):
        ref = f"Articles of Faith 1:{number}"
        passages.append({
            "id": ids[ref], "ref": ref, "topic": f"Article of Faith {number}",
            "texts": {"lds2013": chapter_cache[url][number]}, "source": "builtin",
        })
    campaign = {
        "id": "camp_aof", "track": "seminary", "name": "The Articles of Faith Tower",
        "shortName": "Articles of Faith", "subtitle": "Thirteen declarations of belief",
        "towerArt": {"kit": "restoration-temple", "baseWidth": 585},
        "hue": "#f472b6", "soft": "rgba(244,114,182,.22)", "icon": "📜",
        "tag": "Thirteen articles. One clear statement of faith.", "order": 10,
        "status": "active", "group": "articles", "passageIds": [p["id"] for p in passages],
    }
    lines = [
        "/* articles-of-faith.js — Articles of Faith pack (T10)",
        "   Generated from the official current-edition scripture page. */",
        "const ARTICLES_OF_FAITH_PASSAGES = " + js(passages) + ";",
        "const ARTICLES_OF_FAITH_CAMPAIGN = " + js(campaign) + ";",
        "SQ.registerContentPack({id:\"seminary-articles-of-faith\",defaultTranslation:\"lds2013\",",
        "  passages:ARTICLES_OF_FAITH_PASSAGES,campaigns:[ARTICLES_OF_FAITH_CAMPAIGN]});",
        "",
    ]
    (ROOT / "data/articles-of-faith.js").write_text("\n".join(lines), encoding="utf-8")
    return passages


def write_sources(new_passages):
    records = {}
    for passage in new_passages:
        text = passage["texts"]["lds2013"]
        records[passage["ref"]] = {
            "hash": fnv_hash(text),
            "source": "Current edition (churchofjesuschrist.org)",
            "verifiedAt": "2026-08-14",
            "by": "extracted from the official chapter page by tools/build-t10-content.py",
        }
    lines = [
        "/* text-sources-t10.js — provenance added with T10. Generated by the",
        "   official-page extractor; loaded after data/text-sources.js. */",
        "Object.assign(TEXT_SOURCES," + js(records) + ");",
        "",
    ]
    (ROOT / "data/text-sources-t10.js").write_text("\n".join(lines), encoding="utf-8")


def main():
    core = CoreParser()
    core.feed(fetch(CORE_URL))
    counts = {key: 0 for key in COURSE_IDS.values()}
    for row in core.rows:
        counts[row["course"]] += 1
    # As retrieved on 2026-08-14, the official table has 24 per course. The
    # roadmap deliberately warns not to trust older 25-per-course summaries.
    if counts != {"ot": 24, "nt": 24, "bom": 24, "dc": 24}:
        raise RuntimeError(f"Official course counts changed: {counts}")

    retired = retired_passages()
    ids = load_ids()
    used = {entry["id"] for entry in retired.values()} | set(ids.values())
    chapter_cache: dict[str, dict[int, str]] = {}
    official_text = {}
    for row in core.rows:
        official_text[row["ref"]] = text_for(row, chapter_cache)

    needed_refs = [row["ref"] for row in core.rows if row["ref"] not in retired]
    needed_refs.extend(f"Articles of Faith 1:{number}" for number in range(1, 14))
    for ref in needed_refs:
        if ref not in ids:
            ids[ref] = opaque_id(used)
    IDS_PATH.write_text(json.dumps(dict(sorted(ids.items())), ensure_ascii=False, indent=2) + "\n")

    SOURCE_PATH.write_text(json.dumps({
        "source": CORE_URL,
        "retrievedAt": "2026-08-14",
        "courses": [
            {"id": key, "passages": [
                {"ref": row["ref"], "keyPhrase": row["keyPhrase"]}
                for row in core.rows if row["course"] == key
            ]} for key in ("ot", "nt", "bom", "dc")
        ],
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    write_dm(core.rows, retired, ids, official_text)
    article_passages = write_articles(ids, chapter_cache)
    novel_dm = [
        {"ref": row["ref"], "texts": {"lds2013": official_text[row["ref"]]}}
        for row in core.rows if row["ref"] not in retired
    ]
    write_sources(novel_dm + article_passages)
    print(f"official Doctrinal Mastery rows: {len(core.rows)} ({counts})")
    print(f"shared with retired pack: {len(core.rows) - len(novel_dm)}")
    print(f"new Doctrinal Mastery passages: {len(novel_dm)}")
    print(f"Articles of Faith passages: {len(article_passages)}")
    print(f"chapter pages fetched/parsed: {len(chapter_cache)}")


if __name__ == "__main__":
    main()
