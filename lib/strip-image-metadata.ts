/**
 * Strip location and other hidden notes from JPEG, PNG, and WebP without
 * redrawing pixels. Phone photos often keep GPS in EXIF, XMP, IPTC, or a
 * trailer after the image — canvas redraw misses some of those and can
 * rotate or soften the picture.
 */

export type ImageKind = "jpeg" | "png" | "webp" | "heic" | "gif" | "unknown";

export function sniffImageKind(bytes: Uint8Array): ImageKind {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "png";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "webp";
  }
  if (bytes.length >= 12 && bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) {
    const brand = String.fromCharCode(bytes[8]!, bytes[9]!, bytes[10]!, bytes[11]!).toLowerCase();
    if (brand === "heic" || brand === "heix" || brand === "heif" || brand === "mif1" || brand === "msf1") {
      return "heic";
    }
  }
  if (bytes.length >= 6 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return "gif";
  return "unknown";
}

export function mimeForKind(kind: ImageKind, fallback = "image/jpeg"): string {
  if (kind === "jpeg") return "image/jpeg";
  if (kind === "png") return "image/png";
  if (kind === "webp") return "image/webp";
  if (kind === "gif") return "image/gif";
  if (kind === "heic") return "image/heic";
  return fallback;
}

/**
 * Returns a cleaned copy, or null if this format cannot be stripped in place
 * (HEIC, GIF, unknown). JPEG orientation 2–8 is kept as a tiny EXIF tag so
 * the photo does not appear rotated after GPS is removed.
 */
export function stripImageMetadata(bytes: Uint8Array, jpegOrientation?: number): Uint8Array | null {
  const kind = sniffImageKind(bytes);
  if (kind === "jpeg") return stripJpeg(bytes, jpegOrientation);
  if (kind === "png") return stripPng(bytes);
  if (kind === "webp") return stripWebp(bytes);
  return null;
}

function concat(parts: Uint8Array[]): Uint8Array {
  let total = 0;
  for (const p of parts) total += p.length;
  const out = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
}

function u16be(bytes: Uint8Array, i: number): number {
  return (bytes[i]! << 8) | bytes[i + 1]!;
}

function u32be(bytes: Uint8Array, i: number): number {
  return ((bytes[i]! << 24) | (bytes[i + 1]! << 16) | (bytes[i + 2]! << 8) | bytes[i + 3]!) >>> 0;
}

function u32le(bytes: Uint8Array, i: number): number {
  return (bytes[i]! | (bytes[i + 1]! << 8) | (bytes[i + 2]! << 16) | (bytes[i + 3]! << 24)) >>> 0;
}

function writeU32le(bytes: Uint8Array, i: number, value: number): void {
  bytes[i] = value & 0xff;
  bytes[i + 1] = (value >>> 8) & 0xff;
  bytes[i + 2] = (value >>> 16) & 0xff;
  bytes[i + 3] = (value >>> 24) & 0xff;
}

function asciiAt(bytes: Uint8Array, i: number, text: string): boolean {
  if (i + text.length > bytes.length) return false;
  for (let n = 0; n < text.length; n++) {
    if (bytes[i + n] !== text.charCodeAt(n)) return false;
  }
  return true;
}

/** Tiny EXIF with only Orientation, so portrait shots still display upright. */
function orientationApp1(orientation: number): Uint8Array {
  const tiff = new Uint8Array([
    0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x12, 0x01, 0x03, 0x00, 0x01, 0x00,
    0x00, 0x00, orientation & 0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  ]);
  const payload = concat([new Uint8Array([0x45, 0x78, 0x69, 0x66, 0x00, 0x00]), tiff]);
  const len = payload.length + 2;
  return concat([new Uint8Array([0xff, 0xe1, (len >> 8) & 0xff, len & 0xff]), payload]);
}

function keepJpegAppn(marker: number, segment: Uint8Array): boolean {
  if (marker === 0xe0) return true;
  if (marker === 0xee) return true;
  if (marker === 0xe2) return asciiAt(segment, 4, "ICC_PROFILE\u0000");
  return false;
}

function copyJpegScanThroughEoi(bytes: Uint8Array, sosFf: number): Uint8Array {
  let i = sosFf + 2;
  if (i + 1 >= bytes.length) return bytes.subarray(sosFf);
  const sosLen = u16be(bytes, i);
  i += sosLen;
  while (i < bytes.length) {
    if (bytes[i] !== 0xff) {
      i++;
      continue;
    }
    if (i + 1 >= bytes.length) break;
    const next = bytes[i + 1]!;
    if (next === 0x00 || (next >= 0xd0 && next <= 0xd7)) {
      i += 2;
      continue;
    }
    if (next === 0xd9) {
      return bytes.slice(sosFf, i + 2);
    }
    i += 2;
  }
  return bytes.slice(sosFf);
}

