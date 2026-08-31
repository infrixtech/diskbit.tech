"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import DownloadButton from "@/components/DownloadButton";
import FileDropzone from "@/components/FileDropzone";
import Icon from "@/components/Icon";
import { loadPdfJsDocument } from "@/lib/pdfjs";
import { bytesToBlob, formatBytes } from "@/lib/utils";

const THUMBNAIL_LIMIT = 60;

/** Parses "10, 12, 15-17" into 0-based page indexes. */
function parseDeleteList(input: string, pageCount: number): number[] {
  const trimmed = input.trim();
  if (!trimmed) return [];
  const parts = trimmed.split(",").map((p) => p.trim()).filter(Boolean);
  const pages = new Set<number>();
  for (const part of parts) {
    const match = part.match(/^(\d+)\s*(?:-\s*(\d+))?$/);
    if (!match) {
      throw new Error(`"${part}" is not a page number. Use 10, 12 or a range like 3-5.`);
    }
    const from = parseInt(match[1], 10);
    const to = match[2] ? parseInt(match[2], 10) : from;
    if (from < 1 || to < 1) throw new Error("Page numbers start at 1.");
    if (from > to) throw new Error(`"${part}" is backwards. Put the smaller number first.`);
    if (to > pageCount) {
      throw new Error(`Page ${to} does not exist. This file has ${pageCount} page${pageCount === 1 ? "" : "s"}.`);
    }
    for (let n = from; n <= to; n++) pages.add(n - 1);
  }
  return [...pages].sort((a, b) => a - b);
}

function selectionToText(selected: Set<number>): string {
  return [...selected]
    .sort((a, b) => a - b)
    .map((i) => String(i + 1))
    .join(", ");
}

