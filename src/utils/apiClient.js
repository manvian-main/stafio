/**
 * Centralized API Client for Stafio
 * ==================================
 * Automatically:
 * - Attaches JWT access token (Authorization: Bearer) to all requests
 * - Keeps backward-compatible X-User-ID / X-User-Role headers
 * - Auto-refreshes expired access tokens using refresh token (with global lock)
 * - Auto-redirects to login on 401 (after refresh fails)
 *
 * All auth data is stored in localStorage for persistence across browser close.
 */
import axios from "axios";

const API_BASE = "http://127.0.0.1:5001";

const apiClient = axios.create({
  baseURL: API_BASE,
});

// ---------------------------------------------------------------------------
// Global refresh state — prevents concurrent refresh storms
// When multiple requests get 401 at the same time, only ONE refresh fires.
// All other queued requests wait and are retried with the new token.
// ---------------------------------------------------------------------------
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

// ---------------------------------------------------------------------------
// Helper: get auth data from localStorage (persistent across browser close)
// ---------------------------------------------------------------------------
const getAuthToken = () => {
  const path = window.location.pathname.toLowerCase();
  if (path.includes("admin"))
    return (
      localStorage.getItem("auth_token_admin") ||
      localStorage.getItem("auth_token")
    );
  if (path.includes("employee"))
    return (
      localStorage.getItem("auth_token_employee") ||
      localStorage.getItem("auth_token")
    );
  return localStorage.getItem("auth_token");
};

const getRefreshToken = () => {
  const path = window.location.pathname.toLowerCase();
  if (path.includes("admin"))
    return (
      localStorage.getItem("refresh_token_admin") ||
      localStorage.getItem("refresh_token")
    );
  if (path.includes("employee"))
    return (
      localStorage.getItem("refresh_token_employee") ||
      localStorage.getItem("refresh_token")
    );
  return localStorage.getItem("refresh_token");
};

const getUserId = () =>
  localStorage.getItem("current_user_id") ||
  localStorage.getItem("employee_user_id");

const getUserRole = () => {
  const path = window.location.pathname.toLowerCase();
  if (path.includes("admin")) return "admin";
  if (path.includes("employee")) return "employee";
  return (
    localStorage.getItem("current_role") ||
    localStorage.getItem("employee_role")
  );
};

/**
 * Store a new access token in localStorage.
 * FIX 1: Saves to BOTH the generic key AND the role-specific key so that
 * getAuthToken() reads the updated token on the very next request.
 * Without this, the retried request after refresh used the still-expired
 * role-specific token → infinite 401 loop.
 */
const storeAccessToken = (token) => {
  const path = window.location.pathname.toLowerCase();
  // Always update the generic fallback key
  localStorage.setItem("auth_token", token);
  // Also update the role-specific key (this is what getAuthToken() reads first)
  if (path.includes("admin")) {
    localStorage.setItem("auth_token_admin", token);
  } else if (path.includes("employee")) {
    localStorage.setItem("auth_token_employee", token);
  }
};

/**
 * Clear all auth data from localStorage and redirect to login
 */
const clearAllAuthAndRedirect = () => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_token_admin");
  localStorage.removeItem("auth_token_employee");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("refresh_token_admin");
  localStorage.removeItem("refresh_token_employee");
  localStorage.removeItem("current_user_id");
  localStorage.removeItem("current_username");
  localStorage.removeItem("current_role");
  localStorage.removeItem("current_email");
  localStorage.removeItem("employee_user_id");
  localStorage.removeItem("employee_role");
  localStorage.removeItem("employee_username");

  // Also clear sessionStorage for backward compat cleanup
  sessionStorage.removeItem("auth_token");
  sessionStorage.removeItem("refresh_token");
  sessionStorage.removeItem("current_user_id");
  sessionStorage.removeItem("current_username");
  sessionStorage.removeItem("current_role");
  sessionStorage.removeItem("current_email");

  // Determine redirect based on current path
  const isEmployeePath = window.location.pathname.includes("employee");
  window.location.href = isEmployeePath ? "/employee-login" : "/admin-login";
};


// ---------------------------------------------------------------------------
// REQUEST INTERCEPTOR: attach Authorization + backward-compat headers
// ---------------------------------------------------------------------------
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // Backward compatibility headers (for migration period)
    const userId = getUserId();
    const userRole = getUserRole();
    if (userId) config.headers["X-User-ID"] = userId;
    if (userRole) config.headers["X-User-Role"] = userRole;

    return config;
  },
  (error) => Promise.reject(error)
);


// ---------------------------------------------------------------------------
// RESPONSE INTERCEPTOR: auto-refresh on 401, then retry original request
//
// FIX 2: Global isRefreshing lock + failedQueue prevents multiple concurrent
// refresh calls when polling components (e.g. Topbar) fire several requests
// at once. Only ONE refresh request fires; all others wait in the queue and
// are retried with the new token once the refresh completes.
// ---------------------------------------------------------------------------
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 errors, and only once per request
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();

    // No refresh token → logout immediately
    if (!refreshToken) {
      clearAllAuthAndRedirect();
      return Promise.reject(error);
    }

    // If a refresh is already in progress, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          originalRequest._retry = true;
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // Mark this request as retried and start the refresh flow
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Use plain axios (not apiClient) to avoid interceptor loop
      const { data } = await axios.post(`${API_BASE}/api/refresh`, {
        refresh_token: refreshToken,
      });

      const newToken = data.access_token;

      // FIX 1 in action: save to role-specific key so next request reads it
      storeAccessToken(newToken);

      // Unblock all queued requests with the new token
      processQueue(null, newToken);

      // Retry the original request
      originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      // Refresh token is also invalid → full logout
      processQueue(refreshError, null);
      clearAllAuthAndRedirect();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);


export default apiClient;
export {
  getAuthToken,
  getRefreshToken,
  getUserId,
  getUserRole,
  clearAllAuthAndRedirect,
};
