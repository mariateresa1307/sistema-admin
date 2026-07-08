import { NivelSeveridadItem } from "./types";

export const TIPO_INCIDENCIA = {
  FALLA_MASIVA: "FALLA MASIVA",
  FALLA_PUNTUAL: "FALLA PUNTUAL",
  VENTANA_MANTENIMIENTO: "VENTANA DE MANTENIMIENTO"
}


export const CATEGORIA_RED = [
  "ACCESO",
  "AMBIENTE",
  "COMPONENTES",
  "CORE",
  "IT",
  "TRANSPORTE"
] 


export const TICKET_STATUS = {
  EN_GESTION: 'en_gestion',
  PENDIENTE: 'pendiente',
  CERRADO: 'cerrado',
}


export const TIPO_SERVICIO = {
  DOG: "DOG",
  INTERNET: "INTERNET",
  METROLAN: "METROLAN",
  RBS: "RBS",
  REDES_COMPARTIDAS: "REDES_COMPARTIDAS",
  UI: "UI"
}


export const NIVEL_SEVERIDAD: NivelSeveridadItem[] = [
  {
    label: "Bajo",
    value: "BAJO",
    bgcolor: "#c8e6c9",
    color: "#2e7d32",
    icon: "🟢",
  },
  {
    label: "Medio",
    value: "MEDIO",
    bgcolor: "#fff3e0",
    color: "#e65100",
    icon: "🟠",
  },
  {
    label: "Alto",
    value: "ALTO",
    bgcolor: "#ffcdd2",
    color: "#c62828",
    icon: "🔴",
  },
];

export const NIVEL_SEVERIDAD_DEFAULT: NivelSeveridadItem = {
  label: "No especificado",
  value: "",
  bgcolor: "#f5f5f5",
  color: "#616161",
  icon: "⚪",
};

export const TIPO_CLIENTE = {
  BANCA: "BANCA", 
  CARRIER: "CARRIER",   
  CORPORATIVO: "CORPORATIVO", 
  RESIDENCIAL: "RESIDENCIAL"
}

export const IMPUTABLE = {
  CLIENTE: "Cliente",
  NETUNO: "Netuno",
  PROVEEDOR: "Proveedor",
};


export const CATEGORIA = {
  TIPO_CLIENTE: 'TIPO_CLIENTE',
  PROVEEDOR: 'PROVEEDOR',
  ESTADO: 'ESTADO',
  CIUDAD: 'CIUDAD',
  LOCALIDAD: 'LOCALIDAD',
  CATEGORIA_RED: 'CATEGORIA_RED',
  SUBCATEGORIA: 'SUBCATEGORIA',
  DETALLE: 'DETALLE',
  CAUSA_RAIZ: 'CAUSA_RAIZ',
  SOLUCION_CASO: 'SOLUCION_CASO',
} as const;

export type CategoriaType = typeof CATEGORIA[keyof typeof CATEGORIA];