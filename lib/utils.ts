export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes;
  let unit = "B";
  for (const u of units) {
    if (value < 1024) break;
    value /= 1024;
    unit = u;
  }
  return `${value >= 100 ? Math.round(value) : value.toFixed(1)} ${unit}`;
}

/**
 * Wraps raw bytes (e.g. from pdf-lib's save()) in a Blob.
 * Copies into a fresh Uint8Array so TypeScript knows the view is backed by a
 * plain ArrayBuffer (not a SharedArrayBuffer), which BlobPart requires.
 */
export function bytesToBlob(bytes: Uint8Array, type: string): Blob {
  return new Blob([new Uint8Array(bytes)], { type });
}

/** Trigger a browser download for a blob. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Give the browser a moment to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** Replace a filename's extension, e.g. swapExt("photo.png", "webp") -> "photo.webp". */
export function swapExt(filename: string, ext: string): string {
  const base = filename.replace(/\.[^.]+$/, "");
  return `${base}.${ext}`;
}

export const SIZE_WARNING_BYTES = 50 * 1024 * 1024;

/**
 * Serializes an object for a JSON-LD <script> tag. Escapes "<" so the payload
 * can never terminate the script tag early (XSS hardening), per the OWASP
 * recommendation for embedding JSON in HTML.
 */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
