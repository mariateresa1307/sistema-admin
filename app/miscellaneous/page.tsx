"use client";
import { useState, useMemo, ReactElement, useCallback, useEffect } from "react";
import { ContainerBox } from "../components/containerBox";
import { FloatingAddButton } from "../components/FloatingAddButton";
import { MiscellaneousModal } from "./miscellaneousModal";
import { CardSeeMiscellaneousModal } from "./cardSeeMiscellaneousModal";
import { EstadosDialog } from "../components/EstadosDialog";
import { LocalidadesDialog } from "../components/localidadesDialog";
import { SubcategoriasDialog } from "../components/subcategoriasDialog";
import { MiscellaneousTable } from "../components/MiscellaneousTable";
import { useMiscellaneous, MiscellaneousItem } from "./useMiscellaneous";
import { GridCellParams } from "@mui/x-data-grid";
import {
  Tabs, Tab, Box, Snackbar, Alert, Button, Typography
} from "@mui/material";
import CategoryIcon from '@mui/icons-material/Category';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import BuildIcon from '@mui/icons-material/Build';
import StorageIcon from '@mui/icons-material/Storage';
import DevicesIcon from '@mui/icons-material/Devices';
import PeopleIcon from '@mui/icons-material/People';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import BugReportIcon from '@mui/icons-material/BugReport';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CableIcon from '@mui/icons-material/Cable';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import MapIcon from '@mui/icons-material/Map';
import FmdGoodIcon from '@mui/icons-material/FmdGood';

type TabConfig = {
  label: string;
  icon: ReactElement;
  categoria: string;
};

const TABS_CONFIG: TabConfig[] = [
  { label: "Categoría Red", icon: <CategoryIcon />, categoria: "CATEGORIA_RED" },
  { label: "Subcategoría", icon: <BuildIcon />, categoria: "SUBCATEGORIA" },
  { label: "Detalle", icon: <BuildIcon />, categoria: "DETALLE" },
  { label: "Ciudad / Estado", icon: <LocationCityIcon />, categoria: "CIUDAD" },
  { label: "Causa Raíz", icon: <BugReportIcon />, categoria: "CAUSA_RAIZ" },
  { label: "Solución Caso", icon: <CheckCircleIcon />, categoria: "SOLUCION_CASO" },
  { label: "Tipo Cliente", icon: <PeopleIcon />, categoria: "TIPO_CLIENTE" },
  { label: "Grupo Destino", icon: <GroupWorkIcon />, categoria: "GRUPO_DESTINO" },
   { label: "Última Milla", icon: <CableIcon />, categoria: "ULTIMA_MILLA" },
 
];

