import { copyFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const destDir = join(root, "public");
const dest = join(destDir, "pdf.worker.min.mjs");

const candidates = [
  "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
  "pdfjs-dist/build/pdf.worker.min.mjs",
];

let src;
for (const id of candidates) {
  try {
    src = require.resolve(id);
    break;
  } catch {
    // try next path (pdf.js version layout differs)
  }
}

if (!src) {
  console.warn("pdfjs-dist worker not found; PDF preview/text extraction may fail until npm install completes.");
  process.exit(0);
}

mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);
console.log(`Copied PDF.js worker to public/pdf.worker.min.mjs`);
