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
    console.log(`⚠️ [hasPermission] userRole es undefined para módulo: ${module}`);
    return false;
  }
  
  const allowedRoles = MODULE_PERMISSIONS[module];
  if (!allowedRoles) {
    console.log(`⚠️ [hasPermission] Módulo ${module} no está definido`);
    return false;
  }
  
  const hasAccess = allowedRoles.includes(userRole);
  console.log(`🔍 [hasPermission] ${module} - role: ${userRole} - allowedRoles: ${allowedRoles.join(', ')} - acceso: ${hasAccess}`);
  return hasAccess;
};

export const filterMenuByRole = <T extends { label: string; module?: string; children?: T[] }>(
  menuItems: T[],
  userRole: string | undefined,
): T[] => {
  console.log("🔍 [filterMenuByRole] userRole:", userRole);
  
  const filtered = menuItems
    .filter((item) => {
      if (item.module) {
        const allowed = hasPermission(userRole, item.module);
        console.log(`🔍 [filterMenuByRole] ${item.label} (${item.module}): ${allowed}`);
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
  
  console.log("✅ [filterMenuByRole] filtered:", filtered.length, "items");
  return filtered;
};