export default function MiscellaneousPage() {
  const [tabValue, setTabValue] = useState(0);
  const currentCategoria = TABS_CONFIG[tabValue].categoria;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MiscellaneousItem | null>(null);
  const [estadosDialogOpen, setEstadosDialogOpen] = useState(false);
  const [localidadesDialogOpen, setLocalidadesDialogOpen] = useState(false);
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState<MiscellaneousItem | null>(null);
  const [subcategoriasDialogOpen, setSubcategoriasDialogOpen] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<MiscellaneousItem | null>(null);
  const [soluciones, setSoluciones] = useState<MiscellaneousItem[]>([]);


  const {
    rows,
    loading,
    notification,
    closeNotification,
    fetchItems,
    fetchRelatedData,
    deleteItem,
    addItem,
    getEstados,
    getLocalidadesByCiudad,
    getSubcategoriasByCategoria,
    localidades,
    ciudades, 
  } = useMiscellaneous(currentCategoria);

useEffect(() => {
  if (isDetailOpen && selectedItem?.categoria === 'CAUSA_RAIZ') {
    fetch('http://localhost:4000/miscellaneous?categoria=SOLUCION_CASO')
      .then(res => res.json())
      .then(data => {
        const solucionesData = Array.isArray(data) ? data : [];
        setSoluciones(solucionesData.filter((s: MiscellaneousItem) => s.activo !== false));
      })
      .catch(err => console.error("Error al cargar soluciones:", err));
  }
}, [isDetailOpen, selectedItem]);


  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setSelectedItem(null);
  };

  const handleCellClick = (params: GridCellParams) => {
    if (params.field === 'acciones' || params.field === 'gestionarLocalidades' || params.field === 'gestionarSubcategorias') return;
    if (params.row) {
      setSelectedItem(params.row as MiscellaneousItem);
      setIsDetailOpen(true);
    }
  };

  const handleEdit = (item: MiscellaneousItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleTransitionToEdit = () => {
    setIsDetailOpen(false);
    setIsDialogOpen(true);
  };

  const handleDelete = async (item: MiscellaneousItem) => {
    await deleteItem(item);
  };

  // Handlers para Estados
  const handleOpenEstados = () => {
    setEstadosDialogOpen(true);
  };

  const handleAgregarEstado = async (valor: string) => {
    await addItem({
      categoria: 'ESTADO',
      valor: valor.toUpperCase(),
      activo: true,
    });
  };

  const handleEliminarEstado = async (estado: MiscellaneousItem) => {
    await deleteItem(estado);
  };

  // Handlers para Localidades
  const handleOpenLocalidades = (ciudad: MiscellaneousItem) => {
    console.log('🏙️ Abriendo modal para ciudad:', ciudad);
    setCiudadSeleccionada(ciudad);
    setLocalidadesDialogOpen(true);
  };

  const handleAgregarLocalidad = async (valor: string) => {
    if (!ciudadSeleccionada) {
      console.error('❌ No hay ciudad seleccionada');
      return;
    }
    
    try {
      const success = await addItem({
        categoria: 'LOCALIDAD',
        valor: valor.toUpperCase(),
        ciudadId: ciudadSeleccionada._id,
        padreNombre: ciudadSeleccionada.valor,
        activo: true,
      });
      
      console.log('✅ Resultado de agregar localidad:', success);
      
      if (success) {
        await fetchRelatedData();
      }
    } catch (error) {
      console.error("Error al agregar localidad:", error);
    }
  };

  const handleEliminarLocalidad = async (localidad: MiscellaneousItem) => {
    try {
      const success = await deleteItem(localidad);
      if (success) {
        await fetchRelatedData();
      }
    } catch (error) {
      console.error("Error al eliminar localidad:", error);
    }
  };

  // Handlers para Subcategorías
  const handleOpenSubcategorias = (categoria?: MiscellaneousItem) => {
    setCategoriaSeleccionada(categoria ?? null);
    setSubcategoriasDialogOpen(true);
  };

  const handleAgregarSubcategoria = async (valor: string) => {
    if (!categoriaSeleccionada) return;
    
    try {
      await addItem({
        categoria: 'SUBCATEGORIA',
        valor: valor.toUpperCase(),
        categoriaId: categoriaSeleccionada._id,
        padreNombre: categoriaSeleccionada.valor,
        activo: true,
      });
    } catch (error) {
      console.error("Error al agregar subcategoría:", error);
    }
  };

  const handleEliminarSubcategoria = async (subcategoria: MiscellaneousItem) => {
    await deleteItem(subcategoria);
  };

  // ✅ MODIFICADO: Datos filtrados con soluciones asociadas para CAUSA_RAIZ
  const filteredRows = useMemo(() => {
    const rowsFiltradas = rows.filter(r => r.categoria === currentCategoria);
    
    // Si es CAUSA_RAIZ, agregar las soluciones asociadas a cada causa
    if (currentCategoria === 'CAUSA_RAIZ') {
      return rowsFiltradas.map(causa => {
        const causaId = causa._id || causa.id;
        const solucionesAsociadas = soluciones.filter(
          sol => sol.padreId === causaId && sol.activo !== false
        );
        
        return {
          ...causa,
          solucionesAsociadas: solucionesAsociadas
        };
      });
    }
    
    return rowsFiltradas;
  }, [rows, currentCategoria, soluciones]);

  const estados = useMemo(() => getEstados(), [getEstados]);

  // Localidades para el modal de detalle
  const localidadesParaDetalle = useMemo(() => {
    if (!selectedItem?._id || selectedItem.categoria !== 'CIUDAD') return [];
    return getLocalidadesByCiudad(selectedItem._id);
  }, [selectedItem, getLocalidadesByCiudad]);

  // subcategoriasParaDetalle para el modal de detalle
  const subcategoriasParaDetalle = useMemo(() => {
    if (!selectedItem?._id || selectedItem.categoria !== 'CATEGORIA_RED') return [];
    return getSubcategoriasByCategoria(selectedItem._id);
  }, [selectedItem, getSubcategoriasByCategoria]);

  // Localidades para el modal de gestión
  const localidadesParaGestion = useMemo(() => {
    if (!ciudadSeleccionada?._id) return [];
    return getLocalidadesByCiudad(ciudadSeleccionada._id);
  }, [ciudadSeleccionada, getLocalidadesByCiudad, localidades]);

  const subcategorias = useMemo(() => {
    if (!categoriaSeleccionada?._id) return [];
    return getSubcategoriasByCategoria(categoriaSeleccionada._id);
  }, [categoriaSeleccionada, getSubcategoriasByCategoria]);

  return (
    <>
      {/* Notificación */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={closeNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%', bgcolor: notification.severity === 'success' ? '#1ccf46' : '#d32f2f' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      <ContainerBox title="Configuración del Sistema">
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="miscellaneous tabs"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                minHeight: 56,
                flexDirection: 'row',
                gap: 1,
              },
            }}
          >
            {TABS_CONFIG.map((tab) => (
              <Tab key={tab.categoria} icon={tab.icon} iconPosition="start" label={tab.label} />
            ))}
          </Tabs>
        </Box>

        {/* Botón Gestionar Estados (solo en CIUDAD) */}
        {currentCategoria === 'CIUDAD' && (
          <Box sx={{
            mb: 2, p: 1.5, bgcolor: '#e3f2fd', borderRadius: 2,
            borderBottom: '1px solid #1976d2', display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          }}>
            <Button
              variant="contained"
              startIcon={<MapIcon />}
              onClick={handleOpenEstados}
              sx={{
                bgcolor: '#1976d2',
                textTransform: 'none',
                '&:hover': { bgcolor: '#1565c0' },
              }}
            >
              Gestionar Estados
            </Button>
          </Box>
        )}

        {/* Tabla */}
        <MiscellaneousTable
          rows={filteredRows}
          loading={loading}
          currentCategoria={currentCategoria}
          localidades={localidades}
          onCellClick={handleCellClick}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onOpenLocalidades={handleOpenLocalidades}
          onOpenSubcategorias={handleOpenSubcategorias}
        />
      </ContainerBox>

      {/* Botón flotante */}
      <FloatingAddButton onClick={() => { setSelectedItem(null); setIsDialogOpen(true); }} />

      {/* Modal Crear/Editar */}
      <MiscellaneousModal
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedItem(null);
          fetchItems();
          fetchRelatedData();
        }}
        title={selectedItem ? "Editar Elemento" : "Nuevo Elemento"}
        initialData={selectedItem}
        categoria={currentCategoria}
      />

      
