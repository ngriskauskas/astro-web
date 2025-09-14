import { jwtDecode } from "jwt-decode";

const API_URL = import.meta.env.VITE_API_URL;

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  let token = localStorage.getItem("token");

  if (isTokenExpired(token)) {
    console.log("EXPIRED");
    token = await refreshToken();
  }

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
  const data = res.status !== 204 ? await res.json() : null;
  if (!res.ok) {
    if (data.errors) {
      const errorKey = Object.keys(data.errors)[0];
      const errorMessage = data.errors[errorKey];
      throw Error(`${errorKey}: ${errorMessage}`);
    } else throw Error(data.message);
  }

  return data;
};

interface JWTPayload {
  exp: number;
  user_id: string;
}

const isTokenExpired = (token: string | null) => {
  if (!token) return true;

  try {
    const payload = jwtDecode<JWTPayload>(token);
    const now = Math.floor(Date.now() / 1000);
    return payload.exp <= now;
  } catch {
    return true;
  }
};

const refreshToken = async () => {
  const refreshToken = localStorage.getItem("refresh");
  if (!refreshToken) throw new Error("No refresh token available");

  const res = await fetch(`${API_URL}/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!res.ok) throw new Error("Failed to refresh token");

  const data = await res.json();
  localStorage.setItem("token", data.token);

  return data.token;
};
