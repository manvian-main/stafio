import apiClient from "../api/apiClient";

/**
 * Auth API calls. Every function returns the parsed response body
 * (axios's response.data) so callers never touch the raw axios object.
 */

export function login(identifier, password) {
  return apiClient
    .post("/login", { identifier, password })
    .then((res) => res.data);
}

export function register(payload) {
  return apiClient.post("/register", payload).then((res) => res.data);
}

/**
 * `accessToken` is the OAuth access token from @react-oauth/google's
 * implicit flow. The backend independently verifies it against Google's
 * tokeninfo endpoint and resolves the email itself — the frontend never
 * asserts an email the backend just trusts. Used for both "log in with
 * Google" and "register with Google" (the backend creates the account on
 * first sign-in). `role` is only a hint: the backend only ever honors
 * "admin" the very first time, before any admin account exists.
 */
export function googleLogin(accessToken, role = "employee") {
  return apiClient
    .post("/api/google-login", { access_token: accessToken, role })
    .then((res) => res.data);
}

export function sendOtp(email) {
  return apiClient.post("/send_otp", { email }).then((res) => res.data);
}

export function verifyOtp(email, otp) {
  return apiClient.post("/verify_otp", { email, otp }).then((res) => res.data);
}

export function resetPassword(email, otp, newPassword) {
  return apiClient
    .post("/reset_password", { email, otp, new_password: newPassword })
    .then((res) => res.data);
}
