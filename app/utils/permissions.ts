// ✅ Roles unificados en ESPAÑOL (consistentes con backend y AuthContext)
export const ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  OPERADOR: 'operador',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

// ✅ Permisos usando roles en español
export const MODULE_PERMISSIONS: Record<string, string[]> = {
  dashboard: [ROLES.ADMIN, ROLES.EDITOR, ROLES.OPERADOR],
  servicios: [ROLES.ADMIN, ROLES.EDITOR, ROLES.OPERADOR],
  usuarios: [ROLES.ADMIN],
  reportes: [ROLES.ADMIN],
  auditoria: [ROLES.ADMIN],
  configuracion: [ROLES.ADMIN, ROLES.EDITOR],
  miscellaneous: [ROLES.ADMIN, ROLES.EDITOR],
};

export const hasPermission = (userRole: string | undefined, module: string): boolean => {
  if (!userRole) {

    return false;
  }
  
  const allowedRoles = MODULE_PERMISSIONS[module];
  if (!allowedRoles) {
    return false;
  }
  
  const hasAccess = allowedRoles.includes(userRole);
  return hasAccess;
};

export const filterMenuByRole = <T extends { label: string; module?: string; children?: T[] }>(
  menuItems: T[],
  userRole: string | undefined,
): T[] => {  
  const filtered = menuItems
    .filter((item) => {
      if (item.module) {
        const allowed = hasPermission(userRole, item.module);
        return allowed;
      }
      return true;
    })
    .map((item) => {
      if (item.children) {
        return {
          ...item,
          children: filterMenuByRole(item.children, userRole),
        };
      }
      return item;
    })
    .filter((item) => {
      if (item.children && item.children.length === 0) {
        return false;
      }
      return true;
    });
  
  return filtered;
};