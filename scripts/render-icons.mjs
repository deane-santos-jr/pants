import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";

const icon = (padding) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="28" fill="#ffb6d9"/>
  <g transform="translate(${padding} ${padding}) scale(${(120 - padding * 2) / 120})">
    <path d="M26 18 h68 a6 6 0 0 1 6 6 v12 l-8 70 a6 6 0 0 1 -6 6 h-18 a6 6 0 0 1 -6 -6 l-2 -34 l-2 34 a6 6 0 0 1 -6 6 h-18 a6 6 0 0 1 -6 -6 l-8 -70 v-12 a6 6 0 0 1 6 -6 z" fill="#e8bfff" stroke="#ffffff" stroke-width="6" stroke-linejoin="round"/>
    <rect x="22" y="22" width="76" height="10" rx="5" fill="#7c3aed" opacity="0.35"/>
    <path d="M38 44 q6 -8 12 0 M70 44 q6 -8 12 0" fill="none" stroke="#7c3aed" stroke-width="4" stroke-linecap="round"/>
    <path d="M46 56 q14 16 28 0 z" fill="#7c3aed"/>
  </g>
</svg>`;

await mkdir("public/icons", { recursive: true });
const targets = [
  ["public/icons/icon-192.png", 192, 0],
  ["public/icons/icon-512.png", 512, 0],
  ["public/icons/icon-512-maskable.png", 512, 14],
  ["public/icons/apple-touch-icon.png", 180, 0],
];
for (const [file, size, padding] of targets) {
  await writeFile(file, await sharp(Buffer.from(icon(padding))).resize(size, size).png().toBuffer());
}
await writeFile("public/icons/icon.svg", icon(0).trim());
