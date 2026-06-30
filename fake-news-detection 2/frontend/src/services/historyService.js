import api from "./api.js";

/**
 * Fetch paginated, filterable prediction history for the current user.
 * @param {object} params
 * @param {string} [params.search] - substring search against title/text.
 * @param {"REAL"|"FAKE"} [params.label] - filter to one predicted label.
 * @param {number} [params.page] - 1-indexed page number.
 * @param {number} [params.pageSize] - rows per page.
 */
export async function getHistory({ search, label, page = 1, pageSize = 10 } = {}) {
  const response = await api.get("/api/history", {
    params: {
      search: search || undefined,
      label: label || undefined,
      page,
      page_size: pageSize,
    },
  });
  return response.data;
}

/** Fetch aggregate analytics (totals, percentages, time series, model metrics). */
export async function getAnalytics() {
  const response = await api.get("/api/analytics");
  return response.data;
}

/** Trigger a PDF download of the current user's prediction history. */
export async function downloadHistoryPdf() {
  const response = await api.get("/api/reports/history.pdf", { responseType: "blob" });
  triggerBlobDownload(response.data, "prediction_history.pdf");
}

/** Trigger a CSV download of the current user's prediction history. */
export async function downloadHistoryCsv() {
  const response = await api.get("/api/reports/history.csv", { responseType: "blob" });
  triggerBlobDownload(response.data, "prediction_history.csv");
}

function triggerBlobDownload(blobData, filename) {
  const url = window.URL.createObjectURL(new Blob([blobData]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
