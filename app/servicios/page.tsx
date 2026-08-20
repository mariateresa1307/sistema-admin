"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { ContainerBox } from "../components/containerBox";
import { FloatingAddButton } from "../components/FloatingAddButton";
import CustomDataGrid from "../components/customDataGrid";
import { FullScreenServiceDialog } from "./serviceModal";
import { CardSeeServiceModal } from "./cardSeeServiceModal";
import { GridCellParams, GridColDef } from "@mui/x-data-grid";
import { Chip, Tabs, Tab, Box } from "@mui/material";
import { Service } from "app/utils/types";
import { getService, getMiscellaneous } from "@/lib/api";

type SearchParams = {
  field: string;
  value: string;
};

export default function RBSPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const [tabValue, setTabValue] = useState(0);
  const [rows, setRows] = useState<Service[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // ✅ Mapas de lookup para evitar consultas N+1
  const [proveedoresMap, setProveedoresMap] = useState<Map<string, string>>(new Map());
  const [tipoClienteMap, setTipoClienteMap] = useState<Map<string, string>>(new Map());

  // ✅ Función auxiliar de normalización
  const normalizeToArray = (response: any): any[] => {
    if (!response?.data) return [];
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.data.data)) return response.data.data;
    if (Array.isArray(response.data.results)) return response.data.results;
    return [];
  };

  // ✅ Cargar mapas de lookup una sola vez
  useEffect(() => {
    const loadLookupMaps = async () => {
      try {
        const [resProveedores, resTipoCliente] = await Promise.all([
          getMiscellaneous({ categoria: "PROVEEDOR", limit: 999 }),
          getMiscellaneous({ categoria: "TIPO_CLIENTE", limit: 999 }),
        ]);

        const proveedores = normalizeToArray(resProveedores);
        const tipoClientes = normalizeToArray(resTipoCliente);

        const proveedoresMapTemp = new Map<string, string>();
        proveedores.forEach((p: any) => {
          if (p._id && p.valor) {
            proveedoresMapTemp.set(String(p._id), p.valor);
          }
        });

        const tipoClienteMapTemp = new Map<string, string>();
        tipoClientes.forEach((tc: any) => {
          if (tc._id && tc.valor) {
            tipoClienteMapTemp.set(String(tc._id), tc.valor);
          }
        });

        setProveedoresMap(proveedoresMapTemp);
        setTipoClienteMap(tipoClienteMapTemp);
      } catch (error) {
        console.error("❌ [RBSPage] Error cargando mapas de lookup:", error);
      }
    };

    loadLookupMaps();
  }, []);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const backendPage = paginationModel.page + 1;

      let excludeTipo: string | undefined = undefined;
      let tipoServicioParam: string | undefined = undefined;

      if (tabValue === 0) excludeTipo = "ENLACE";
      else if (tabValue === 1) tipoServicioParam = "ENLACE";

      if (searchParams?.field === "tipoServicio" && searchParams.value) {
        tipoServicioParam = searchParams.value;
        excludeTipo = undefined;
      }

      const apiParams: any = {
        page: backendPage,
        limit: paginationModel.pageSize,
      };

      if (tipoServicioParam) apiParams.tipoServicio = tipoServicioParam;
      if (excludeTipo) apiParams.excludeTipo = excludeTipo;

      if (searchParams?.field === "nodos" && searchParams.value) {
        apiParams.nodos = searchParams.value;
      } else if (searchParams?.field === "status" && searchParams.value) {
        apiParams.status = searchParams.value;
      } else if (
        searchParams?.field &&
        !["tipoServicio", "status", "nodos"].includes(searchParams.field) &&
        searchParams.value
      ) {
        apiParams.search = searchParams.value;
      }

      const response = await getService(apiParams);
      const payload = response.data;

      setRows(payload?.data || []);
      setTotalRows(payload?.total ?? 0);
    } catch (error) {
      console.error("❌ [RBSPage] Error:", error);
      setRows([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationModel.page, paginationModel.pageSize, tabValue, searchParams]);

  // ✅ Único useEffect que dispara el fetch (incluye refreshTrigger)
  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchServices, refreshTrigger]);


  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setSearchParams(null);
    setPaginationModel({ page: 0, pageSize: 10 });
  };

  const handleSearch = useCallback((params: SearchParams) => {
    setSearchParams(params);
    setPaginationModel({ page: 0, pageSize: 10 });
  }, []);

  // ✅ Helper para obtener nombre de proveedor
  const getProveedorNombre = useCallback((id: string | undefined): string => {
    if (!id) return "—";
    return proveedoresMap.get(String(id)) || `ID: ${String(id).substring(0, 8)}...`;
  }, [proveedoresMap]);

  // ✅ Helper para obtener nombre de tipo de cliente
  const getTipoClienteNombre = useCallback((value: string | { _id?: string; valor?: string } | undefined): string => {
    if (!value) return "—";
    if (typeof value === "object" && value !== null) {
      if (value.valor) return value.valor;
      if (value._id) return tipoClienteMap.get(String(value._id)) || `ID: ${String(value._id).substring(0, 8)}...`;
    }
    if (typeof value === "string") {
      return tipoClienteMap.get(value) || `ID: ${value.substring(0, 8)}...`;
    }
    return "—";
  }, [tipoClienteMap]);

  const renderDetalles = useCallback((row: Service) => {
    switch (row.tipoServicio) {
      case "METROLAN": return `VLAN: ${row.vlan} | NodoA: ${row.nodoA || "-"}`;
      case "RBS": return `ID RBS: ${row.idRBS} | Serial: ${row.serialONT || "-"}`;
      case "ENLACE": return `ID: ${row.id_circuito} | Proveedor: ${getTipoClienteNombre(row.tipoCliente)}`;
      case "DOG": return `Circuito: ${row.id_circuito} | Contrato: ${row.contrato || "-"}`;
      case "REDES COMPARTIDAS": return `VLAN: ${row.vlan} | Equipo: ${row.nodoA || "-"}`;
      default: return "N/A";
    }
  }, [getTipoClienteNombre]);

  const serviciosColumns = useMemo((): GridColDef[] => [
    { field: "tipoServicio", headerName: "Tipo", width: 140 },
    { field: "name", headerName: "Nombre / Cliente", flex: 1 },
    { field: "city", headerName: "Ciudad", width: 140 },
    { field: "detalles", headerName: "Detalles Técnicos", flex: 1.5, renderCell: (params) => renderDetalles(params.row as Service) },
    {
      field: "status", headerName: "Estado", width: 120,
      renderCell: (params) => {
        const isActivo = params.value === "Activo";
        return (
          <Chip label={params.value || "Activo"} size="small" sx={{
            bgcolor: isActivo ? "#e8f5e9" : "#ffebee",
            color: isActivo ? "#2e7d32" : "#c62828",
            fontWeight: "bold", border: isActivo ? "none" : "1px solid #ef9a9a",
          }} />
        );
      },
    },
  ], [renderDetalles]);

  const enlacesColumns = useMemo((): GridColDef[] => [
    { field: "tipoServicio", headerName: "Tipo", width: 100 },
    { field: "name", headerName: "Nombre del Enlace", flex: 1 },
    { field: "id_circuito", headerName: "ID Circuito", width: 150 },
    {
      field: "proveedorDelServicioCompartido",
      headerName: "Proveedor",
      width: 200,
      renderCell: (params) => getProveedorNombre(params.value),
    },
    { field: "city", headerName: "Ciudad", width: 140 },
    {
      field: "status", headerName: "Estado", width: 120,
      renderCell: (params) => {
        const isActivo = params.value === "Activo";
        return (
          <Chip label={params.value || "Activo"} size="small" sx={{
            bgcolor: isActivo ? "#e8f5e9" : "#ffebee",
            color: isActivo ? "#2e7d32" : "#c62828",
            fontWeight: "bold", border: isActivo ? "none" : "1px solid #ef9a9a",
          }} />
        );
      },
    },
  ], [getProveedorNombre]);

  return (
    <>
      <ContainerBox title="Gestión de Servicios">
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="service tabs"
            sx={{ "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "1rem" } }}>
            <Tab label="Servicios" />
            <Tab label="Enlaces" />
          </Tabs>
        </Box>

        <CustomDataGrid
          rows={rows}
          columns={tabValue === 0 ? serviciosColumns : enlacesColumns}
          loading={loading}
          onCellClick={(params: GridCellParams) => { setSelectedService(params.row as Service); setIsDetailOpen(true); }}
          getRowId={(row) => String(row._id)}
          onSearch={handleSearch}
          getRowClassName={(params) => (params.row.status === 'Inactivo' ? 'fila-inactiva' : '')}
          paginationMode="server"
          rowCount={totalRows}
          paginationModel={paginationModel}
          onPaginationModelChange={(newModel) => setPaginationModel(newModel)}
          pageSizeOptions={[10, 50, 100]}
          sx={{
            '& .fila-inactiva': {
              backgroundColor: '#fff5f5',
              '&:hover': { backgroundColor: '#ffebee' },
              '& .MuiDataGrid-cell': { color: '#c62828 !important', fontWeight: 600 }
            },
            '& .MuiDataGrid-row': { cursor: 'pointer', transition: 'background-color 0.15s ease' },
            '& .MuiDataGrid-row:hover': { backgroundColor: '#f8fafc' }
          }}
        />
      </ContainerBox>

      <FloatingAddButton onClick={() => { setSelectedService(null); setIsDialogOpen(true); }} />

      <FullScreenServiceDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedService(null);
          setRefreshTrigger(prev => prev + 1);
        }}
        title={selectedService ? "Editar Servicio" : "Nuevo Servicio"}
        initialData={selectedService}
      />

      <CardSeeServiceModal
        open={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
        }}
        service={
          selectedService
            ? ({ ...selectedService, id_circuito: selectedService.id_circuito || "" } as any)
            : null
        }
        onEditClick={() => {
          setIsDetailOpen(false);
          setIsDialogOpen(true);
        }}
        onDeleteSuccess={() => {
    // ✅ Actualiza la fila localmente al instante
    if (selectedService?._id) {
      const id = String(selectedService._id);
      const nuevoStatus = selectedService.status === "Activo" ? "Inactivo" : "Activo";
      setRows((prev) =>
        prev.map((r) =>
          String((r as any)._id) === id ? { ...r, status: nuevoStatus } : r
        )
      );
    }
    setIsDetailOpen(false);
    setSelectedService(null);
    setRefreshTrigger((prev) => prev + 1);
  }}
      />
    </>
  );
}