#!/usr/bin/env node
// Generates icon-192.png and icon-512.png for Angel 11+ PWA
// Uses only Node.js built-ins (zlib, fs) — no npm packages required.
// Blue background (#2563eb, matching --color-primary), white "A" lettermark,
// centred. Zero-Purple final closure pass (2026-08-31): was purple
// (#7c3aed) — the actual generated app icon shown on a user's home screen
// when Angel is installed as a PWA, missed by every earlier Tailwind/CSS
// sweep since this script bakes the colour directly into PNG pixel data,
// not a class or token. Regenerated, not just recoloured in source.

const zlib = require("zlib");
const fs = require("fs");
const path = require("path");

// ── CRC-32 ────────────────────────────────────────────────────────────────────

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++)
    c = ((c >>> 8) ^ CRC_TABLE[(c ^ buf[i]) & 0xff]) >>> 0;
  return (c ^ 0xffffffff) >>> 0;
}

// ── PNG helpers ───────────────────────────────────────────────────────────────

function pngChunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

// ── Letter-A bitmap (8 × 7) ───────────────────────────────────────────────────
// Designed as a bold, clean capital "A" — legible at both 192 px and 512 px.

const A_BITMAP = [
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 0, 0, 1, 1, 0],
  [1, 1, 0, 0, 0, 0, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 0, 0, 0, 0, 1, 1],
  [1, 1, 0, 0, 0, 0, 1, 1],
  [1, 1, 0, 0, 0, 0, 1, 1],
];

const BITMAP_COLS = 8;
const BITMAP_ROWS = 7;

// ── PNG generator ─────────────────────────────────────────────────────────────

function generatePNG(size) {
  const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // colour type: RGB
  // bytes 10-12: compression=0, filter=0, interlace=0

  // Background: #2563eb  Foreground: #ffffff
  const BG = [37, 99, 235];
  const FG = [255, 255, 255];

  // Scale letter to 62% of icon width
  const cellW = Math.floor((size * 0.62) / BITMAP_COLS);
  const cellH = Math.floor(cellW * 1.05); // very slightly taller than wide
  const letterW = cellW * BITMAP_COLS;
  const letterH = cellH * BITMAP_ROWS;
  const ox = Math.floor((size - letterW) / 2);
  const oy = Math.floor((size - letterH) / 2);

  const rawRows = [];
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 3);
    // row[0] = 0  (PNG filter: None — already zero-initialised)
    for (let x = 0; x < size; x++) {
      const lx = x - ox;
      const ly = y - oy;
      let inLetter = false;
      if (lx >= 0 && lx < letterW && ly >= 0 && ly < letterH) {
        const col = Math.floor(lx / cellW);
        const row2 = Math.floor(ly / cellH);
        if (row2 < BITMAP_ROWS && col < BITMAP_COLS) {
          inLetter = A_BITMAP[row2][col] === 1;
        }
      }
      const [r, g, b] = inLetter ? FG : BG;
      const base = 1 + x * 3;
      row[base] = r;
      row[base + 1] = g;
      row[base + 2] = b;
    }
    rawRows.push(row);
  }

  const compressed = zlib.deflateSync(Buffer.concat(rawRows), { level: 9 });

  return Buffer.concat([
    PNG_SIG,
    pngChunk("IHDR", ihdrData),
    pngChunk("IDAT", compressed),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

// ── Write files ───────────────────────────────────────────────────────────────

const publicDir = path.join(__dirname, "..", "public");

fs.writeFileSync(path.join(publicDir, "icon-192.png"), generatePNG(192));
fs.writeFileSync(path.join(publicDir, "icon-512.png"), generatePNG(512));

console.log("✓ icon-192.png");
console.log("✓ icon-512.png");
