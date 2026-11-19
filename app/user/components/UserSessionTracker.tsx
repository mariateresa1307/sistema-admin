"use client";
import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { useAuth } from '../../context/authContext';
import { sendHeartbeat } from '@/lib/api';
import { clearSessionTurno } from 'app/utils/sessionTurno';

// Respaldo por inactividad: 20 minutos sin interacción
const INACTIVITY_TIMEOUT = 20 * 60 * 1000; 

//Hora de cierre por turno
const TURNOS = {
  DIA:   { closeHour: 17, closeMinute: 20 }, // DÍA   -> 17:20
  TARDE: { closeHour: 20, closeMinute: 30 }, // TARDE -> 20:30
  NOCHE: { closeHour: 8,  closeMinute: 15 }, // NOCHE -> 08:15
};

// Determina el turno basado en la hora actual (coincide con la tabla OnlineUsersTab)
function getTurnoByHour(hour: number): keyof typeof TURNOS {
  if (hour >= 6 && hour < 14) return 'DIA';
  if (hour >= 14 && hour < 22) return 'TARDE';
  return 'NOCHE';
}

// Calcula el timestamp (ms) de cierre, manejando el cruce de medianoche
function computeCloseAt(turno: keyof typeof TURNOS, now = dayjs()): number {
  const { closeHour, closeMinute } = TURNOS[turno];
  let target = now.hour(closeHour).minute(closeMinute).second(0).millisecond(0);

  if (turno === 'NOCHE' && now.hour() >= 22) {
    target = target.add(1, 'day');
  }

  return target.valueOf();
}


export const UserSessionTracker = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  
  const inactivityRef = useRef<NodeJS.Timeout | null>(null);
  const closeRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);

  // Función que ejecuta el cierre de sesión
const handleLogout = useCallback((motivo: string, preserveTurno = false) => {
  console.warn(`⚠️ [Tracker] Cierre de sesión: ${motivo}`);

const reasonKey =
    motivo.includes('inactividad') ? 'inactividad' :
    motivo.includes('turno') ? 'turno' :
    motivo.includes('token') ? 'expirada' :
    'manual';

  const turnoActual = localStorage.getItem('sessionTurno');
  const closeAtActual = localStorage.getItem('sessionCloseAt');

  if (typeof logout === 'function') {
    logout();
  } else {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
  }

  if (preserveTurno && turnoActual && closeAtActual) {
    localStorage.setItem('sessionTurno', turnoActual);
    localStorage.setItem('sessionCloseAt', closeAtActual);
  } else {
    clearSessionTurno();
  }

  // ✅ Esta línea es CRÍTICA - debe ser window.location.href, NO router.push
  window.location.href = `/?reason=${reasonKey}`;
}, [logout]);

  // Reinicia el temporizador de inactividad
   const resetInactivity = useCallback(() => {
    if (inactivityRef.current) clearTimeout(inactivityRef.current);
    inactivityRef.current = setTimeout(() => handleLogout('inactividad de 15 min', true), INACTIVITY_TIMEOUT);
  }, [handleLogout]);

 useEffect(() => {
  if (!isAuthenticated) {
    if (inactivityRef.current) clearTimeout(inactivityRef.current);
    if (closeRef.current) clearTimeout(closeRef.current);
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    return;
  }

  // ✅ Flag para evitar heartbeats duplicados en StrictMode
  let isActive = true;
  const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
  events.forEach((event) => window.addEventListener(event, resetInactivity));

  const sendHeartbeatSafe = async () => {
    if (!isActive) return; // Si el efecto ya se limpió, no enviar
    try {
      await sendHeartbeat();
    } catch (err: any) {
      if (err?.response?.status === 401) {
        handleLogout('token expirado o inválido', false);
      }
    }
  };

  sendHeartbeatSafe();
  heartbeatRef.current = setInterval(sendHeartbeatSafe, 60000);

  // ... resto del código (turnos, inactividad) ...

  // ✅ Cleanup robusto
  return () => {
    isActive = false; // Marca el efecto como inactivo
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    if (closeRef.current) clearTimeout(closeRef.current);
    if (inactivityRef.current) clearTimeout(inactivityRef.current);
    events.forEach((event) => window.removeEventListener(event, resetInactivity));
  };
}, [isAuthenticated, user?.username]); // ✅ Quita handleLogout y resetInactivity de las dependencias

  return null;
};