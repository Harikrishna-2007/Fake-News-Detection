/** Format an ISO date string as a short, readable date+time. */
export function formatDateTime(isoString) {
  if (!isoString) return "—";
  const date = new Date(isoString);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Format a 0.0–1.0 confidence score as a percentage string, e.g. "87.3%". */
export function formatConfidence(score) {
  if (score === null || score === undefined) return "—";
  return `${(score * 100).toFixed(1)}%`;
}

/** Truncate text to a max length with an ellipsis, for table/card previews. */
export function truncate(text, maxLength = 120) {
  if (!text) return "";
  const trimmed = text.trim();
  return trimmed.length <= maxLength ? trimmed : `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}

/** Map a predicted label to its semantic Tailwind color tokens. */
export function verdictColors(label) {
  if (label === "FAKE") {
    return {
      text: "text-verdict-fake",
      bg: "bg-verdict-fakeBg",
      border: "border-verdict-fake/30",
      ring: "ring-verdict-fake/20",
    };
  }
  return {
    text: "text-verdict-real",
    bg: "bg-verdict-realBg",
    border: "border-verdict-real/30",
    ring: "ring-verdict-real/20",
  };
}

/** Returns a human-readable word for a confidence band, for screen-reader-friendly copy. */
export function confidenceBand(score) {
  if (score >= 0.9) return "Very high";
  if (score >= 0.75) return "High";
  if (score >= 0.6) return "Moderate";
  return "Low";
}
