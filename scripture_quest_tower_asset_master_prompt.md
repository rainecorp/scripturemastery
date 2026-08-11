# Scripture Quest Tower Asset Kit
## Master production specification and AI prompt

This document defines how to create additional climbable tower designs that fit the existing Scripture Quest tower renderer without gaps, jumps, resizing errors, or misaligned glowing windows.

---

# 1. Existing tower system

The tower is not one tall image. It is assembled vertically from five transparent PNG assets:

1. A roof/crown for Floor 25
2. A special upper window for Floor 24
3. One repeatable middle-floor segment used 22 times for Floors 2–23
4. A special first-floor segment
5. A bottom/base and landscaping section

The complete rendered tower contains 25 interactive floors.

## Current stacking order from top to bottom

```text
Floor 25: roof/crown asset
Floor 24: top-window asset
Floors 23 through 2: repeat-window asset repeated 22 times
Floor 1: first-window asset
Ground/base: bottom asset
```

The renderer places every main tower piece on a **640-pixel-wide master coordinate system**. The base is intentionally displayed slightly narrower at **585 pixels**, centered under the tower.

---

# 2. Required files and exact dimensions

Every tower theme must deliver these five files.

| Purpose | Required filename pattern | Canvas size |
|---|---|---:|
| Floor 25 roof/crown | `[tower-id]-roof-final-25.png` | **640 × 251 px** |
| Floor 24 upper segment | `[tower-id]-top-window-24.png` | **640 × 87 px** |
| Floors 2–23 repeat segment | `[tower-id]-window-repeat.png` | **640 × 94 px** |
| Floor 1 special segment | `[tower-id]-window-01.png` | **640 × 94 px** |
| Ground, entrance, and base | `[tower-id]-bottom.png` | **640 × 302 px** |

All five files must be:

- PNG
- RGBA with a transparent background
- Exactly the listed pixel dimensions
- Centered on the same vertical axis
- Exported without cropping, padding changes, resizing, or automatic canvas trimming
- Designed at 1× native resolution, not exported at arbitrary dimensions
- Free of embedded text, floor numbers, interface labels, or backgrounds

## Existing generic filenames

The current tower uses:

```text
tower-roof-final-25.png
tower-top-window-24.png
tower-window-repeat.png
tower-window-01.png
tower-bottom.png
```

For multiple themes, use namespaced filenames instead:

```text
iron-rod-roof-final-25.png
iron-rod-top-window-24.png
iron-rod-window-repeat.png
iron-rod-window-01.png
iron-rod-bottom.png
```

Example additional themes:

```text
faith-spire-roof-final-25.png
faith-spire-top-window-24.png
faith-spire-window-repeat.png
faith-spire-window-01.png
faith-spire-bottom.png
```

```text
covenant-citadel-roof-final-25.png
covenant-citadel-top-window-24.png
covenant-citadel-window-repeat.png
covenant-citadel-window-01.png
covenant-citadel-bottom.png
```

Use lowercase kebab-case only. Never use spaces, parentheses, version words, or mixed capitalization.

---

# 3. Exact tower geometry

The app calculates the complete unscaled tower height as follows:

```text
251 roof
+ 87 top floor
+ 22 × 94 repeat floors
+ 94 first floor
+ 302 base
= 2,802 pixels total
```

Therefore, every compatible tower kit must assemble into a **640 × 2,802 px virtual tower world** before responsive scaling.

## Vertical floor map

| Floor | Asset | Top coordinate in assembled tower | Interactive region height |
|---:|---|---:|---:|
| 25 | roof-final-25 | 0 px | 251 px |
| 24 | top-window-24 | 251 px | 87 px |
| 23 | first repeat instance | 338 px | 94 px |
| 22 | repeat | 432 px | 94 px |
| 21 | repeat | 526 px | 94 px |
| … | repeat | increases by 94 px | 94 px |
| 2 | final repeat instance | 2,312 px | 94 px |
| 1 | window-01 | 2,406 px | 94 px |
| Base | bottom | 2,500 px | 302 px |

The art must visually join at these exact boundaries:

```text
251
338
432
526
620
714
808
902
996
1090
1184
1278
1372
1466
1560
1654
1748
1842
1936
2030
2124
2218
2312
2406
2500
2802
```

Do not place a projecting ledge, roof, balcony, tree, flag, or ornament across a piece boundary unless the adjoining piece contains the exact continuation.

---

# 4. Horizontal alignment

All pieces live on a 640-pixel canvas and must share the same centerline:

