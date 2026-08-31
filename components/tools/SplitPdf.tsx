"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import DownloadButton from "@/components/DownloadButton";
import FileDropzone from "@/components/FileDropzone";
import Icon from "@/components/Icon";
import { bytesToBlob, formatBytes, swapExt } from "@/lib/utils";

type Range = { from: number; to: number };

/** Parses "1-3, 5, 8-10" into ranges (1-based, inclusive). Throws with a friendly message. */
function parseRanges(input: string, pageCount: number): Range[] {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("Enter at least one page or range, e.g. 1-3, 5.");
  const parts = trimmed.split(",").map((p) => p.trim()).filter(Boolean);
  const ranges: Range[] = [];
  for (const part of parts) {
    const match = part.match(/^(\d+)\s*(?:-\s*(\d+))?$/);
    if (!match) {
      throw new Error(`"${part}" is not a valid page or range. Use numbers like 5 or ranges like 2-8.`);
    }
    const from = parseInt(match[1], 10);
    const to = match[2] ? parseInt(match[2], 10) : from;
    if (from < 1 || to < 1) throw new Error("Page numbers start at 1.");
    if (from > to) throw new Error(`Range "${part}" is backwards. The first number must be smaller.`);
    if (to > pageCount) {
      throw new Error(`Page ${to} does not exist. This document has ${pageCount} page${pageCount === 1 ? "" : "s"}.`);
    }
    ranges.push({ from, to });
  }
  return ranges;
}

export default function SplitPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [rangeInput, setRangeInput] = useState("");
  const [mode, setMode] = useState<"single" | "separate">("single");
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onFile(files: File[]) {
    const f = files[0];
    setFile(f);
    setResult(null);
    setError(null);
    setPageCount(null);
    setLoading(true);
    try {
      const doc = await PDFDocument.load(await f.arrayBuffer());
      setPageCount(doc.getPageCount());
    } catch {
      setError(`Could not read "${f.name}". It may be corrupted or password-protected.`);
      setFile(null);
    } finally {
      setLoading(false);
    }
  }

  async function split() {
    if (!file || pageCount === null) return;
    setProcessing(true);
    setError(null);
    setResult(null);
    try {
      const ranges = parseRanges(rangeInput, pageCount);
      const source = await PDFDocument.load(await file.arrayBuffer());
      const baseName = file.name.replace(/\.pdf$/i, "");

      if (mode === "single" || ranges.length === 1) {
        const out = await PDFDocument.create();
        for (const { from, to } of ranges) {
          const indices = Array.from({ length: to - from + 1 }, (_, i) => from - 1 + i);
          const pages = await out.copyPages(source, indices);
          pages.forEach((p) => out.addPage(p));
        }
        const bytes = await out.save();
        setResult({
          blob: bytesToBlob(bytes, "application/pdf"),
          filename: `${baseName}-pages.pdf`,
        });
      } else {
        const { default: JSZip } = await import("jszip");
        const zip = new JSZip();
        for (const { from, to } of ranges) {
          const out = await PDFDocument.create();
          const indices = Array.from({ length: to - from + 1 }, (_, i) => from - 1 + i);
          const pages = await out.copyPages(source, indices);
          pages.forEach((p) => out.addPage(p));
          const bytes = await out.save();
          const label = from === to ? `page-${from}` : `pages-${from}-${to}`;
          zip.file(`${baseName}-${label}.pdf`, bytes);
        }
        const blob = await zip.generateAsync({ type: "blob" });
        setResult({ blob, filename: swapExt(file.name, "zip") });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong while splitting. Please try again.");
    } finally {
      setProcessing(false);
    }
  }

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

      {file && pageCount !== null && (
        <>
          <div className="rounded-xl border border-cream-200 bg-white px-4 py-3 dark:border-white/15 dark:bg-black">
            <p className="truncate text-sm font-medium text-ink dark:text-white">{file.name}</p>
            <p className="text-xs text-ink-muted dark:text-white/55">
              {pageCount} page{pageCount === 1 ? "" : "s"} &middot; {formatBytes(file.size)}
            </p>
          </div>

          <div>
            <label htmlFor="ranges" className="block text-sm font-medium text-ink dark:text-white/70">
              Pages to extract
            </label>
            <input
              id="ranges"
              type="text"
              value={rangeInput}
              onChange={(e) => {
                setRangeInput(e.target.value);
                setResult(null);
              }}
              placeholder={`e.g. 1-3, 5, 8-${pageCount}`}
              className="mt-1.5 w-full rounded-xl border border-cream-200 bg-white px-4 py-2.5 text-ink placeholder:text-ink-muted focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-500/30 dark:border-white/15 dark:bg-black dark:text-white"
            />
            <p className="mt-1.5 text-xs text-ink-muted dark:text-white/55">
              Separate pages and ranges with commas. Example: 1-3, 5, 8-10
            </p>
          </div>

          <fieldset>
            <legend className="text-sm font-medium text-ink dark:text-white/70">Output</legend>
            <div className="mt-2 space-y-2">
              {(
                [
                  { value: "single", label: "One PDF containing all selected pages" },
                  { value: "separate", label: "One file per range (downloads as ZIP)" },
                ] as const
              ).map((option) => (
                <label key={option.value} className="flex cursor-pointer items-center gap-2.5 text-sm text-ink dark:text-white/70">
                  <input
                    type="radio"
                    name="split-mode"
                    value={option.value}
                    checked={mode === option.value}
                    onChange={() => {
                      setMode(option.value);
                      setResult(null);
                    }}
                    className="h-4 w-4 accent-accent-600"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
        </>
      )}

      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          <Icon name="alert" size={18} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      {file && pageCount !== null && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={split}
            disabled={processing || !rangeInput.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-5 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing && <Icon name="spinner" size={18} className="animate-spin" />}
            {processing ? "Splitting..." : "Split PDF"}
          </button>
          {result && (
            <DownloadButton blob={result.blob} filename={result.filename}>
              Download {result.filename.endsWith(".zip") ? "ZIP" : "PDF"}
            </DownloadButton>
          )}
        </div>
      )}
    </div>
  );
}
