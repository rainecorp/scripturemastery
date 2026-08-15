# Christian track text sources

T12 ships two text editions for every Christian-track passage:

- **Berean Standard Bible (BSB)** — the Christian-track default. The BSB has
  been in the public domain since April 30, 2023. Licensing statement:
  <https://berean.bible/licensing.htm>
- **King James Version (KJV)** — public domain in the United States. The exact
  API source is the `eng_kjv` King James (Authorized) Version corpus.

The selected chapter JSON comes from the Free Use Bible API:
<https://bible.helloao.org/docs/reference/>. Its translation records point
back to the underlying eBible distributions and expose a SHA-256 fingerprint
for each complete source edition.

`tools/build-t12-content.py` downloads only the chapters required by the
checked-in `christian-curriculum.json`, ignores headings and study notes,
preserves the verse text, and joins multi-verse passages in reference order.
It then writes:

- `christian.js` — the browser-ready Passage, Campaign, and Track records;
- `text-sources-christian.js` — a separate FNV provenance claim for every
  passage/translation pair;
- `t12-passage-ids.json` — the permanent opaque identity for each reference.

Seven references already existed in the Seminary catalog. The generator
reuses those IDs and adds BSB/KJV text to the same canonical Passage so study
progress carries between tracks. Christian topics are kept separate from
Seminary key phrases, and the latter are never exposed in Christian mode.

To rebuild from the repository root:

```sh
python3 tools/build-t12-content.py
```

Downloaded chapter JSON is cached in `/tmp/scripture-quest-t12-bible`, outside
the repository. Delete that cache only when intentionally auditing a newer
upstream source fingerprint; then review every generated text and provenance
diff before committing it.
