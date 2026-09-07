export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const BACKEND_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

export const getMediaUrl = (filePath) => {
  if (!filePath) return "";

  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }

  return `${BACKEND_URL}${filePath}`;
};
