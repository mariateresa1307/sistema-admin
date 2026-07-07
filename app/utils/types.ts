import { TICKET_STATUS, TIPO_INCIDENCIA } from "./constants";

export type TipoIncidenciaKey = keyof typeof TIPO_INCIDENCIA;

export type SimpleConfigOpt = {
  _id: string;
  valor: string;
};


export interface ConfiguracionInterface {
   _id: string;
  categoria: string;
  valor: string;
  descripcion: string;
  padreId: string | null;
  padreNombre: string | null;
  tipoIncidencia: string[];
  activo: boolean;
  nivelSeveridad?: string;
  createdAt: Date;
  updatedAt: Date;
}


export interface TicketModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (ticketData: any) => void;
}


export type Service = {
  _id?: string;
  tipoServicio: string;
  name: string;
  city: string;
  tipoCliente: string;
  proveedorDelServicioCompartido: string;
  id_netuno: string;
  idRBS?: string;
  id_circuito?: string;
  serialONT?: string;
  nodoA?: string;
  nodoB?: string;
  oltnodo?: string;
  contrato?: number;
  vlan?: number | string;
  status?: string;
  instalado?: boolean;
};


export type Tickets = {
  id: string;
  _id: string;
  username: string;
  email: string;
  asuntoCaso: string;
  ticketCodigo: string;
  primerNombre: string;
  primerApellido: string;
  responsable: string;
  estado: 'PRELIMINAR' | 'ACTIVO' | 'CERRADO';
};


export type Pagination<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
export type NivelSeveridadItem = {
  label: string;
  value: string;
  bgcolor: string;
  color: string;
  icon: string;
};
