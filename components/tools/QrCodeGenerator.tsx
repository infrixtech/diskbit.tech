"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import FileDropzone from "@/components/FileDropzone";
import Icon from "@/components/Icon";
import { loadImage } from "@/lib/image";
import { downloadBlob } from "@/lib/utils";

type EcLevel = "L" | "M" | "Q" | "H";
type Mode = "text" | "picture";

/** QR version 40-L holds 2953 bytes. Leave a little room. */
const MAX_QR_CHARS = 2800;

function jpegDataUrl(img: HTMLImageElement, maxEdge: number, quality: number): string {
  const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser could not read this picture.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

async function packImageForQr(file: File): Promise<string> {
  const img = await loadImage(file);
  const edges = [160, 128, 96, 80, 64, 48, 40, 32, 24, 16];
  const qualities = [0.72, 0.55, 0.4, 0.28];
  for (const edge of edges) {
    for (const q of qualities) {
      const dataUrl = jpegDataUrl(img, edge, q);
      if (dataUrl.length <= MAX_QR_CHARS) return dataUrl;
    }
  }
  throw new Error("This picture could not be packed into a QR, even at a tiny size.");
}

export default function QrCodeGenerator() {
  const [mode, setMode] = useState<Mode>("text");
  const [text, setText] = useState("");
  const [imageName, setImageName] = useState<string | null>(null);
  const [payload, setPayload] = useState("");
  const [packing, setPacking] = useState(false);
  const [size, setSize] = useState(512);
  const [level, setLevel] = useState<EcLevel>("M");
  const [dark, setDark] = useState("#000000");
  const [light, setLight] = useState("#ffffff");
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const activeLevel: EcLevel = mode === "picture" ? "L" : level;
  const ready = payload.trim().length > 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!ready) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    QRCode.toCanvas(canvas, payload, {
      width: 240,
      margin: 2,
      errorCorrectionLevel: activeLevel,
      color: { dark, light },
    })
      .then(() => setError(null))
      .catch(() =>
        setError(
          mode === "picture"
            ? "This picture is still too large for a QR code. Try a simpler image, like an icon or logo."
            : "This text is too long for a QR code. Try shortening it or lowering the error correction level."
        )
      );
  }, [payload, activeLevel, dark, light, ready, mode]);

  async function onPicture(files: File[]) {
    const file = files[0];
    setImageName(file.name);
    setPacking(true);
    setError(null);
    try {
      const packed = await packImageForQr(file);
      setPayload(packed);
    } catch (e) {
      setPayload("");
      setError(e instanceof Error ? e.message : "Could not turn this picture into a QR code.");
    } finally {
      setPacking(false);
    }
  }

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    if (next === "text") {
      setPayload(text);
    } else if (!imageName) {
      setPayload("");
    }
  }

  async function download() {
    if (!ready) return;
    try {
      const canvas = document.createElement("canvas");
      await QRCode.toCanvas(canvas, payload, {
        width: size,
        margin: 2,
        errorCorrectionLevel: activeLevel,
        color: { dark, light },
      });
      canvas.toBlob((blob) => {
        if (blob) downloadBlob(blob, "qr-code.png");
      }, "image/png");
    } catch {
      setError("Could not generate the QR code at this size. Try a simpler picture or shorter text.");
    }
  }

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-cream-200 bg-white px-4 py-2.5 text-ink placeholder:text-ink-muted focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-500/30 dark:border-white/15 dark:bg-black dark:text-white";

  return (
    <div className="space-y-5">
      <div className="flex rounded-xl border border-cream-200 p-1 dark:border-white/15">
        <button
          type="button"
          onClick={() => switchMode("text")}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${
            mode === "text"
              ? "bg-accent-600 text-white"
              : "text-ink-muted hover:bg-accent-50 dark:text-white/70 dark:hover:bg-white/10"
          }`}
        >
          Link or text
        </button>
        <button
          type="button"
          onClick={() => switchMode("picture")}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${
            mode === "picture"
              ? "bg-accent-600 text-white"
              : "text-ink-muted hover:bg-accent-50 dark:text-white/70 dark:hover:bg-white/10"
          }`}
        >
          Picture
        </button>
      </div>

      {mode === "text" ? (
        <div>
          <label htmlFor="qr-text" className="block text-sm font-medium text-ink dark:text-white/70">
            Link or text to encode
          </label>
          <textarea
            id="qr-text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setPayload(e.target.value);
            }}
            placeholder="https://example.com or any text..."
            rows={3}
            className={`${inputClass} resize-y`}
          />
        </div>
      ) : (
        <div className="space-y-3">
          <FileDropzone
            accept="image/jpeg,image/png,image/webp,image/gif"
            acceptLabel="a picture"
            compact={!!imageName}
            onFiles={onPicture}
          />
          {imageName && (
            <p className="truncate text-sm text-ink-muted dark:text-white/70">
              {packing ? "Packing picture into a QR…" : imageName}
            </p>
          )}
          <p className="text-sm text-ink-muted dark:text-white/70">
            A QR can only hold a tiny picture, not a full photo. We shrink yours as far as a scan can
            carry. Many phone cameras will show the picture as a small image or as text.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="qr-size" className="block text-sm font-medium text-ink dark:text-white/70">
            Download size
          </label>
          <select
            id="qr-size"
            value={size}
            onChange={(e) => setSize(parseInt(e.target.value, 10))}
            className={inputClass}
          >
            <option value={256}>256 x 256 px (small)</option>
            <option value={512}>512 x 512 px (recommended)</option>
            <option value={1024}>1024 x 1024 px (print)</option>
            <option value={2048}>2048 x 2048 px (large print)</option>
          </select>
        </div>
        {mode === "text" && (
          <div>
            <label htmlFor="qr-level" className="block text-sm font-medium text-ink dark:text-white/70">
              Error correction
            </label>
            <select
              id="qr-level"
              value={level}
              onChange={(e) => setLevel(e.target.value as EcLevel)}
              className={inputClass}
            >
              <option value="L">Low (7% damage recovery)</option>
              <option value="M">Medium (15%, recommended)</option>
              <option value="Q">Quartile (25%)</option>
              <option value="H">High (30%, for print)</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2.5 text-sm font-medium text-ink dark:text-white/70">
          Foreground
          <input
            type="color"
            value={dark}
            onChange={(e) => setDark(e.target.value)}
            className="h-9 w-14 cursor-pointer rounded-lg border border-cream-200 bg-transparent dark:border-white/15"
            aria-label="Foreground color"
          />
        </label>
        <label className="flex items-center gap-2.5 text-sm font-medium text-ink dark:text-white/70">
          Background
          <input
            type="color"
            value={light}
            onChange={(e) => setLight(e.target.value)}
            className="h-9 w-14 cursor-pointer rounded-lg border border-cream-200 bg-transparent dark:border-white/15"
            aria-label="Background color"
          />
        </label>
      </div>

      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          <Icon name="alert" size={18} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      <div className="flex flex-col items-center gap-4 rounded-xl border border-cream-200 bg-white p-6 dark:border-white/15 dark:bg-black">
        <canvas
          ref={canvasRef}
          className={`h-60 w-60 rounded-lg ${ready && !packing ? "" : "hidden"}`}
          aria-label="QR code preview"
        />
        {(!ready || packing) && (
          <div className="flex h-60 w-60 items-center justify-center rounded-lg border-2 border-dashed border-cream-200 text-sm text-ink-muted dark:border-white/15">
            {packing ? "Packing picture…" : "Preview appears here"}
          </div>
        )}
        <button
          type="button"
          onClick={download}
          disabled={!ready || packing || !!error}
          className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-5 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon name="download" size={18} />
          Download PNG
        </button>
      </div>
    </div>
  );
}
