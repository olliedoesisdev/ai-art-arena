// Admin authentication utilities

import { createClient } from '@/lib/supabase/server';
import { AdminUser, AdminRole, ROLE_PERMISSIONS } from '@/types/admin';

/**
 * Get the current admin user from the session
 * @returns AdminUser if authenticated and is an admin, null otherwise
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const supabase = await createClient();

  // Get the authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Check if user is in admin_users table
  const { data: adminUser, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', user.id)
    .eq('is_active', true)
    .single();

  if (error || !adminUser) {
    return null;
  }

  return adminUser as AdminUser;
}

/**
 * Check if current user has admin access
 */
export async function hasAdminAccess(): Promise<boolean> {
  const adminUser = await getAdminUser();
  return adminUser !== null;
}

/**
 * Check if current user has a specific role
 */
export async function hasRole(role: AdminRole): Promise<boolean> {
  const adminUser = await getAdminUser();
  return adminUser?.role === role;
}

/**
 * Check if current user has a specific permission
 */
export async function hasPermission(
  permission: keyof typeof ROLE_PERMISSIONS.admin
): Promise<boolean> {
  const adminUser = await getAdminUser();
  if (!adminUser) return false;

  const rolePermissions = ROLE_PERMISSIONS[adminUser.role];
  return rolePermissions[permission];
}

/**
 * Require admin access - throws error if not authenticated
 */
export async function requireAdmin(): Promise<AdminUser> {
  const adminUser = await getAdminUser();
  if (!adminUser) {
    throw new Error('Unauthorized: Admin access required');
  }
  return adminUser;
}

/**
 * Require specific permission - throws error if not authorized
 */
export async function requirePermission(
  permission: keyof typeof ROLE_PERMISSIONS.admin
): Promise<AdminUser> {
  const adminUser = await requireAdmin();
  const rolePermissions = ROLE_PERMISSIONS[adminUser.role];

  if (!rolePermissions[permission]) {
    throw new Error(
      `Forbidden: ${permission} permission required (current role: ${adminUser.role})`
    );
  }

  return adminUser;
}

/**
 * Update admin user's last login timestamp
 */
export async function updateLastLogin(userId: string): Promise<void> {
  const supabase = await createClient();

  await supabase
    .from('admin_users')
    .update({ last_login: new Date().toISOString() })
    .eq('id', userId);
}

/**
 * Log admin action to audit log
 */
export async function logAdminAction({
  action,
  resourceType,
  resourceId,
  changes,
  ipAddress,
  userAgent,
}: {
  action: string;
  resourceType: string;
  resourceId?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  const adminUser = await getAdminUser();
  if (!adminUser) return;

  const supabase = await createClient();

  await supabase.from('audit_logs').insert({
    admin_user_id: adminUser.id,
    action,
    resource_type: resourceType,
    resource_id: resourceId || null,
    changes: changes || null,
    ip_address: ipAddress || null,
    user_agent: userAgent || null,
  });
}