// Role-based permission system for Regent Cha-am Hotel

export type UserRole = "admin" | "manager" | "staff" | "technician";

export type Permission = 
  | "repairs:create"
  | "repairs:read"
  | "repairs:update"
  | "repairs:delete"
  | "repairs:assign"
  | "users:create"
  | "users:read" 
  | "users:update"
  | "users:delete"
  | "notifications:read"
  | "notifications:create"
  | "dashboard:view"
  | "uploads:create";

// Permission matrix defining what each role can do
const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    "repairs:create",
    "repairs:read", 
    "repairs:update",
    "repairs:delete",
    "repairs:assign",
    "users:create",
    "users:read",
    "users:update", 
    "users:delete",
    "notifications:read",
    "notifications:create",
    "dashboard:view",
    "uploads:create",
  ],
  manager: [
    "repairs:create",
    "repairs:read",
    "repairs:update", 
    "repairs:delete",
    "repairs:assign",
    "users:read",
    "users:update", // Can update user roles but not create/delete
    "notifications:read",
    "notifications:create",
    "dashboard:view",
    "uploads:create",
  ],
  staff: [
    "repairs:create",
    "repairs:read",
    "notifications:read",
    "dashboard:view",
    "uploads:create",
  ],
  technician: [
    "repairs:read",
    "repairs:update", // Can accept jobs and update status
    "repairs:assign", // Can accept job assignments
    "notifications:read",
    "dashboard:view",
    "uploads:create",
  ],
};

/**
 * Check if a user role has a specific permission
 */
export function checkPermission(role: UserRole, permission: Permission): boolean {
  const permissions = rolePermissions[role];
  return permissions.includes(permission);
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return rolePermissions[role] || [];
}

/**
 * Check if user can manage other users
 */
export function canManageUsers(role: UserRole): boolean {
  return checkPermission(role, "users:create") || checkPermission(role, "users:update");
}

/**
 * Check if user can assign repair jobs
 */
export function canAssignRepairs(role: UserRole): boolean {
  return checkPermission(role, "repairs:assign");
}

/**
 * Check if user can update repair status
 */
export function canUpdateRepairStatus(role: UserRole): boolean {
  return checkPermission(role, "repairs:update");
}