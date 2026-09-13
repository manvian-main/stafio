/**
 * Role definitions, mirroring backend constants/roles.py.
 * Used by RoleRoute and any UI that needs to show/hide actions by role.
 */

export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  EMPLOYEE: "employee",
};

// Roles allowed to see org-wide (not just "my own") data.
export const MANAGEMENT_ROLES = [ROLES.ADMIN, ROLES.MANAGER];

export const isManagement = (role) => MANAGEMENT_ROLES.includes(role);
export const isAdmin = (role) => role === ROLES.ADMIN;
