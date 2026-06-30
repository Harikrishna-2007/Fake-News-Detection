import React from "react";
import { AlertTriangle, X } from "lucide-react";

/**
 * Displays an error message. Errors don't apologize and are never
 * vague: callers should pass a specific, actionable message extracted
 * from the API response, not a generic "Something went wrong."
 */
export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-card border border-verdict-fake/30 bg-verdict-fakeBg px-4 py-3 text-sm text-verdict-fake dark:bg-verdict-fake/10"
    >
      <AlertTriangle size={18} className="mt-0.5 shrink-0" />
      <p className="flex-1">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 rounded-md p-0.5 hover:bg-verdict-fake/15"
          aria-label="Dismiss error"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

/** Extracts a readable message from an Axios error, falling back gracefully. */
export function extractErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  const errors = error?.response?.data?.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    return errors.map((e) => `${e.field ? `${e.field}: ` : ""}${e.message}`).join(" ");
  }
  if (error?.message === "Network Error") {
    return "Could not reach the server. Check that the backend is running and try again.";
  }
  return fallback;
}
