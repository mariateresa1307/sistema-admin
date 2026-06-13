"use client";
import * as React from "react";
import { BaseModal, MiscellaneousItem } from "./modal/baseMiscellaneousModal";
import { CiudadFields } from "./modal/fields/ciudadFields";
import { SubcategoriaFields } from "./modal/fields/subcategoriaFields";
import { CategoriaRedFields } from "./modal/fields/CategoriaRedFields";
import { DetalleFields } from "./modal/fields/detalleFields";
//import { LocalidadFields } from "./modal/fields/localidadFields";
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

  // Estados para los campos específicos
  const [estadoSeleccionado, setEstadoSeleccionado] = React.useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = React.useState("");
  const [tipoIncidencia, setTipoIncidencia] = React.useState("");
  const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = React.useState("");
  const [ciudadSeleccionada, setCiudadSeleccionada] = React.useState("");
  const [causaRaizSeleccionada, setCausaRaizSeleccionada] = React.useState("");

  // Estados para las opciones de los selectores
  const [estados, setEstados] = React.useState<MiscellaneousItem[]>([]);
  const [categorias, setCategorias] = React.useState<MiscellaneousItem[]>([]);
  const [subcategorias, setSubcategorias] = React.useState<MiscellaneousItem[]>([]);
  const [ciudades, setCiudades] = React.useState<MiscellaneousItem[]>([]);
  const [causasRaiz, setCausasRaiz] = React.useState<MiscellaneousItem[]>([]);
  // Función de validación
  const [validateFn, setValidateFn] = React.useState<() => boolean>(() => () => true);

  // Cargar datos según la categoría
  React.useEffect(() => {
    if (!isOpen) return;

    // Resetear estados al cambiar de categoría
    setEstadoSeleccionado("");
    setCategoriaSeleccionada("");
    setTipoIncidencia("");
    setSubcategoriaSeleccionada("");
    setCiudadSeleccionada("");
    setCausaRaizSeleccionada("");
    setEstados([]);
    setCategorias([]);
    setSubcategorias([]);
    setCiudades([]);
     setCausasRaiz([]);
    setValidateFn(() => () => true);

    // Cargar ESTADOS si es CIUDAD
    if (categoria === "CIUDAD") {
      fetch("http://localhost:4000/miscellaneous?categoria=ESTADO")
        .then(res => res.json())
        .then(data => {
          const estadosData = Array.isArray(data) ? data : [];
          setEstados(estadosData.filter((e: MiscellaneousItem) => e.activo !== false));
        })
        .catch(err => console.error("Error al cargar estados:", err));
    }

    // Cargar CATEGORÍAS si es SUBCATEGORIA
    if (categoria === "SUBCATEGORIA") {
      fetch("http://localhost:4000/miscellaneous?categoria=CATEGORIA_RED")
        .then(res => res.json())
        .then(data => {
          const categoriasData = Array.isArray(data) ? data : [];
          setCategorias(categoriasData.filter((c: MiscellaneousItem) => c.activo !== false));
        })
        .catch(err => console.error("Error al cargar categorías:", err));
    }

    // Cargar SUBCATEGORÍAS si es DETALLE
    if (categoria === "DETALLE") {
      fetch("http://localhost:4000/miscellaneous?categoria=SUBCATEGORIA")
        .then(res => res.json())
        .then(data => {
          const subcategoriasData = Array.isArray(data) ? data : [];
          setSubcategorias(subcategoriasData.filter((s: MiscellaneousItem) => s.activo !== false));
        })
        .catch(err => console.error("Error al cargar subcategorías:", err));
    }

    // ✅ Cargar CIUDADES si es LOCALIDAD
    if (categoria === "LOCALIDAD") {
      fetch("http://localhost:4000/miscellaneous?categoria=CIUDAD")
        .then(res => res.json())
        .then(data => {
          const ciudadesData = Array.isArray(data) ? data : [];
          setCiudades(ciudadesData.filter((c: MiscellaneousItem) => c.activo !== false));
        })
        .catch(err => console.error("Error al cargar ciudades:", err));
    }

      //  Cargar CAUSAS_RAIZ si es SOLUCION_CASO
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

 



  // Título por defecto según la categoría
  const getDefaultTitle = () => {
    if (initialData) return "Editar Elemento";
    
    switch (categoria) {
      case "CIUDAD":
        return "Nueva Ciudad";
      case "SUBCATEGORIA":
        return "Nueva Subcategoría";
      case "CATEGORIA_RED":
        return "Nueva Categoría de Red";
      case "ESTADO":
        return "Nuevo Estado";
      case "LOCALIDAD":
        return "Nueva Localidad";
      case "DETALLE":
        return "Nuevo Detalle";
      case "SOLUCION_CASO":
        return "Nueva Solución del Caso";
      default:
        return "Nuevo Elemento";
    }
  };

  const modalTitle = title || getDefaultTitle();

  // FUNCIÓN onSave
  const handleSave = async (basePayload: any): Promise<boolean> => {
    try {
      const payload = { ...basePayload };

      // CIUDAD → requiere ESTADO
      if (categoria === "CIUDAD" && estadoSeleccionado) {
        const estado = estados.find((e) => (e._id || e.id) === estadoSeleccionado);
        if (estado) {
          payload.estadoId = estado._id || estado.id;
          payload.padreNombre = estado.valor;
        }
      }

      // SUBCATEGORIA → requiere CATEGORIA_RED
      if (categoria === "SUBCATEGORIA" && categoriaSeleccionada) {
        const cat = categorias.find((c) => (c._id || c.id) === categoriaSeleccionada);
        if (cat) {
          payload.categoriaId = cat._id || cat.id;
          payload.padreNombre = cat.valor;
        }
      }

      // DETALLE → requiere SUBCATEGORIA
      if (categoria === "DETALLE" && subcategoriaSeleccionada) {
        const subcat = subcategorias.find((s) => (s._id || s.id) === subcategoriaSeleccionada);
        if (subcat) {
          payload.subcategoriaId = subcat._id || subcat.id;
          payload.padreNombre = subcat.valor;
        }
      }

      //  LOCALIDAD → requiere CIUDAD
      if (categoria === "LOCALIDAD" && ciudadSeleccionada) {
        const ciudad = ciudades.find((c) => (c._id || c.id) === ciudadSeleccionada);
        if (ciudad) {
          payload.ciudadId = ciudad._id || ciudad.id;
          payload.padreNombre = ciudad.valor;
        }
      }

        if (categoria === "SOLUCION_CASO" && causaRaizSeleccionada) {
        const causa = causasRaiz.find((c) => (c._id || c.id) === causaRaizSeleccionada);
        if (causa) {
          payload.causaId = causa._id || causa.id;
          payload.padreNombre = causa.valor;
        }
      }

      // CATEGORIA_RED → tipo de incidencia
      if (categoria === "CATEGORIA_RED" && tipoIncidencia) {
        payload.tipoIncidencia = tipoIncidencia;
      }

      // Hacer la petición
      const isEditMode = Boolean(initialData?._id || initialData?.id);
      const id = initialData?._id || initialData?.id;
      const url = isEditMode && id
        ? `http://localhost:4000/miscellaneous/${id}`
        : "http://localhost:4000/miscellaneous";

      const response = await fetch(url, {
        method: isEditMode ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        console.error("Error del servidor:", err);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error:", error);
      return false;
    }
  };

  // Renderizar los campos específicos según la categoría
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
            onTipoIncidenciaChange={setTipoIncidencia}
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

      //  Caso LOCALIDAD
case "LOCALIDAD":
       /* return (
          <LocalidadFields
            isOpen={isOpen}
            initialData={initialData}
            ciudades={ciudades}
            onCiudadChange={setCiudadSeleccionada}
            onValidate={setValidateFn}
          />
        );*/

   //  Caso SOLUCION_CASO
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

  // Función de validación
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
        }else if (categoria === "SOLUCION_CASO") {
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