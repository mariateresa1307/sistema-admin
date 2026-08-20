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
import { Tabs, Tab, Box, Snackbar, Alert, Button } from "@mui/material";
import CategoryIcon from '@mui/icons-material/Category';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import BuildIcon from '@mui/icons-material/Build';
import PeopleIcon from '@mui/icons-material/People';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import BugReportIcon from '@mui/icons-material/BugReport';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CableIcon from '@mui/icons-material/Cable';
import MapIcon from '@mui/icons-material/Map';
import { getMiscellaneous } from "@/lib/api";

type TabConfig = {
  label: string;
  icon: ReactElement;
  categoria: string;
};

const TABS_CONFIG: TabConfig[] = [
  { label: "Categoría Red", icon: <CategoryIcon />, categoria: "CATEGORIA_RED" },
  { label: "Subcategoría", icon: <BuildIcon />, categoria: "SUBCATEGORIA" },
  { label: "Detalle", icon: <BuildIcon />, categoria: "DETALLE" },
  { label: "Ciudades - Estados - Localidades", icon: <LocationCityIcon />, categoria: "CIUDAD" },
  { label: "Causa Raíz", icon: <BugReportIcon />, categoria: "CAUSA_RAIZ" },
  { label: "Solución Caso", icon: <CheckCircleIcon />, categoria: "SOLUCION_CASO" },
  { label: "Tipo Cliente", icon: <PeopleIcon />, categoria: "TIPO_CLIENTE" },
  { label: "Grupo Destino", icon: <GroupWorkIcon />, categoria: "GRUPO_DESTINO" },
  { label: "Última Milla", icon: <CableIcon />, categoria: "ULTIMA_MILLA" },
  { label: "Proveedor Servicio Compartido", icon: <CableIcon />, categoria: "PROVEEDOR" },
];

