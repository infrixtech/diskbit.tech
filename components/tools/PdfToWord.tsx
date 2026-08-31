"use client";

import { useState } from "react";
import { Document, Packer, Paragraph, TextRun } from "docx";
import DownloadButton from "@/components/DownloadButton";
import FileDropzone from "@/components/FileDropzone";
import Icon from "@/components/Icon";
import { loadPdfJsDocument } from "@/lib/pdfjs";
import { formatBytes, swapExt } from "@/lib/utils";

interface TextItem {
  str: string;
  x: number;
  y: number;
  height: number;
}

function linesFromItems(items: TextItem[]): string[] {
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  const lines: { y: number; height: number; parts: { x: number; str: string }[] }[] = [];
  for (const item of items.length ? sorted : []) {
    const tolerance = Math.max(3, item.height * 0.45);
    const line = lines.find((l) => Math.abs(l.y - item.y) < tolerance);
    if (line) {
      line.parts.push({ x: item.x, str: item.str });
    } else {
      lines.push({ y: item.y, height: item.height, parts: [{ x: item.x, str: item.str }] });
    }
  }
  return lines
    .map((line) =>
      line.parts
        .sort((a, b) => a.x - b.x)
        .map((p) => p.str)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter(Boolean);
}

export default function PdfToWord() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [notes, setNotes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  function onFile(files: File[]) {
    setFile(files[0]);
    setResult(null);
    setNotes([]);
    setError(null);
  }

  async function convert() {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setResult(null);
    setNotes([]);
    try {
      const data = await file.arrayBuffer();
      const pdf = await loadPdfJsDocument(data);
      const children: Paragraph[] = [];
      let emptyPages = 0;

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const items: TextItem[] = [];
        for (const raw of content.items) {
          if (!("str" in raw) || !raw.str) continue;
          const transform = "transform" in raw ? raw.transform : [1, 0, 0, 1, 0, 0];
          items.push({
            str: raw.str,
            x: transform[4] ?? 0,
            y: transform[5] ?? 0,
            height: Math.abs(transform[3] || transform[0] || 12),
          });
        }
        const lines = linesFromItems(items);
        if (lines.length === 0) {
          emptyPages += 1;
          children.push(
            new Paragraph({
              pageBreakBefore: i > 1,
              children: [
                new TextRun({
                  text: `(Page ${i} has no selectable text. It may be a scan or a picture.)`,
                  italics: true,
                  color: "64748B",
                }),
              ],
            })
          );
        } else {
          lines.forEach((line, idx) => {
            children.push(
              new Paragraph({
                pageBreakBefore: i > 1 && idx === 0,
                children: [new TextRun(line)],
              })
            );
          });
        }
      }

      const doc = new Document({
        sections: [{ children: children.length ? children : [new Paragraph("")] }],
      });
      const blob = await Packer.toBlob(doc);
      setResult(blob);

      const hints: string[] = [
        "This Word file contains the text from your PDF. Fancy layouts, tables, and images may not match the original.",
      ];
      if (emptyPages > 0) {
        hints.push(
          `${emptyPages} page${emptyPages === 1 ? "" : "s"} had no selectable text (often a photo or a scan). Those pages are noted in the document.`
        );
      }
      setNotes(hints);
    } catch {
      setError(
        `Could not read "${file.name}". It may be damaged, password-protected, or not a PDF.`
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

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300"
        >
          <Icon name="alert" size={18} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      {notes.length > 0 && (
        <ul className="space-y-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-900/20 dark:text-amber-200">
          {notes.map((note) => (
            <li key={note} className="flex gap-2">
              <Icon name="alert" size={18} className="mt-0.5 shrink-0" />
              {note}
            </li>
          ))}
        </ul>
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
            {processing ? "Converting..." : "Convert to Word"}
          </button>
          {result && (
            <DownloadButton blob={result} filename={swapExt(file.name, "docx")}>
              Download Word file
            </DownloadButton>
          )}
        </div>
      )}
    </div>
  );
}
