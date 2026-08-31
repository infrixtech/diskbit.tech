"use client";

import { useEffect, useState } from "react";
import DownloadButton from "@/components/DownloadButton";
import FileDropzone from "@/components/FileDropzone";
import Icon from "@/components/Icon";
import { rasterizeToBlob } from "@/lib/image";
import { mimeForKind, sniffImageKind, stripImageMetadata } from "@/lib/strip-image-metadata";
import { bytesToBlob, formatBytes, swapExt } from "@/lib/utils";

interface Findings {
  hasLocation: boolean;
  latitude?: number;
  longitude?: number;
  camera?: string;
  takenAt?: string;
  kind: ReturnType<typeof sniffImageKind>;
}

type ExifrModule = {
  gps: (input: Blob) => Promise<{ latitude: number; longitude: number } | undefined>;
  parse: (input: Blob, options?: object) => Promise<Record<string, unknown> | undefined>;
  orientation: (input: Blob) => Promise<number | undefined>;
};

async function loadExifr(): Promise<ExifrModule> {
  const mod = await import("exifr");
  const root = (mod as { default?: ExifrModule }).default ?? (mod as unknown as ExifrModule);
  return root;
}

function toFiniteNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  if (Array.isArray(value) && value.length >= 2) {
    const deg = Number(value[0]);
    const min = Number(value[1]);
    const sec = value.length > 2 ? Number(value[2]) : 0;
    if ([deg, min, sec].every(Number.isFinite)) return deg + min / 60 + sec / 3600;
  }
  return undefined;
}

function gpsFromParsed(data: Record<string, unknown> | undefined): { latitude: number; longitude: number } | null {
  if (!data) return null;
  const nested =
    data.gps && typeof data.gps === "object" ? (data.gps as Record<string, unknown>) : null;
  const lat = toFiniteNumber(data.latitude ?? data.Latitude ?? data.GPSLatitude ?? nested?.latitude);
  const lon = toFiniteNumber(data.longitude ?? data.Longitude ?? data.GPSLongitude ?? nested?.longitude);
  if (lat == null || lon == null) return null;
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  return { latitude: lat, longitude: lon };
}

async function readGps(exifr: ExifrModule, input: Blob) {
  try {
    const gps = await exifr.gps(input);
    if (gps && Number.isFinite(gps.latitude) && Number.isFinite(gps.longitude)) {
      return { latitude: gps.latitude, longitude: gps.longitude };
    }
  } catch {
    /* try full parse */
  }
  try {
    const parsed = await exifr.parse(input, {
      gps: true,
      xmp: true,
      iptc: true,
      mergeOutput: true,
      multiSegment: true,
      reviveValues: true,
    });
    return gpsFromParsed(parsed as Record<string, unknown> | undefined);
  } catch {
    return null;
  }
}

function cleanName(file: File, mime: string): string {
  const tagged = file.name.replace(/(\.[^.]+)$/, "-clean$1");
  if (mime === "image/jpeg" && !/\.(jpe?g)$/i.test(tagged)) return swapExt(file.name, "jpg").replace(/(\.[^.]+)$/, "-clean$1");
  if (mime === "image/png" && !/\.png$/i.test(tagged)) return swapExt(file.name, "png").replace(/(\.[^.]+)$/, "-clean$1");
  if (mime === "image/webp" && !/\.webp$/i.test(tagged)) return swapExt(file.name, "webp").replace(/(\.[^.]+)$/, "-clean$1");
  return tagged || swapExt(file.name, "jpg");
}

