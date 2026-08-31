"use client";

import { useEffect, useRef, useState } from "react";
import DownloadButton from "@/components/DownloadButton";
import FileDropzone from "@/components/FileDropzone";
import Icon from "@/components/Icon";
import { canvasToBlob, loadImage } from "@/lib/image";
import { formatBytes } from "@/lib/utils";

type Rect = { x: number; y: number; w: number; h: number };
type Handle = "move" | "nw" | "ne" | "sw" | "se";
type Aspect = "free" | "1:1" | "4:3" | "16:9" | "3:4";

const ASPECTS: { id: Aspect; label: string; ratio: number | null }[] = [
  { id: "free", label: "Free", ratio: null },
  { id: "1:1", label: "Square", ratio: 1 },
  { id: "4:3", label: "4:3", ratio: 4 / 3 },
  { id: "16:9", label: "Wide", ratio: 16 / 9 },
  { id: "3:4", label: "Portrait", ratio: 3 / 4 },
];

function clampCrop(crop: Rect, maxW: number, maxH: number): Rect {
  const w = Math.min(Math.max(24, crop.w), maxW);
  const h = Math.min(Math.max(24, crop.h), maxH);
  const x = Math.min(Math.max(0, crop.x), maxW - w);
  const y = Math.min(Math.max(0, crop.y), maxH - h);
  return { x, y, w, h };
}

function cropForAspect(width: number, height: number, ratio: number | null): Rect {
  if (!ratio) {
    return { x: width * 0.1, y: height * 0.1, w: width * 0.8, h: height * 0.8 };
  }
  let w = width * 0.85;
  let h = w / ratio;
  if (h > height * 0.85) {
    h = height * 0.85;
    w = h * ratio;
  }
  return { x: (width - w) / 2, y: (height - h) / 2, w, h };
}

export default function ImageCropper() {
  const [file, setFile] = useState<File | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [frameW, setFrameW] = useState(1);
  const [crop, setCrop] = useState<Rect>({ x: 0, y: 0, w: 1, h: 1 });
  const [aspect, setAspect] = useState<Aspect>("free");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ handle: Handle; startX: number; startY: number; start: Rect } | null>(null);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const session = drag.current;
      const image = img;
      if (!session || !image || !frameRef.current) return;
      const scale = image.naturalWidth / frameRef.current.clientWidth;
      const dx = (e.clientX - session.startX) * scale;
      const dy = (e.clientY - session.startY) * scale;
      const s = session.start;
      let next = { ...s };
      if (session.handle === "move") {
        next = { ...s, x: s.x + dx, y: s.y + dy };
      } else {
        if (session.handle.includes("w")) {
          next.x = s.x + dx;
          next.w = s.w - dx;
        }
        if (session.handle.includes("e")) next.w = s.w + dx;
        if (session.handle.includes("n")) {
          next.y = s.y + dy;
          next.h = s.h - dy;
        }
        if (session.handle.includes("s")) next.h = s.h + dy;
        const ratio = ASPECTS.find((a) => a.id === aspect)?.ratio;
        if (ratio && next.w > 0) next.h = next.w / ratio;
      }
      setCrop(clampCrop(next, image.naturalWidth, image.naturalHeight));
      setResult(null);
    };
    const onUp = () => {
      drag.current = null;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [img, aspect]);

  useEffect(() => {
    if (!frameRef.current) return;
    const ro = new ResizeObserver(() => {
      if (frameRef.current) setFrameW(frameRef.current.clientWidth || 1);
    });
    ro.observe(frameRef.current);
    return () => ro.disconnect();
  }, [img]);

  async function onFile(files: File[]) {
    const f = files[0];
    setResult(null);
    setError(null);
    try {
      const loaded = await loadImage(f);
      setFile(f);
      setImg(loaded);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(f);
      });
      const ratio = ASPECTS.find((a) => a.id === aspect)?.ratio ?? null;
      setCrop(cropForAspect(loaded.naturalWidth, loaded.naturalHeight, ratio));
    } catch (e) {
      setFile(null);
      setImg(null);
      setError(e instanceof Error ? e.message : "Could not read this image.");
    }
  }

  function applyAspect(id: Aspect) {
    setAspect(id);
    setResult(null);
    if (!img) return;
    const ratio = ASPECTS.find((a) => a.id === id)?.ratio ?? null;
    setCrop(cropForAspect(img.naturalWidth, img.naturalHeight, ratio));
  }

  async function cropImage() {
    if (!file || !img) return;
    setProcessing(true);
    setError(null);
    setResult(null);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(crop.w));
      canvas.height = Math.max(1, Math.round(crop.h));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Your browser could not crop this image.");
      ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, canvas.width, canvas.height);
      const type = ["image/jpeg", "image/png", "image/webp"].includes(file.type) ? file.type : "image/png";
      setResult(await canvasToBlob(canvas, type, type === "image/png" ? undefined : 0.92));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong while cropping.");
    } finally {
      setProcessing(false);
    }
  }

  const scale = img ? frameW / img.naturalWidth : 1;

  return (
    <div className="space-y-5">
      <FileDropzone accept="image/*" acceptLabel="a photo" compact={!!file} onFiles={onFile} />

      {file && img && (
        <>
          <div className="rounded-xl border border-cream-200 bg-white px-4 py-3 dark:border-white/15 dark:bg-black">
            <p className="truncate text-sm font-medium text-ink dark:text-white">{file.name}</p>
            <p className="text-xs text-ink-muted dark:text-white/55">
              {img.naturalWidth} &times; {img.naturalHeight} px &middot; {formatBytes(file.size)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Crop shape">
            {ASPECTS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => applyAspect(item.id)}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                  aspect === item.id
                    ? "bg-accent-600 text-white"
                    : "bg-white text-ink-muted hover:bg-accent-50 dark:bg-black dark:text-white/70 dark:hover:bg-white/10"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div ref={frameRef} className="relative mx-auto max-w-full overflow-hidden rounded-xl bg-ink/10 dark:bg-black">
            <img src={previewUrl ?? ""} alt="Photo to crop" className="block w-full select-none" draggable={false} />
            <div
              className="absolute cursor-move border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"
              style={{
                left: crop.x * scale,
                top: crop.y * scale,
                width: crop.w * scale,
                height: crop.h * scale,
              }}
              onPointerDown={(e) => {
                e.preventDefault();
                drag.current = { handle: "move", startX: e.clientX, startY: e.clientY, start: crop };
              }}
            >
              {(["nw", "ne", "sw", "se"] as Handle[]).map((handle) => (
                <span
                  key={handle}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    drag.current = { handle, startX: e.clientX, startY: e.clientY, start: crop };
                  }}
                  className={`absolute h-4 w-4 rounded-sm bg-white shadow ${
                    handle === "nw"
                      ? "left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize"
                      : handle === "ne"
                        ? "right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize"
                        : handle === "sw"
                          ? "bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize"
                          : "bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize"
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-xs text-ink-muted dark:text-white/55">
            Drag the box to move it. Drag a corner to resize. Crop is {Math.round(crop.w)} &times;{" "}
            {Math.round(crop.h)} px.
          </p>
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
            onClick={cropImage}
            disabled={processing || !img}
            className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-5 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing && <Icon name="spinner" size={18} className="animate-spin" />}
            {processing ? "Cropping..." : "Crop photo"}
          </button>
          {result && file && (
            <DownloadButton blob={result} filename={file.name.replace(/(\.[^.]+)$/, "-cropped$1")}>
              Download photo
            </DownloadButton>
          )}
        </div>
      )}
    </div>
  );
}
