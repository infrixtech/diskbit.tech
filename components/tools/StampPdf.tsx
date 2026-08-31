"use client";

import { useEffect, useRef, useState } from "react";
import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import DownloadButton from "@/components/DownloadButton";
import FileDropzone from "@/components/FileDropzone";
import Icon from "@/components/Icon";
import { loadPdfJsDocument, renderPdfPageToCanvas } from "@/lib/pdfjs";
import { bytesToBlob, formatBytes } from "@/lib/utils";

type Mode = "signature" | "watermark";
type Pages = "last" | "first" | "all";

function pageList(count: number, which: Pages): number[] {
  if (which === "all") return Array.from({ length: count }, (_, i) => i);
  if (which === "first") return [0];
  return [count - 1];
}

function previewPageIndex(count: number, which: Pages): number {
  if (which === "last") return count - 1;
  return 0;
}

export default function StampPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<Mode>("signature");
  const [pages, setPages] = useState<Pages>("last");
  const [scale, setScale] = useState(1);
  const [opacity, setOpacity] = useState(1);
  const [text, setText] = useState("CONFIDENTIAL");
  const [diagonal, setDiagonal] = useState(true);
  const [sigBlob, setSigBlob] = useState<Blob | null>(null);
  const [sigUrl, setSigUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<{ width: number; height: number } | null>(null);
  const [pos, setPos] = useState({ x: 0.58, y: 0.78 });
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sigBlob) return;
    const url = URL.createObjectURL(sigBlob);
    const id = window.setTimeout(() => setSigUrl(url), 0);
    return () => {
      window.clearTimeout(id);
      URL.revokeObjectURL(url);
    };
  }, [sigBlob]);

  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    (async () => {
      try {
        const bytes = await file.arrayBuffer();
        const doc = await PDFDocument.load(bytes);
        const count = doc.getPageCount();
        const index = previewPageIndex(count, pages);
        const size = doc.getPage(index).getSize();
        const pdf = await loadPdfJsDocument(bytes.slice(0));
        const canvas = await renderPdfPageToCanvas(pdf, index + 1, 720);
        if (cancelled) return;
        setPageSize(size);
        setPreviewUrl(canvas.toDataURL("image/jpeg", 0.75));
      } catch {
        if (!cancelled) setError(`Could not read "${file.name}". It may be damaged or password-protected.`);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [file, pages]);

  function onFile(files: File[]) {
    setFile(files[0]);
    setResult(null);
    setError(null);
    setPreviewUrl(null);
    setPageSize(null);
    setPos({ x: 0.58, y: 0.78 });
  }

  function onSignature(blob: Blob | null) {
    setSigBlob(blob);
    if (!blob) setSigUrl(null);
  }

  const overlayW = mode === "signature" ? 0.28 * scale : 0.42 * scale;
  const overlayH = mode === "signature" ? overlayW * 0.4 : overlayW * 0.28;

  async function stamp() {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setResult(null);
    try {
      const doc = await PDFDocument.load(await file.arrayBuffer());
      const count = doc.getPageCount();
      const targets = pageList(count, pages);

      if (mode === "signature") {
        if (!sigBlob) throw new Error("Draw or upload a signature first.");
        const png = await doc.embedPng(await sigBlob.arrayBuffer());
        for (const index of targets) {
          const page = doc.getPage(index);
          const { width, height } = page.getSize();
          const w = width * overlayW;
          const h = (png.height / png.width) * w;
          const x = pos.x * width;
          const y = height - pos.y * height - h;
          page.drawImage(png, { x, y, width: w, height: h, opacity });
        }
      } else {
        const trimmed = text.trim();
        if (!trimmed) throw new Error("Type the watermark text first.");
        const font = await doc.embedFont(StandardFonts.HelveticaBold);
        for (const index of targets) {
          const page = doc.getPage(index);
          const { width, height } = page.getSize();
          const size = Math.min(width, height) * 0.055 * scale;
          const textWidth = font.widthOfTextAtSize(trimmed, size);
          const x = pos.x * width;
          const y = height - pos.y * height - size;
          page.drawText(trimmed, {
            x,
            y,
            size,
            font,
            color: rgb(0.45, 0.45, 0.45),
            opacity: Math.min(opacity, 0.55),
            rotate: degrees(diagonal ? -35 : 0),
          });
          void textWidth;
        }
      }

      setResult(bytesToBlob(await doc.save(), "application/pdf"));
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : `Could not read "${file.name}". It may be damaged or password-protected.`
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
          <div className="flex gap-2" role="tablist" aria-label="Stamp type">
            {(
              [
                { id: "signature", label: "Signature" },
                { id: "watermark", label: "Watermark" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={mode === tab.id}
                onClick={() => {
                  setMode(tab.id);
                  setResult(null);
                }}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  mode === tab.id
                    ? "bg-accent-600 text-white"
                    : "bg-white text-ink hover:bg-accent-50 dark:bg-black dark:text-white/70"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {mode === "signature" ? (
            <SignatureCapture onChange={onSignature} />
          ) : (
            <div>
              <label htmlFor="wm-text" className="block text-sm font-medium text-ink dark:text-white/80">
                Watermark text
              </label>
              <input
                id="wm-text"
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setResult(null);
                }}
                className="mt-1.5 w-full rounded-lg border border-cream-200 bg-white px-4 py-2.5 text-ink focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-600/20 dark:border-white/15 dark:bg-black dark:text-white"
              />
              <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-sm text-ink dark:text-white/70">
                <input
                  type="checkbox"
                  checked={diagonal}
                  onChange={(e) => {
                    setDiagonal(e.target.checked);
                    setResult(null);
                  }}
                  className="h-4 w-4 rounded accent-accent-700"
                />
                Tilt the text
              </label>
            </div>
          )}

          <div>
            <label htmlFor="stamp-pages" className="block text-sm font-medium text-ink dark:text-white/80">
              Which pages?
            </label>
            <select
              id="stamp-pages"
              value={pages}
              onChange={(e) => {
                setPages(e.target.value as Pages);
                setResult(null);
              }}
              className="mt-1.5 w-full rounded-lg border border-cream-200 bg-white px-4 py-2.5 text-sm text-ink focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-600/20 dark:border-white/15 dark:bg-black dark:text-white"
            >
              <option value="last">Last page only</option>
              <option value="first">First page only</option>
              <option value="all">Every page</option>
            </select>
          </div>

          <div>
            <p className="text-sm font-medium text-ink dark:text-white/80">
              Drag the stamp onto the page
            </p>
            <p className="mt-1 text-xs text-ink-muted dark:text-white/55">
              Grab the box and move it. The same spot is used on every page you selected.
            </p>
            {previewUrl && pageSize && (
              <StampStage
                previewUrl={previewUrl}
                pageAspect={pageSize.width / pageSize.height}
                pos={pos}
                overlayW={overlayW}
                overlayH={overlayH}
                diagonal={mode === "watermark" && diagonal}
                label={mode === "watermark" ? text : null}
                imageUrl={mode === "signature" ? sigUrl : null}
                onMove={(next) => {
                  setPos(next);
                  setResult(null);
                }}
              />
            )}
          </div>

          <div>
            <label htmlFor="stamp-size" className="block text-sm font-medium text-ink dark:text-white/80">
              Size
            </label>
            <input
              id="stamp-size"
              type="range"
              min={0.5}
              max={2}
              step={0.1}
              value={scale}
              onChange={(e) => {
                setScale(Number(e.target.value));
                setResult(null);
              }}
              className="mt-2 w-full accent-accent-700"
            />
          </div>

          <div>
            <label htmlFor="stamp-opacity" className="block text-sm font-medium text-ink dark:text-white/80">
              How solid? {Math.round((mode === "watermark" ? Math.min(opacity, 0.55) : opacity) * 100)}%
            </label>
            <input
              id="stamp-opacity"
              type="range"
              min={0.15}
              max={1}
              step={0.05}
              value={opacity}
              onChange={(e) => {
                setOpacity(Number(e.target.value));
                setResult(null);
              }}
              className="mt-2 w-full accent-accent-700"
            />
          </div>
        </>
      )}

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-300"
        >
          <Icon name="alert" size={18} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      {file && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={stamp}
            disabled={processing || (mode === "signature" && !sigBlob)}
            className="inline-flex items-center gap-2 rounded-lg bg-accent-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing && <Icon name="spinner" size={18} className="animate-spin" />}
            {processing ? "Stamping..." : mode === "signature" ? "Add signature" : "Add watermark"}
          </button>
          {result && (
            <DownloadButton blob={result} filename={file.name.replace(/\.pdf$/i, "-stamped.pdf")}>
              Download PDF
            </DownloadButton>
          )}
        </div>
      )}
    </div>
  );
}

function StampStage({
  previewUrl,
  pageAspect,
  pos,
  overlayW,
  overlayH,
  diagonal,
  label,
  imageUrl,
  onMove,
}: {
  previewUrl: string;
  pageAspect: number;
  pos: { x: number; y: number };
  overlayW: number;
  overlayH: number;
  diagonal: boolean;
  label: string | null;
  imageUrl: string | null;
  onMove: (next: { x: number; y: number }) => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ ox: number; oy: number } | null>(null);

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      const session = drag.current;
      const box = boxRef.current;
      if (!session || !box) return;
      const rect = box.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - session.ox;
      const y = (e.clientY - rect.top) / rect.height - session.oy;
      onMove({
        x: Math.min(Math.max(0, x), Math.max(0, 1 - overlayW)),
        y: Math.min(Math.max(0, y), Math.max(0, 1 - overlayH)),
      });
    };
    const onPointerUp = () => {
      drag.current = null;
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [onMove, overlayW, overlayH]);

  return (
    <div
      ref={boxRef}
      className="relative mt-3 w-full overflow-hidden rounded-lg border border-cream-200 bg-white dark:border-white/15"
      style={{ aspectRatio: pageAspect }}
    >
      <img src={previewUrl} alt="PDF page preview" className="absolute inset-0 h-full w-full object-contain" />
      <div
        role="button"
        tabIndex={0}
        aria-label="Move stamp"
        className="absolute cursor-grab touch-none border-2 border-accent-700 bg-white/50 active:cursor-grabbing"
        style={{
          left: `${pos.x * 100}%`,
          top: `${pos.y * 100}%`,
          width: `${overlayW * 100}%`,
          height: `${overlayH * 100}%`,
        }}
        onPointerDown={(e) => {
          const box = boxRef.current;
          if (!box) return;
          const rect = box.getBoundingClientRect();
          drag.current = {
            ox: (e.clientX - rect.left) / rect.width - pos.x,
            oy: (e.clientY - rect.top) / rect.height - pos.y,
          };
        }}
      >
        {imageUrl ? (
          <img src={imageUrl} alt="" className="h-full w-full object-contain" draggable={false} />
        ) : (
          <span
            className="flex h-full w-full items-center justify-center px-1 text-center text-[10px] font-bold text-ink-muted sm:text-xs"
            style={{ transform: diagonal ? "rotate(-25deg)" : undefined }}
          >
            {label || "Drag me"}
          </span>
        )}
      </div>
    </div>
  );
}

