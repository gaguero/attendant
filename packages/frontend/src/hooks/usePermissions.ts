import { useAuth } from './useAuth';

/**
 * Permission checking hook
 */
export default function usePermissions() {
  const { hasRole, hasAnyRole, isAdmin, isManager, isStaff, canManageUsers } = useAuth();

  return { hasRole, hasAnyRole, isAdmin, isManager, isStaff, canManageUsers };
} 