// Values both test runners inject into the app as VITE_API_URL / VITE_GOOGLE_CLIENT_ID.
// The host never resolves, so a request that slips past the mocks cannot reach a real server.
export const API_URL = "http://api.astro.test";
export const GOOGLE_CLIENT_ID = "test-client-id";

const base64url = (value: object) =>
  btoa(JSON.stringify(value)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

// A JWT-shaped token the app treats as a live session: apiFetch only reads `exp`
// (2099-01-01) and never verifies the signature.
export const fakeToken = () =>
  [
    base64url({ alg: "none", typ: "JWT" }),
    base64url({ exp: 4070908800, user_id: "user-1" }),
    "test-signature",
  ].join(".");
