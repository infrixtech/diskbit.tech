"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import DownloadButton from "@/components/DownloadButton";
import FileDropzone from "@/components/FileDropzone";
import Icon from "@/components/Icon";
import { loadPdfJsDocument, renderPdfPageJpeg } from "@/lib/pdfjs";
import { bytesToBlob, formatBytes } from "@/lib/utils";

const MIN_TARGET_BYTES = 80 * 1024;

async function losslessCompress(file: File, removeMetadata: boolean): Promise<Uint8Array> {
  const doc = await PDFDocument.load(await file.arrayBuffer(), { updateMetadata: false });
  if (removeMetadata) {
    doc.setTitle("");
    doc.setAuthor("");
    doc.setSubject("");
    doc.setKeywords([]);
    doc.setProducer("");
    doc.setCreator("");
  }
  return doc.save({ useObjectStreams: true });
}

async function rasterizeToTarget(
  sourceBytes: ArrayBuffer,
  targetBytes: number,
  onProgress: (message: string) => void
): Promise<{ bytes: Uint8Array; hitTarget: boolean }> {
  const pdf = await loadPdfJsDocument(sourceBytes);
  const pageCount = pdf.numPages;
  const attempts: { maxWidth: number; quality: number }[] = [
    { maxWidth: 1200, quality: 0.72 },
    { maxWidth: 1000, quality: 0.55 },
    { maxWidth: 850, quality: 0.4 },
    { maxWidth: 700, quality: 0.28 },
  ];

  let smallest: Uint8Array | null = null;

  for (const attempt of attempts) {
    onProgress(`Trying a smaller version (${Math.round(attempt.quality * 100)}% picture quality)…`);
    const out = await PDFDocument.create();
    for (let i = 1; i <= pageCount; i++) {
      const jpeg = await renderPdfPageJpeg(pdf, i, attempt.maxWidth, attempt.quality);
      const image = await out.embedJpg(await jpeg.arrayBuffer());
      const page = out.addPage([image.width, image.height]);
      page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
    }
    const bytes = await out.save({ useObjectStreams: true });
    if (!smallest || bytes.length < smallest.length) smallest = bytes;
    if (bytes.length <= targetBytes) return { bytes, hitTarget: true };
  }

  return { bytes: smallest ?? new Uint8Array(), hitTarget: false };
}

