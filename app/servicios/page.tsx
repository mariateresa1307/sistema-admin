"use client";
import CustomDataGrid, { SearchParams } from "app/components/customDataGrid";
import { useState, useEffect, useCallback, useMemo } from "react";
import { ContainerBox } from "../components/containerBox";
import { FloatingAddButton } from "../components/FloatingAddButton";
import { FullScreenServiceDialog } from "./serviceModal";
import { CardSeeServiceModal } from "./cardSeeServiceModal";
import { GridCellParams, GridColDef } from "@mui/x-data-grid";
import { Chip, Tabs, Tab, Box } from "@mui/material";
import { Service } from "app/utils/types";
import { getService } from "@/lib/api";

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

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const backendPage = paginationModel.page + 1;

      let excludeTipo = undefined;
      let tipoServicioParam = undefined;

      // 1️⃣ Lógica de Pestañas por defecto
      if (tabValue === 0) {
        excludeTipo = "IU"; // Por defecto en "Servicios" ocultamos IU
      } else if (tabValue === 1) {
        tipoServicioParam = "IU"; // En "Enlaces IU" forzamos IU
      }

      // 2️⃣ Lógica del Filtro del CustomDataGrid (Sobreescribe la lógica por defecto si el usuario eligió algo)
      if (searchParams?.field === 'tipoServicio' && searchParams.value) {
        tipoServicioParam = searchParams.value;
        excludeTipo = undefined; // Si el usuario eligió un tipo específico, respetamos su elección y no excluimos nada
      }

      const apiParams: any = {
        page: backendPage,
        limit: paginationModel.pageSize,
      };

      if (tipoServicioParam) apiParams.tipoServicio = tipoServicioParam;
      if (excludeTipo) apiParams.excludeTipo = excludeTipo;

      // 3️⃣ Otros filtros (Status o Búsqueda general)
      if (searchParams?.field === 'status' && searchParams.value) {
        apiParams.status = searchParams.value;
      } else if (searchParams?.field && searchParams.field !== 'tipoServicio' && searchParams.field !== 'status' && searchParams.value) {
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
  }, [paginationModel.page, paginationModel.pageSize, tabValue, searchParams, refreshTrigger]);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setSearchParams(null); // Limpia filtros al cambiar de pestaña
    setPaginationModel({ page: 0, pageSize: 10 });
  };

  const handleSearch = useCallback((params: SearchParams) => {
    setSearchParams(params);
    setPaginationModel({ page: 0, pageSize: 10 });
  }, []);

  const renderDetalles = (row: Service) => {
    switch (row.tipoServicio) {
      case "METROLAN": return `VLAN: ${row.vlan} | NodoA: ${row.nodoA || "-"}`;
      case "RBS": return `ID RBS: ${row.idRBS} | Serial: ${row.serialONT || "-"}`;
      case "IU": return `ID: ${row.id_circuito} | Proveedor: ${row.tipoCliente || "-"}`;
      case "DOG": return `Circuito: ${row.id_circuito} | Contrato: ${row.contrato || "-"}`;
      case "Redes Compartidas": return `VLAN: ${row.vlan} | Equipo: ${row.nodoA || "-"}`;
      default: return "N/A";
    }
  };

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
  ], []);

  const enlacesColumns = useMemo((): GridColDef[] => [
    { field: "tipoServicio", headerName: "Tipo", width: 100 },
    { field: "name", headerName: "Nombre del Enlace", flex: 1 },
    { field: "id_circuito", headerName: "ID Circuito", width: 150 },
    { field: "proveedorDelServicioCompartido", headerName: "Proveedor", width: 150 },
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
  ], []);

  return (
    <>
      <ContainerBox title="Gestión de Servicios">
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="service tabs"
            sx={{ "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "1rem" } }}>
            <Tab label="Servicios" />
            <Tab label="Enlaces IU" />
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
          setRefreshTrigger(prev => prev + 1);
        }}
        service={selectedService ? { ...selectedService, id_circuito: selectedService.id_circuito || "" } as any : null}
        onEditClick={() => { setIsDetailOpen(false); setIsDialogOpen(true); }}
        onDeleteSuccess={() => {
          setIsDetailOpen(false);
          setRefreshTrigger(prev => prev + 1);
        }}
      />
    </>
  );
}