```text
Tower centerline: x = 320 px
```

The central shaft, doorway, windows, trim, and roof peak should align to x = 320.

The primary tower body should occupy approximately the same width from piece to piece. A safe target is:

```text
Middle tower shaft: roughly x = 220 to x = 420
Visual center: x = 320
```

The design may be somewhat wider or narrower, but all five pieces must use identical shaft edges at their seams.

The bottom image is displayed at 585 CSS pixels while the other pieces display at 640 CSS pixels. Because it is centered automatically, important structural connections in the bottom asset should remain centered. Keep trees, rocks, landscaping, stairs, and broad foundation decoration within the 640-pixel canvas, but do not rely on the extreme left and right edges for the tower-shaft connection.

---

# 5. Window placement and glow compatibility

The application adds its own glow over each floor. Windows must be placed so those overlays land correctly.

## Glow offsets currently used

| Floor type | Glow top inside that asset |
|---|---:|
| Floor 25 roof/crown | 163 px |
| Floor 24 top window | 32 px |
| Floors 2–23 repeat | 31 px |
| Floor 1 first window | 36 px |

## Standard glow size

For Floors 1–24, the overlay is approximately:

```text
38 px wide
58 px high
```

For Floor 25, it is approximately:

```text
96 px wide
74 px high
```

The glow is horizontally centered at x = 320.

Therefore:

- Put the primary lightable window at the center of each tile.
- The visual center of a standard floor window should align close to x = 320.
- The standard window opening should sit around the corresponding glow offset.
- Do not put multiple competing central windows on one floor.
- Do not move the central window left or right between pieces.
- Keep the window glass/opening large enough for the glow to be visible.
- Avoid opaque architectural artwork completely covering the glow region.
- Use a darker unlit window so the app-generated gold glow is noticeable.
- Do not bake a permanent bright glow into the artwork. A subtle warm interior is acceptable, but the “lit” state comes from the app.

## Recommended window geometry

For repeatable floors:

```text
Window center x: 320 px
Window visible region: approximately 32–46 px wide
Window visible region: approximately 48–65 px tall
Window top: approximately 25–35 px
```

For the first floor:

```text
Window center x: 320 px
Window top: approximately 30–40 px
```

For Floor 24:

```text
Window center x: 320 px
Window top: approximately 27–36 px
```

For Floor 25:

Design a crown, beacon, large upper window, temple spire light, crystal, flame, or emblem centered around the renderer’s 96 × 74 px glow zone beginning near y = 163.

---

# 6. Seamless repeat requirements

The repeat segment is the most important file because it is stacked 22 consecutive times.

The top edge and bottom edge must join perfectly when the same image is placed directly beneath itself.

## Nonnegotiable repeat rules

- Canvas is exactly 640 × 94 px.
- The tower shaft must enter and leave the image at exactly the same x coordinates.
- Left and right wall edges at y = 0 must match those at y = 93.
- Vertical pillars, grooves, trim, stone blocks, and shadows must continue naturally.
- Lighting direction and color must remain constant.
- No roof, base, taper, large ledge, tree, hanging banner, gargoyle, bridge, or unique ornament that visibly repeats every floor.
- Avoid obvious one-time weathering marks because they will repeat 22 times.
- Avoid cast shadows that imply a nearby object not present in the next tile.
- Keep the background fully transparent.
- Keep the visual mass balanced so 22 copies still look like one tower.
- A very small overlap is applied by CSS (`margin-top: -1px`), so the top and bottom rows should tolerate a one-pixel overlap.

## Best construction method

Create a tall master tower shaft first, then derive the repeat tile from a section whose top and bottom architecture is identical.

A reliable workflow:

1. Draw a 640 × 282 px test shaft containing three identical floor modules.
2. Ensure each floor module is exactly 94 px tall.
3. Crop the center module as the repeat tile.
4. Stack that crop at least 8 times.
5. Inspect at 100%, 200%, and 50%.
6. Correct any visible seam, width drift, light shift, or repeated artifact.
7. Only then export the final 640 × 94 repeat PNG.

---

# 7. Design freedom versus locked geometry

## The AI may change

- Stone, metal, wood, crystal, brick, marble, sandstone, ice, obsidian, bronze, jade, or celestial materials
- Color scheme
- Roof silhouette
- Spires, pinnacles, fins, battlements, domes, arches, buttresses, and trim
- Window shape, provided it stays centered and glow-compatible
- Door shape
- Base landscaping
- Small architectural details
- Cultural or scriptural visual motifs
- Tower personality and level of ornament
- Lighting mood
- Shape of the top crown

