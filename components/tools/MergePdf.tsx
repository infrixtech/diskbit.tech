"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import DownloadButton from "@/components/DownloadButton";
import FileDropzone from "@/components/FileDropzone";
import Icon from "@/components/Icon";
import { bytesToBlob, formatBytes } from "@/lib/utils";

interface Item {
  id: number;
  file: File;
}

let nextId = 1;

export default function MergePdf() {
  const [items, setItems] = useState<Item[]>([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  function addFiles(files: File[]) {
    setItems((prev) => [...prev, ...files.map((file) => ({ id: nextId++, file }))]);
    setResult(null);
    setError(null);
  }

  function move(index: number, delta: number) {
    setItems((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setResult(null);
  }

  function remove(id: number) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setResult(null);
  }

  async function merge() {
    setProcessing(true);
    setError(null);
    setResult(null);
    try {
      const merged = await PDFDocument.create();
      for (const { file } of items) {
        let doc: PDFDocument;
        try {
          doc = await PDFDocument.load(await file.arrayBuffer());
        } catch {
          throw new Error(
            `Could not read "${file.name}". It may be corrupted or password-protected. Remove the password and try again.`
          );
        }
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      const bytes = await merged.save();
      setResult(bytesToBlob(bytes, "application/pdf"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong while merging. Please try again.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-5">
      <FileDropzone
        accept="application/pdf,.pdf"
        acceptLabel="PDF files"
        multiple
        compact={items.length > 0}
        onFiles={addFiles}
      />

      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-cream-200 bg-white px-4 py-3 dark:border-white/15 dark:bg-black"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-100 text-xs font-bold text-accent-700 dark:bg-accent-900/40 dark:text-accent-300">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink dark:text-white">
                  {item.file.name}
                </p>
                <p className="text-xs text-ink-muted dark:text-white/55">
                  {formatBytes(item.file.size)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label={`Move ${item.file.name} up`}
                  className="rounded-lg p-1.5 text-ink-muted hover:bg-accent-50 disabled:opacity-30 dark:text-white/55 dark:hover:bg-white/10"
                >
                  <Icon name="arrowUp" size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === items.length - 1}
                  aria-label={`Move ${item.file.name} down`}
                  className="rounded-lg p-1.5 text-ink-muted hover:bg-accent-50 disabled:opacity-30 dark:text-white/55 dark:hover:bg-white/10"
                >
                  <Icon name="arrowDown" size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  aria-label={`Remove ${item.file.name}`}
                  className="rounded-lg p-1.5 text-ink-muted hover:bg-red-100 hover:text-red-600 dark:text-white/55 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                >
                  <Icon name="trash" size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          <Icon name="alert" size={18} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={merge}
          disabled={items.length < 2 || processing}
          className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-5 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {processing && <Icon name="spinner" size={18} className="animate-spin" />}
          {processing ? "Merging..." : "Merge PDFs"}
        </button>
        {items.length === 1 && (
          <p className="text-sm text-ink-muted dark:text-white/55">Add at least one more PDF to merge.</p>
        )}
        {result && (
          <DownloadButton blob={result} filename="merged.pdf">
            Download merged PDF
          </DownloadButton>
        )}
      </div>
    </div>
  );
}
