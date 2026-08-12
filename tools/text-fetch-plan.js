/* text-fetch-plan.js — step 1 of the T4 text verification (audit tool, not CI)
   ===========================================================================
   Builds the fetch plan: one entry per chapter page on
   churchofjesuschrist.org, listing which of our passages live on it and which
   verses each needs. 100 passages collapse to 87 pages.

   The three-step protocol, for whoever repeats this:
     1. node tools/text-fetch-plan.js plan.json
     2. Fetch each page and record the verses verbatim into a JSON of the
        shape {"<page key>": {"<verse>": "<text>"}}. This step is manual —
        there is no API, and it is the step that needs a careful reader.
     3. node tools/text-compare.js  → the report behind data/TEXT-REVIEW.md

   Book -> churchofjesuschrist.org slug. Note that abbreviated verse ranges
   ("D&C 88:123–24" meaning 123–124) are expanded here; missing that silently
   drops the passage from the plan, which is how it was first written.
   =========================================================================== */
const fs = require("fs");
const ROOT = "/Users/boss-mode/Documents/scripture mastery/scripture-tower";
let CONTENT_PACK = null;
const SQ = {registerContentPack(pack){ CONTENT_PACK = pack; }};
eval(fs.readFileSync(ROOT + "/data/passages.js", "utf8"));
if(!CONTENT_PACK) throw new Error("Seminary content pack did not register.");

const OT = {
  "Genesis":"gen","Exodus":"ex","Leviticus":"lev","Numbers":"num","Deuteronomy":"deut",
  "Joshua":"josh","Judges":"judg","Ruth":"ruth","1 Samuel":"1-sam","2 Samuel":"2-sam",
  "1 Kings":"1-kgs","2 Kings":"2-kgs","Job":"job","Psalm":"ps","Psalms":"ps","Proverbs":"prov",
  "Ecclesiastes":"eccl","Isaiah":"isa","Jeremiah":"jer","Lamentations":"lam","Ezekiel":"ezek",
  "Daniel":"dan","Hosea":"hosea","Joel":"joel","Amos":"amos","Jonah":"jonah","Micah":"micah",
  "Habakkuk":"hab","Zechariah":"zech","Malachi":"mal"
};
const NT = {
  "Matthew":"matt","Mark":"mark","Luke":"luke","John":"john","Acts":"acts","Romans":"rom",
  "1 Corinthians":"1-cor","2 Corinthians":"2-cor","Galatians":"gal","Ephesians":"eph",
  "Philippians":"philip","Colossians":"col","1 Thessalonians":"1-thes","2 Thessalonians":"2-thes",
  "1 Timothy":"1-tim","2 Timothy":"2-tim","Titus":"titus","Hebrews":"heb","James":"james",
  "1 Peter":"1-pet","2 Peter":"2-pet","1 John":"1-jn","Jude":"jude","Revelation":"rev"
};
const BOFM = {
  "1 Nephi":"1-ne","2 Nephi":"2-ne","Jacob":"jacob","Enos":"enos","Jarom":"jarom","Omni":"omni",
  "Words of Mormon":"w-of-m","Mosiah":"mosiah","Alma":"alma","Helaman":"hel","3 Nephi":"3-ne",
  "4 Nephi":"4-ne","Mormon":"morm","Ether":"ether","Moroni":"moro"
};
const PGP = {"Moses":"moses","Abraham":"abr"};

function urlFor(book, ch){
  if(book === "D&C") return `https://www.churchofjesuschrist.org/study/scriptures/dc-testament/dc/${ch}?lang=eng`;
  if(book === "Joseph Smith—History") return `https://www.churchofjesuschrist.org/study/scriptures/pgp/js-h/1?lang=eng`;
  if(book === "Articles of Faith") return `https://www.churchofjesuschrist.org/study/scriptures/pgp/a-of-f/1?lang=eng`;
  if(PGP[book])  return `https://www.churchofjesuschrist.org/study/scriptures/pgp/${PGP[book]}/${ch}?lang=eng`;
  if(BOFM[book]) return `https://www.churchofjesuschrist.org/study/scriptures/bofm/${BOFM[book]}/${ch}?lang=eng`;
  if(NT[book])   return `https://www.churchofjesuschrist.org/study/scriptures/nt/${NT[book]}/${ch}?lang=eng`;
  if(OT[book])   return `https://www.churchofjesuschrist.org/study/scriptures/ot/${OT[book]}/${ch}?lang=eng`;
  return null;
}

/* "D&C 18:10, 15–16" -> {book:"D&C", ch:18, verses:[10,15,16]} */
function parseRef(ref){
  const m = ref.match(/^(.*?)\s+(\d+):(.+)$/);
  if(!m) return null;
  const book = m[1], ch = parseInt(m[2],10);
  const verses = [];
  m[3].split(",").forEach(part=>{
    const r = part.trim().match(/^(\d+)(?:[–—-](\d+))?$/);
    if(!r) return;
    const a = parseInt(r[1],10);
    let b = r[2] ? parseInt(r[2],10) : a;
    /* Abbreviated ranges: "123–24" means 123–124, "88:123-24" style. Rebuild
       the end from the start's leading digits when it reads as smaller. */
    if(b < a){
      const lead = String(a).slice(0, String(a).length - String(b).length);
      const wide = parseInt(lead + String(b), 10);
      if(wide > a) b = wide;
    }
    for(let i=a;i<=b;i++) verses.push(i);
  });
  return {book, ch, verses};
}

const byUrl = new Map();
const unmapped = [];
CONTENT_PACK.passages.forEach(v=>{
  const p = parseRef(v.ref);
  if(!p){ unmapped.push(v.ref + "  (unparsed)"); return; }
  const url = urlFor(p.book, p.ch);
  if(!url){ unmapped.push(v.ref + "  (no slug for book: " + p.book + ")"); return; }
  if(!byUrl.has(url)) byUrl.set(url, []);
  byUrl.get(url).push({ref:v.ref, verses:p.verses, text:v.text});
});

const plan = [...byUrl.entries()].map(([url, refs])=>({url, refs}));
fs.writeFileSync(process.argv[2] || "/tmp/plan.json", JSON.stringify(plan, null, 1));
console.log("chapter pages:", plan.length);
console.log("passages mapped:", plan.reduce((n,p)=>n+p.refs.length,0));
if(unmapped.length){ console.log("UNMAPPED:"); unmapped.forEach(u=>console.log("  "+u)); }
