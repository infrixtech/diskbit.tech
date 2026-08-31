"use client";

import { useEffect, useState } from "react";
import DownloadButton from "@/components/DownloadButton";
import FileDropzone from "@/components/FileDropzone";
import Icon from "@/components/Icon";
import { canvasToBlob, loadImage } from "@/lib/image";
import { formatBytes } from "@/lib/utils";

export default function ImageResizer() {
  const [file, setFile] = useState<File | null>(null);
  const [original, setOriginal] = useState<{ width: number; height: number } | null>(null);
  const [mode, setMode] = useState<"pixels" | "percent">("pixels");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [percent, setPercent] = useState("50");
  const [keepAspect, setKeepAspect] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; width: number; height: number } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function onFile(files: File[]) {
    const f = files[0];
    setResult(null);
    setPreviewUrl(null);
    setError(null);
    try {
      const img = await loadImage(f);
      setFile(f);
      setOriginal({ width: img.naturalWidth, height: img.naturalHeight });
      setWidth(String(img.naturalWidth));
      setHeight(String(img.naturalHeight));
    } catch (e) {
      setFile(null);
      setOriginal(null);
      setError(e instanceof Error ? e.message : "Could not read this image.");
    }
  }

  const ratio = original ? original.width / original.height : 1;

  function onWidthChange(value: string) {
    setWidth(value);
    setResult(null);
    const w = parseInt(value, 10);
    if (keepAspect && Number.isFinite(w) && w > 0) {
      setHeight(String(Math.max(1, Math.round(w / ratio))));
    }
  }

  function onHeightChange(value: string) {
    setHeight(value);
    setResult(null);
    const h = parseInt(value, 10);
    if (keepAspect && Number.isFinite(h) && h > 0) {
      setWidth(String(Math.max(1, Math.round(h * ratio))));
    }
  }

  function targetDimensions(): { w: number; h: number } {
    if (!original) throw new Error("No image loaded.");
    if (mode === "percent") {
      const p = parseFloat(percent);
      if (!Number.isFinite(p) || p <= 0) throw new Error("Enter a percentage greater than 0.");
      if (p > 1000) throw new Error("Percentage is capped at 1000% to avoid running out of memory.");
      return {
        w: Math.max(1, Math.round((original.width * p) / 100)),
        h: Math.max(1, Math.round((original.height * p) / 100)),
      };
    }
    const w = parseInt(width, 10);
    const h = parseInt(height, 10);
    if (!Number.isFinite(w) || w <= 0 || !Number.isFinite(h) || h <= 0) {
      throw new Error("Enter a width and height of at least 1 pixel.");
    }
    if (w > 20000 || h > 20000) {
      throw new Error("Dimensions are capped at 20,000 px to avoid running out of memory.");
    }
    return { w, h };
  }

  async function resize() {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setResult(null);
    try {
      const { w, h } = targetDimensions();
      const img = await loadImage(file);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Your browser does not support canvas rendering.");
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, w, h);
      const type = ["image/jpeg", "image/png", "image/webp"].includes(file.type)
        ? file.type
        : "image/png";
      const blob = await canvasToBlob(canvas, type, type === "image/png" ? undefined : 0.92);
      setResult({ blob, width: w, height: h });
      setPreviewUrl(URL.createObjectURL(blob));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong while resizing. Please try again.");
    } finally {
      setProcessing(false);
    }
  }

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-cream-200 bg-white px-4 py-2.5 text-ink focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-500/30 dark:border-white/15 dark:bg-black dark:text-white";

  return (
    <div className="space-y-5">
      <FileDropzone accept="image/*" acceptLabel="an image" compact={!!file} onFiles={onFile} />

      {file && original && (
        <>
          <div className="rounded-xl border border-cream-200 bg-white px-4 py-3 dark:border-white/15 dark:bg-black">
            <p className="truncate text-sm font-medium text-ink dark:text-white">{file.name}</p>
            <p className="text-xs text-ink-muted dark:text-white/55">
              {original.width} &times; {original.height} px &middot; {formatBytes(file.size)}
            </p>
          </div>

          <div className="flex gap-2" role="tablist" aria-label="Resize mode">
            {(
              [
                { value: "pixels", label: "Pixels" },
                { value: "percent", label: "Percentage" },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={mode === option.value}
                onClick={() => {
                  setMode(option.value);
                  setResult(null);
                }}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                  mode === option.value
                    ? "bg-accent-600 text-white"
                    : "bg-white text-ink-muted hover:bg-accent-50 dark:bg-black dark:text-white/70 dark:hover:bg-white/10"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {mode === "pixels" ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="resize-width" className="block text-sm font-medium text-ink dark:text-white/70">
                    Width (px)
                  </label>
                  <input
                    id="resize-width"
                    type="number"
                    min={1}
                    value={width}
                    onChange={(e) => onWidthChange(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="resize-height" className="block text-sm font-medium text-ink dark:text-white/70">
                    Height (px)
                  </label>
                  <input
                    id="resize-height"
                    type="number"
                    min={1}
                    value={height}
                    onChange={(e) => onHeightChange(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink dark:text-white/70">
                <input
                  type="checkbox"
                  checked={keepAspect}
                  onChange={(e) => {
                    setKeepAspect(e.target.checked);
                    if (e.target.checked) onWidthChange(width);
                  }}
                  className="h-4 w-4 rounded accent-accent-600"
                />
                Keep aspect ratio
              </label>
            </>
          ) : (
            <div>
              <label htmlFor="resize-percent" className="block text-sm font-medium text-ink dark:text-white/70">
                Scale (%)
              </label>
              <input
                id="resize-percent"
                type="number"
                min={1}
                max={1000}
                value={percent}
                onChange={(e) => {
                  setPercent(e.target.value);
                  setResult(null);
                }}
                className={inputClass}
              />
              {(() => {
                const p = parseFloat(percent);
                if (!Number.isFinite(p) || p <= 0) return null;
                return (
                  <p className="mt-1.5 text-xs text-ink-muted dark:text-white/55">
                    Result: {Math.max(1, Math.round((original.width * p) / 100))} &times;{" "}
                    {Math.max(1, Math.round((original.height * p) / 100))} px
                  </p>
                );
              })()}
            </div>
          )}
        </>
      )}

      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          <Icon name="alert" size={18} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      {result && previewUrl && (
        <div>
          <p className="mb-2 text-sm text-ink-muted dark:text-white/70">
            Resized to <strong>{result.width} &times; {result.height} px</strong> ({formatBytes(result.blob.size)})
          </p>
          <img
            src={previewUrl}
            alt="Resized preview"
            className="max-h-72 w-full rounded-xl border border-cream-200 object-contain dark:border-white/15"
          />
        </div>
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
            {processing ? "Resizing..." : "Resize image"}
          </button>
          {result && (
            <DownloadButton
              blob={result.blob}
              filename={file.name.replace(/(\.[^.]+)$/, `-${result.width}x${result.height}$1`)}
            >
              Download image
            </DownloadButton>
          )}
        </div>
      )}
    </div>
  );
}