export default function MiscellaneousPage() {
  const [tabValue, setTabValue] = useState(0);
  const currentCategoria = TABS_CONFIG[tabValue].categoria;
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [searchValue, setSearchValue] = useState<string | undefined>(undefined);
  const [searchField, setSearchField] = useState<string>('valor');
  const [filtroPadreId, setFiltroPadreId] = useState<string | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MiscellaneousItem | null>(null);
  const [estadosDialogOpen, setEstadosDialogOpen] = useState(false);
  const [localidadesDialogOpen, setLocalidadesDialogOpen] = useState(false);
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState<MiscellaneousItem | null>(null);
  const [subcategoriasDialogOpen, setSubcategoriasDialogOpen] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<MiscellaneousItem | null>(null);
  const [soluciones, setSoluciones] = useState<MiscellaneousItem[]>([]);
  const [causasRaiz, setCausasRaiz] = useState<MiscellaneousItem[]>([]);

  // ✅ Determinar si necesitamos traer todos los registros (para búsqueda por localidad/estado)
  const needsFetchAll = currentCategoria === 'CIUDAD' && (searchField === 'localidades' || searchField === 'padreNombre');

  const {
    rows,
    totalItems,
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
  } = useMiscellaneous({
    categoria: currentCategoria,
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    searchValue: searchField === 'valor' ? searchValue : undefined,
    padreId: searchField === 'padreNombre' ? filtroPadreId : undefined,
    fetchAll: needsFetchAll,
  });

  useEffect(() => {
    const loadSoluciones = async () => {
      try {
        const response = await getMiscellaneous({ categoria: 'SOLUCION_CASO', limit: 9999 });
        const rawData = response?.data;
        const solucionesData = Array.isArray(rawData?.data)
          ? rawData.data
          : (Array.isArray(rawData) ? rawData : []);
        setSoluciones(solucionesData.filter((s: MiscellaneousItem) => s.activo !== false));
      } catch (error) {
        console.error("Error al cargar soluciones:", error);
      }
    };

    const loadCausasRaiz = async () => {
      try {
        const response = await getMiscellaneous({ categoria: 'CAUSA_RAIZ', limit: 9999 });
        const rawData = response?.data;
        const causasData = Array.isArray(rawData?.data)
          ? rawData.data
          : (Array.isArray(rawData) ? rawData : []);
        setCausasRaiz(causasData.filter((c: MiscellaneousItem) => c.activo !== false));
      } catch (error) {
        console.error("Error al cargar causas raíz:", error);
      }
    };

    loadSoluciones();
    loadCausasRaiz();
  }, []);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setSelectedItem(null);
    setPaginationModel({ page: 0, pageSize: 10 });
    setSearchValue(undefined);
    setSearchField('valor');
    setFiltroPadreId(undefined);
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

  const handleOpenEstados = () => setEstadosDialogOpen(true);

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

  const handleOpenLocalidades = (ciudad: MiscellaneousItem) => {
    setCiudadSeleccionada(ciudad);
    setLocalidadesDialogOpen(true);
  };

  const handleAgregarLocalidad = async (valor: string) => {
    if (!ciudadSeleccionada) return;
    try {
      const success = await addItem({
        categoria: 'LOCALIDAD',
        valor: valor.toUpperCase(),
        ciudadId: ciudadSeleccionada._id,
        padreNombre: ciudadSeleccionada.valor,
        activo: true,
      });
      if (success) await fetchRelatedData();
    } catch (error) {
      console.error("Error al agregar localidad:", error);
    }
  };

  const handleEliminarLocalidad = async (localidad: MiscellaneousItem) => {
    try {
      const success = await deleteItem(localidad);
      if (success) await fetchRelatedData();
    } catch (error) {
      console.error("Error al eliminar localidad:", error);
    }
  };

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

  const estados = useMemo(() => getEstados(), [getEstados]);

  const handleSearch = useCallback((params: { field?: string; value?: string } | null) => {
    const field = params?.field || 'valor';
    const value = params?.value || '';

    setSearchField(field);
    setPaginationModel({ page: 0, pageSize: 10 });

    // Caso 1: Búsqueda por Ciudad (campo valor)
    if (field === 'valor') {
      setSearchValue(value || undefined);
      setFiltroPadreId(undefined);
      return;
    }

    // Caso 2: Búsqueda por Estado (campo padreNombre)
    if (currentCategoria === 'CIUDAD' && field === 'padreNombre') {
      if (!value) {
        setFiltroPadreId(undefined);
        setSearchValue(undefined);
        return;
      }

      const term = value.toLowerCase().trim();
      const estadoEncontrado = estados.find(e =>
        e.activo !== false && (e.valor || '').toLowerCase().includes(term)
      );

      if (estadoEncontrado) {
        setFiltroPadreId(String(estadoEncontrado._id || estadoEncontrado.id));
        setSearchValue(undefined);
      } else {
        setFiltroPadreId(undefined);
        setSearchValue(value);
      }
      return;
    }

    // Caso 3: Búsqueda por Localidades y otros
    setFiltroPadreId(undefined);
    setSearchValue(value || undefined);
  }, [currentCategoria, estados]);

  const filteredRows = useMemo(() => {
    let rowsFiltradas = rows;

    if (currentCategoria === 'CIUDAD') {
      // Enriquecer ciudades con el nombre del estado
      rowsFiltradas = rowsFiltradas.map(ciudad => {
        const estadoId = ciudad.padreId || ciudad.estadoId;
        const estadoPadre = estados.find(
          est => (est._id || est.id) === estadoId && est.activo !== false
        );
        return {
          ...ciudad,
          padreNombre: estadoPadre?.valor || ciudad.padreNombre || 'Sin estado'
        };
      });

      // Filtrado client-side por texto en localidad
      if (searchField === 'localidades' && searchValue) {
        const term = searchValue.toLowerCase().trim();
        rowsFiltradas = rowsFiltradas.filter(ciudad => {
          const ciudadId = String(ciudad._id || ciudad.id);
          const localidadesDeLaCiudad = localidades.filter(l => {
            const lPadreId = typeof l.padreId === 'object'
              ? String((l.padreId as any)?._id ?? '')
              : String(l.padreId || '');
            return lPadreId === ciudadId;
          });
          return localidadesDeLaCiudad.some(l =>
            (l.valor || '').toLowerCase().includes(term)
          );
        });
      }

      // Filtrado client-side por texto en nombre de estado (cuando no se pudo resolver padreId)
      if (searchField === 'padreNombre' && searchValue && !filtroPadreId) {
        const term = searchValue.toLowerCase().trim();
        rowsFiltradas = rowsFiltradas.filter(ciudad =>
          (ciudad.padreNombre || '').toLowerCase().includes(term)
        );
      }
    }

    if (currentCategoria === 'CAUSA_RAIZ') {
      return rowsFiltradas.map(causa => {
        const causaId = causa._id || causa.id;
        const solucionesAsociadas = soluciones.filter(
          sol => (sol.causaId === causaId || sol.padreId === causaId) && sol.activo !== false
        );
        return { ...causa, solucionesAsociadas };
      });
    }

    if (currentCategoria === 'SOLUCION_CASO') {
      return rowsFiltradas.map(solucion => {
        const causaId = solucion.causaId || solucion.padreId;
        const causaRaizAsociada = causasRaiz.find(
          causa => (causa._id || causa.id) === causaId && causa.activo !== false
        );
        return { ...solucion, causaRaizAsociada: causaRaizAsociada || null };
      });
    }

    return rowsFiltradas;
  }, [rows, currentCategoria, soluciones, causasRaiz, estados, localidades, searchValue, searchField, filtroPadreId]);

  const localidadesParaDetalle = useMemo(() => {
    if (!selectedItem?._id || selectedItem.categoria !== 'CIUDAD') return [];
    return getLocalidadesByCiudad(selectedItem._id);
  }, [selectedItem, getLocalidadesByCiudad]);

  const subcategoriasParaDetalle = useMemo(() => {
    if (!selectedItem?._id || selectedItem.categoria !== 'CATEGORIA_RED') return [];
    return getSubcategoriasByCategoria(selectedItem._id);
  }, [selectedItem, getSubcategoriasByCategoria]);

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

        <MiscellaneousTable
          rows={filteredRows}
          localidades={localidades}
          loading={loading}
          currentCategoria={currentCategoria}
          onCellClick={handleCellClick}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onOpenLocalidades={handleOpenLocalidades}
          onOpenSubcategorias={handleOpenSubcategorias}
          onSearch={handleSearch}
          paginationMode={needsFetchAll ? "client" : "server"}
          rowCount={needsFetchAll ? undefined : totalItems}
          paginationModel={paginationModel}
          onPaginationModelChange={(newModel) => setPaginationModel(newModel)}
          pageSizeOptions={[10, 25, 50]}
          excludeSearchFields={['gestionarLocalidades', 'gestionarSubcategorias', 'activo']}
        />
      </ContainerBox>

      <FloatingAddButton onClick={() => { setSelectedItem(null); setIsDialogOpen(true); }} />

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
        {...({ subcategorias: subcategoriasParaDetalle } as any)}
        soluciones={soluciones}
        causasRaiz={causasRaiz}
      />

      <EstadosDialog
        open={estadosDialogOpen}
        onClose={() => setEstadosDialogOpen(false)}
        estados={estados}
        onAgregar={handleAgregarEstado}
        onEliminar={handleEliminarEstado}
      />

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