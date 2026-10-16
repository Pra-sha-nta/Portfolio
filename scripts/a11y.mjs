/** Accessibility + link audit against a running build. Run: node scripts/a11y.mjs <url> */
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const url = process.argv[2] ?? 'http://127.0.0.1:4321/';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);

const results = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  .analyze();

console.log('=== AXE VIOLATIONS:', results.violations.length, '===');
for (const v of results.violations) {
  console.log(`[${v.impact}] ${v.id}: ${v.help}`);
  for (const n of v.nodes.slice(0, 3)) console.log('   ', n.target.join(' '), '|', n.html.slice(0, 90));
}

// Every in-page anchor must resolve to a real element.
const anchors = await page.evaluate(() =>
  [...document.querySelectorAll('a[href^="#"]')]
    .map((a) => a.getAttribute('href'))
    .filter((h) => h && h !== '#' && !document.querySelector(h)),
);
console.log('=== BROKEN ANCHORS:', anchors.length, anchors.join(', '));

// Keyboard: tab through and confirm focus is always visible.
await page.keyboard.press('Tab');
const firstFocus = await page.evaluate(() => document.activeElement?.textContent?.trim().slice(0, 40));
console.log('=== FIRST TAB STOP:', firstFocus);

const noOutline = await page.evaluate(() => {
  const bad = [];
  for (const el of document.querySelectorAll('a, button')) {
    el.focus();
    const s = getComputedStyle(el);
    if (s.outlineStyle === 'none' && !s.boxShadow.includes('rgb')) bad.push(el.textContent?.trim().slice(0, 30));
  }
  return bad;
});
console.log('=== NO FOCUS INDICATOR:', noOutline.length, noOutline.slice(0, 5).join(' | '));

await browser.close();
