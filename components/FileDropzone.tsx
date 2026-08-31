"use client";

import { useCallback, useId, useRef, useState } from "react";
import type { DragEvent } from "react";
import Icon from "@/components/Icon";
import { SIZE_WARNING_BYTES, formatBytes } from "@/lib/utils";

interface FileDropzoneProps {
  /** Comma-separated accept list, e.g. "application/pdf" or "image/jpeg,image/png". */
  accept: string;
  /** Human-readable description of accepted files, e.g. "PDF files". */
  acceptLabel: string;
  multiple?: boolean;
  disabled?: boolean;
  /** Called with valid files only. */
  onFiles: (files: File[]) => void;
  /** Compact style once files are already selected. */
  compact?: boolean;
}

const EXT_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".heic": "image/heic",
  ".heif": "image/heif",
  ".avif": "image/avif",
  ".bmp": "image/bmp",
  ".tif": "image/tiff",
  ".tiff": "image/tiff",
  ".pdf": "application/pdf",
};

function mimeOf(file: File): string {
  if (file.type) return file.type.toLowerCase();
  const name = file.name.toLowerCase();
  const dot = name.lastIndexOf(".");
  if (dot < 0) return "";
  return EXT_MIME[name.slice(dot)] ?? "";
}

function matchesAccept(file: File, accept: string): boolean {
  const patterns = accept.split(",").map((p) => p.trim().toLowerCase());
  const type = mimeOf(file);
  const name = file.name.toLowerCase();
  return patterns.some((pattern) => {
    if (pattern.startsWith(".")) return name.endsWith(pattern);
    if (pattern.endsWith("/*")) return type.startsWith(pattern.slice(0, -1));
    return type === pattern;
  });
}

export default function FileDropzone({
  accept,
  acceptLabel,
  multiple = false,
  disabled = false,
  onFiles,
  compact = false,
}: FileDropzoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const handleFiles = useCallback(
    (list: FileList | File[]) => {
      const all = Array.from(list);
      if (all.length === 0) return;

      const valid = all.filter((f) => matchesAccept(f, accept));
      const rejected = all.filter((f) => !matchesAccept(f, accept));

      if (rejected.length > 0) {
        const names = rejected.map((f) => f.name).join(", ");
        setError(
          `${names} ${rejected.length === 1 ? "is" : "are"} not supported here. Please choose ${acceptLabel}.`
        );
      } else {
        setError(null);
      }

      const big = valid.filter((f) => f.size > SIZE_WARNING_BYTES);
      setWarning(
        big.length > 0
          ? `Heads up: ${big.map((f) => `${f.name} (${formatBytes(f.size)})`).join(", ")} ${
              big.length === 1 ? "is" : "are"
            } over 50 MB. Everything still runs on your device, but processing may take a while.`
          : null
      );

      if (valid.length > 0) {
        onFiles(multiple ? valid : [valid[0]]);
      }
    },
    [accept, acceptLabel, multiple, onFiles]
  );

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label={`Upload ${acceptLabel}`}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={[
          "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed text-center transition-colors",
          compact ? "px-4 py-5" : "px-6 py-12",
          disabled ? "cursor-not-allowed opacity-50" : "",
          dragOver
            ? "border-accent-500 bg-accent-50 dark:border-accent-400 dark:bg-accent-900/20"
            : "border-cream-200 bg-white hover:border-accent-400 hover:bg-accent-50/50 dark:border-white/20 dark:bg-ink dark:hover:border-accent-500 dark:hover:bg-white/5",
        ].join(" ")}
      >
        <span
          className={[
            "flex items-center justify-center rounded-full bg-accent-100 text-accent-600 dark:bg-accent-900/40 dark:text-accent-300",
            compact ? "h-10 w-10" : "h-14 w-14",
          ].join(" ")}
        >
          <Icon name="upload" size={compact ? 20 : 28} />
        </span>
        <p className={`font-semibold text-ink dark:text-cream-50 ${compact ? "mt-2 text-sm" : "mt-4"}`}>
          {dragOver ? "Drop to add" : `Drag & drop ${acceptLabel} here`}
        </p>
        <p className="mt-1 text-sm text-ink-muted dark:text-cream-200">
          or <span className="font-medium text-accent-600 dark:text-accent-400">browse your device</span>
          {multiple ? ". You can add several files at once" : ""}
        </p>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {error && (
        <p
          role="alert"
          className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300"
        >
          <Icon name="alert" size={18} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
      {warning && (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          <Icon name="alert" size={18} className="mt-0.5 shrink-0" />
          {warning}
        </p>
      )}
    </div>
  );
}