## The AI must not change

- Number of assets
- Asset dimensions
- Transparent canvas
- Shared x = 320 centerline
- Repeat floor height of 94 px
- Floor 24 height of 87 px
- Crown height of 251 px
- Base height of 302 px
- Placement of the primary lightable window
- Seam coordinates
- Overall upright front-facing orientation
- The ability to repeat the middle tile 22 times
- File naming conventions
- Perspective between pieces

---

# 8. Perspective and camera specification

Use:

```text
Orthographic-like frontal game asset view
Very mild low-angle grandeur is acceptable
No three-quarter rotation
No isometric view
No strong perspective convergence
No fisheye distortion
No camera tilt
No different zoom level between pieces
```

The tower must feel like a single structure assembled from slices. Every piece should be created from the same camera, scale, material system, lighting direction, and render settings.

Recommended description:

> Photorealistic architectural render of a real temple-style tower, shot like a professional product/architecture photograph on a seamless transparent background. Front-facing elevation, vertically symmetrical, centered, tack-sharp focus, physically based materials (real limestone/marble/bronze with visible grain, veining, and micro-texture), soft studio-quality daylight, gentle contact shadows under ledges, no environment, no text, no watermark.

This is the single biggest lever for fixing a "childlike" result: the reference tower renders look like real-world temple architecture photographed or rendered in an architectural-visualization engine (think Corona/V-Ray/Unreal Engine 5 arch-viz, or a straight photograph of an actual stone building), NOT a painted fantasy game icon. Every prompt sent to the image generator must say so explicitly, and must explicitly rule out "game asset," "icon," "illustration," "concept art," and "cartoon" — those words are what push image models toward the flatter, cuter look you got last time.

---

# 9. Visual style target

Match the visual language of the reference photorealistic temple-tower renders (the "tower-full" images), not a stylized game icon:

- **Photoreal architectural render**, indistinguishable from a real building photograph — not a painted or illustrated fantasy asset
- Real, identifiable building materials: dressed limestone or cast stone, polished marble, brushed bronze/gold metal, real glass — each with authentic surface imperfections (subtle staining, tooling marks, mortar lines, stone grain)
- Reverent, dignified, formal — closer to real sacred/civic architecture (classical temple, cathedral, capitol building) than to a fantasy castle
- Crisp, clean geometric ornament: fluted pilasters, dentil molding, carved trim, gothic-arched lancet windows — precise and architecturally plausible, not whimsical or exaggerated
- Strong silhouette at small screen sizes, but achieved through real architectural massing (setbacks, cornices, string courses), not cartoon outlines
- Warm, believable interior window light glowing through real glass, not a flat painted-on glow
- Neutral, soft, even studio/overcast lighting (like a product photo or architectural elevation shot) — avoid dramatic fantasy rim-lighting, magic particles, or glowing runes
- No people, no weapons, no logos, no text, no watermark, no opaque rectangular background
- No visible brush strokes, no painterly texture, no "digital painting" look
- No plastic/toy/miniature look, no soft rounded "mobile game" proportions

Do not generate: a flat icon, cartoon clip art, hand-painted fantasy concept art, low-poly or stylized 3D, a scene with sky/landscape/background, or anything that reads as "game UI asset." The target is a real building rendered/photographed straight-on, then cleanly cut out onto transparency.

---

# 10. Suggested tower theme system

Each scripture volume can have its own architecture while retaining the same geometry.

## Old Testament
Possible visual direction:

- Sandstone, bronze, deep red, desert gold
- Ancient monumental construction
- Pillars, carved stone bands, covenant motifs
- Strong, weighty base
- Name examples: Covenant Citadel, Sinai Watchtower, Prophets’ Fortress

## New Testament
Possible visual direction:

- Cream stone, olive green, warm gold, soft blue
- Graceful arches and welcoming windows
- Olive leaves, lamps, subtle fish or shepherd motifs
- Name examples: Galilee Lightspire, Grace Tower, Apostles’ Beacon

## Book of Mormon
Possible visual direction:

- White or pale stone, turquoise, green, gold
- Ancient American-inspired geometric trim without copying a specific sacred culture
- Tree, iron rod, compass, plates, or light motifs
- Name examples: Iron Rod Tower, Promised Land Spire, Nephite Beacon

## Doctrine and Covenants
Possible visual direction:

- Granite, silver, blue, celestial gold
- Pioneer-era solidity blended with celestial architecture
- Keys, stars, rays, temple-inspired verticality
- Name examples: Restoration Spire, Keys of Light Tower, Latter-day Citadel

