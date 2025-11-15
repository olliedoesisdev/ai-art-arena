// Admin-related TypeScript types

export type AdminRole = 'admin' | 'moderator' | 'editor';

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: AdminRole;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  admin_user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  changes: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AdminSession {
  user: AdminUser;
  expiresAt: string;
}

// Permission levels for different roles
export const ROLE_PERMISSIONS = {
  admin: {
    canManageUsers: true,
    canManageContests: true,
    canManageArtworks: true,
    canViewAnalytics: true,
    canViewAuditLogs: true,
    canDeleteAny: true,
  },
  moderator: {
    canManageUsers: false,
    canManageContests: true,
    canManageArtworks: true,
    canViewAnalytics: true,
    canViewAuditLogs: true,
    canDeleteAny: false,
  },
  editor: {
    canManageUsers: false,
    canManageContests: false,
    canManageArtworks: true,
    canViewAnalytics: false,
    canViewAuditLogs: false,
    canDeleteAny: false,
  },
} as const;