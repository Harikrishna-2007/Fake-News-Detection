import api from "./api.js";

/**
 * Submit raw article text for REAL/FAKE classification.
 * @param {string} text - the article body to analyze.
 * @param {string|null} title - optional title/headline shown in history later.
 */
export async function predictText(text, title = null) {
  const response = await api.post("/api/predict", { text, title });
  return response.data;
}

/**
 * Submit an uploaded .txt file for classification.
 * @param {File} file - a File object from an <input type="file"> element.
 */
export async function predictFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/api/predict/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}
