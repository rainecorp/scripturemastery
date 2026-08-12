/* text-sources.js — the provenance record (T4)
   ===========================================================================
   One entry per passage whose text has actually been checked against an
   authoritative edition, keyed by reference exactly as it appears in
   data/passages.js.

   Format:

     "1 Nephi 3:7": {
       hash:       "fnv1a:…",       // textHash() of the text that was checked
       source:     "Current edition (churchofjesuschrist.org)",
       verifiedAt: "2026-08-11",    // ISO date the check happened
       by:         "who or what did the checking"
     },

   Get the hash line for a passage you have just checked by hand by running
   this in the browser console:

     copy(sourceRecordFor(allPassages().find(v=>v.ref === "1 Nephi 3:7"),
                          "Current edition (churchofjesuschrist.org)", "your name"))

   RULES:
     - Add an entry only after the passage has genuinely been compared to the
       source, including punctuation. This file is a claim that the check
       happened. An entry added on faith is worse than no entry, because the
       app stops warning about the passage.
     - Never edit a hash to make a warning go away. If the text changed, the
       passage needs re-checking; that is the entire point of the mechanism.
     - Re-verifying? Replace hash, verifiedAt and by together.

   CURRENT STATE: all 100 passages recorded, 21 of them checked against the
   chapter page's own rendered text and the remaining 79 against a text fetch
   of the same page. The distinction is in each entry's "by" field and it
   matters: the fetch is mediated by a summarizing model, which was caught
   silently normalizing curly apostrophes to straight ones. Every passage
   whose text contains an apostrophe or a quotation mark was therefore
   re-read from the page directly.

   Trust order, highest first: a person reading a printed edition, the page's
   own text, a text fetch of the page. Upgrade an entry when you can; never
   downgrade one silently.
   =========================================================================== */
