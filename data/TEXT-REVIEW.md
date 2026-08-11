# Text review — the 2026-08-11 edition diff

Every passage in `data/passages.js` was compared against its own chapter page
on churchofjesuschrist.org, which the project owner confirmed is the edition
this app ships. **82 of 100 matched character for character. 16 were wrong and
have been corrected. 2 turned out to be right after all.**

All 100 now carry a provenance record in `data/text-sources.js` and render a
green "Verified text" line in Study.

## How this was checked, and why that matters

Two methods, and the difference between them caught a real error:

1. **Text fetch** of each chapter page, through a summarizing model. Fast,
   and good enough for 79 passages.
2. **The page's own rendered text**, read directly out of the DOM. Slower,
   byte-accurate, no model in the loop. Used for the 21 passages on the 17
   pages where anything looked wrong.

Method 1 was **silently normalizing curly apostrophes to straight ones**. On
the strength of that alone, D&C 84:33–39 and D&C 130:22–23 looked like they
had the wrong apostrophe. Method 2 showed the page uses U+2019 and our text
was already correct. Had those "corrections" been applied automatically, the
result would have been two passages made wrong by the process meant to make
them right — and then certified as verified.

That is the whole argument for not auto-applying an automated diff, and for
recording in each entry's `by` field *how* it was checked.

**Trust order, highest first:** a person reading a printed edition · the
page's own text · a text fetch of the page. Upgrade an entry when you can;
never downgrade one silently.

## Effect on gameplay

None. All 16 corrections left their passage inside the same word-count band,
so no difficulty tier and no relic metal changed.

---

# What was corrected

`-` is what the app used to show. `+` is what it shows now.

## Class E · missing text — **1 passage, corrected**

### Joseph Smith—History 1:15–20

2609 → 2967 characters.

```diff
- destruction, not
+ destruction—not
- being, just
+ being—just
- other: This
+ other—This
- right, and
+ right (for at this time it had never entered into my heart that all were wrong)—and
- well — I
+ well—I It seems as though the adversary was aware, at a very early period of my life, that I was destined to prove a disturber and an annoyer of his kingdom; else why should the powers of darkness combine against me? Why the opposition and persecution that arose against me, almost in my infancy?
```

## Class A · modernized KJV wording — **5 passages, corrected**

### Genesis 39:9

185 → 186 characters.

```diff
- anything
+ any thing
```

### Exodus 20:3–17

1566 → 1558 characters.

```diff
- anything
+ any thing
- showing
+ shewing
- male servant,
+ manservant,
- female servant,
+ maidservant,
- male servant,
+ manservant,
- female servant,
+ maidservant,
- anything
+ any thing
```

### Malachi 3:8–10

443 → 444 characters.

```diff
- offering.
+ offerings.
```

### Acts 7:55–56

240 → 241 characters.

```diff
- stedfastly
+ steadfastly
```

### Ephesians 4:11–14

559 → 558 characters.

```diff
- fullness
+ fulness
```

## Class B · em dash flattened — **9 passages, corrected**

### 2 Nephi 28:7–9

795 → 794 characters.

```diff
- God, he
+ God—he
```

### Jacob 2:18–19

323 → 322 characters.

```diff
- good, to
+ good—to
```

### Alma 32:21

169 → 168 characters.

```diff
- faith, faith
+ faith—faith
```

### D&C 19:16–19

485 → 482 characters.

```diff
- spirit — and
+ spirit—and
- shrink —
+ shrink—
```

### D&C 58:42–43

202 → 200 characters.

```diff
- sins — behold,
+ sins—behold,
```

### D&C 64:9–11

402 → 400 characters.

```diff
- hearts — let
+ hearts—let
```

### D&C 76:22–24

413 → 412 characters.

```diff
- Father —
+ Father—
```

### D&C 121:34–36

414 → 413 characters.

```diff
- lesson —
+ lesson—
```

### D&C 130:20–21

227 → 226 characters.

```diff
- predicated —
+ predicated—
```

## Class C · editorial brackets dropped — **1 passage, corrected**

### D&C 131:1–4

333 → 335 characters.

```diff
- meaning
+ [meaning
- marriage;
+ marriage];
```

## Class D · apostrophe shape — **2 passages, no change needed**

**D&C 84:33–39** and **D&C 130:22–23**. The text fetch reported `man's` and
`Father's` with a straight ASCII apostrophe where our text has the curly
U+2019. Reading the page directly showed U+2019 in both places: the fetch was
normalizing, our text was correct. Both are now verified by page text.