---

# 11. Folder structure

Recommended:

```text
assets/
  towers/
    iron-rod/
      iron-rod-roof-final-25.png
      iron-rod-top-window-24.png
      iron-rod-window-repeat.png
      iron-rod-window-01.png
      iron-rod-bottom.png
      iron-rod-preview.png
      iron-rod-manifest.json

    grace-spire/
      grace-spire-roof-final-25.png
      grace-spire-top-window-24.png
      grace-spire-window-repeat.png
      grace-spire-window-01.png
      grace-spire-bottom.png
      grace-spire-preview.png
      grace-spire-manifest.json
```

The preview is optional and should not be used by the assembled-tower renderer.

---

# 12. Manifest format

Create one JSON manifest per tower:

```json
{
  "id": "iron-rod",
  "name": "The Iron Rod Tower",
  "version": 1,
  "canvasWidth": 640,
  "floors": 25,
  "repeatLevels": 22,
  "pieces": {
    "roof": {
      "file": "iron-rod-roof-final-25.png",
      "width": 640,
      "height": 251,
      "glowTop": 163
    },
    "top": {
      "file": "iron-rod-top-window-24.png",
      "width": 640,
      "height": 87,
      "glowTop": 32
    },
    "repeat": {
      "file": "iron-rod-window-repeat.png",
      "width": 640,
      "height": 94,
      "glowTop": 31,
      "instances": 22
    },
    "first": {
      "file": "iron-rod-window-01.png",
      "width": 640,
      "height": 94,
      "glowTop": 36
    },
    "bottom": {
      "file": "iron-rod-bottom.png",
      "width": 640,
      "height": 302,
      "displayWidth": 585
    }
  },
  "colors": {
    "hue": "#34d399",
    "soft": "rgba(52,211,153,.20)"
  }
}
```

---

# 13. Quality-assurance checklist

Do not accept the generated kit until all of these pass.

## File validation

- [ ] Exactly five required tower PNGs
- [ ] All filenames are correct
- [ ] All images use RGBA transparency
- [ ] All images are exactly 640 px wide
- [ ] Heights are exactly 251, 87, 94, 94, and 302 px
- [ ] No automatic trimming occurred
- [ ] No opaque white, black, or colored canvas background
- [ ] No watermark or text

## Alignment validation

- [ ] All pieces share x = 320 as the centerline
- [ ] Tower shaft width matches at every seam
- [ ] Roof joins Floor 24
- [ ] Floor 24 joins the repeat floor
- [ ] Repeat floor joins itself with no visible seam
- [ ] Final repeat joins Floor 1
- [ ] Floor 1 joins the base
- [ ] No piece jumps horizontally
- [ ] No sudden change in perspective or scale

## Repeat validation

- [ ] Repeat tile stacked 22 times remains believable
- [ ] No obvious repeated dirt blotch or unique ornament
- [ ] No visible one-pixel light or dark seam
- [ ] Pillars and vertical bands continue
- [ ] Window remains centered on every floor

## In-app validation

- [ ] Standard glow lands inside windows on Floors 1–24
- [ ] Floor 25 glow lands on the crown feature
- [ ] Tower remains readable at mobile scale
- [ ] Base remains centered when displayed at 585 px
- [ ] Tower looks correct at 0.4×, 0.6×, and 0.86× scale
- [ ] Active floor remains visually recognizable
- [ ] Transparent margins do not cause accidental clipping

---

# 14. Master AI prompt

Copy the following prompt into an image-generation or coding-capable AI. Replace bracketed values.

---

## MASTER PROMPT

You are creating a production-ready modular tower asset kit for a mobile and desktop scripture-memorization game called Scripture Quest.

**Style bar, stated up front because it matters most: render this like a real temple/cathedral building — photorealistic architectural visualization or straight photography, cut out on transparency. Do NOT render this as a fantasy game icon, cartoon, or painted concept-art asset. If you would describe your own output as "cute," "stylized," or "game-art," it is wrong — redo it as a photoreal architectural render instead.**

The tower will be assembled by code from five transparent PNG slices and must fit an existing renderer exactly. This is not a loose concept-art request. Pixel dimensions, alignment, transparency, seams, and filenames are strict production requirements — and the visual style must be photorealistic, matching real-world temple architecture photography, not illustrated game art.

### Tower concept

Tower ID: `[tower-id]`

Display name: `[tower display name]`