const TEXT_SOURCES = {
  "Moses 1:39": {hash:"fnv1a:70d0dd572e7b01c4:98", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Moses 7:18": {hash:"fnv1a:4aa6a1240e19cfe2:143", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Abraham 3:22–23": {hash:"fnv1a:53cd8c57447298bb:455", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Genesis 1:26–27": {hash:"fnv1a:b6ac7d1fa0f7acf7:357", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Genesis 39:9": {hash:"fnv1a:0c81772f23c68787:186", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page's own text"},
  "Exodus 20:3–17": {hash:"fnv1a:038c9c6d4a954515:1558", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page's own text"},
  "Exodus 33:11": {hash:"fnv1a:98ba815fda01bc1a:202", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Leviticus 19:18": {hash:"fnv1a:1660d99223728785:139", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Deuteronomy 7:3–4": {hash:"fnv1a:d0c75232da472c9b:302", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Joshua 1:8": {hash:"fnv1a:8bdeb0a0d83adbd5:259", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Joshua 24:15": {hash:"fnv1a:8ae74563d308ad28:277", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "1 Samuel 16:7": {hash:"fnv1a:41a663d8fdb3be47:235", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Job 19:25–26": {hash:"fnv1a:69b9902c7b886c33:176", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Psalm 24:3–4": {hash:"fnv1a:b62d6d67bc3971b8:193", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Proverbs 3:5–6": {hash:"fnv1a:c6efd1b3f5f6cc41:146", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Isaiah 1:18": {hash:"fnv1a:3d8e55bdf1b540a5:173", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Isaiah 29:13–14": {hash:"fnv1a:8afd4d70dcda3591:432", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Isaiah 53:3–5": {hash:"fnv1a:cbf2fe9164f0a906:443", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Isaiah 55:8–9": {hash:"fnv1a:e71ba0728ddfadd9:205", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Jeremiah 16:16": {hash:"fnv1a:6104ca87308d46ad:221", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Ezekiel 37:15–17": {hash:"fnv1a:2c5d411fd6a984b9:385", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Daniel 2:44–45": {hash:"fnv1a:263d056438073aa7:553", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Amos 3:7": {hash:"fnv1a:6ace82a194129b93:96", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Malachi 3:8–10": {hash:"fnv1a:db77735339391d93:444", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page's own text"},
  "Malachi 4:5–6": {hash:"fnv1a:d68e330b38b19c31:257", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Matthew 5:14–16": {hash:"fnv1a:150091ce23ff0549:322", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Matthew 6:24": {hash:"fnv1a:c27a0d9ad98de131:170", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Matthew 16:15–19": {hash:"fnv1a:f1dc339703f97d57:624", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Matthew 25:40": {hash:"fnv1a:dc479551b8722939:164", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Luke 24:36–39": {hash:"fnv1a:c67732dded9d18ba:401", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "John 3:5": {hash:"fnv1a:93c961f58eaac673:138", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "John 7:17": {hash:"fnv1a:add0b035f6b67b8b:111", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "John 10:16": {hash:"fnv1a:a436cc6a4cfd8a6a:152", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "John 14:15": {hash:"fnv1a:3321dbdf8f6c2247:36", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "John 17:3": {hash:"fnv1a:c9b456bae16edc6c:109", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Acts 7:55–56": {hash:"fnv1a:a590a8c929a840e6:241", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page's own text"},
  "Romans 1:16": {hash:"fnv1a:52f53c559fc6f422:157", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "1 Corinthians 10:13": {hash:"fnv1a:c44ecfdc5bc426ed:235", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "1 Corinthians 15:20–22": {hash:"fnv1a:e1b29b695de800d1:228", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "1 Corinthians 15:29": {hash:"fnv1a:8e7c5001d0a73cda:126", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "1 Corinthians 15:40–42": {hash:"fnv1a:f67a0ce0431cb892:382", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Ephesians 4:11–14": {hash:"fnv1a:b19646fffd3afaea:558", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page's own text"},
  "2 Thessalonians 2:1–3": {hash:"fnv1a:fd056d75597393f2:418", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "2 Timothy 3:1–5": {hash:"fnv1a:88d3214fa89bd834:460", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "2 Timothy 3:16–17": {hash:"fnv1a:e54dd662b7cd1759:217", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Hebrews 5:4": {hash:"fnv1a:e7c616e206811356:87", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "James 1:5–6": {hash:"fnv1a:a18e327776fb61df:251", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "James 2:17–18": {hash:"fnv1a:4f9cca4691c65a42:193", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Revelation 14:6–7": {hash:"fnv1a:280131be9cb3c290:368", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Revelation 20:12–13": {hash:"fnv1a:8e621a6227bd104c:406", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "1 Nephi 3:7": {hash:"fnv1a:4f173288d3976ebd:286", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "1 Nephi 19:23": {hash:"fnv1a:295a82d6aed28b24:311", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "2 Nephi 2:25": {hash:"fnv1a:12ab9d32300c038c:67", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "2 Nephi 2:27": {hash:"fnv1a:85834e375ea7b3df:351", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "2 Nephi 9:28–29": {hash:"fnv1a:1aca4d19759e669c:408", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "2 Nephi 28:7–9": {hash:"fnv1a:36ff0e2077f81a15:794", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page's own text"},
  "2 Nephi 32:3": {hash:"fnv1a:8fb8d3e83b77b673:223", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "2 Nephi 32:8–9": {hash:"fnv1a:2a7b85e4b7c4f79e:630", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Jacob 2:18–19": {hash:"fnv1a:304f1984221330bd:322", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page's own text"},
  "Mosiah 2:17": {hash:"fnv1a:36ad96a3d45d683e:173", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Mosiah 3:19": {hash:"fnv1a:5c46b3b57bbde93c:450", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Mosiah 4:30": {hash:"fnv1a:432c83170c43446b:327", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Alma 32:21": {hash:"fnv1a:b93ff22891788882:168", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page's own text"},
  "Alma 34:32–34": {hash:"fnv1a:dc4d1b8443455c45:817", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Alma 37:6–7": {hash:"fnv1a:58e2e47b9aabcb48:388", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Alma 37:35": {hash:"fnv1a:15f60b0d93e8b69d:108", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Alma 41:10": {hash:"fnv1a:7cb72a562cd6617d:171", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Helaman 5:12": {hash:"fnv1a:16ba4cd2e638d233:511", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "3 Nephi 11:29": {hash:"fnv1a:17ae0f133565052e:218", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "3 Nephi 27:27": {hash:"fnv1a:95fb8c7a37169cc8:210", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Ether 12:6": {hash:"fnv1a:5bf6809409a98900:254", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Ether 12:27": {hash:"fnv1a:96f2800a597b2246:301", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Moroni 7:16–17": {hash:"fnv1a:33eecfc189630f15:657", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Moroni 7:45": {hash:"fnv1a:9b9c290ffa6b2889:282", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Moroni 10:4–5": {hash:"fnv1a:9b933006fe35e94f:385", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "Joseph Smith—History 1:15–20": {hash:"fnv1a:c68c89ef58c8aa0b:2967", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page's own text"},
  "D&C 1:37–38": {hash:"fnv1a:817278a9c8fcd787:380", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "D&C 8:2–3": {hash:"fnv1a:9a0e990c9df547cd:297", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "D&C 10:5": {hash:"fnv1a:192032ba59a0e420:162", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "D&C 14:7": {hash:"fnv1a:a53fe7b44cb135e4:135", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "D&C 18:10, 15–16": {hash:"fnv1a:c66af5e2af4a7648:431", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "D&C 19:16–19": {hash:"fnv1a:1489fff50c243007:482", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page's own text"},
  "D&C 25:12": {hash:"fnv1a:37a02bbd1f8941cb:159", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "D&C 58:26–27": {hash:"fnv1a:2478971eaec2d589:328", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page's own text"},
  "D&C 58:42–43": {hash:"fnv1a:9fb83641e235e5aa:200", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page's own text"},
  "D&C 59:9–10": {hash:"fnv1a:70f8634d4de976c5:268", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "D&C 64:9–11": {hash:"fnv1a:57721382d1bc8ad3:400", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page's own text"},
  "D&C 64:23": {hash:"fnv1a:af2c93c03cdaf3ba:200", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page's own text"},
  "D&C 76:22–24": {hash:"fnv1a:098c62a950cce4bb:412", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page's own text"},
  "D&C 82:3": {hash:"fnv1a:74476747536d0d0b:134", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "D&C 82:10": {hash:"fnv1a:154193b58b7dc445:95", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "D&C 84:33–39": {hash:"fnv1a:37e3741bc5e992c6:674", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page's own text"},
  "D&C 88:123–24": {hash:"fnv1a:adb23b20e4fa4339:338", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "D&C 89:18–21": {hash:"fnv1a:ddb00fe28a749b8c:444", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
  "D&C 121:34–36": {hash:"fnv1a:b37fe2b42e6805c3:413", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page's own text"},
  "D&C 130:18–19": {hash:"fnv1a:d7f310f12c4d36b4:279", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page's own text"},
  "D&C 130:20–21": {hash:"fnv1a:98630696124cfeea:226", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page's own text"},
  "D&C 130:22–23": {hash:"fnv1a:77b6faea15126bb3:300", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page's own text"},
  "D&C 131:1–4": {hash:"fnv1a:4ebbb55653146290:335", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page's own text"},
  "D&C 137:7–10": {hash:"fnv1a:f211436c2d4e91d9:601", source:"Current edition (churchofjesuschrist.org)", verifiedAt:"2026-08-11", by:"compared to the chapter page via text fetch"},
};

/* ---- SQ registry ---- */
SQ.TEXT_SOURCES = TEXT_SOURCES;
