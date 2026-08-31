"use client";

import { useEffect, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import DownloadButton from "@/components/DownloadButton";
import FileDropzone from "@/components/FileDropzone";
import Icon from "@/components/Icon";
import { bytesToBlob, formatBytes } from "@/lib/utils";

interface Item {
  id: number;
  file: File;
  previewUrl: string;
}

let nextId = 1;

// A4 in PDF points.
const A4 = { width: 595.28, height: 841.89 };
const A4_MARGIN = 36;

export default function ImagesToPdf() {
  const [items, setItems] = useState<Item[]>([]);
  const [pageSize, setPageSize] = useState<"a4" | "fit">("a4");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const itemsRef = useRef<Item[]>([]);

  // Mirror the latest items into a ref so the unmount cleanup below can
  // revoke every preview object URL without re-running on each change.
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    return () => itemsRef.current.forEach((i) => URL.revokeObjectURL(i.previewUrl));
  }, []);

  function addFiles(files: File[]) {
    setItems((prev) => [
      ...prev,
      ...files.map((file) => ({ id: nextId++, file, previewUrl: URL.createObjectURL(file) })),
    ]);
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
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
    setResult(null);
  }

  async function createPdf() {
    setProcessing(true);
    setError(null);
    setResult(null);
    try {
      const doc = await PDFDocument.create();
      for (const { file } of items) {
        const bytes = await file.arrayBuffer();
        const isPng = file.type === "image/png" || file.name.toLowerCase().endsWith(".png");
        let image;
        try {
          image = isPng ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
        } catch {
          throw new Error(`Could not read "${file.name}". Please make sure it is a valid JPG or PNG image.`);
        }

        if (pageSize === "fit") {
          const page = doc.addPage([image.width, image.height]);
          page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
        } else {
          const page = doc.addPage([A4.width, A4.height]);
          const maxW = A4.width - A4_MARGIN * 2;
          const maxH = A4.height - A4_MARGIN * 2;
          const scale = Math.min(maxW / image.width, maxH / image.height, 1);
          const w = image.width * scale;
          const h = image.height * scale;
          page.drawImage(image, {
            x: (A4.width - w) / 2,
            y: (A4.height - h) / 2,
            width: w,
            height: h,
          });
        }
      }
      const bytes = await doc.save();
      setResult(bytesToBlob(bytes, "application/pdf"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong while creating the PDF. Please try again.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-5">
      <FileDropzone
        accept="image/jpeg,image/png,.jpg,.jpeg,.png"
        acceptLabel="JPG or PNG images"
        multiple
        compact={items.length > 0}
        onFiles={addFiles}
      />

      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-cream-200 bg-white px-3 py-2.5 dark:border-white/15 dark:bg-black"
            >
              <img
                src={item.previewUrl}
                alt={item.file.name}
                className="h-12 w-12 shrink-0 rounded-lg border border-cream-200 object-cover dark:border-white/15"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink dark:text-white">
                  {item.file.name}
                </p>
                <p className="text-xs text-ink-muted dark:text-white/55">
                  Page {index + 1} &middot; {formatBytes(item.file.size)}
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

      {items.length > 0 && (
        <fieldset>
          <legend className="text-sm font-medium text-ink dark:text-white/70">Page size</legend>
          <div className="mt-2 space-y-2">
            {(
              [
                { value: "a4", label: "A4 pages (image centered with margins)" },
                { value: "fit", label: "Fit to image (each page matches its image exactly)" },
              ] as const
            ).map((option) => (
              <label key={option.value} className="flex cursor-pointer items-center gap-2.5 text-sm text-ink dark:text-white/70">
                <input
                  type="radio"
                  name="page-size"
                  value={option.value}
                  checked={pageSize === option.value}
                  onChange={() => {
                    setPageSize(option.value);
                    setResult(null);
                  }}
                  className="h-4 w-4 accent-accent-600"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          <Icon name="alert" size={18} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      {items.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={createPdf}
            disabled={processing}
            className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-5 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing && <Icon name="spinner" size={18} className="animate-spin" />}
            {processing ? "Creating PDF..." : "Create PDF"}
          </button>
          {result && (
            <DownloadButton blob={result} filename="images.pdf">
              Download PDF
            </DownloadButton>
          )}
        </div>
      )}
    </div>
  );
}