export default function RemovePhotoLocation() {
  const [file, setFile] = useState<File | null>(null);
  const [findings, setFindings] = useState<Findings | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [resultName, setResultName] = useState("photo-clean.jpg");
  const [verifiedClean, setVerifiedClean] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function onFile(files: File[]) {
    const f = files[0];
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(f);
    setResult(null);
    setVerifiedClean(false);
    setError(null);
    setFindings(null);
    setPreviewUrl(URL.createObjectURL(f));
    const bytes = new Uint8Array(await f.arrayBuffer());
    const kind = sniffImageKind(bytes);
    try {
      const exifr = await loadExifr();
      const gps = await readGps(exifr, f);
      const extra = await exifr.parse(f, {
        pick: ["Make", "Model", "DateTimeOriginal"],
        reviveValues: true,
      });
      const camera = [extra?.Make, extra?.Model].filter(Boolean).join(" ");
      setFindings({
        hasLocation: Boolean(gps),
        latitude: gps?.latitude,
        longitude: gps?.longitude,
        camera: camera || undefined,
        takenAt: extra?.DateTimeOriginal
          ? extra.DateTimeOriginal instanceof Date
            ? extra.DateTimeOriginal.toLocaleString()
            : String(extra.DateTimeOriginal)
          : undefined,
        kind,
      });
    } catch {
      setFindings({ hasLocation: false, kind });
    }
  }

  async function strip() {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setResult(null);
    setVerifiedClean(false);
    try {
      const exifr = await loadExifr();
      const bytes = new Uint8Array(await file.arrayBuffer());
      const kind = sniffImageKind(bytes);
      let orientation: number | undefined;
      try {
        orientation = await exifr.orientation(file);
      } catch {
        orientation = undefined;
      }

      let blob: Blob | null = null;
      const lossless = stripImageMetadata(bytes, orientation);
      if (lossless) {
        blob = bytesToBlob(lossless, mimeForKind(kind, file.type || "image/jpeg"));
        if (await readGps(exifr, blob)) blob = null;
      }

      if (!blob) {
        if (kind === "heic") {
          try {
            blob = await rasterizeToBlob(file, "image/jpeg");
          } catch {
            throw new Error(
              "This iPhone photo format (HEIC) cannot be cleaned in this browser. In Photos, save it as a JPG and drop that file here."
            );
          }
        } else {
          const outType =
            kind === "png" ? "image/png" : kind === "webp" ? "image/webp" : "image/jpeg";
          blob = await rasterizeToBlob(file, outType);
        }
      }

      if (await readGps(exifr, blob)) {
        blob = await rasterizeToBlob(file, "image/jpeg");
      }
      if (await readGps(exifr, blob)) {
        throw new Error("Location data was still present after cleaning. Please try a JPG copy of this photo.");
      }

      setResult(blob);
      setResultName(cleanName(file, blob.type || "image/jpeg"));
      setVerifiedClean(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not strip data from this photo.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-5">
      <p className="rounded-xl border border-cream-200 bg-white px-4 py-3 text-sm text-ink dark:border-white/15 dark:bg-black dark:text-white/80">
        Phones often hide a map pin inside photos. Anyone you send the file to can sometimes see
        where you were standing. Strip it before you share pictures of home or family.
      </p>
      <FileDropzone accept="image/*" acceptLabel="a photo" compact={!!file} onFiles={onFile} />

      {file && (
        <div className="rounded-xl border border-cream-200 bg-white px-4 py-3 dark:border-white/15 dark:bg-black">
          <p className="truncate text-sm font-medium text-ink dark:text-white">{file.name}</p>
          <p className="text-xs text-ink-muted dark:text-white/55">{formatBytes(file.size)}</p>
        </div>
      )}

      {previewUrl && (
        <img
          src={previewUrl}
          alt="Photo preview"
          className="max-h-64 w-full rounded-xl border border-cream-200 object-contain dark:border-white/15"
        />
      )}

      {findings?.kind === "heic" && (
        <p className="rounded-xl border border-cream-200 bg-white px-4 py-3 text-sm text-ink-muted dark:border-white/15 dark:bg-black dark:text-white/55">
          This looks like an iPhone HEIC file. Cleaning works best if you save it as a JPG first.
          This browser will try anyway.
        </p>
      )}

      {findings?.hasLocation && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-100">
          <p className="flex items-start gap-2 font-semibold">
            <Icon name="mapPin" size={18} className="mt-0.5 shrink-0" />
            This photo includes a location
          </p>
          <p className="mt-2">
            Anyone you send it to could see roughly where it was taken
            {findings.latitude != null && findings.longitude != null
              ? ` (${findings.latitude.toFixed(3)}, ${findings.longitude.toFixed(3)})`
              : ""}
            . Removing that data is a good idea before sharing.
          </p>
        </div>
      )}

      {findings && !findings.hasLocation && (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200">
          No location was found. You can still save a clean copy that drops other hidden camera
          details{findings.camera ? ` (camera: ${findings.camera})` : ""}
          {findings.takenAt ? ` taken ${findings.takenAt}` : ""}.
        </p>
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
            onClick={strip}
            disabled={processing}
            className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-5 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing && <Icon name="spinner" size={18} className="animate-spin" />}
            {processing ? "Cleaning..." : "Remove hidden data"}
          </button>
          {result && (
            <DownloadButton blob={result} filename={resultName}>
              Download clean photo
            </DownloadButton>
          )}
        </div>
      )}

      {verifiedClean && result && (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200">
          Clean copy is ready. Location and other hidden camera notes are gone from this download.
          Share this file, not the original.
        </p>
      )}

      <p className="text-xs text-ink-muted dark:text-white/55">
        Cleaning happens on this device. JPG, PNG, and WebP keep the original picture and only drop
        hidden notes. Other formats are redrawn as a new file.
      </p>
    </div>
  );
}
