"use client";
import * as React from "react";
import { BaseModal, MiscellaneousItem } from "./modal/baseMiscellaneousModal";
import { CiudadFields } from "./modal/fields/ciudadFields";
import { SubcategoriaFields } from "./modal/fields/subcategoriaFields";
import { CategoriaRedFields } from "./modal/fields/CategoriaRedFields";
import { DetalleFields } from "./modal/fields/detalleFields";
import { SolucionCasoFields } from "./modal/fields/solucionCasoFields";
import { TipoClienteFields } from "./modal/fields/tipoClienteFields";
import { getMiscellaneous, createMiscellaneous, updateMiscellaneous } from "@/lib/api";

interface MiscellaneousModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  initialData?: MiscellaneousItem | null;
  categoria: string;
}


const CATEGORIA_DEPENDENCIAS: Record<string, { categoria: string; stateKey: string; label: string; campoId: string }> = {
  CIUDAD: { categoria: "ESTADO", stateKey: "estados", label: "estado", campoId: "estadoId" },
  SUBCATEGORIA: { categoria: "CATEGORIA_RED", stateKey: "categorias", label: "categoría", campoId: "categoriaId" },
  DETALLE: { categoria: "SUBCATEGORIA", stateKey: "subcategorias", label: "subcategoría", campoId: "subcategoriaId" },
  LOCALIDAD: { categoria: "CIUDAD", stateKey: "ciudades", label: "ciudad", campoId: "ciudadId" },
  SOLUCION_CASO: { categoria: "CAUSA_RAIZ", stateKey: "causasRaiz", label: "causa raíz", campoId: "causaId" },
};

const TITULOS: Record<string, { nuevo: string; editar: string }> = {
  CIUDAD: { nuevo: "Nueva Ciudad", editar: "Editar Ciudad" },
  SUBCATEGORIA: { nuevo: "Nueva Subcategoría", editar: "Editar Subcategoría" },
  CATEGORIA_RED: { nuevo: "Nueva Categoría de Red", editar: "Editar Categoría de Red" },
  ESTADO: { nuevo: "Nuevo Estado", editar: "Editar Estado" },
  LOCALIDAD: { nuevo: "Nueva Localidad", editar: "Editar Localidad" },
  DETALLE: { nuevo: "Nuevo Detalle", editar: "Editar Detalle" },
  SOLUCION_CASO: { nuevo: "Nueva Solución del Caso", editar: "Editar Solución del Caso" },
  TIPO_CLIENTE: { nuevo: "Nuevo Tipo de Cliente", editar: "Editar Tipo de Cliente" },
};

