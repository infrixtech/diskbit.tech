"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import DownloadButton from "@/components/DownloadButton";
import FileDropzone from "@/components/FileDropzone";
import Icon from "@/components/Icon";
import { bytesToBlob, formatBytes } from "@/lib/utils";

const SIZES = [
  { id: "a4", label: "A4", hint: "Most common outside the US", width: 595.28, height: 841.89 },
  { id: "letter", label: "Letter", hint: "US letter 8.5 × 11 in", width: 612, height: 792 },
  { id: "legal", label: "Legal", hint: "US legal 8.5 × 14 in", width: 612, height: 1008 },
  { id: "a5", label: "A5", hint: "Half of A4", width: 419.53, height: 595.28 },
] as const;

type SizeId = (typeof SIZES)[number]["id"];

export default function ResizePdfPages() {
  const [file, setFile] = useState<File | null>(null);
  const [sizeId, setSizeId] = useState<SizeId>("a4");
  const [landscape, setLandscape] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onFile(files: File[]) {
    setFile(files[0]);
    setResult(null);
    setError(null);
  }

  async function resize() {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setResult(null);
    try {
      const preset = SIZES.find((s) => s.id === sizeId)!;
      const targetW = landscape ? preset.height : preset.width;
      const targetH = landscape ? preset.width : preset.height;
      const source = await PDFDocument.load(await file.arrayBuffer());
      const out = await PDFDocument.create();

      for (let i = 0; i < source.getPageCount(); i++) {
        const [embedded] = await out.embedPdf(source, [i]);
        const srcPage = source.getPage(i);
        const { width, height } = srcPage.getSize();
        const page = out.addPage([targetW, targetH]);
        const scale = Math.min(targetW / width, targetH / height);
        const w = width * scale;
        const h = height * scale;
        page.drawPage(embedded, {
          x: (targetW - w) / 2,
          y: (targetH - h) / 2,
          width: w,
          height: h,
        });
      }

      setResult(bytesToBlob(await out.save(), "application/pdf"));
    } catch {
      setError(
        `Could not read "${file.name}". It may be damaged or password-protected.`
      );
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

      {file && (
        <div className="rounded-xl border border-cream-200 bg-white px-4 py-3 dark:border-white/15 dark:bg-black">
          <p className="truncate text-sm font-medium text-ink dark:text-white">{file.name}</p>
          <p className="text-xs text-ink-muted dark:text-white/55">{formatBytes(file.size)}</p>
        </div>
      )}

      {file && (
        <>
          <fieldset>
            <legend className="text-sm font-medium text-ink dark:text-white/70">
              New page size
            </legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {SIZES.map((size) => (
                <label
                  key={size.id}
                  className={`flex cursor-pointer flex-col rounded-xl border px-4 py-3 text-sm transition-colors ${
                    sizeId === size.id
                      ? "border-accent-500 bg-accent-50 dark:border-accent-400 dark:bg-accent-900/20"
                      : "border-cream-200 bg-white hover:border-cream-200 dark:border-white/15 dark:bg-black"
                  }`}
                >
                  <span className="flex items-center gap-2.5 font-medium text-ink dark:text-white">
                    <input
                      type="radio"
                      name="page-size"
                      value={size.id}
                      checked={sizeId === size.id}
                      onChange={() => {
                        setSizeId(size.id);
                        setResult(null);
                      }}
                      className="h-4 w-4 accent-accent-600"
                    />
                    {size.label}
                  </span>
                  <span className="mt-1 pl-6 text-xs text-ink-muted dark:text-white/55">{size.hint}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink dark:text-white/70">
            <input
              type="checkbox"
              checked={landscape}
              onChange={(e) => {
                setLandscape(e.target.checked);
                setResult(null);
              }}
              className="h-4 w-4 rounded accent-accent-600"
            />
            Landscape (wide) instead of tall
          </label>
        </>
      )}

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300"
        >
          <Icon name="alert" size={18} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      {file && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={resize}
            disabled={processing}
            className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-5 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing && <Icon name="spinner" size={18} className="animate-spin" />}
            {processing ? "Resizing..." : "Resize pages"}
          </button>
          {result && (
            <DownloadButton blob={result} filename={file.name.replace(/\.pdf$/i, "-resized.pdf")}>
              Download PDF
            </DownloadButton>
          )}
        </div>
      )}
    </div>
  );
}
