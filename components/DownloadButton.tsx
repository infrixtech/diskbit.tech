"use client";

import type { ReactNode } from "react";
import Icon from "@/components/Icon";
import { downloadBlob, formatBytes } from "@/lib/utils";

interface DownloadButtonProps {
  blob: Blob;
  filename: string;
  children?: ReactNode;
  /** Show the file size next to the label (default true). */
  showSize?: boolean;
}

export default function DownloadButton({
  blob,
  filename,
  children,
  showSize = true,
}: DownloadButtonProps) {
  return (
    <button
      type="button"
      onClick={() => downloadBlob(blob, filename)}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-accent-600 focus:ring-offset-2 dark:focus:ring-offset-ink"
    >
      <Icon name="download" size={18} />
      {children ?? "Download"}
      {showSize && (
        <span className="rounded-md bg-white/20 px-2 py-0.5 text-xs font-medium">
          {formatBytes(blob.size)}
        </span>
      )}
    </button>
  );
}
