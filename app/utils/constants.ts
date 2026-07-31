import { NivelSeveridadItem } from "./types";

export const TIPO_INCIDENCIA = {
  FALLA_MASIVA: "FALLA MASIVA",
  FALLA_PUNTUAL: "FALLA PUNTUAL",
  VENTANA_MANTENIMIENTO: "VENTANA DE MANTENIMIENTO"
}



export const TIPO_SERVICIO = {
  DOG: "DOG",
  METROLAN: "METROLAN",
  RBS: "RBS",
  REDES_COMPARTIDAS: "REDES COMPARTIDAS",
  IU: "IU"
}


export const CATEGORIA_RED = [/*esto se debe trar de miscelaneos no de aca de aca se debe eliminar */
  "ACCESO",
  "AMBIENTE",
  "COMPONENTES",
  "CORE",
  "IT",
  "TRANSPORTE"
] 

export const PRODUCTO = [
"FiberPonBusinessPlus100Mb",
"FiberPonBusinessPlus200Mb",
"FiberPonBusinessPlus400Mb",
"FiberPonBusinessPlus600Mb",
"FiberPonPremium100Mb",
"FiberPonPremium200Mb",
"FiberPonPremium250Mb",
"FiberPonPremium300Mb",
"FiberPonPremium400Mb",
"FiberPonPremium500Mb",
"FiberPonPremium600Mb",
"FiberPonPremium800Mb",
"FiberPonPremium1Gb",
"FiberPonPremium5Gb",
"FiberPonPremium8Gb",
"FiberPonPremium10Gb",

] 


export const PRODUCTO_DATOS= [
"FiberPON_Datos_2Mbps",
"FiberPON_Datos_6Mbps",
"FiberPON_Datos_8Mbps",
"FiberPON_Datos_10Mbps",
"FiberPON_Datos_20Mbps",
"FiberPON_Datos_30Mbps",
"FiberPON_Datos_40Mbps",
"FiberPON_Datos_50Mbps",
"FiberPON_Datos_60Mbps",
"FiberPON_Datos_80Mbps",
"FiberPON_Datos_100Mbps",
"FiberPON_Datos_150Mbps",
"FiberPON_Datos_200Mbps",
"FiberPON_Datos_300Mbps",
"FiberPON_Datos_400Mbps",
"FiberPON_Datos_500Mbps",
"FiberPON_Datos_800Mbps",
"FiberPON_Datos_1Gbps",

] 


export const TICKET_STATUS = {
  EN_GESTION: 'en_gestion',
  ACTIVO: 'activo',
  CERRADO: 'cerrado',
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