"use client";
import { createContext, ReactNode, useCallback, useContext, useEffect, useState, useMemo } from "react";

export interface UserData {
  _id?: string;
  email?: string;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  role?: string;
  username?: string;
}

interface AuthContextType {
  user: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: UserData, token: string) => void;
  logout: () => void;
  hasPermission: (module: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeRole = (role: string | undefined): string => {
  if (!role) {
    console.warn("⚠️ [normalizeRole] Role es undefined, usando 'operador' por defecto");
    return 'operador';
  }
  
  const roleLower = role.toLowerCase().trim();
  
  const roleMap: Record<string, string> = {
    'admin': 'admin',
    'administrador': 'admin',
    'operador': 'operador',
    'operator': 'operador',
    'editor': 'editor',
    'operator_edit': 'editor',
    'operator editor': 'editor',
    'operador editor': 'editor',
  };
  
  const normalized = roleMap[roleLower] || 'operador';

  return normalized;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
 
    
    try {
      const storedUser = localStorage.getItem("userData");
      const storedToken = localStorage.getItem("token");

     
        
      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser);
    
        
        if (parsedUser.role) {
          parsedUser.role = normalizeRole(parsedUser.role);
         
        } else {
          console.warn("⚠️ [AuthProvider] Usuario NO tiene role, asignando 'operador'");
          parsedUser.role = 'operador';
        }
        
        setUser(parsedUser);
      } else {
        console.warn("⚠️ [AuthProvider] No hay userData o token en localStorage");
        console.warn("⚠️ [AuthProvider] storedUser:", !!storedUser);
        console.warn("⚠️ [AuthProvider] storedToken:", !!storedToken);
      }
    } catch (err) {
      console.error("❌ [AuthProvider] Error parsing userData:", err);
      localStorage.removeItem("userData");
      localStorage.removeItem("token");
    }
    
    
    setIsLoading(false);
 
  }, []);

  const login = useCallback((userData: UserData, token: string) => {
   
    const normalizedUser = { ...userData };
    normalizedUser.role = normalizeRole(normalizedUser.role);
    
    setUser(normalizedUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("userData", JSON.stringify(normalizedUser));
      localStorage.setItem("token", token);
    }
   
  }, []);

  const logout = useCallback(() => {
   
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("userData");
      localStorage.removeItem("token");
    }
  }, []);

  const hasPermission = useCallback(
    (module: string): boolean => {
 
      
      if (!user?.role) {
        console.log(`❌ [hasPermission] Sin role, denegando acceso`);
        return false;
      }
      
      const MODULE_PERMISSIONS: Record<string, string[]> = {
        dashboard: ['admin', 'editor', 'operador'],
        servicios: ['admin', 'editor', 'operador'],
        usuarios: ['admin'],
        reportes: ['admin'],
        auditoria: ['admin'],
        configuracion: ['admin', 'editor'],
        miscellaneous: ['admin', 'editor'],
      };
      
      const allowedRoles = MODULE_PERMISSIONS[module];
    
      
      if (!allowedRoles) {
        console.log(`❌ [hasPermission] Módulo ${module} no está definido`);
        return false;
      }
      
      const hasAccess = allowedRoles.includes(user.role);
    
      return hasAccess;
    },
    [user?.role],
  );

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasPermission,
  }), [user, isLoading, login,logout, hasPermission]);


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}