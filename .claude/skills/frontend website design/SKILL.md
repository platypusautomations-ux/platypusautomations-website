---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, or applications. Generates creative, polished code that avoids generic AI aesthetics. Always produces and verifies both desktop and mobile layouts before deploying.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

---

## Mandatory Execution Order

Every frontend build follows this sequence without exception:

1. Design Thinking — commit to aesthetic direction before writing any code
2. Build — implement the full page or component
3. Puppeteer Screenshot Verification — run the verify-responsive.js script, save screenshots, review all three viewports
4. Fix — resolve any issues identified in the screenshots, re-run verification after each fix
5. Deploy — only push after all three viewport screenshots are confirmed clean

**Never push to git before completing steps 3 and 4. Screenshots are the source of truth — not assumptions about what the CSS will do.**

---

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work — the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

---

## Frontend Aesthetics Guidelines

Focus on:
- **Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics; unexpected, characterful font choices. Pair a distinctive display font with a refined body font.
- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Motion**: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions. Use scroll-triggering and hover states that surprise.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.

NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices (Space Grotesk, for example) across generations.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

Remember: Claude is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.

---

## Responsive Design Requirements

All builds must be fully responsive. These are not optional polish items — they are build requirements checked before every deploy.

### Breakpoints

Define and implement these breakpoints in every build:
- Mobile: max-width 480px (primary target: 390px iPhone)
- Tablet: 481px–768px
- Desktop: 769px and above

### Mobile-Specific Rules

Apply these to every mobile media query without exception:

**Hero sections**
- `background-attachment: scroll` — never `fixed` on mobile; fixed breaks on iOS Safari and causes images to disappear
- `background-position: center center` — prevents subject from being cut off
- `background-size: cover` — confirm not overridden at mobile
- `min-height: 85vh` minimum — gives the image room without requiring a scroll to see content
- Reduce overlay opacity if image becomes unreadable at mobile size

**Typography**
- Hero headlines: scale down — no headline larger than `2.8rem` on mobile (use `clamp()` where possible)
- Body text: minimum `16px`, never smaller
- Line height: `1.5` minimum on mobile for readability
- No orphaned single words on narrow viewports — check headline wrapping at 390px

**Navigation**
- Hamburger menu or collapsed nav required if desktop nav has more than 3 items
- Nav links must be tap-target size: minimum `44px` height
- Logo must remain visible and correctly sized in both transparent and scrolled nav states

**Layout**
- All multi-column grid layouts must collapse to single column on mobile
- Flexbox rows must wrap or switch to `flex-direction: column`
- No horizontal overflow — `overflow-x: hidden` on body is a last resort, not a fix; resolve the root cause
- Padding: minimum `1rem` horizontal padding on all sections at mobile
- Cards, stat blocks, and feature grids: full width at mobile, no clipped content

**Images**
- All images: `max-width: 100%` and `height: auto` unless explicitly constrained
- Background images: see Hero rules above
- No images that overflow their container at any viewport

**Forms and CTAs**
- Input fields and buttons: `width: 100%` on mobile unless intentionally constrained
- Buttons: minimum `44px` height, full width preferred on mobile

**Animations**
- CSS parallax effects using `background-attachment: fixed` must be disabled on mobile
- Heavy scroll animations should be reduced or removed on mobile — use `@media (prefers-reduced-motion: reduce)` and a separate mobile motion budget
- `position: sticky` nav: test that it doesn't obscure content on short viewports

---

## Pre-Deploy Responsive Verification — Puppeteer

Claude cannot open a GUI browser and cannot visually verify layout by reading CSS alone. CSS interactions — layered backgrounds, background-size on multi-layer gradients, Intersection Observer thresholds, sticky nav states, font rendering — produce results that differ from what the code implies. Screenshots are required. Do not skip this step.

### Setup — install Puppeteer (first time only)

Check whether Puppeteer is already installed before running the install command:

