const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
const SERVER_BASE = API_BASE.replace('/api/v1', '');

export const getFileUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${SERVER_BASE}${path}`;
};
