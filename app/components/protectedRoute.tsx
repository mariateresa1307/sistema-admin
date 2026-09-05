"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/authContext";
import { useUserSession } from '../hooks/useUserSession';
import { PageSkeleton } from './skeletons';

interface ProtectedRouteProps {
  children: React.ReactNode;
  module: string;
}

export default function ProtectedRoute({ children, module }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, hasPermission } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  // Reportar actividad del usuario logueado (heartbeat cada 60s)
  useUserSession();

  useEffect(() => {
    if (!isLoading) {
      setIsChecking(false);
      
      if (!isAuthenticated) {
        router.push("/");
        return;
      }
      
      if (!hasPermission(module)) {
        router.push("/home");
        return;
      }
      
      console.log(` [ProtectedRoute] Acceso permitido a ${module}`);
    }
  }, [isLoading, isAuthenticated, hasPermission, module, router]);

  // Skeleton 
  if (isLoading || isChecking) {
    return <PageSkeleton />;
  }

  if (!isAuthenticated || !hasPermission(module)) {
    return null;
  }

  return <>{children}</>;
}