Theme: `[architectural and spiritual theme]`

Primary materials: `[materials]`

Primary colors: `[colors]`

Accent/light color: `[accent color]`

Mood: reverent, dignified, luminous, welcoming

Rendering style (mandatory): **Photorealistic architectural visualization / real-building photography.** Treat this exactly like rendering a real temple or cathedral for an architecture firm's marketing photo, then cutting it out on transparency — NOT like illustrating a fantasy game icon. Reference quality bar: a clean, front-elevation architectural render of an actual temple building, physically based materials, real stone/metal texture, soft neutral daylight, tack-sharp detail, photographic realism throughout.

Create a front-facing, vertically symmetrical scripture tower with real-world architectural materials and photographic realism. The tower should be distinctive from the existing white Iron Rod Tower but compatible with the exact same modular geometry.

Explicitly avoid: cartoon style, stylized game art, flat vector icon, hand-painted concept art, "mobile game asset" look, toy/miniature proportions, glossy plastic materials, exaggerated fantasy ornamentation, glowing magic effects, soft rounded cute forms. If the output looks like it belongs in a casual mobile game rather than next to a photo of a real temple, it has failed.

### Camera and composition

- Front-facing orthographic-like view
- Tower perfectly upright
- Centerline fixed at x = 320 px on every image
- No three-quarter view
- No isometric view
- No camera tilt
- No strong perspective convergence
- Same scale, lighting, materials, and camera across all pieces
- Transparent background
- No sky, clouds, scenery, interface, people, words, floor numbers, logos, or watermark

### Required deliverables

Generate exactly five separate RGBA PNG images:

1. `[tower-id]-roof-final-25.png`
   - Exact canvas: 640 × 251 px
   - Represents Floor 25 and the crown/roof
   - Must connect seamlessly to the upper-floor asset beneath it
   - Main crown light feature centered near x = 320
   - Design the lightable crown feature around a 96 × 74 px glow overlay beginning near y = 163
   - The roof silhouette may be unique and dramatic but must remain inside the transparent canvas

2. `[tower-id]-top-window-24.png`
   - Exact canvas: 640 × 87 px
   - Represents Floor 24
   - Must join the roof above and repeat shaft below
   - Central dark/unlit window centered at x = 320
   - Window positioned for a 38 × 58 px glow beginning near y = 32

3. `[tower-id]-window-repeat.png`
   - Exact canvas: 640 × 94 px
   - Used 22 consecutive times for Floors 2–23
   - Top and bottom edges must tile seamlessly with itself
   - Tower shaft has identical width and x position at y = 0 and y = 93
   - Central dark/unlit window centered at x = 320
   - Window positioned for a 38 × 58 px glow beginning near y = 31
   - No unique ornament or mark that becomes distracting when repeated 22 times
   - No taper, roof, ground, major balcony, or one-time architectural event
   - Ensure vertical pillars, stone courses, grooves, and shadows continue perfectly

4. `[tower-id]-window-01.png`
   - Exact canvas: 640 × 94 px
   - Represents Floor 1
   - Must join the repeat shaft above and the base below
   - May contain a slightly more decorated first-floor transition
   - Central dark/unlit window centered at x = 320
   - Window positioned for a 38 × 58 px glow beginning near y = 36

5. `[tower-id]-bottom.png`
   - Exact canvas: 640 × 302 px
   - Contains the tower entrance, foundation, stairs, and optional restrained landscaping
   - Must join Floor 1 seamlessly at the top
   - The code displays this piece centered at 585 px wide, so keep the tower connection centered and avoid placing essential structural details at the extreme edges
   - Transparent background
   - No text carved into the architecture

### Locked geometry

- All pieces exactly 640 px wide
- Shared centerline x = 320
- Heights must remain exactly:
  - roof: 251 px
  - top: 87 px
  - repeat: 94 px
  - first: 94 px
  - base: 302 px
- Repeat segment must stack 22 times
- Total assembled virtual height must equal 2,802 px
- The shaft must not shift, widen, narrow, or change perspective at any seam
- Preserve a continuous lighting direction and material scale
- Leave fully transparent pixels outside the architecture
- Do not auto-crop or trim the exported canvas

### Art direction

Create an original design inspired by `[theme details]`, rendered as if it were a real building.

