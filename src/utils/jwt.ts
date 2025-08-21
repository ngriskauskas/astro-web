export function decodeJwt<T = Record<string, unknown>>(token: string): T | null {
  try {
    const base64Payload = token.split(".")[1];
    if (!base64Payload) return null;

    const decoded = atob(base64Payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded) as T;
  } catch {
    return null;
  }
}
