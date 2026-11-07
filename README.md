# Shutr — website

The website for **Shutr**: a social media marketing, creative marketing and creative direction agency that also builds AI agents for brands. It's led by founder & CEO **Sanchit Chopra**.

It's a plain static site: HTML, one CSS file and one JS file. There's no build step and no dependencies. You can open `index.html` in a browser or deploy the folder anywhere.

## Pages

| File | What it is |
| --- | --- |
| `index.html` | Home: balloon-letter hero, manifesto, the "Shutr Index", AI agents teaser, selected work, founder feature, process player |
| `work.html` | Work index: filterable grid, plus an "Index" list view |
| `work/halfpipe-supply.html` | Case study template (social launch). **Sample** |
| `work/nova-cycles.html` | Case study template (AI agent). **Sample** |
| `work/sunday-club.html` | Case study template (creative direction). **Sample** |
| `services.html` | Social · Creative direction · AI agents, process "track listing", ways to work, FAQ |
| `agents.html` | AI agents for brands: agent types, live chat demo, build process, guardrails |
| `studio.html` | Founder file (Sanchit Chopra), the crew, house rules |
| `contact.html` | Project brief form. It opens the visitor's email app with the brief filled in, so no backend is needed |
| `404.html` | "Out of focus." |

## Design system: where each reference shows up

| Reference | Used for |
| --- | --- |
| Nike "Play the game" | Inflated balloon letters in the hero and 404, plus corner metadata labels and the heavy grotesk headline |
| BUNO "We are ready" | Giant red condensed type on navy, the marker scrawl, the micro-type marquee and the "On air" badge |
| Studio Régine | Pixel type (`AGENTS`), frosted-glass cards, the glowing orb and the pill navigation in the header |
| THUG2 site (2003) | Orange grunge CTA, the interactive "Track listing" CD player and the `>> click here ::` buttons |
| Thrasher site | Khaki halftone zine grid, torn-paper bands, underlined serif link lists and the footer |
| Tyler, the Creator site | Yellow/red split founder feature, sticker collage and repeated tag words |
| Pinterest itself | The "More to explore" masonry and the case-study "pin" layout (image left, actions right) |

**Typefaces (Google Fonts):**
- Archivo (variable width) for condensed display and grotesk text
- Instrument Serif for editorial copy and links
- DM Mono for metadata
- Pixelify Sans for pixel accents
- Permanent Marker for scrawls

**Colours** are defined as CSS variables at the top of `assets/css/shutr.css`.

**Little extras:**
- Stickers can be dragged on desktop.
- Clicking the camera mascot in the hero fires a camera flash.
- Pages open and close with an aperture transition.
- The header shows a live studio clock.

All motion is switched off for visitors who ask for reduced motion.

## Before launch: things to replace

1. **Email.** Every page uses `hello@shutr.studio` as a placeholder. Find and replace it across all `.html` files.
2. **Social links.** The footer and contact page link to `#`. Search for `data-todo` and `TODO` to find them.
3. **Founder photo.** Replace `assets/svg/halftone-portrait.svg` in `index.html` and `studio.html`. A comment in `studio.html` shows where to put a real `<img>`.
4. **Case studies.** The three files in `work/` are clearly marked **Sample**, and their client names are made up. See "Adding a case study" below.
5. **Studio clock timezone.** It's set to IST (`Asia/Kolkata`). Change `CONFIG.timeZone` in `assets/js/shutr.js` and the "IST" labels in the HTML if needed.
6. **Social share image.** `assets/img/og.png` is generated from the hero and can be swapped for any 1200×630 image.

## Adding a case study

1. Duplicate one of the files in `work/` and give it a new name, for example `work/your-client.html`.
2. Edit the title, the client facts and the five chapters: brief, background, idea, what we made, results.
3. Put the real images or videos in the viewfinder frames. Each frame has a comment showing where the `<img>` goes. Images go in `assets/img/work/`.
4. Delete the `Sample case file` stamp.
5. Add a card for the new project to the grids in `work.html` and `index.html`, and a row to the Index list in `work.html`. Copy an existing `<a class="card">` and its poster.

## Deploying

The site is static, so any of these work:
- **GitHub Pages:** go to Settings → Pages and deploy from the branch root.
- **Netlify or Vercel:** import the repo. There's no build command, and the publish directory is `/`.

## Regenerating the balloon letters

`assets/img/balloons/*.webp` are rendered by `tools/render-balloons.cjs`, which uses Playwright and Python Pillow. To change the letters or colours, edit the `JOBS` list at the top of that file and run:

```bash
node tools/render-balloons.cjs
```