```bash
node -e "require('puppeteer')" 2>/dev/null && echo "installed" || echo "not installed"
```

If not installed:

```bash
cd ~/Documents/CC
npm install puppeteer
```

Puppeteer is installed once at the CC root and reused across all projects. Do not reinstall per project.

### The verification script

A shared script lives at `~/Documents/CC/verify-responsive.js`. If it does not exist, create it with this exact content:

```javascript
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const target = process.argv[2];
const outDir = process.argv[3] || '/tmp/responsive-screenshots';

if (!target) {
  console.error('Usage: node verify-responsive.js <file-path-or-url> [output-dir]');
  process.exit(1);
}

const url = target.startsWith('http') ? target : 'file://' + path.resolve(target);
fs.mkdirSync(outDir, { recursive: true });

const viewports = [
  { name: 'mobile-390',  width: 390,  height: 844,  isMobile: true,  deviceScaleFactor: 3 },
  { name: 'tablet-768',  width: 768,  height: 1024, isMobile: true,  deviceScaleFactor: 2 },
  { name: 'desktop-1280',width: 1280, height: 900,  isMobile: false, deviceScaleFactor: 1 },
];

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });

  for (const vp of viewports) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.isMobile, deviceScaleFactor: vp.deviceScaleFactor });
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));

    // Full-page screenshot
    const fullPath = path.join(outDir, `${vp.name}-full.png`);
    await page.screenshot({ path: fullPath, fullPage: true });
    console.log(`Saved: ${fullPath}`);

    // Above-fold screenshot (hero area)
    const foldPath = path.join(outDir, `${vp.name}-fold.png`);
    await page.screenshot({ path: foldPath, fullPage: false });
    console.log(`Saved: ${foldPath}`);

    // Check for horizontal overflow
    const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    if (hasOverflow) {
      console.warn(`WARNING: Horizontal overflow detected at ${document.documentElement.clientWidth}px viewport`);
    }

    await page.close();
  }

  await browser.close();
  console.log('\nAll screenshots saved. Review before deploying.');
})();
```

### Running verification

After completing the build, run:

```bash
node ~/Documents/CC/verify-responsive.js ~/Documents/CC/[project-folder]/[page].html ~/Documents/CC/screenshots/[project-name]
```

This produces 6 PNG files in the screenshots folder:
- `mobile-390-fold.png` — hero/above-fold at iPhone 14 width
- `mobile-390-full.png` — full page at mobile
- `tablet-768-fold.png` — hero at tablet
- `tablet-768-full.png` — full page at tablet
- `desktop-1280-fold.png` — hero at desktop
- `desktop-1280-full.png` — full page at desktop

### Review and report

After running the script, report the following to the user before touching git:

1. Whether any horizontal overflow warnings were logged
2. A plain-language description of what each fold screenshot shows — specifically: is the hero image visible and is the intended subject (logo, person, product) in frame or cropped out?
3. Any layout issues visible in the full-page screenshots — collapsed grids, overflowing text, broken nav states, clipped buttons
4. A clear pass/fail for each viewport

Do not describe what the CSS should produce. Describe only what the screenshots show.

### Fix and re-verify

For any failed viewport, fix the issue and re-run the script targeting only the affected file. Confirm the fix worked by comparing the new screenshot to the previous one. Do not assume the fix worked without re-running.

### Deploy only after all viewports pass

```bash
cd ~/Documents/CC/[project-folder]
git add .
git commit -m "your message"
git push origin main
```

Confirm push succeeds. Cloudflare Pages auto-deploys in approximately 30 seconds.

### Background image verification note

Background images — especially multi-layer backgrounds with gradients — require special attention. When the hero uses a layered `background` shorthand (image + gradient overlays), overriding only `background-size` or `background-position` in a media query affects ALL layers. Always override the full `background` shorthand in the mobile media query, specifying size and position explicitly per layer. Verify the result in the fold screenshot — do not trust CSS reasoning alone.

