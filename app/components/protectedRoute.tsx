"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useAuth } from "../context/authContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  module: string;
}

export default function ProtectedRoute({ children, module }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, hasPermission } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Esperar a que termine de cargar
    if (!isLoading) {
      setIsChecking(false);
      
      // Verificar autenticación y permisos
      if (!isAuthenticated) {
       
        router.push("/");
        return;
      }
      
      if (!hasPermission(module)) {
        
        router.push("/home");
        return;
      }
      
      console.log(`✅ [ProtectedRoute] Acceso permitido a ${module}`);
    }
  }, [isLoading, isAuthenticated, hasPermission, module, router]);

  // Mostrar spinner mientras verifica
  if (isLoading || isChecking) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="body1" color="text.secondary">
          Verificando permisos...
        </Typography>
      </Box>
    );
  }

  // Si no está autenticado o no tiene permisos, no renderizar nada
  if (!isAuthenticated || !hasPermission(module)) {
    return null;
  }

  
  return <>{children}</>;
}