// Generates the PWA icons (and OG image) as PNGs with zero dependencies:
// solid brand-green background with a three-tile word-row motif.
// Usage: node scripts/make-icons.mjs

import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function png(width, height, pixels) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const stride = width * 4;
  const raw = Buffer.alloc(height * (stride + 1));
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const GREEN = [0x16, 0xa3, 0x4a, 255];
const WHITE = [0xff, 0xff, 0xff, 255];
const AMBER = [0xfb, 0xbf, 0x24, 255];
const DARK = [0x14, 0x53, 0x2d, 255];

function draw(size, ogWidth = null) {
  const width = ogWidth ?? size;
  const height = size;
  const pixels = Buffer.alloc(width * height * 4);
  const set = (x, y, [r, g, b, a]) => {
    const i = (y * width + x) * 4;
    pixels[i] = r;
    pixels[i + 1] = g;
    pixels[i + 2] = b;
    pixels[i + 3] = a;
  };
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) set(x, y, GREEN);

  // three tiles centered: white, amber, dark green
  const tile = Math.round(height * 0.22);
  const gap = Math.round(height * 0.05);
  const totalW = tile * 3 + gap * 2;
  const x0 = Math.round((width - totalW) / 2);
  const y0 = Math.round((height - tile) / 2);
  const colours = [WHITE, AMBER, DARK];
  colours.forEach((colour, i) => {
    const tx = x0 + i * (tile + gap);
    for (let y = y0; y < y0 + tile; y++)
      for (let x = tx; x < tx + tile; x++) set(x, y, colour);
  });
  return png(width, height, pixels);
}

mkdirSync("public/icons", { recursive: true });
writeFileSync("public/icons/icon-192.png", draw(192));
writeFileSync("public/icons/icon-512.png", draw(512));
writeFileSync("public/og.png", draw(630, 1200));
console.log("wrote public/icons/icon-192.png, icon-512.png, public/og.png");
