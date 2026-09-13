/**
 * @deprecated Import from "src/api/apiClient" instead.
 * This re-export exists only so files not yet migrated to the new
 * feature-based structure keep working unchanged. Once every import of
 * "utils/apiClient" has been moved to "api/apiClient", delete this file.
 */
export { default, getAuthToken, getRefreshToken, getUserId, getUserRole, clearAllAuthAndRedirect } from "../api/apiClient";
