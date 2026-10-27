/**
 * Visual + behavioural check across viewports using Windows Chrome via CDP.
 * Run: node scripts/shoot.mjs <baseUrl> <outDir>
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const base = process.argv[2] ?? 'http://127.0.0.1:4321/';
const out = process.argv[3] ?? './shots';
const cdp = process.env.CDP ?? 'http://127.0.0.1:9222';

const VIEWPORTS = [
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-320', width: 320, height: 720 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1440', width: 1440, height: 900 },
];

await mkdir(out, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext();

const problems = [];

for (const vp of VIEWPORTS) {
  const page = await ctx.newPage();
  await page.setViewportSize({ width: vp.width, height: vp.height });

  const consoleErrors = [];
  page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
  page.on('pageerror', (e) => consoleErrors.push(String(e)));

  await page.goto(base, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  // Let hero word-reveal settle before capturing.
  await page.waitForTimeout(1400);

  // Horizontal overflow is the classic responsive defect.
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  if (overflow > 0) problems.push(`${vp.name}: horizontal overflow ${overflow}px`);
  if (consoleErrors.length) problems.push(`${vp.name}: console ${consoleErrors.join(' | ')}`);

  await page.screenshot({ path: `${out}/${vp.name}-top.png` });

  // Scroll the page so every reveal fires. Pause at the bottom BEFORE
  // returning to the top: scrolling straight back races the IntersectionObserver
  // for elements at the end of the document and reports false positives.
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.6;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 190));
    }
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((r) => setTimeout(r, 900));
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${out}/${vp.name}-full.png`, fullPage: true });

  // A stranded reveal is one that OCCUPIES LAYOUT but is still transparent.
  // Elements hidden by a responsive `display:none` have no client rects and
  // are correctly skipped by the motion system, so they are not defects.
  const hidden = await page.evaluate(
    () =>
      Array.from(document.querySelectorAll('[data-reveal]')).filter(
        (el) => el.getClientRects().length > 0 && getComputedStyle(el).opacity === '0',
      ).length,
  );
  if (hidden > 0) problems.push(`${vp.name}: ${hidden} [data-reveal] still at opacity 0`);

  await page.close();
}

// Reduced-motion path: content must be fully visible with no animation.
const rm = await ctx.newPage();
await rm.emulateMedia({ reducedMotion: 'reduce' });
await rm.setViewportSize({ width: 1440, height: 900 });
await rm.goto(base, { waitUntil: 'networkidle' });
await rm.waitForTimeout(700);
const rmHidden = await rm.evaluate(
  () =>
    Array.from(document.querySelectorAll('[data-reveal], [data-reveal-word] > span > span')).filter(
      (el) => getComputedStyle(el).opacity === '0',
    ).length,
);
if (rmHidden > 0) problems.push(`reduced-motion: ${rmHidden} elements hidden`);
await rm.screenshot({ path: `${out}/reduced-motion.png`, fullPage: true });
await rm.close();

await browser.close();

console.log(problems.length ? 'PROBLEMS:\n' + problems.join('\n') : 'PASS: no problems detected');
