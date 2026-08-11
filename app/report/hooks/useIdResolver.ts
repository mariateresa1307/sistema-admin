"use client";
import { useState, useEffect, useCallback } from "react";
import { getMiscellaneous, getService, getUsers } from "@/lib/api";

const normalizeToArray = (response: any): any[] => {
  if (!response?.data) return [];
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.data.data)) return response.data.data;
  if (Array.isArray(response.data.results)) return response.data.results;
  return [];
};

// Detecta ObjectIds de MongoDB (24 caracteres hexadecimales)
const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;
const OBJECT_ID_GLOBAL_REGEX = /[a-f\d]{24}/gi;

// ✅ Cache compartida a nivel de módulo: tabla y modal usan el mismo fetch
let sharedMap: Map<string, string> | null = null;
let sharedPromise: Promise<Map<string, string>> | null = null;

const buildLookupMap = async (): Promise<Map<string, string>> => {
  const [resMisc, resServices, resUsers] = await Promise.all([
    getMiscellaneous({ limit: 9999 }),
    getService({ limit: 9999 }),
    getUsers(),
  ]);

  const map = new Map<string, string>();

  // Miscellaneous: cubre networkCategory, subcategoria, detalle, tipoCliente,
  // proveedorDelServicioCompartido, ultimaMilla, etc.
  normalizeToArray(resMisc).forEach((item: any) => {
    if (item?._id && item?.valor) map.set(String(item._id), item.valor);
  });

  // Servicios: cubre serviciosAfectados
  normalizeToArray(resServices).forEach((item: any) => {
    if (item?._id) map.set(String(item._id), item.name || item.id_circuito || String(item._id));
  });

  // Usuarios: cubre operatorResponsable, operatorAsignado, etc.
  normalizeToArray(resUsers).forEach((item: any) => {
    const nombre = `${item?.primerNombre || ""} ${item?.primerApellido || ""}`.trim();
    if (item?._id) map.set(String(item._id), nombre || item.email || String(item._id));
  });

  return map;
};

const loadLookupMap = (): Promise<Map<string, string>> => {
  if (sharedMap) return Promise.resolve(sharedMap);
  if (!sharedPromise) {
    sharedPromise = buildLookupMap()
      .then((map) => {
        sharedMap = map;
        return map;
      })
      .catch((err) => {
        sharedPromise = null;
        throw err;
      });
  }
  return sharedPromise;
};

export const useIdResolver = () => {
  const [lookupMap, setLookupMap] = useState<Map<string, string>>(sharedMap ?? new Map());
  const [ready, setReady] = useState(Boolean(sharedMap));

  useEffect(() => {
    let isMounted = true;
    if (sharedMap) return;

    loadLookupMap()
      .then((map) => {
        if (isMounted) {
          setLookupMap(map);
          setReady(true);
        }
      })
      .catch((error) => {
        console.error("❌ [useIdResolver] Error cargando lookups:", error);
        if (isMounted) setReady(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Reemplaza ObjectIds por nombres, recursivo (objetos, arrays, strings)
  const resolveValue = useCallback((value: any): any => {
    if (value === null || value === undefined) return value;

    if (typeof value === "string") {
      return OBJECT_ID_REGEX.test(value) ? lookupMap.get(value) ?? value : value;
    }
    if (Array.isArray(value)) return value.map((v) => resolveValue(v));
    if (typeof value === "object") {
      const out: Record<string, any> = {};
      for (const [k, v] of Object.entries(value)) out[k] = resolveValue(v);
      return out;
    }
    return value;
  }, [lookupMap]);

  // Para oldValue/newValue guardados como JSON string
  const resolveAuditJson = useCallback((json?: string): any => {
    if (!json) return null;
    try {
      return resolveValue(JSON.parse(json));
    } catch {
      return json;
    }
  }, [resolveValue]);

  // Reemplaza IDs dentro de texto libre ("DELETE en SERVICE (ID: xxx)")
  const resolveText = useCallback((text?: string | null): string => {
    if (!text) return "";
    return text.replace(OBJECT_ID_GLOBAL_REGEX, (id) => lookupMap.get(id) ?? id);
  }, [lookupMap]);

  return { lookupMap, ready, resolveValue, resolveAuditJson, resolveText };
};