function SignatureCapture({ onChange }: { onChange: (blob: Blob | null) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const empty = useRef(true);
  const [hasInk, setHasInk] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1c1915";
  }, []);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function exportPng() {
    const canvas = canvasRef.current;
    if (!canvas || empty.current) {
      onChange(null);
      return;
    }
    canvas.toBlob((blob) => onChange(blob), "image/png");
  }

  return (
    <div>
      <p className="text-sm font-medium text-ink dark:text-white/80">
        Draw your signature, or upload a picture of it
      </p>
      <canvas
        ref={canvasRef}
        className="mt-1.5 h-36 w-full touch-none rounded-lg border border-cream-200 bg-white dark:border-white/15"
        onPointerDown={(e) => {
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext("2d");
          if (!canvas || !ctx) return;
          canvas.setPointerCapture(e.pointerId);
          drawing.current = true;
          const { x, y } = pos(e);
          ctx.beginPath();
          ctx.moveTo(x, y);
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          const ctx = canvasRef.current?.getContext("2d");
          if (!ctx) return;
          const { x, y } = pos(e);
          ctx.lineTo(x, y);
          ctx.stroke();
          empty.current = false;
          setHasInk(true);
        }}
        onPointerUp={() => {
          drawing.current = false;
          exportPng();
        }}
      />
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext("2d");
            if (!canvas || !ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            empty.current = true;
            setHasInk(false);
            onChange(null);
          }}
          className="text-sm font-medium text-ink-muted hover:text-ink dark:text-white/70"
        >
          Clear drawing
        </button>
        <label className="cursor-pointer text-sm font-medium text-accent-700 hover:text-accent-800 dark:text-accent-400">
          Upload a signature image
          <input
            type="file"
            accept="image/png,image/jpeg,.png,.jpg,.jpeg"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              const img = new Image();
              const url = URL.createObjectURL(f);
              await new Promise<void>((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject();
                img.src = url;
              });
              URL.revokeObjectURL(url);
              const canvas = document.createElement("canvas");
              canvas.width = img.naturalWidth;
              canvas.height = img.naturalHeight;
              const ctx = canvas.getContext("2d");
              if (!ctx) return;
              ctx.drawImage(img, 0, 0);
              canvas.toBlob((blob) => {
                onChange(blob);
                setHasInk(Boolean(blob));
              }, "image/png");
            }}
          />
        </label>
        {hasInk && <span className="text-xs text-emerald-800 dark:text-emerald-300">Signature ready</span>}
      </div>
    </div>
  );
}