export const MiscellaneousModal = ({
  isOpen,
  onClose,
  title,
  initialData,
  categoria,
}: MiscellaneousModalProps) => {
  const [estadoSeleccionado, setEstadoSeleccionado] = React.useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = React.useState("");
  const [tipoIncidencia, setTipoIncidencia] = React.useState<string[]>([]);
  const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = React.useState("");
  const [ciudadSeleccionada, setCiudadSeleccionada] = React.useState("");
  const [causaRaizSeleccionada, setCausaRaizSeleccionada] = React.useState("");
  const [nivelSeveridadSeleccionado, setNivelSeveridadSeleccionado] = React.useState("");
  const [estados, setEstados] = React.useState<MiscellaneousItem[]>([]);
  const [categorias, setCategorias] = React.useState<MiscellaneousItem[]>([]);
  const [subcategorias, setSubcategorias] = React.useState<MiscellaneousItem[]>([]);
  const [ciudades, setCiudades] = React.useState<MiscellaneousItem[]>([]);
  const [causasRaiz, setCausasRaiz] = React.useState<MiscellaneousItem[]>([]);
  const [validateFn, setValidateFn] = React.useState<() => boolean>(() => () => true);
  const cargarDependencia = async (categoriaDep: string): Promise<MiscellaneousItem[]> => {
    try {
      const response = await getMiscellaneous({ categoria: categoriaDep });
      return (response.data || []).filter((item: MiscellaneousItem) => item.activo !== false);
    } catch (error) {
      console.error(`Error al cargar ${categoriaDep}:`, error);
      return [];
    }
  };


  const resetearEstados = () => {
    setEstadoSeleccionado("");
    setCategoriaSeleccionada("");
    setTipoIncidencia([]);
    setSubcategoriaSeleccionada("");
    setCiudadSeleccionada("");
    setCausaRaizSeleccionada("");
    setNivelSeveridadSeleccionado("");
    setEstados([]);
    setCategorias([]);
    setSubcategorias([]);
    setCiudades([]);
    setCausasRaiz([]);
    setValidateFn(() => () => true);
  };


  React.useEffect(() => {
    if (!isOpen) return;

    resetearEstados();

    const dependencia = CATEGORIA_DEPENDENCIAS[categoria];
    if (!dependencia) return;

    const cargarDatos = async () => {
      const datos = await cargarDependencia(dependencia.categoria);
      
      switch (categoria) {
        case "CIUDAD": setEstados(datos); break;
        case "SUBCATEGORIA": setCategorias(datos); break;
        case "DETALLE": setSubcategorias(datos); break;
        case "LOCALIDAD": setCiudades(datos); break;
        case "SOLUCION_CASO": setCausasRaiz(datos); break;
      }
    };

    cargarDatos();
  }, [categoria, isOpen]);

  const modalTitle = title || (initialData 
    ? TITULOS[categoria]?.editar || "Editar Elemento"
    : TITULOS[categoria]?.nuevo || "Nuevo Elemento"
  );

  const construirPayloadConRelacion = (
    basePayload: any,
    padreSeleccionado: string,
    listaPadres: MiscellaneousItem[],
    campoId: string
  ): any => {
    const payload = { ...basePayload };

    if (padreSeleccionado) {
      const padre = listaPadres.find((p) => (p._id || p.id) === padreSeleccionado);
      if (padre) {
        payload[campoId] = padre._id || padre.id;
      }
    }

    return payload;
  };

  
  const handleSave = async (basePayload: any): Promise<boolean> => {
    try {
      let payload = { ...basePayload };

 if (!payload.categoria || payload.categoria === 'null' || payload.categoria === null) {
      payload.categoria = categoria;
    }
      switch (categoria) {
        case "CIUDAD":
          payload = construirPayloadConRelacion(payload, estadoSeleccionado, estados, "estadoId");
          break;
        case "SUBCATEGORIA":
          payload = construirPayloadConRelacion(payload, categoriaSeleccionada, categorias, "categoriaId");
          break;
        case "DETALLE":
          payload = construirPayloadConRelacion(payload, subcategoriaSeleccionada, subcategorias, "subcategoriaId");
          break;
        case "LOCALIDAD":
          payload = construirPayloadConRelacion(payload, ciudadSeleccionada, ciudades, "ciudadId");
          break;
        case "SOLUCION_CASO":
          payload = construirPayloadConRelacion(payload, causaRaizSeleccionada, causasRaiz, "causaId");
          break;
        case "TIPO_CLIENTE":
          if (nivelSeveridadSeleccionado) {
            payload.nivelSeveridad = nivelSeveridadSeleccionado;
          }
          break;
        case "CATEGORIA_RED":
          if (tipoIncidencia.length === 0) {
            alert('Debes seleccionar al menos un tipo de incidencia');
            return false;
          }
          payload.tipoIncidencia = tipoIncidencia;
          break;
      }

     
      delete payload.padreId;
      delete payload.padreNombre;
      delete payload.padre;
      delete payload._id;
      delete payload.id;

   
    console.log('🔍 [handleSave] Payload final:', JSON.stringify(payload, null, 2));
    console.log('🔍 [handleSave] Categoría:', categoria);

    const isEditMode = Boolean(initialData?._id || initialData?.id);
    const id = initialData?._id || initialData?.id;
    
    const response = isEditMode && id
      ? await updateMiscellaneous(id, payload)
      : await createMiscellaneous(payload);

      return Boolean(response?.data);
    } catch (error: any) {
     
      return false;
    }
  };


  const renderExtraFields = () => {
    const commonProps = { isOpen, initialData, onValidate: setValidateFn };

    switch (categoria) {
      case "CIUDAD":
        return <CiudadFields {...commonProps} onEstadoChange={setEstadoSeleccionado} />;
      case "SUBCATEGORIA":
        return <SubcategoriaFields {...commonProps} onCategoriaChange={setCategoriaSeleccionada} />;
      case "CATEGORIA_RED":
        return <CategoriaRedFields isOpen={isOpen} initialData={initialData} onTipoIncidenciaChange={setTipoIncidencia} />;
      case "DETALLE":
        return <DetalleFields {...commonProps} subcategorias={subcategorias} onSubcategoriaChange={setSubcategoriaSeleccionada} />;
      case "SOLUCION_CASO":
        return <SolucionCasoFields {...commonProps} causasRaiz={causasRaiz} onCausaRaizChange={setCausaRaizSeleccionada} />;
      case "TIPO_CLIENTE":
        return <TipoClienteFields {...commonProps} onNivelSeveridadChange={setNivelSeveridadSeleccionado} />;
      default:
        return null;
    }
  };


  const validate = () => {
    if (typeof validateFn === 'function' && !validateFn()) {
      const dependencia = CATEGORIA_DEPENDENCIAS[categoria];
      if (dependencia) {
        alert(`Debe seleccionar un${dependencia.label.startsWith('e') ? 'a' : ''} ${dependencia.label}`);
      }
      return false;
    }
    return true;
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      initialData={initialData}
      categoria={categoria}
      extraFields={renderExtraFields()}
      onSave={handleSave}
      validate={validate}
    />
  );
};