export default function CompressPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [removeMetadata, setRemoveMetadata] = useState(true);
  const [targetMb, setTargetMb] = useState("");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [result, setResult] = useState<Blob | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onFile(files: File[]) {
    setFile(files[0]);
    setResult(null);
    setError(null);
    setWarning(null);
    setProgress(null);
  }

  async function compress() {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setWarning(null);
    setResult(null);
    setProgress(null);
    try {
      const parsed = targetMb.trim() === "" ? null : parseFloat(targetMb);
      if (parsed !== null && (!Number.isFinite(parsed) || parsed <= 0)) {
        throw new Error("Enter a target size greater than 0, or leave it blank.");
      }
      const targetBytes = parsed === null ? null : parsed * 1024 * 1024;
      if (targetBytes !== null && targetBytes < MIN_TARGET_BYTES) {
        throw new Error(
          "That target is too small. A PDF usually needs at least about 0.08 MB, or the pages turn into mush. Try a larger number."
        );
      }
      if (targetBytes !== null && targetBytes >= file.size) {
        setWarning(
          `This file is already ${formatBytes(file.size)}, which is under your ${parsed} MB target. No extra shrinking is needed.`
        );
        const packed = await losslessCompress(file, removeMetadata);
        setResult(bytesToBlob(packed, "application/pdf"));
        return;
      }

      setProgress("Re-packing the file…");
      let packed: Uint8Array;
      try {
        packed = await losslessCompress(file, removeMetadata);
      } catch {
        throw new Error(`Could not read "${file.name}". It may be corrupted or password-protected.`);
      }

      if (targetBytes === null || packed.length <= targetBytes) {
        setResult(bytesToBlob(packed, "application/pdf"));
        if (targetBytes !== null && packed.length > file.size * 0.98) {
          setWarning("The file was already tight. Size barely changed.");
        }
        return;
      }

      const raster = await rasterizeToTarget(await file.arrayBuffer(), targetBytes, setProgress);
      setResult(bytesToBlob(raster.bytes, "application/pdf"));
      if (!raster.hitTarget) {
        setWarning(
          `Could not get this PDF under ${parsed} MB without wrecking the pages. Smallest safe size is ${formatBytes(raster.bytes.length)}. Try a larger target.`
        );
      } else {
        setWarning(
          "To hit that size, pages were redrawn as pictures. Text may not stay as sharp as the original. Check the download before you send it."
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong while compressing. Please try again.");
    } finally {
      setProcessing(false);
      setProgress(null);
    }
  }

  const saved = file && result ? file.size - result.size : 0;
  const savedPercent = file && result && file.size > 0 ? Math.round((saved / file.size) * 100) : 0;

  return (
    <div className="space-y-5">
      <FileDropzone
        accept="application/pdf,.pdf"
        acceptLabel="a PDF file"
        compact={!!file}
        onFiles={onFile}
      />

      {file && (
        <div className="rounded-xl border border-cream-200 bg-white px-4 py-3 dark:border-white/15 dark:bg-black">
          <p className="truncate text-sm font-medium text-ink dark:text-white">{file.name}</p>
          <p className="text-xs text-ink-muted dark:text-white/55">{formatBytes(file.size)}</p>
        </div>
      )}

      {file && (
        <>
          <div>
            <label htmlFor="target-mb" className="block text-sm font-medium text-ink dark:text-white/80">
              Make it smaller than (optional)
            </label>
            <div className="mt-1.5 flex items-center gap-2">
              <input
                id="target-mb"
                type="number"
                min={0.1}
                step={0.1}
                value={targetMb}
                onChange={(e) => {
                  setTargetMb(e.target.value);
                  setResult(null);
                  setWarning(null);
                }}
                placeholder="e.g. 1"
                className="w-32 rounded-lg border border-cream-200 bg-white px-4 py-2.5 text-ink placeholder:text-ink-muted focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-600/20 dark:border-white/15 dark:bg-black dark:text-white"
              />
              <span className="text-sm text-ink-muted dark:text-white/70">MB</span>
            </div>
            <p className="mt-1.5 text-xs text-ink-muted dark:text-white/55">
              Leave blank to shrink the file without a size cap. If the target is too small, you will get a message instead of a ruined PDF.
            </p>
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink dark:text-white/70">
            <input
              type="checkbox"
              checked={removeMetadata}
              onChange={(e) => {
                setRemoveMetadata(e.target.checked);
                setResult(null);
              }}
              className="h-4 w-4 rounded accent-accent-700"
            />
            Remove hidden document info (title, author, app name)
          </label>
        </>
      )}

      {progress && (
        <p className="flex items-center gap-2 text-sm text-ink-muted dark:text-white/70">
          <Icon name="spinner" size={16} className="animate-spin" /> {progress}
        </p>
      )}

      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-300">
          <Icon name="alert" size={18} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      {warning && (
        <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:bg-amber-900/20 dark:text-amber-200">
          <Icon name="alert" size={18} className="mt-0.5 shrink-0" />
          {warning}
        </p>
      )}

      {file && result && (
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl border border-cream-200 bg-white px-3 py-4 dark:border-white/10 dark:bg-black">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Before</p>
            <p className="mt-1 font-bold text-ink dark:text-white">{formatBytes(file.size)}</p>
          </div>
          <div className="rounded-xl border border-cream-200 bg-white px-3 py-4 dark:border-white/10 dark:bg-black">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">After</p>
            <p className="mt-1 font-bold text-ink dark:text-white">{formatBytes(result.size)}</p>
          </div>
          <div className="rounded-xl bg-emerald-50 px-3 py-4 dark:bg-emerald-900/20">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">Saved</p>
            <p className="mt-1 font-bold text-emerald-800 dark:text-emerald-300">
              {savedPercent > 0 ? `${savedPercent}%` : "0%"}
            </p>
          </div>
        </div>
      )}

      {file && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={compress}
            disabled={processing}
            className="inline-flex items-center gap-2 rounded-lg bg-accent-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing && <Icon name="spinner" size={18} className="animate-spin" />}
            {processing ? "Compressing..." : "Compress PDF"}
          </button>
          {result && (
            <DownloadButton blob={result} filename={file.name.replace(/\.pdf$/i, "-compressed.pdf")}>
              Download compressed PDF
            </DownloadButton>
          )}
        </div>
      )}
    </div>
  );
}
