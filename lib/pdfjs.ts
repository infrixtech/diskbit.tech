import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from "pdfjs-dist/legacy/build/pdf.mjs";
import { canvasToBlob } from "@/lib/image";

let workerReady = false;

/** Point PDF.js at the worker copied into /public on install and build. */
export function ensurePdfWorker(): void {
  if (workerReady || typeof window === "undefined") return;
  GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  workerReady = true;
}

export async function loadPdfJsDocument(data: ArrayBuffer): Promise<PDFDocumentProxy> {
  ensurePdfWorker();
  return getDocument({ data: new Uint8Array(data) }).promise;
}

export async function renderPdfPageToCanvas(
  pdf: PDFDocumentProxy,
  pageNumber: number,
  maxWidth: number
): Promise<HTMLCanvasElement> {
  const page = await pdf.getPage(pageNumber);
  const unscaled = page.getViewport({ scale: 1 });
  const scale = Math.min(1.5, maxWidth / unscaled.width);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(viewport.width));
  canvas.height = Math.max(1, Math.round(viewport.height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser could not draw this PDF page.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas;
}

export async function renderPdfPageJpeg(
  pdf: PDFDocumentProxy,
  pageNumber: number,
  maxWidth: number,
  quality: number
): Promise<Blob> {
  const canvas = await renderPdfPageToCanvas(pdf, pageNumber, maxWidth);
  return canvasToBlob(canvas, "image/jpeg", quality);
}
