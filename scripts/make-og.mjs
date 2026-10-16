/**
 * Renders public/og.png (1200x630) from an inline SVG via sharp.
 * Uses generic font families so it renders without a headless browser.
 * Run: node scripts/make-og.mjs
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const W = 1200;
const H = 630;

const grid = () => {
  const lines = [];
  for (let x = 64; x < W; x += 64) {
    lines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="#262a31" stroke-width="1"/>`);
  }
  for (let y = 64; y < H; y += 64) {
    lines.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#262a31" stroke-width="1"/>`);
  }
  return lines.join('');
};

const chip = (label, x) => {
  const w = label.length * 10.5 + 28;
  return `
    <rect x="${x}" y="536" width="${w}" height="38" rx="7" fill="#141619" stroke="#262a31"/>
    <text x="${x + w / 2}" y="561" font-family="monospace" font-size="15"
          fill="#8b8f98" text-anchor="middle">${label}</text>`;
};

// Right-aligned chip row, laid out from the right edge inwards.
const chips = ['DevTools', 'RTM', 'Jira', 'Postman'];
let cursor = W - 80;
const chipMarkup = chips
  .map((label) => {
    const w = label.length * 10.5 + 28;
    cursor -= w;
    const markup = chip(label, cursor);
    cursor -= 14;
    return markup;
  })
  .join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="fade" cx="50%" cy="0%" r="80%">
      <stop offset="20%" stop-color="#fff" stop-opacity="0.3"/>
      <stop offset="75%" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <mask id="gridMask"><rect width="${W}" height="${H}" fill="url(#fade)"/></mask>
  </defs>

  <rect width="${W}" height="${H}" fill="#0a0b0d"/>
  <g mask="url(#gridMask)">${grid()}</g>

  <rect x="80" y="74" width="246" height="42" rx="21" fill="#3ddc84" fill-opacity="0.1" stroke="#3ddc84" stroke-opacity="0.3"/>
  <circle cx="104" cy="95" r="4" fill="#3ddc84"/>
  <text x="120" y="101" font-family="monospace" font-size="15" letter-spacing="2.1" fill="#3ddc84">OPEN TO QA ROLES</text>

  <text x="80" y="330" font-family="Inter Tight, Helvetica, Arial, sans-serif" font-size="118"
        font-weight="600" letter-spacing="-4" fill="#f4f5f7">Prashanta</text>
  <text x="80" y="441" font-family="Inter Tight, Helvetica, Arial, sans-serif" font-size="118"
        font-weight="600" letter-spacing="-4" fill="#8b8f98">Parajuli</text>

  <text x="80" y="495" font-family="Inter Tight, Helvetica, Arial, sans-serif" font-size="29" fill="#8b8f98">
    <tspan fill="#f4f5f7" font-weight="600">Associate QA Engineer</tspan>
    <tspan> - functional, API &amp; role-based access testing</tspan>
  </text>

  <line x1="80" y1="536" x2="${W - 80}" y2="536" stroke="#262a31" stroke-width="1"/>
  <text x="80" y="572" font-family="monospace" font-size="17" letter-spacing="1" fill="#5a5f69">prashantaparajuli.com.np</text>
  ${chipMarkup}
</svg>`;

await mkdir('public', { recursive: true });
await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile('public/og.png');
console.log(`og.png written (${W}x${H})`);
