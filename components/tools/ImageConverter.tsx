"use client";

import { useEffect, useState } from "react";
import DownloadButton from "@/components/DownloadButton";
import FileDropzone from "@/components/FileDropzone";
import Icon from "@/components/Icon";
import { canvasToBlob, loadImage } from "@/lib/image";
import { formatBytes, swapExt } from "@/lib/utils";

type Format = "png" | "jpg" | "webp";

const mimeByFormat: Record<Format, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
};

export default function ImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<Format>("png");
  const [quality, setQuality] = useState(0.9);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function onFile(files: File[]) {
    const f = files[0];
    setFile(f);
    setResult(null);
    setPreviewUrl(null);
    setError(null);
    // Preselect a sensible target: convert to something different than the input.
    if (f.type === "image/png") setFormat("jpg");
    else setFormat("png");
  }

  async function convert() {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setResult(null);
    try {
      const img = await loadImage(file);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Your browser does not support canvas rendering.");
      if (format === "jpg") {
        // JPG has no transparency, so composite onto white.
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      const blob = await canvasToBlob(
        canvas,
        mimeByFormat[format],
        format === "png" ? undefined : quality
      );
      setResult(blob);
      setPreviewUrl(URL.createObjectURL(blob));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong while converting. Please try again.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-5">
      <FileDropzone
        accept="image/png,image/jpeg,image/webp"
        acceptLabel="a PNG, JPG, or WebP image"
        compact={!!file}
        onFiles={onFile}
      />

      {file && (
        <>
          <div className="rounded-xl border border-cream-200 bg-white px-4 py-3 dark:border-white/15 dark:bg-black">
            <p className="truncate text-sm font-medium text-ink dark:text-white">{file.name}</p>
            <p className="text-xs text-ink-muted dark:text-white/55">
              {file.type || "unknown type"} &middot; {formatBytes(file.size)}
            </p>
          </div>

          <fieldset>
            <legend className="text-sm font-medium text-ink dark:text-white/70">Convert to</legend>
            <div className="mt-2 flex gap-2">
              {(["png", "jpg", "webp"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => {
                    setFormat(f);
                    setResult(null);
                  }}
                  aria-pressed={format === f}
                  className={`rounded-xl px-5 py-2 text-sm font-semibold uppercase transition-colors ${
                    format === f
                      ? "bg-accent-600 text-white"
                      : "bg-white text-ink-muted hover:bg-accent-50 dark:bg-black dark:text-white/70 dark:hover:bg-white/10"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            {format === "jpg" && (
              <p className="mt-2 text-xs text-ink-muted dark:text-white/55">
                JPG does not support transparency, so transparent areas will become white.
              </p>
            )}
          </fieldset>

          {format !== "png" && (
            <div>
              <label htmlFor="convert-quality" className="flex items-center justify-between text-sm font-medium text-ink dark:text-white/70">
                Quality
                <span className="font-bold text-accent-600 dark:text-accent-400">{Math.round(quality * 100)}%</span>
              </label>
              <input
                id="convert-quality"
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={quality}
                onChange={(e) => {
                  setQuality(parseFloat(e.target.value));
                  setResult(null);
                }}
                className="mt-2 w-full accent-accent-600"
              />
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
            Converted to <strong className="uppercase">{format}</strong> ({formatBytes(result.size)})
          </p>
          <img
            src={previewUrl}
            alt="Converted preview"
            className="max-h-72 w-full rounded-xl border border-cream-200 object-contain dark:border-white/15"
          />
        </div>
      )}

      {file && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={convert}
            disabled={processing}
            className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-5 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing && <Icon name="spinner" size={18} className="animate-spin" />}
            {processing ? "Converting..." : "Convert"}
          </button>
          {result && (
            <DownloadButton blob={result} filename={swapExt(file.name, format)}>
              Download {format.toUpperCase()}
            </DownloadButton>
          )}
        </div>
      )}
    </div>
  );
}