---

## Common Mobile Bugs — Fix Reference

| Symptom | Root Cause | Fix |
|---|---|---|
| Hero background image blank on iOS | `background-attachment: fixed` | Change to `background-attachment: scroll` on mobile |
| Hero image cuts off subject | `background-position` not set for mobile | Set `background-position: center center` in mobile media query |
| Horizontal scrollbar appears | Element wider than viewport | Find the overflowing element with DevTools, set `max-width: 100%` or remove fixed width |
| Nav logo invisible on scroll | CSS toggle between transparent/solid states not updating logo color | Add explicit logo color/filter rules to both nav states |
| Grid not collapsing | `grid-template-columns` not overridden at mobile | Add `grid-template-columns: 1fr` in mobile media query |
| Buttons too small to tap | Fixed height below 44px | Set `min-height: 44px` on all interactive elements |
| Text overflowing container | Long word or URL with no `overflow-wrap` | Add `overflow-wrap: break-word` to the container |
| Reveal animation never fires | Intersection Observer threshold too high for above-fold elements | Add an on-load viewport pass; set observer threshold to 0 |
| Fixed nav covers content | `top` offset not accounting for nav height | Add `scroll-padding-top` equal to nav height on `html` element |

---

## Scroll-Driven Website Design Guidelines

When this skill is invoked for a scroll-driven animated website (used alongside `video-to-website`), follow these additional rules:

### Typography as Design
- Hero headings: **6rem minimum on desktop**, scaled to `clamp(2.5rem, 8vw, 6rem)` for mobile compatibility
- Section headings: **3rem minimum on desktop**, `clamp(1.8rem, 5vw, 3rem)` on mobile
- Horizontal marquee text: **10-15vw**, uppercase, letterspaced
- Section labels: small (0.7rem), uppercase, letterspaced (0.15em+), muted color — like "001 / Features"
- Text hierarchy replaces card containers. Size, weight, and color ARE the structure

### No Cards, No Boxes
- **NEVER** use glassmorphism cards, frosted glass, or visible containers around text on scroll-driven sites
- Text sits directly on the background — clean, confident, editorial
- Readability comes from: font weight (600+), text-shadow if needed, and ensuring video frames have clean backgrounds at text scroll points
- The only acceptable "container" is generous padding on the section itself

### Color Zones
- Background color must shift between sections (light → dark → accent → light)
- Define color zones in CSS variables: `--bg-light`, `--bg-dark`, `--bg-accent`
- Text color inverts automatically: `--text-on-light`, `--text-on-dark`
- Transitions happen via GSAP, not CSS transitions

### Layout Variety
Every scroll-driven page needs at least 3 different layout patterns:
1. **Centered** — hero sections, CTAs
2. **Left-aligned** — feature descriptions with product on right
3. **Right-aligned** — alternate features
4. **Full-width** — horizontal marquee text, stats rows
5. **Split** — text on one side, supporting visual on the other

Never use the same layout for consecutive sections. On mobile, all split and side-by-side layouts collapse to stacked single column.

### Animation Choreography
- Every section must use a DIFFERENT entrance animation (fade-up, slide-left, slide-right, scale-up, clip-path reveal)
- Elements within a section enter with staggered delays (0.08-0.12s between items)
- Sequence: label first → heading → body text → CTA/button
- At least one section must pin (stay fixed) while its contents animate internally
- At least one oversized text element must move horizontally on scroll
- All GSAP scroll-triggered animations must be tested at mobile viewport — confirm they fire correctly and don't produce layout jank

### Stats & Numbers
- Display stats at **4rem+** on desktop, `clamp(2rem, 8vw, 4rem)` on mobile
- Numbers MUST count up via GSAP (never appear statically)
- Use a suffix element for units (x, M, %, etc.) at a smaller size
- Labels below in small caps or uppercase muted text
