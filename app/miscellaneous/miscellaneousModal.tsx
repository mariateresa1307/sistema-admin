"use client";
import * as React from "react";
import { BaseModal, MiscellaneousItem } from "./modal/baseMiscellaneousModal";
import { CiudadFields } from "./modal/fields/ciudadFields";
import { SubcategoriaFields } from "./modal/fields/subcategoriaFields";
import { CategoriaRedFields } from "./modal/fields/CategoriaRedFields";
import { DetalleFields } from "./modal/fields/detalleFields";
import { SolucionCasoFields } from "./modal/fields/solucionCasoFields";

interface MiscellaneousModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  initialData?: MiscellaneousItem | null;
  categoria: string;
}

export const MiscellaneousModal = ({
  isOpen,
  onClose,
  title,
  initialData,
  categoria,
}: MiscellaneousModalProps) => {
  const [estadoSeleccionado, setEstadoSeleccionado] = React.useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = React.useState("");
  // ✅ CAMBIADO: Ahora es array
  const [tipoIncidencia, setTipoIncidencia] = React.useState<string[]>([]);
  const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = React.useState("");
  const [ciudadSeleccionada, setCiudadSeleccionada] = React.useState("");
  const [causaRaizSeleccionada, setCausaRaizSeleccionada] = React.useState("");

  const [estados, setEstados] = React.useState<MiscellaneousItem[]>([]);
  const [categorias, setCategorias] = React.useState<MiscellaneousItem[]>([]);
  const [subcategorias, setSubcategorias] = React.useState<MiscellaneousItem[]>([]);
  const [ciudades, setCiudades] = React.useState<MiscellaneousItem[]>([]);
  const [causasRaiz, setCausasRaiz] = React.useState<MiscellaneousItem[]>([]);
  const [validateFn, setValidateFn] = React.useState<() => boolean>(() => () => true);

  React.useEffect(() => {
    if (!isOpen) return;

    setEstadoSeleccionado("");
    setCategoriaSeleccionada("");
    setTipoIncidencia([]); // ✅ Resetear como array vacío
    setSubcategoriaSeleccionada("");
    setCiudadSeleccionada("");
    setCausaRaizSeleccionada("");
    setEstados([]);
    setCategorias([]);
    setSubcategorias([]);
    setCiudades([]);
    setCausasRaiz([]);
    setValidateFn(() => () => true);

    if (categoria === "CIUDAD") {
      fetch("http://localhost:4000/miscellaneous?categoria=ESTADO")
        .then(res => res.json())
        .then(data => {
          const estadosData = Array.isArray(data) ? data : [];
          setEstados(estadosData.filter((e: MiscellaneousItem) => e.activo !== false));
        })
        .catch(err => console.error("Error al cargar estados:", err));
    }

    if (categoria === "SUBCATEGORIA") {
      fetch("http://localhost:4000/miscellaneous?categoria=CATEGORIA_RED")
        .then(res => res.json())
        .then(data => {
          const categoriasData = Array.isArray(data) ? data : [];
          setCategorias(categoriasData.filter((c: MiscellaneousItem) => c.activo !== false));
        })
        .catch(err => console.error("Error al cargar categorías:", err));
    }

    if (categoria === "DETALLE") {
      fetch("http://localhost:4000/miscellaneous?categoria=SUBCATEGORIA")
        .then(res => res.json())
        .then(data => {
          const subcategoriasData = Array.isArray(data) ? data : [];
          setSubcategorias(subcategoriasData.filter((s: MiscellaneousItem) => s.activo !== false));
        })
        .catch(err => console.error("Error al cargar subcategorías:", err));
    }

    if (categoria === "LOCALIDAD") {
      fetch("http://localhost:4000/miscellaneous?categoria=CIUDAD")
        .then(res => res.json())
        .then(data => {
          const ciudadesData = Array.isArray(data) ? data : [];
          setCiudades(ciudadesData.filter((c: MiscellaneousItem) => c.activo !== false));
        })
        .catch(err => console.error("Error al cargar ciudades:", err));
    }

    if (categoria === "SOLUCION_CASO") {
      fetch("http://localhost:4000/miscellaneous?categoria=CAUSA_RAIZ")
        .then(res => res.json())
        .then(data => {
          const causasData = Array.isArray(data) ? data : [];
          setCausasRaiz(causasData.filter((c: MiscellaneousItem) => c.activo !== false));
        })
        .catch(err => console.error("Error al cargar causas raíz:", err));
    }
  }, [categoria, isOpen]);

  const getDefaultTitle = () => {
    if (initialData) return "Editar Elemento";
    
    switch (categoria) {
      case "CIUDAD": return "Nueva Ciudad";
      case "SUBCATEGORIA": return "Nueva Subcategoría";
      case "CATEGORIA_RED": return "Nueva Categoría de Red";
      case "ESTADO": return "Nuevo Estado";
      case "LOCALIDAD": return "Nueva Localidad";
      case "DETALLE": return "Nuevo Detalle";
      case "SOLUCION_CASO": return "Nueva Solución del Caso";
      default: return "Nuevo Elemento";
    }
  };

  const modalTitle = title || getDefaultTitle();

  const handleSave = async (basePayload: any): Promise<boolean> => {
    try {
      console.log("═══════════════════════════════════════");
      console.log("📦 [handleSave] INICIO");
      console.log("📦 [handleSave] basePayload recibido:", basePayload);
      console.log("📦 [handleSave] tipoIncidencia del estado:", tipoIncidencia);
      console.log("📦 [handleSave] categoría:", categoria);
      console.log("═══════════════════════════════════════");
      
      const payload = { ...basePayload };

      // CIUDAD → requiere ESTADO
      if (categoria === "CIUDAD" && estadoSeleccionado) {
        const estado = estados.find((e) => (e._id || e.id) === estadoSeleccionado);
        if (estado) {
          payload.estadoId = estado._id || estado.id;
          payload.padreNombre = estado.valor;
          console.log("✅ [handleSave] Agregado estadoId:", payload.estadoId);
        }
      }

      // SUBCATEGORIA → requiere CATEGORIA_RED
      if (categoria === "SUBCATEGORIA" && categoriaSeleccionada) {
        const cat = categorias.find((c) => (c._id || c.id) === categoriaSeleccionada);
        if (cat) {
          payload.categoriaId = cat._id || cat.id;
          payload.padreNombre = cat.valor;
          console.log("✅ [handleSave] Agregado categoriaId:", payload.categoriaId);
        }
      }

      // DETALLE → requiere SUBCATEGORIA
      if (categoria === "DETALLE" && subcategoriaSeleccionada) {
        const subcat = subcategorias.find((s) => (s._id || s.id) === subcategoriaSeleccionada);
        if (subcat) {
          payload.subcategoriaId = subcat._id || subcat.id;
          payload.padreNombre = subcat.valor;
          console.log("✅ [handleSave] Agregado subcategoriaId:", payload.subcategoriaId);
        }
      }

      // LOCALIDAD → requiere CIUDAD
      if (categoria === "LOCALIDAD" && ciudadSeleccionada) {
        const ciudad = ciudades.find((c) => (c._id || c.id) === ciudadSeleccionada);
        if (ciudad) {
          payload.ciudadId = ciudad._id || ciudad.id;
          payload.padreNombre = ciudad.valor;
          console.log("✅ [handleSave] Agregado ciudadId:", payload.ciudadId);
        }
      }

      // SOLUCION_CASO → requiere CAUSA_RAIZ
      if (categoria === "SOLUCION_CASO" && causaRaizSeleccionada) {
        const causa = causasRaiz.find((c) => (c._id || c.id) === causaRaizSeleccionada);
        if (causa) {
          payload.causaId = causa._id || causa.id;
          payload.padreNombre = causa.valor;
          console.log("✅ [handleSave] Agregado causaId:", payload.causaId);
        }
      }

      // ✅ CATEGORIA_RED → tipo de incidencia (ARRAY)
      if (categoria === "CATEGORIA_RED") {
        console.log("🎯 [handleSave] ═══ PROCESANDO CATEGORIA_RED ═══");
        console.log("🎯 [handleSave] tipoIncidencia actual:", tipoIncidencia);
        console.log("🎯 [handleSave] tipoIncidencia es array?", Array.isArray(tipoIncidencia));
        
        if (tipoIncidencia.length === 0) {
          console.warn("⚠️ [handleSave] ⚠️⚠️⚠️ tipoIncidencia está VACÍO!");
          alert('Debes seleccionar al menos un tipo de incidencia');
          return false;
        } else {
          payload.tipoIncidencia = tipoIncidencia; // ✅ Array completo
          console.log("✅ [handleSave] ✅✅✅ AGREGADO tipoIncidencia al payload:", payload.tipoIncidencia);
        }
      }

      console.log("═══════════════════════════════════════");
      console.log("🚀 [handleSave] PAYLOAD FINAL COMPLETO:", payload);
      console.log("═══════════════════════════════════════");

      const isEditMode = Boolean(initialData?._id || initialData?.id);
      const id = initialData?._id || initialData?.id;
      const url = isEditMode && id
        ? `http://localhost:4000/miscellaneous/${id}`
        : "http://localhost:4000/miscellaneous";

      console.log("🌐 [handleSave] Enviando a:", url);
      console.log("🌐 [handleSave] Método:", isEditMode ? "PATCH" : "POST");
      console.log("🌐 [handleSave] Body:", JSON.stringify(payload));

      const response = await fetch(url, {
        method: isEditMode ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        console.error("❌ [handleSave] Error del servidor:", err);
        return false;
      }

      const result = await response.json();
      console.log("✅ [handleSave] Respuesta exitosa:", result);
      return true;
    } catch (error) {
      console.error("❌ [handleSave] Error:", error);
      return false;
    }
  };

  const renderExtraFields = () => {
    switch (categoria) {
      case "CIUDAD":
        return (
          <CiudadFields
            isOpen={isOpen}
            initialData={initialData}
            onEstadoChange={setEstadoSeleccionado}
            onValidate={setValidateFn}
          />
        );

      case "SUBCATEGORIA":
        return (
          <SubcategoriaFields
            isOpen={isOpen}
            initialData={initialData}
            onCategoriaChange={setCategoriaSeleccionada}
            onValidate={setValidateFn}
          />
        );

      case "CATEGORIA_RED":
        return (
          <CategoriaRedFields
            isOpen={isOpen}
            initialData={initialData}
            onTipoIncidenciaChange={setTipoIncidencia} // ✅ Ahora recibe array
          />
        );

      case "DETALLE":
        return (
          <DetalleFields
            isOpen={isOpen}
            initialData={initialData}
            subcategorias={subcategorias}
            onSubcategoriaChange={setSubcategoriaSeleccionada}
            onValidate={setValidateFn}
          />
        );

      case "LOCALIDAD":
        return null;

      case "SOLUCION_CASO":
        return (
          <SolucionCasoFields
            isOpen={isOpen}
            initialData={initialData}
            causasRaiz={causasRaiz}
            onCausaRaizChange={setCausaRaizSeleccionada}
            onValidate={setValidateFn}
          />
        );

      default:
        return null;
    }
  };

  const validate = () => {
    if (typeof validateFn === 'function') {
      const isValid = validateFn();
      if (!isValid) {
        if (categoria === "CIUDAD") {
          alert("Debe seleccionar un estado");
        } else if (categoria === "SUBCATEGORIA") {
          alert("Debe seleccionar una categoría");
        } else if (categoria === "DETALLE") {
          alert("Debe seleccionar una subcategoría");
        } else if (categoria === "LOCALIDAD") {
          alert("Debe seleccionar una ciudad");
        } else if (categoria === "SOLUCION_CASO") {
          alert("Debe seleccionar una causa raíz");
        }
        return false;
      }
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