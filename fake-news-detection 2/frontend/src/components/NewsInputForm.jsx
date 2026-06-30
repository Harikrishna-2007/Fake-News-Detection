import React, { useState, useRef } from "react";
import { ClipboardPaste, Upload, Loader2, ScanLine } from "lucide-react";

const MIN_LENGTH = 20;
const MAX_LENGTH = 50000;

export default function NewsInputForm({ onSubmit, isSubmitting }) {
  const [mode, setMode] = useState("paste"); // "paste" | "upload"
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const charCount = text.length;
  const isTextValid = charCount >= MIN_LENGTH && charCount <= MAX_LENGTH;
  const canSubmit = mode === "paste" ? isTextValid : Boolean(file);

  const handleFileSelect = (selected) => {
    if (selected && selected.name.endsWith(".txt")) {
      setFile(selected);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files?.[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit || isSubmitting) return;
    if (mode === "paste") {
      onSubmit({ type: "text", text, title: title.trim() || null });
    } else {
      onSubmit({ type: "file", file });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Mode toggle */}
      <div className="inline-flex rounded-card border border-paper-border bg-paper-panel p-1 dark:border-ink-border dark:bg-ink-panel">
        <button
          type="button"
          onClick={() => setMode("paste")}
          className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
            mode === "paste"
              ? "bg-ink text-paper dark:bg-paper dark:text-ink"
              : "text-signal-slate hover:text-ink dark:hover:text-paper"
          }`}
        >
          <ClipboardPaste size={15} /> Paste text
        </button>
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
            mode === "upload"
              ? "bg-ink text-paper dark:bg-paper dark:text-ink"
              : "text-signal-slate hover:text-ink dark:hover:text-paper"
          }`}
        >
          <Upload size={15} /> Upload file
        </button>
      </div>

      {mode === "paste" ? (
        <div className="space-y-3">
          <div>
            <label htmlFor="article-title" className="mb-1.5 block text-sm font-medium">
              Headline <span className="text-signal-slate">(optional)</span>
            </label>
            <input
              id="article-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Local council approves new transit budget"
              className="w-full rounded-card border border-paper-border bg-paper-panel px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-signal-amber dark:border-ink-border dark:bg-ink-panel"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <label htmlFor="article-text" className="block text-sm font-medium">
                Article text
              </label>
              <span
                className={`text-xs font-mono ${
                  charCount > 0 && !isTextValid ? "text-verdict-fake" : "text-signal-slate"
                }`}
              >
                {charCount.toLocaleString()} / {MAX_LENGTH.toLocaleString()}
              </span>
            </div>
            <textarea
              id="article-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the full body of the news article here…"
              rows={10}
              className="w-full resize-y rounded-card border border-paper-border bg-paper-panel px-3.5 py-3 text-sm leading-relaxed outline-none transition-colors focus:border-signal-amber dark:border-ink-border dark:bg-ink-panel"
            />
            {charCount > 0 && charCount < MIN_LENGTH && (
              <p className="mt-1.5 text-xs text-verdict-fake">
                Enter at least {MIN_LENGTH} characters for a meaningful analysis.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed px-6 py-14 text-center transition-colors ${
            dragActive
              ? "border-signal-amber bg-signal-amber/5"
              : "border-paper-border hover:border-signal-slate dark:border-ink-border"
          }`}
        >
          <Upload size={28} className="text-signal-slate" />
          {file ? (
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-xs text-signal-slate">{(file.size / 1024).toFixed(1)} KB · click to change</p>
            </div>
          ) : (
            <div>
              <p className="font-medium">Drop a .txt file here, or click to browse</p>
              <p className="text-xs text-signal-slate">Plain text files only, up to 50,000 characters</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,text/plain"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files?.[0])}
          />
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit || isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-card bg-ink px-5 py-3 text-sm font-semibold text-paper transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-paper dark:text-ink sm:w-auto"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Analyzing…
          </>
        ) : (
          <>
            <ScanLine size={16} /> Analyze article
          </>
        )}
      </button>
    </form>
  );
}