export default function DeletePdfPages() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [typed, setTyped] = useState("");
  const [thumbs, setThumbs] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onFile(files: File[]) {
    const f = files[0];
    setFile(f);
    setResult(null);
    setError(null);
    setSelected(new Set());
    setTyped("");
    setThumbs({});
    setPageCount(0);
    setLoading(true);
    try {
      const bytes = await f.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const count = doc.getPageCount();
      setPageCount(count);
      if (count <= THUMBNAIL_LIMIT) {
        void loadThumbs(bytes.slice(0), count);
      }
    } catch {
      setError(`Could not read "${f.name}". It may be damaged or password-protected.`);
      setFile(null);
    } finally {
      setLoading(false);
    }
  }

  async function loadThumbs(data: ArrayBuffer, count: number) {
    try {
      const pdf = await loadPdfJsDocument(data);
      for (let i = 1; i <= count; i++) {
        const page = await pdf.getPage(i);
        const unscaled = page.getViewport({ scale: 1 });
        const scale = 120 / unscaled.width;
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        await page.render({ canvasContext: ctx, viewport }).promise;
        const url = canvas.toDataURL("image/jpeg", 0.55);
        setThumbs((prev) => ({ ...prev, [i - 1]: url }));
      }
    } catch {
      // Thumbnails are a nicety. Numbered buttons still work.
    }
  }

  function applySelection(next: Set<number>, syncTyped = true) {
    setSelected(next);
    if (syncTyped) setTyped(selectionToText(next));
    setResult(null);
    setError(null);
  }

  function toggle(index: number) {
    const next = new Set(selected);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    applySelection(next);
  }

  function onTyped(value: string) {
    setTyped(value);
    setResult(null);
    if (!value.trim()) {
      setSelected(new Set());
      setError(null);
      return;
    }
    if (/[,\-\s]$/.test(value)) {
      setError(null);
      return;
    }
    try {
      applySelection(new Set(parseDeleteList(value, pageCount)), false);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Check the page numbers.");
    }
  }

  async function deletePages() {
    if (!file || selected.size === 0) return;
    if (selected.size >= pageCount) {
      setError("Keep at least one page. Select fewer pages to delete.");
      return;
    }
    setProcessing(true);
    setError(null);
    setResult(null);
    try {
      const source = await PDFDocument.load(await file.arrayBuffer());
      const keep = Array.from({ length: pageCount }, (_, i) => i).filter((i) => !selected.has(i));
      const out = await PDFDocument.create();
      const pages = await out.copyPages(source, keep);
      pages.forEach((p) => out.addPage(p));
      setResult(bytesToBlob(await out.save(), "application/pdf"));
    } catch {
      setError("Something went wrong while removing pages. Please try again.");
    } finally {
      setProcessing(false);
    }
  }

  const remaining = pageCount - selected.size;

  return (
    <div className="space-y-5">
      <FileDropzone
        accept="application/pdf,.pdf"
        acceptLabel="a PDF file"
        compact={!!file}
        onFiles={onFile}
      />

      {loading && (
        <p className="flex items-center gap-2 text-sm text-ink-muted dark:text-white/55">
          <Icon name="spinner" size={16} className="animate-spin" /> Reading document...
        </p>
      )}

      {file && pageCount > 0 && (
        <>
          <div className="rounded-xl border border-cream-200 bg-white px-4 py-3 dark:border-white/15 dark:bg-black">
            <p className="truncate text-sm font-medium text-ink dark:text-white">{file.name}</p>
            <p className="text-xs text-ink-muted dark:text-white/55">
              {pageCount} page{pageCount === 1 ? "" : "s"} &middot; {formatBytes(file.size)}
            </p>
          </div>

          <div>
            <label htmlFor="delete-pages" className="block text-sm font-medium text-ink dark:text-white/80">
              Type page numbers to remove
            </label>
            <input
              id="delete-pages"
              type="text"
              value={typed}
              onChange={(e) => onTyped(e.target.value)}
              placeholder={`e.g. 10, 12 or 3-5  (this file has ${pageCount} pages)`}
              className="mt-1.5 w-full rounded-lg border border-cream-200 bg-white px-4 py-2.5 text-ink placeholder:text-ink-muted focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-600/20 dark:border-white/15 dark:bg-black dark:text-white"
            />
            <p className="mt-1.5 text-xs text-ink-muted dark:text-white/55">
              Separate pages with commas. You can also tap pages below. Both stay in sync.
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-ink dark:text-white/80">Or tap pages to delete</p>
            {pageCount > THUMBNAIL_LIMIT && (
              <p className="mt-1 text-xs text-ink-muted dark:text-white/55">
                This file is long, so pages are shown as numbers instead of pictures.
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {Array.from({ length: pageCount }, (_, i) => {
              const on = selected.has(i);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggle(i)}
                  aria-pressed={on}
                  className={`relative overflow-hidden rounded-lg border-2 text-left transition-colors ${
                    on
                      ? "border-red-600 bg-red-50 dark:border-red-400 dark:bg-red-900/20"
                      : "border-cream-200 bg-white hover:border-accent-500 dark:border-white/15 dark:bg-black"
                  }`}
                >
                  {thumbs[i] ? (
                    <img src={thumbs[i]} alt="" className="h-28 w-full bg-white object-contain dark:bg-black" />
                  ) : (
                    <div className="flex h-28 items-center justify-center bg-white text-2xl font-bold text-ink-muted dark:bg-black">
                      {i + 1}
                    </div>
                  )}
                  <span className="flex items-center justify-between px-2 py-1.5 text-xs font-medium text-ink dark:text-white/70">
                    Page {i + 1}
                    {on && <span className="text-red-700 dark:text-red-400">Remove</span>}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-sm text-ink-muted dark:text-white/70">
            {selected.size === 0
              ? "No pages selected yet."
              : `${selected.size} page${selected.size === 1 ? "" : "s"} will be deleted. ${remaining} will remain.`}
          </p>
        </>
      )}

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-300"
        >
          <Icon name="alert" size={18} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      {file && pageCount > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={deletePages}
            disabled={processing || selected.size === 0 || selected.size >= pageCount}
            className="inline-flex items-center gap-2 rounded-lg bg-accent-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing && <Icon name="spinner" size={18} className="animate-spin" />}
            {processing ? "Removing pages..." : "Delete selected pages"}
          </button>
          {result && (
            <DownloadButton blob={result} filename={file.name.replace(/\.pdf$/i, "-edited.pdf")}>
              Download PDF
            </DownloadButton>
          )}
        </div>
      )}
    </div>
  );
}
