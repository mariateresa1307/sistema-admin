"use client";
import { useEffect } from 'react';
import { sendHeartbeat } from '@/lib/api';

export const useUserSession = () => {
  useEffect(() => {
    const send = async () => {
      try {
        const res = await sendHeartbeat();
        console.log('💓 [useUserSession] Heartbeat OK:', res.status);
      } catch (err: any) {
        // ✅ Ahora el error es VISIBLE en consola
        console.warn('💔 [useUserSession] Heartbeat falló:', err?.response?.status, err?.response?.data?.message || err.message);
      }
    };

    send(); // heartbeat inicial
    const interval = setInterval(send, 60000);

    return () => clearInterval(interval);
  }, []);
};