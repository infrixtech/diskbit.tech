"use client";

import { useEffect, useState } from "react";
import imageCompression from "browser-image-compression";
import DownloadButton from "@/components/DownloadButton";
import FileDropzone from "@/components/FileDropzone";
import Icon from "@/components/Icon";
import { canvasToBlob, loadImage } from "@/lib/image";
import { formatBytes } from "@/lib/utils";

const MIN_TARGET_BYTES = 4 * 1024;

/** Parse "20kb", "20 KB", "1mb", or a bare number (treated as KB). */
function parseTargetBytes(input: string): number | null {
  const t = input.trim().toLowerCase().replace(/,/g, "").replace(/\s+/g, "");
  if (!t) return null;
  const m = t.match(/^(\d+(?:\.\d+)?)(kilobytes?|kb|k|megabytes?|mb|m|bytes?|b)?$/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (!Number.isFinite(n) || n <= 0) return null;
  const unit = m[2] ?? "kb";
  if (unit.startsWith("m")) return Math.round(n * 1024 * 1024);
  if (unit.startsWith("k")) return Math.round(n * 1024);
  return Math.round(n);
}

async function encodeAt(
  img: HTMLImageElement,
  width: number,
  height: number,
  type: string,
  quality: number
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser could not compress this image.");
  if (type !== "image/png") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(img, 0, 0, width, height);
  return canvasToBlob(canvas, type, type === "image/png" ? undefined : quality);
}

async function canvasCompressToTarget(
  file: File,
  targetBytes: number,
  maxEdge: number | null
): Promise<{ blob: Blob; hit: boolean; convertedToJpeg: boolean }> {
  const img = await loadImage(file);
  let width = img.naturalWidth;
  let height = img.naturalHeight;
  if (maxEdge && Math.max(width, height) > maxEdge) {
    const scale = maxEdge / Math.max(width, height);
    width = Math.max(1, Math.round(width * scale));
    height = Math.max(1, Math.round(height * scale));
  }

  const types: string[] =
    file.type === "image/webp"
      ? ["image/webp", "image/jpeg"]
      : file.type === "image/png"
        ? ["image/png", "image/jpeg"]
        : ["image/jpeg"];

  let best: Blob | null = null;
  let convertedToJpeg = false;

  for (const type of types) {
    let w = width;
    let h = height;
    for (let round = 0; round < 14; round++) {
      let lo = 0.12;
      let hi = 0.95;
      let qBest: Blob | null = null;
      for (let i = 0; i < 8; i++) {
        const mid = (lo + hi) / 2;
        const blob = await encodeAt(img, w, h, type, mid);
        if (blob.size <= targetBytes) {
          qBest = blob;
          lo = mid;
        } else {
          hi = mid;
        }
      }
      const blob = qBest ?? (await encodeAt(img, w, h, type, Math.max(0.12, lo)));
      if (!best || blob.size < best.size) {
        best = blob;
        convertedToJpeg = type === "image/jpeg" && file.type !== "image/jpeg";
      }
      if (blob.size <= targetBytes) {
        return { blob, hit: true, convertedToJpeg };
      }
      if (w <= 32 && h <= 32) break;
      w = Math.max(32, Math.round(w * 0.82));
      h = Math.max(32, Math.round(h * 0.82));
    }
  }

  if (!best) throw new Error("Your browser could not compress this image.");
  return { blob: best, hit: false, convertedToJpeg };
}

function downloadName(original: string, convertedToJpeg: boolean): string {
  const base = original.replace(/(\.[^.]+)$/, "-compressed");
  if (convertedToJpeg) return base.replace(/\.[^.]+$/, "") + ".jpg";
  return original.replace(/(\.[^.]+)$/, "-compressed$1");
}

export default function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [target, setTarget] = useState("20kb");
  const [maxEdge, setMaxEdge] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function onFile(files: File[]) {
    setFile(files[0]);
    setResult(null);
    setError(null);
    setWarning(null);
    setPreviewUrl(null);
  }

  async function compress() {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setWarning(null);
    setResult(null);
    try {
      const targetBytes = parseTargetBytes(target);
      if (targetBytes === null) {
        throw new Error("Enter a size like 20kb, 500kb, or 1mb.");
      }
      if (targetBytes < MIN_TARGET_BYTES) {
        throw new Error("That target is too small. Try at least 4kb, or the picture will look ruined.");
      }

      if (file.size <= targetBytes) {
        setWarning(
          `This image is already ${formatBytes(file.size)}, which is under your ${target.trim()} target. Nothing extra to shrink.`
        );
        setResult(file);
        setPreviewUrl(URL.createObjectURL(file));
        return;
      }

      let blob: Blob | null = null;
      let hit = false;
      let convertedToJpeg = false;

      try {
        const compressed = await imageCompression(file, {
          maxSizeMB: targetBytes / (1024 * 1024),
          maxWidthOrHeight: maxEdge ?? undefined,
          useWebWorker: true,
          preserveExif: false,
          initialQuality: 0.92,
          maxIteration: 18,
        });
        blob = compressed;
        hit = compressed.size <= targetBytes;
        if (compressed.type === "image/jpeg" && file.type !== "image/jpeg") {
          convertedToJpeg = true;
        }
      } catch {
        blob = null;
      }

      if (!blob || !hit) {
        const canvas = await canvasCompressToTarget(file, targetBytes, maxEdge);
        if (!blob || canvas.blob.size < blob.size || canvas.hit) {
          blob = canvas.blob;
          hit = canvas.hit;
          convertedToJpeg = canvas.convertedToJpeg;
        }
      }

      if (convertedToJpeg) {
        setWarning(
          hit
            ? `Saved as JPG so it could reach ${target.trim()} with as little quality loss as possible. PNG does not shrink that far.`
            : `Could not get this image under ${target.trim()} without wrecking it. Smallest safe size is ${formatBytes(blob.size)}. Try a larger target.`
        );
      } else if (!hit) {
        setWarning(
          `Could not get this image under ${target.trim()} without wrecking it. Smallest safe size is ${formatBytes(blob.size)}. Try a larger target.`
        );
      }

      setResult(blob);
      setPreviewUrl(URL.createObjectURL(blob));
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Something went wrong while compressing this image. Please make sure it is a valid JPG, PNG, or WebP file."
      );
    } finally {
      setProcessing(false);
    }
  }

  const saved = file && result ? file.size - result.size : 0;
  const savedPercent = file && result && file.size > 0 ? Math.round((saved / file.size) * 100) : 0;

  return (
    <div className="space-y-5">
      <FileDropzone
        accept="image/jpeg,image/png,image/webp"
        acceptLabel="a JPG, PNG, or WebP image"
        compact={!!file}
        onFiles={onFile}
      />

      {file && (
        <>
          <div className="rounded-xl border border-cream-200 bg-white px-4 py-3 dark:border-white/15 dark:bg-black">
            <p className="truncate text-sm font-medium text-ink dark:text-white">{file.name}</p>
            <p className="text-xs text-ink-muted dark:text-white/55">{formatBytes(file.size)}</p>
          </div>

          <div>
            <label htmlFor="target-size" className="block text-sm font-medium text-ink dark:text-white/70">
              Target size
            </label>
            <input
              id="target-size"
              type="text"
              inputMode="text"
              value={target}
              onChange={(e) => {
                setTarget(e.target.value);
                setResult(null);
                setWarning(null);
              }}
              placeholder="20kb"
              className="mt-1.5 w-full max-w-xs rounded-xl border border-cream-200 bg-white px-4 py-2.5 text-ink placeholder:text-ink-muted focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-500/30 dark:border-white/15 dark:bg-black dark:text-white"
            />
            <p className="mt-1.5 text-xs text-ink-muted dark:text-white/55">
              Type a size like 20kb, 500kb, or 1mb. The tool keeps as much quality as it can while aiming for that size.
            </p>
          </div>

          <div>
            <label htmlFor="max-edge" className="block text-sm font-medium text-ink dark:text-white/70">
              Limit longest edge (optional)
            </label>
            <select
              id="max-edge"
              value={maxEdge ?? ""}
              onChange={(e) => {
                setMaxEdge(e.target.value ? parseInt(e.target.value, 10) : null);
                setResult(null);
                setWarning(null);
              }}
              className="mt-1.5 w-full rounded-xl border border-cream-200 bg-white px-4 py-2.5 text-ink focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-500/30 dark:border-white/15 dark:bg-black dark:text-white"
            >
              <option value="">Keep original dimensions unless size needs it</option>
              <option value="2560">2560 px (large screens)</option>
              <option value="1920">1920 px (full HD)</option>
              <option value="1280">1280 px (web content)</option>
              <option value="800">800 px (email, thumbnails)</option>
            </select>
          </div>
        </>
      )}

      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          <Icon name="alert" size={18} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      {warning && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-900/20 dark:text-amber-100">
          {warning}
        </p>
      )}

      {file && result && (
        <>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl border border-cream-200 bg-white px-3 py-4 dark:border-white/10 dark:bg-black">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-muted dark:text-white/55">Before</p>
              <p className="mt-1 font-bold text-ink dark:text-white">{formatBytes(file.size)}</p>
            </div>
            <div className="rounded-xl border border-cream-200 bg-white px-3 py-4 dark:border-white/10 dark:bg-black">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-muted dark:text-white/55">After</p>
              <p className="mt-1 font-bold text-ink dark:text-white">{formatBytes(result.size)}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 px-3 py-4 dark:bg-emerald-900/20">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Saved</p>
              <p className="mt-1 font-bold text-emerald-700 dark:text-emerald-300">
                {savedPercent > 0 ? `${savedPercent}%` : "0%"}
              </p>
            </div>
          </div>
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Compressed preview"
              className="max-h-72 w-full rounded-xl border border-cream-200 object-contain dark:border-white/15"
            />
          )}
        </>
      )}

      {file && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={compress}
            disabled={processing}
            className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-5 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing && <Icon name="spinner" size={18} className="animate-spin" />}
            {processing ? "Compressing..." : "Compress image"}
          </button>
          {result && (
            <DownloadButton
              blob={result}
              filename={downloadName(file.name, result.type === "image/jpeg" && file.type !== "image/jpeg")}
            >
              Download image
            </DownloadButton>
          )}
        </div>
      )}
    </div>
  );
}
