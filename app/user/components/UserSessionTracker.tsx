"use client";
import { useEffect } from 'react';
import { useAuth } from '../../context/authContext';
import { sendHeartbeat } from '@/lib/api';

export const UserSessionTracker = () => {
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      console.log('⏸️ [Tracker] Sin sesión activa, heartbeat pausado');
      return;
    }

    console.log('🚀 [Tracker] Sesión activa, iniciando heartbeat para:', user?.username);

    const send = async () => {
      try {
        const res = await sendHeartbeat();
        console.log('💓 [Tracker] Heartbeat OK:', res.status);
      } catch (err: any) {
        console.warn('💔 [Tracker] Heartbeat falló:', err?.response?.status, err?.message);
      }
    };

    send(); // inmediato
    const interval = setInterval(send, 60000); // cada 60s

    return () => clearInterval(interval);
  }, [isAuthenticated, user?.username]);

  return null; 
};