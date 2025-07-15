import type { User } from "@shared/schema";

export type UserRole = "admin" | "manager" | "staff" | "technician";

export interface RolePermissions {
  // User management
  canCreateUsers: boolean;
  canViewAllUsers: boolean;
  canManageUsers: boolean;
  
  // Repair management
  canViewAllRepairs: boolean;
  canCreateRepairs: boolean;
  canUpdateRepairStatus: boolean;
  canAssignRepairs: boolean;
  canDeleteRepairs: boolean;
  
  // Dashboard access
  canViewDashboard: boolean;
  canViewAnalytics: boolean;
}

const rolePermissions: Record<UserRole, RolePermissions> = {
  admin: {
    // Full access to everything
    canCreateUsers: true,
    canViewAllUsers: true,
    canManageUsers: true,
    canViewAllRepairs: true,
    canCreateRepairs: true,
    canUpdateRepairStatus: true,
    canAssignRepairs: true,
    canDeleteRepairs: true,
    canViewDashboard: true,
    canViewAnalytics: true,
  },
  manager: {
    // Full access except cannot add new users
    canCreateUsers: false,
    canViewAllUsers: true,
    canManageUsers: false,
    canViewAllRepairs: true,
    canCreateRepairs: true,
    canUpdateRepairStatus: true,
    canAssignRepairs: true,
    canDeleteRepairs: true,
    canViewDashboard: true,
    canViewAnalytics: true,
  },
  staff: {
    // Cannot change job status (view and create only)
    canCreateUsers: false,
    canViewAllUsers: false,
    canManageUsers: false,
    canViewAllRepairs: true,
    canCreateRepairs: true,
    canUpdateRepairStatus: false,
    canAssignRepairs: false,
    canDeleteRepairs: false,
    canViewDashboard: true,
    canViewAnalytics: false,
  },
  technician: {
    // Can accept jobs and change job status
    canCreateUsers: false,
    canViewAllUsers: false,
    canManageUsers: false,
    canViewAllRepairs: true,
    canCreateRepairs: false,
    canUpdateRepairStatus: true,
    canAssignRepairs: false,
    canDeleteRepairs: false,
    canViewDashboard: true,
    canViewAnalytics: false,
  },
};

export function getUserPermissions(role: UserRole): RolePermissions {
  return rolePermissions[role];
}

export function hasPermission(user: User, permission: keyof RolePermissions): boolean {
  const permissions = getUserPermissions(user.role as UserRole);
  return permissions[permission];
}

export function canAccessRoute(user: User, route: string): boolean {
  const permissions = getUserPermissions(user.role as UserRole);
  
  switch (route) {
    case '/dashboard':
      return permissions.canViewDashboard;
    case '/repairs':
      return permissions.canViewAllRepairs;
    case '/new-repair':
      return permissions.canCreateRepairs;
    case '/users':
      return permissions.canViewAllUsers;
    default:
      return true;
  }
}

export function filterRepairsByRole(user: User, repairs: any[]): any[] {
  const permissions = getUserPermissions(user.role as UserRole);
  
  // If user can view all repairs, return everything
  if (permissions.canViewAllRepairs) {
    return repairs;
  }
  
  // Otherwise, only return repairs created by this user
  return repairs.filter(repair => repair.userId === user.id);
}