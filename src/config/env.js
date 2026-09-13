/**
 * Centralised environment configuration.
 * Every other module should import from here instead of reading
 * import.meta.env directly, so there is one place to see what the
 * frontend depends on and one place to change defaults.
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5001";

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