Use:
- Photorealistic, physically based materials: real limestone/marble/sandstone/bronze/gold with authentic grain, veining, mortar joints, and subtle weathering — not a painted or stylized surface
- Soft, even, neutral daylight (studio/overcast quality), gentle contact shadows, tack-sharp architectural detail
- Strong readable silhouette achieved through real massing — cornices, setbacks, pilasters, string courses
- Elegant vertical rhythm and rich but restrained carved ornamental detail
- Dark unlit central windows (real glass, gothic/lancet arch shape) that become warm and luminous when the app adds glow
- Clear, clean cutout separation from the transparent background, as if silhouetted from a real photograph
- Reverent, dignified beauty — think real temple/cathedral, not fantasy adventure architecture

Avoid:
- Flat clip art or vector icon look
- Any cartoon or thick outline styling
- Hand-painted / digital-painting brushwork
- "Fantasy game asset" or "mobile game" rendering style
- Full scenic backgrounds, sky, or landscape
- Excessively dark horror styling
- Weapons as the main visual idea
- Tiny noisy details that read as clutter at small size
- Permanent overpowering window glow
- Glossy plastic or toy-like material response
- Horizontal architectural projections that cross tile boundaries
- Mismatched widths, lighting, or zoom between files

### Mandatory internal test

Before finalizing:

1. Assemble the five files in this order:
   - roof
   - top
   - repeat × 22
   - first
   - bottom
2. Confirm the assembled canvas is 640 × 2,802 px.
3. Inspect every seam at 200% zoom.
4. Stack the repeat file at least eight times and verify there is no visible seam or geometry drift.
5. Confirm all central windows align on x = 320.
6. Confirm glow zones are unobstructed.
7. Confirm the artwork remains readable when reduced to 40% scale.
8. Return a contact sheet preview of the full assembled tower in addition to the five separate PNG files.
9. Do not modify the required filenames or dimensions.

Deliver only assets that pass every test.

---

# 15. Prompt for revising a failed tower kit

Use this when an AI produces nearly correct artwork that does not fit.

```text
Repair this modular tower kit without redesigning its core visual identity.

Strictly preserve:
- Materials
- Colors
- Architectural theme
- Ornament language
- Overall appearance

Correct the production geometry:
- Every file must use an untrimmed transparent 640 px-wide canvas.
- Roof must be exactly 251 px tall.
- Top Floor 24 piece must be exactly 87 px tall.
- Repeat piece must be exactly 94 px tall.
- First-floor piece must be exactly 94 px tall.
- Bottom piece must be exactly 302 px tall.
- Center the tower shaft at x = 320 on every file.
- Make shaft edges and perspective identical at all connecting seams.
- Make the repeat tile seamlessly repeat against itself.
- Put the main central window at x = 320.
- Preserve clear glow regions:
  roof y ≈ 163,
  top y ≈ 32,
  repeat y ≈ 31,
  first floor y ≈ 36.
- Remove all backgrounds, text, floor numbers, watermarks, and accidental canvas trimming.
- Return five separate PNGs with the exact requested filenames and a full 640 × 2,802 assembled validation preview.
```

---

# 16. Recommended code improvement for multiple tower kits

Instead of hard-coding generic filenames, store an asset prefix in each tower definition.

Example:

```javascript
const TOWERS = {
  bom: {
    name: "The Iron Rod Tower",
    assets: "iron-rod",
    hue: "#34d399",
    soft: "rgba(52,211,153,.20)"
  },
  nt: {
    name: "The Galilee Lightspire",
    assets: "galilee-lightspire",
    hue: "#60a5fa",
    soft: "rgba(96,165,250,.20)"
  }
};
```

Then build paths like:

```javascript
function towerAssetPath(tower, piece) {
  return `assets/towers/${tower.assets}/${tower.assets}-${piece}.png`;
}
```

Usage:

```javascript
const prefix = TOWERS[vol].assets;

roof.src   = `assets/towers/${prefix}/${prefix}-roof-final-25.png`;
top.src    = `assets/towers/${prefix}/${prefix}-top-window-24.png`;
repeat.src = `assets/towers/${prefix}/${prefix}-window-repeat.png`;
first.src  = `assets/towers/${prefix}/${prefix}-window-01.png`;
bottom.src = `assets/towers/${prefix}/${prefix}-bottom.png`;
```

This lets each volume use a different tower kit without changing the rendering geometry.

---

# 17. Final production principle

Every tower may have a different personality, material, color, and silhouette.

Every tower must share the same invisible skeleton:

```text
640 px master width
251 px crown
87 px upper floor
22 × 94 px repeating floors
94 px first floor
302 px base
x = 320 centerline
2,802 px assembled height
```

That shared skeleton is what makes each new design work flawlessly in the existing app.
