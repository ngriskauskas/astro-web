const API_URL = import.meta.env.VITE_API_URL;

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  headers.set("Content-Type", "application/json");

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });
  const data = await res.json();

  if(!res.ok) {
    throw Error(data.message);
  }

  return data;
};
