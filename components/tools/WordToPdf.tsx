"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import DownloadButton from "@/components/DownloadButton";
import FileDropzone from "@/components/FileDropzone";
import Icon from "@/components/Icon";
import { canvasToBlob, loadImage } from "@/lib/image";
import { bytesToBlob, formatBytes, swapExt } from "@/lib/utils";

const PAGE_MARGIN_PT = 40;
const CONTENT_WIDTH_PT = 595.28 - PAGE_MARGIN_PT * 2;
const LAYOUT_WIDTH_PX = 700;
const A4 = { width: 595.28, height: 841.89 };

const ACCEPT =
  ".docx,.pptx,.html,.htm,.txt,.md,.csv,.rtf,.png,.jpg,.jpeg,.webp,.gif,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/html,text/plain,image/*";

function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}

function sanitizeHtml(html: string): DocumentFragment {
  const parsed = new DOMParser().parseFromString(html, "text/html");
  parsed.querySelectorAll("script, iframe, object, embed, link, meta").forEach((el) => el.remove());
  parsed.querySelectorAll("*").forEach((el) => {
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      if (name.startsWith("on") || name === "srcdoc") el.removeAttribute(attr.name);
      if ((name === "href" || name === "src") && /^\s*javascript:/i.test(attr.value)) {
        el.removeAttribute(attr.name);
      }
    }
  });
  const fragment = document.createDocumentFragment();
  Array.from(parsed.body.childNodes).forEach((node) => fragment.appendChild(node));
  return fragment;
}

const DOC_STYLES = `
  font-family: Georgia, "Times New Roman", serif;
  font-size: 15px;
  line-height: 1.55;
  color: #1c1915;
  background: #ffffff;
`;

async function htmlToPdf(html: string, notes: string[]): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  if (!html.trim()) throw new Error("This file appears to be empty, so there is nothing to convert.");
  const container = document.createElement("div");
  container.style.cssText = `position: absolute; left: -10000px; top: 0; width: ${LAYOUT_WIDTH_PX}px; ${DOC_STYLES}`;
  container.innerHTML = `
    <style>
      .ts-doc h1 { font-size: 26px; margin: 18px 0 10px; }
      .ts-doc h2 { font-size: 21px; margin: 16px 0 8px; }
      .ts-doc h3 { font-size: 17px; margin: 14px 0 6px; }
      .ts-doc p { margin: 0 0 10px; white-space: pre-wrap; }
      .ts-doc ul, .ts-doc ol { margin: 0 0 10px; padding-left: 26px; }
      .ts-doc li { margin-bottom: 4px; }
      .ts-doc table { border-collapse: collapse; margin: 0 0 12px; }
      .ts-doc td, .ts-doc th { border: 1px solid #999999; padding: 4px 8px; }
      .ts-doc img { max-width: 100%; height: auto; }
    </style>
    <div class="ts-doc"></div>
  `;
  container.querySelector(".ts-doc")!.appendChild(sanitizeHtml(html));
  document.body.appendChild(container);
  try {
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    await pdf.html(container.querySelector(".ts-doc") as HTMLElement, {
      margin: [PAGE_MARGIN_PT, PAGE_MARGIN_PT, PAGE_MARGIN_PT, PAGE_MARGIN_PT],
      autoPaging: "text",
      width: CONTENT_WIDTH_PT,
      windowWidth: LAYOUT_WIDTH_PX,
    });
    return pdf.output("blob");
  } finally {
    container.remove();
    void notes;
  }
}

async function imageToPdf(file: File): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser could not read this image.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
  const jpeg = await canvasToBlob(canvas, "image/jpeg", 0.92);
  const doc = await PDFDocument.create();
  const embedded = await doc.embedJpg(await jpeg.arrayBuffer());
  const scale = Math.min((A4.width - 48) / embedded.width, (A4.height - 48) / embedded.height, 1);
  const w = embedded.width * scale;
  const h = embedded.height * scale;
  const page = doc.addPage([A4.width, A4.height]);
  page.drawImage(embedded, {
    x: (A4.width - w) / 2,
    y: (A4.height - h) / 2,
    width: w,
    height: h,
  });
  return bytesToBlob(await doc.save(), "application/pdf");
}

