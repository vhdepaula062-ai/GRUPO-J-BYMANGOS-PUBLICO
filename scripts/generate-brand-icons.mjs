import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

function createPng(width, height, r, g, b, text) {
  // Create RGBA raw buffer
  const rowBytes = width * 4 + 1; // +1 for filter byte 0
  const rawData = Buffer.alloc(rowBytes * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Check if pixel is part of stylized "J" or frame
      const isCenterBox =
        x >= width * 0.35 &&
        x <= width * 0.65 &&
        y >= height * 0.35 &&
        y <= height * 0.65;
      const isBorder =
        x <= 8 || x >= width - 8 || y <= 8 || y >= height - 8;

      if (isBorder) {
        rawData[pxOffset] = 0x00;     // R
        rawData[pxOffset + 1] = 0x52; // G
        rawData[pxOffset + 2] = 0xFF; // B (Electric Blue accent)
        rawData[pxOffset + 3] = 0xFF; // A
      } else if (isCenterBox) {
        rawData[pxOffset] = 0xFF;     // White
        rawData[pxOffset + 1] = 0xFF;
        rawData[pxOffset + 2] = 0xFF;
        rawData[pxOffset + 3] = 0xFF;
      } else {
        rawData[pxOffset] = r;
        rawData[pxOffset + 1] = g;
        rawData[pxOffset + 2] = b;
        rawData[pxOffset + 3] = 0xFF;
      }
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth
  ihdrData[9] = 6; // Color type (RGBA)
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace
  const ihdrChunk = createChunk("IHDR", ihdrData);

  // IDAT Chunk
  const idatChunk = createChunk("IDAT", deflated);

  // IEND Chunk
  const iendChunk = createChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4);
  data.copy(chunk, 8);

  const crcTarget = chunk.subarray(4, 8 + len);
  const crcVal = crc32(crcTarget);
  chunk.writeUInt32BE(crcVal, 8 + len);
  return chunk;
}

// Standard CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c >>> 0;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Brand navy background: #00091D (R: 0, G: 9, B: 29)
const navyR = 0, navyG = 9, navyB = 29;

const targets = [
  { dir: "apps/customer-mobile/assets", name: "icon.png", w: 512, h: 512 },
  { dir: "apps/customer-mobile/assets", name: "adaptive-icon.png", w: 512, h: 512 },
  { dir: "apps/customer-mobile/assets", name: "splash.png", w: 1024, h: 1024 },
  { dir: "apps/admin-web/public/icons", name: "icon-192.png", w: 192, h: 192 },
  { dir: "apps/admin-web/public/icons", name: "icon-512.png", w: 512, h: 512 },
  { dir: "apps/admin-web/public/icons", name: "icon-maskable.png", w: 512, h: 512 },
  { dir: "apps/workshop-web/public/icons", name: "icon-192.png", w: 192, h: 192 },
  { dir: "apps/workshop-web/public/icons", name: "icon-512.png", w: 512, h: 512 },
  { dir: "apps/workshop-web/public/icons", name: "icon-maskable.png", w: 512, h: 512 }
];

for (const t of targets) {
  const fullDir = path.resolve(t.dir);
  if (!fs.existsSync(fullDir)) {
    fs.mkdirSync(fullDir, { recursive: true });
  }
  const outPath = path.join(fullDir, t.name);
  const png = createPng(t.w, t.h, navyR, navyG, navyB, "J");
  fs.writeFileSync(outPath, png);
  console.log(`Generated icon: ${outPath} (${png.length} bytes)`);
}
