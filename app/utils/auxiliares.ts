import { NIVEL_SEVERIDAD, NIVEL_SEVERIDAD_DEFAULT } from "./constants";
import { NivelSeveridadItem } from "./types";


export const getNivelSeveridadConfig = (nivel: string): NivelSeveridadItem => {
  const nivelUpper = (nivel || "").toUpperCase().trim();
  return (
    NIVEL_SEVERIDAD.find((item) => item.value === nivelUpper) ?? {
      ...NIVEL_SEVERIDAD_DEFAULT,
      value: nivelUpper,
      label: nivel?.trim() || NIVEL_SEVERIDAD_DEFAULT.label,
    }
  );
};

export const parseMttrToMinutes = (value: string): number => {
  if (!value) return 0;
  const match = value.match(/(\d+)h\s*(\d+)m/);
  if (!match) return 0;
  return parseInt(match[1]) * 60 + parseInt(match[2]);
};