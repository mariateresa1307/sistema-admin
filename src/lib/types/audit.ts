// types/audit.ts
export interface AuditLog {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: 'LOGIN' | 'LOGOUT' | 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT';
  module: string;
  recordId?: string;
  recordType?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  details?: string;
  eventDate?: string;
  createdAt: string;
}

export interface AuditFilters {
  userId?: string;
  action?: string;
  module?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}


export interface AuditStats {
  total: number;
  ediciones: number;
  eliminados: number;
  usuarios: number;
  historial: number;
}