async function pptxToPdf(file: File, notes: string[]): Promise<Blob> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const slidePaths = Object.keys(zip.files)
    .filter((n) => /^ppt\/slides\/slide\d+\.xml$/i.test(n))
    .sort((a, b) => {
      const na = parseInt(a.match(/slide(\d+)/i)?.[1] ?? "0", 10);
      const nb = parseInt(b.match(/slide(\d+)/i)?.[1] ?? "0", 10);
      return na - nb;
    });
  if (slidePaths.length === 0) {
    throw new Error(`Could not read slides in "${file.name}". Make sure it is a .pptx file.`);
  }
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  let first = true;
  for (const path of slidePaths) {
    const xml = await zip.file(path)!.async("string");
    const lines = [...xml.matchAll(/<a:t(?:\s[^>]*)?>([^<]*)<\/a:t>/g)]
      .map((m) => m[1].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim())
      .filter(Boolean);
    if (!first) pdf.addPage();
    first = false;
    let y = 56;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(14);
    pdf.setTextColor(28, 25, 21);
    if (lines.length === 0) {
      pdf.setTextColor(100, 100, 100);
      pdf.text("(This slide has no readable text.)", 48, y);
    } else {
      for (const line of lines) {
        const wrapped = pdf.splitTextToSize(line, A4.width - 96) as string[];
        for (const row of wrapped) {
          if (y > A4.height - 56) {
            pdf.addPage();
            y = 56;
          }
          pdf.text(row, 48, y);
          y += 20;
        }
        y += 8;
      }
    }
  }
  notes.push("PowerPoint files keep the words from each slide. Fancy layouts and some pictures may not carry over.");
  return pdf.output("blob");
}

export default function WordToPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [notes, setNotes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  function onFile(files: File[]) {
    setFile(files[0]);
    setResult(null);
    setNotes([]);
    setError(null);
  }

  async function convert() {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setResult(null);
    setNotes([]);
    const notesAcc: string[] = [];
    try {
      const ext = extOf(file.name);
      const type = file.type.toLowerCase();
      const isImage =
        type.startsWith("image/") || ["png", "jpg", "jpeg", "webp", "gif"].includes(ext);
      let blob: Blob;

      if (isImage) {
        blob = await imageToPdf(file);
      } else if (ext === "docx") {
        const mammoth = await import("mammoth");
        let html = "";
        try {
          const converted = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
          html = converted.value;
          notesAcc.push(...Array.from(new Set(converted.messages.map((m) => m.message))).slice(0, 5));
        } catch {
          throw new Error(
            `Could not read "${file.name}". Old .doc files need to be saved as .docx first.`
          );
        }
        blob = await htmlToPdf(html, notesAcc);
      } else if (ext === "pptx") {
        blob = await pptxToPdf(file, notesAcc);
      } else if (ext === "html" || ext === "htm" || type === "text/html") {
        blob = await htmlToPdf(await file.text(), notesAcc);
      } else if (["txt", "md", "csv", "rtf"].includes(ext) || type.startsWith("text/")) {
        const text = await file.text();
        const escaped = text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        blob = await htmlToPdf(`<pre style="font-family: Georgia, serif; white-space: pre-wrap;">${escaped}</pre>`, notesAcc);
      } else {
        throw new Error(
          `"${file.name}" is not a type this tool can turn into a PDF. Try Word (.docx), PowerPoint (.pptx), HTML, a text file, or an image.`
        );
      }
      setResult(blob);
      setNotes(notesAcc);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Something went wrong while converting. Please try again with a different file."
      );
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-5">
      <FileDropzone
        accept={ACCEPT}
        acceptLabel="a document, slideshow, web page, text file, or image"
        compact={!!file}
        onFiles={onFile}
      />

      {file && (
        <div className="rounded-xl border border-cream-200 bg-white px-4 py-3 dark:border-white/15 dark:bg-black">
          <p className="truncate text-sm font-medium text-ink dark:text-white">{file.name}</p>
          <p className="text-xs text-ink-muted dark:text-white/55">{formatBytes(file.size)}</p>
        </div>
      )}

      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-300">
          <Icon name="alert" size={18} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      {notes.length > 0 && (
        <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-900/20 dark:text-amber-200">
          <p className="font-semibold">Notes:</p>
          <ul className="mt-1 list-disc pl-5">
            {notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      )}

      {file && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={convert}
            disabled={processing}
            className="inline-flex items-center gap-2 rounded-lg bg-accent-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing && <Icon name="spinner" size={18} className="animate-spin" />}
            {processing ? "Converting..." : "Convert to PDF"}
          </button>
          {result && (
            <DownloadButton blob={result} filename={swapExt(file.name, "pdf")}>
              Download PDF
            </DownloadButton>
          )}
        </div>
      )}

      <p className="text-xs text-ink-muted dark:text-white/55">
        Works with Word (.docx), PowerPoint (.pptx), HTML, text files, and common images. Old .doc
        files need to be saved as .docx first.
      </p>
    </div>
  );
}
