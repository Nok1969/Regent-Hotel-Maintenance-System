import type { User } from "@shared/schema";

export type UserRole = "admin" | "manager" | "staff" | "technician";

export interface RolePermissions {
  // User management
  canCreateUsers: boolean;
  canViewAllUsers: boolean;
  canManageUsers: boolean;
  canAddUsers: boolean;
  
  // Repair management
  canViewAllRepairs: boolean;
  canViewOwnRepairs: boolean;
  canCreateRepairs: boolean;
  canUpdateRepairStatus: boolean;
  canAcceptJobs: boolean;
  canCancelJobs: boolean;
  canAssignRepairs: boolean;
  canDeleteRepairs: boolean;
  
  // Notifications
  canReceiveNotifications: boolean;
  canReceiveNewJobNotifications: boolean;
  canReceiveStatusChangeNotifications: boolean;
  canManageNotifications: boolean;
  
  // Dashboard access
  canViewDashboard: boolean;
  canViewAnalytics: boolean;
}

const rolePermissions: Record<UserRole, RolePermissions> = {
  admin: {
    // Admin: Full Access + เพิ่มผู้ใช้ได้
    canCreateUsers: true,
    canViewAllUsers: true,
    canManageUsers: true,
    canAddUsers: true, // Only admin can add new users
    canViewAllRepairs: true,
    canViewOwnRepairs: true,
    canCreateRepairs: true,
    canUpdateRepairStatus: true,
    canAcceptJobs: true,
    canCancelJobs: true,
    canAssignRepairs: true,
    canDeleteRepairs: true,
    canReceiveNotifications: true,
    canReceiveNewJobNotifications: true,
    canReceiveStatusChangeNotifications: true,
    canManageNotifications: true,
    canViewDashboard: true,
    canViewAnalytics: true,
  },
  manager: {
    // Manager: Full Access, รับการแจ้งเตือนเมื่อมีงานใหม่เข้ามา, กดรับงาน, สามารถเปลี่ยนสถานะงาน, ยกเลิกงานได้
    canCreateUsers: false,
    canViewAllUsers: true,
    canManageUsers: true,
    canAddUsers: false, // Cannot add new users
    canViewAllRepairs: true,
    canViewOwnRepairs: true,
    canCreateRepairs: true,
    canUpdateRepairStatus: true,
    canAcceptJobs: true, // กดรับงาน
    canCancelJobs: true, // ยกเลิกงานได้
    canAssignRepairs: true,
    canDeleteRepairs: true,
    canReceiveNotifications: true,
    canReceiveNewJobNotifications: true, // รับการแจ้งเตือนเมื่อมีงานใหม่เข้ามา
    canReceiveStatusChangeNotifications: true,
    canManageNotifications: true,
    canViewDashboard: true,
    canViewAnalytics: true,
  },
  staff: {
    // Staff: แจ้งงานใหม่, ติดตามสถานะงานของตัวเองได้, รับแจ้งเตือนเมื่อสถานะงานเปลี่ยนแปลง
    canCreateUsers: false,
    canViewAllUsers: false,
    canManageUsers: false,
    canAddUsers: false,
    canViewAllRepairs: false, // Cannot view all repairs
    canViewOwnRepairs: true, // ติดตามสถานะงานของตัวเองได้
    canCreateRepairs: true, // แจ้งงานใหม่
    canUpdateRepairStatus: false,
    canAcceptJobs: false,
    canCancelJobs: false,
    canAssignRepairs: false,
    canDeleteRepairs: false,
    canReceiveNotifications: true,
    canReceiveNewJobNotifications: false,
    canReceiveStatusChangeNotifications: true, // รับแจ้งเตือนเมื่อสถานะงานเปลี่ยนแปลง
    canManageNotifications: false,
    canViewDashboard: true,
    canViewAnalytics: false,
  },
  technician: {
    // Technician: รับการแจ้งเตือนเมื่อมีงานใหม่เข้ามา, กดรับงาน, สามารถเปลี่ยนสถานะงาน
    canCreateUsers: false,
    canViewAllUsers: false,
    canManageUsers: false,
    canAddUsers: false,
    canViewAllRepairs: true,
    canViewOwnRepairs: true,
    canCreateRepairs: false,
    canUpdateRepairStatus: true, // สามารถเปลี่ยนสถานะงาน
    canAcceptJobs: true, // กดรับงาน
    canCancelJobs: false,
    canAssignRepairs: false,
    canDeleteRepairs: false,
    canReceiveNotifications: true,
    canReceiveNewJobNotifications: true, // รับการแจ้งเตือนเมื่อมีงานใหม่เข้ามา
    canReceiveStatusChangeNotifications: true,
    canManageNotifications: false,
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
  
  // If user can only view own repairs (staff), filter by user ID
  if (permissions.canViewOwnRepairs && !permissions.canViewAllRepairs) {
    return repairs.filter(repair => repair.userId === user.id);
  }
  
  // Default: return empty array if no permissions
  return [];
}