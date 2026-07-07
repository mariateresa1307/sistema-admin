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
