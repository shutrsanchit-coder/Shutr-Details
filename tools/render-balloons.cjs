/**
 * Renders the inflated "balloon" letters used in the Shutr hero.
 * Usage:  node tools/render-balloons.cjs
 * Needs Playwright + Python Pillow (for WebP conversion). Output: assets/img/balloons/*.webp
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');

const OUT = path.resolve(__dirname, '../assets/img/balloons');
const JOBS = [
  // [file, glyph, base, rim, core-shadow, highlight]
  ['s', 'S', '#FFDD1F', '#D99A00', '#C47A00', '#FFF6B8'],
  ['h', 'H', '#FFDD1F', '#D99A00', '#C47A00', '#FFF6B8'],
  ['u', 'U', '#FFDD1F', '#D99A00', '#C47A00', '#FFF6B8'],
  ['t', 'T', '#FFDD1F', '#D99A00', '#C47A00', '#FFF6B8'],
  ['r', 'R', '#FFDD1F', '#D99A00', '#C47A00', '#FFF6B8'],
  ['4-red', '4', '#F0352B', '#A3120C', '#8A0C07', '#FFB3A8'],
  ['0-red', '0', '#F0352B', '#A3120C', '#8A0C07', '#FFB3A8'],
];

const filter = (id, base, rim, core, hi) => `
<filter id="${id}" x="-30%" y="-30%" width="160%" height="170%" color-interpolation-filters="sRGB">
  <feMorphology in="SourceAlpha" operator="dilate" radius="5" result="fat"/>
  <feGaussianBlur in="fat" stdDeviation="9" result="soft"/>
  <feComponentTransfer in="soft" result="shape"><feFuncA type="linear" slope="8" intercept="-3.4"/></feComponentTransfer>
  <feFlood flood-color="${base}"/><feComposite in2="shape" operator="in" result="base"/>
  <feGaussianBlur in="shape" stdDeviation="16" result="b1"/>
  <feComposite in="shape" in2="b1" operator="arithmetic" k2="1" k3="-1" result="rim"/>
  <feFlood flood-color="${rim}"/><feComposite in2="rim" operator="in" result="rimC"/>
  <feOffset in="b1" dx="-18" dy="-24" result="b1o"/>
  <feComposite in="shape" in2="b1o" operator="out" result="cr0"/>
  <feGaussianBlur in="cr0" stdDeviation="14" result="cr1"/>
  <feComposite in="cr1" in2="shape" operator="in" result="cr"/>
  <feFlood flood-color="${core}" flood-opacity="0.7"/><feComposite in2="cr" operator="in" result="crC"/>
  <feMorphology in="shape" operator="erode" radius="18" result="core"/>
  <feOffset in="core" dx="-14" dy="-20" result="coreo"/>
  <feGaussianBlur in="coreo" stdDeviation="16" result="hl0"/>
  <feComposite in="hl0" in2="shape" operator="in" result="hl"/>
  <feFlood flood-color="${hi}" flood-opacity="0.55"/><feComposite in2="hl" operator="in" result="hlC"/>
  <feMorphology in="shape" operator="erode" radius="30" result="core2"/>
  <feOffset in="core2" dx="-18" dy="-26" result="core2o"/>
  <feGaussianBlur in="core2o" stdDeviation="5" result="sp0"/>
  <feComposite in="sp0" in2="shape" operator="in" result="sp"/>
  <feFlood flood-color="#FFFFFF" flood-opacity="0.8"/><feComposite in2="sp" operator="in" result="spC"/>
  <feGaussianBlur in="shape" stdDeviation="16" result="ds0"/>
  <feOffset in="ds0" dx="12" dy="28" result="ds1"/>
  <feFlood flood-color="#2A1E00" flood-opacity="0.2"/><feComposite in2="ds1" operator="in" result="ds"/>
  <feMerge><feMergeNode in="ds"/><feMergeNode in="base"/><feMergeNode in="rimC"/><feMergeNode in="crC"/><feMergeNode in="hlC"/><feMergeNode in="spC"/></feMerge>
</filter>`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const svgs = JOBS.map(([file, g, b, r, c, h]) => `
    <svg id="g-${file}" width="560" height="620" viewBox="-60 -40 560 620" style="display:block">
      <defs>${filter('f-' + file, b, r, c, h)}</defs>
      <text x="200" y="390" text-anchor="middle" font-size="380" filter="url(#f-${file})">${g}</text>
    </svg>`).join('');
  const html = `<!doctype html><html><head><meta charset="utf-8">
    <link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&display=swap" rel="stylesheet">
    <style>html,body{margin:0;background:transparent} text{font-family:Archivo;font-weight:900;font-stretch:100%}</style>
    </head><body>${svgs}</body></html>`;
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  for (const [file] of JOBS) {
    const png = path.join(OUT, file + '.png');
    await page.locator('#g-' + file).screenshot({ path: png, omitBackground: true });
    execFileSync('python3', ['-I', '-c', `
from PIL import Image
im = Image.open(${JSON.stringify(png)}).convert('RGBA')
bbox = im.getchannel('A').point(lambda a: 255 if a > 1 else 0).getbbox()
im = im.crop(bbox)
im.save(${JSON.stringify(png.replace('.png', '.webp'))}, 'WEBP', quality=88, method=6)
print(im.size)
`], { stdio: 'inherit' });
    fs.unlinkSync(png);
  }
  await browser.close();
})();
