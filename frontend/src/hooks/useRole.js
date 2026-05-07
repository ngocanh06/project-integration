import { useAuth } from './useAuth';

/**
 * useRole Hook - Check user role and permissions
 */
export const useRole = () => {
  const { user } = useAuth();

  const isAdmin = () => {
    return user?.system_role === 'admin';
  };

  const isManager = () => {
    return user?.system_role === 'manager' || user?.system_role === 'admin';
  };

  const isUser = () => {
    return user?.system_role === 'user';
  };

  const hasRole = (role) => {
    if (role === 'admin') return isAdmin();
    if (role === 'manager') return isManager();
    if (role === 'user') return isUser();
    return false;
  };

  const hasAnyRole = (roles) => {
    return roles.some(role => hasRole(role));
  };

  return {
    isAdmin,
    isManager,
    isUser,
    hasRole,
    hasAnyRole,
    userRole: user?.system_role,
  };
};

export default useRole;