function stripJpeg(bytes: Uint8Array, orientation?: number): Uint8Array {
  const parts: Uint8Array[] = [new Uint8Array([0xff, 0xd8])];
  const keepOrient = orientation != null && orientation >= 2 && orientation <= 8 ? orientation : 0;
  let insertedOrient = false;

  const insertOrient = () => {
    if (keepOrient && !insertedOrient) {
      parts.push(orientationApp1(keepOrient));
      insertedOrient = true;
    }
  };

  let i = 2;
  while (i < bytes.length) {
    if (bytes[i] !== 0xff) {
      i++;
      continue;
    }
    let ff = i;
    while (ff + 1 < bytes.length && bytes[ff + 1] === 0xff) ff++;
    if (ff + 1 >= bytes.length) break;
    const marker = bytes[ff + 1]!;

    if (marker === 0xd9) break;

    if (marker === 0xda) {
      insertOrient();
      parts.push(copyJpegScanThroughEoi(bytes, ff));
      break;
    }

    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) {
      i = ff + 2;
      continue;
    }

    const lenOff = ff + 2;
    if (lenOff + 1 >= bytes.length) break;
    const len = u16be(bytes, lenOff);
    const end = lenOff + len;
    if (end > bytes.length || len < 2) break;

    const segment = bytes.subarray(ff, end);
    const isApp = marker >= 0xe0 && marker <= 0xef;
    const drop = marker === 0xfe || (isApp && !keepJpegAppn(marker, segment));
    if (!drop) {
      if (marker === 0xe0) {
        parts.push(bytes.slice(ff, end));
        insertOrient();
      } else {
        insertOrient();
        parts.push(bytes.slice(ff, end));
      }
    }
    i = end;
  }

  insertOrient();
  return concat(parts);
}

const PNG_DROP = new Set(["eXIf", "tEXt", "zTXt", "iTXt", "tIME"]);

function stripPng(bytes: Uint8Array): Uint8Array {
  const parts: Uint8Array[] = [bytes.slice(0, 8)];
  let i = 8;
  while (i + 12 <= bytes.length) {
    const dataLen = u32be(bytes, i);
    const type = String.fromCharCode(bytes[i + 4]!, bytes[i + 5]!, bytes[i + 6]!, bytes[i + 7]!);
    const chunkEnd = i + 12 + dataLen;
    if (chunkEnd > bytes.length) break;
    if (!PNG_DROP.has(type)) {
      parts.push(bytes.slice(i, chunkEnd));
    }
    i = chunkEnd;
    if (type === "IEND") break;
  }
  return concat(parts);
}

function stripWebp(bytes: Uint8Array): Uint8Array {
  const chunks: { fourcc: string; data: Uint8Array }[] = [];
  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const fourcc = String.fromCharCode(bytes[offset]!, bytes[offset + 1]!, bytes[offset + 2]!, bytes[offset + 3]!);
    const size = u32le(bytes, offset + 4);
    const dataStart = offset + 8;
    const dataEnd = dataStart + size;
    if (dataEnd > bytes.length) break;
    const padded = size + (size & 1);
    if (fourcc !== "EXIF" && fourcc !== "XMP ") {
      chunks.push({ fourcc, data: bytes.slice(dataStart, dataEnd) });
    }
    offset = dataStart + padded;
  }

  for (const chunk of chunks) {
    if (chunk.fourcc === "VP8X" && chunk.data.length >= 1) {
      const data = new Uint8Array(chunk.data);
      data[0] = data[0]! & ~(1 << 3) & ~(1 << 2);
      chunk.data = data;
    }
  }

  let body = 4;
  for (const chunk of chunks) {
    body += 8 + chunk.data.length + (chunk.data.length & 1);
  }
  const out = new Uint8Array(8 + body);
  out.set([0x52, 0x49, 0x46, 0x46], 0);
  writeU32le(out, 4, body);
  out.set([0x57, 0x45, 0x42, 0x50], 8);
  let o = 12;
  for (const chunk of chunks) {
    out[o] = chunk.fourcc.charCodeAt(0);
    out[o + 1] = chunk.fourcc.charCodeAt(1);
    out[o + 2] = chunk.fourcc.charCodeAt(2);
    out[o + 3] = chunk.fourcc.charCodeAt(3);
    writeU32le(out, o + 4, chunk.data.length);
    out.set(chunk.data, o + 8);
    o += 8 + chunk.data.length;
    if (chunk.data.length & 1) {
      out[o] = 0;
      o++;
    }
  }
  return out;
}
