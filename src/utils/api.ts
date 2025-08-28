const API_URL = import.meta.env.VITE_API_URL;

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  const data = await res.json();

  if (!res.ok) {
    if (data.errors) {
      const errorKey = Object.keys(data.errors)[0];
      const errorMessage = data.errors[errorKey];
      throw Error(`${errorKey}: ${errorMessage}`)
    } else throw Error(data.message);
  }

  return data;
};
