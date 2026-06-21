"use client";

import React, { useEffect, useState } from 'react';
import { Notification } from './Notification';

export default function NotificationProvider() {
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'error' as any });

  useEffect(() => {
    const handler = (e: any) => {
      const { message, severity } = e?.detail || {};
      setNotification({ open: true, message: message || 'Ocurrió un error inesperado.', severity: severity || 'error' });
    };

    window.addEventListener('app-notification', handler as EventListener);
    return () => window.removeEventListener('app-notification', handler as EventListener);
  }, []);

  const handleClose = () => setNotification((s) => ({ ...s, open: false }));
  
  return (
    <Notification open={notification.open} message={notification.message} severity={notification.severity} onClose={handleClose} />
  );
}
