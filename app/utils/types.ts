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
  createdAt: Date;
  updatedAt: Date;
}


export interface TicketModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (ticketData: any) => void;
}