<CardSeeMiscellaneousModal
  open={isDetailOpen}
  onClose={() => {
    setIsDetailOpen(false);
    setSelectedItem(null);
  }}
  item={selectedItem}
  onEditClick={handleTransitionToEdit}
  onDelete={handleDelete}
  localidades={localidadesParaDetalle}
  subcategorias={subcategoriasParaDetalle}
  soluciones={soluciones} // ✅ NUEVO
  causasRaiz={causasRaiz}
/>

      {/* Modal Estados */}
      <EstadosDialog
        open={estadosDialogOpen}
        onClose={() => setEstadosDialogOpen(false)}
        estados={estados}
        onAgregar={handleAgregarEstado}
        onEliminar={handleEliminarEstado}
      />

      {/* Modal Localidades */}
      <LocalidadesDialog
        open={localidadesDialogOpen}
        onClose={() => {
          setLocalidadesDialogOpen(false);
          setCiudadSeleccionada(null);
        }}
        ciudadSeleccionada={ciudadSeleccionada}
        localidades={localidadesParaGestion}
        onAgregar={handleAgregarLocalidad}
        onEliminar={handleEliminarLocalidad}
      />

      {/* Modal Subcategorías */}
      <SubcategoriasDialog
        open={subcategoriasDialogOpen}
        onClose={() => setSubcategoriasDialogOpen(false)}
        categoriaSeleccionada={categoriaSeleccionada}
        subcategorias={subcategorias}
        onAgregar={handleAgregarSubcategoria}
        onEliminar={handleEliminarSubcategoria}
      />
    </>
  );
}