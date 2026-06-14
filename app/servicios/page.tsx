"use client";
import { CustomDataGrid } from "app/components/customDataGrid";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { ContainerBox } from "../components/containerBox";
import { FloatingAddButton } from "../components/FloatingAddButton";
import { FullScreenServiceDialog } from "./serviceModal";
import { CardSeeServiceModal } from "./cardSeeServiceModal";
import { GridCellParams, GridColDef } from "@mui/x-data-grid";
import { Chip, Tabs, Tab, Box } from "@mui/material";
import { Service } from "app/utils/types";

export default function RBSPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [rows, setRows] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0); // 0: Servicios, 1: Enlaces IU

  const isFirstRun = useRef(true);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/services');
      const data = await res.json();
      setRows(data);
    } catch (error) {
      console.error("Error al obtener servicios:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    console.log("Datos actuales en la tabla:", rows);
  }, [rows]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setFiltroTipo("Todos"); // Resetear filtro al cambiar de tab
  };

  const renderDetalles = (row: Service) => {
    switch (row.tipoServicio) {
      case "METROLAN": return `VLAN: ${row.vlan} | NodoA: ${row.nodoA || '-'}`;
      case "RBS": return `ID RBS: ${row.idRBS} | Serial: ${row.serialONT || '-'}`;
      case "IU": return `ID: ${row.id_circuito} | Proveedor: ${row.tipoCliente || '-'}`;
      case "DOG": return `Circuito: ${row.id_circuito} | Contrato: ${row.contrato || '-'}`;
      case "Redes Compartidas": return `VLAN: ${row.vlan} | Equipo: ${row.nodoA || '-'}`;
      default: return "N/A";
    }
  };

  // Columnas para Servicios (todo excepto IU)
  const serviciosColumns = useMemo((): GridColDef[] => {
    return [
      { field: "tipoServicio", headerName: "Tipo", width: 120 },
      { field: "name", headerName: "Nombre / Cliente", flex: 1 },
      { field: "city", headerName: "Ciudad", width: 140 },
      {
        field: "detalles",
        headerName: "Detalles Técnicos",
        flex: 1.5,
        renderCell: (params) => renderDetalles(params.row as Service)
      },
      {
        field: "status",
        headerName: "Estado",
        width: 120,
        renderCell: (params) => (
          <Chip label={params.value || "Activo"} size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 'bold' }} />
        )
      }
    ];
  }, []);

  // Columnas para Enlaces IU
  const enlacesColumns = useMemo((): GridColDef[] => {
    return [
      { field: "tipoServicio", headerName: "Tipo", width: 100 },
      { field: "name", headerName: "Nombre del Enlace", flex: 1 },
      { field: "id_circuito", headerName: "ID Circuito", width: 150 },
      { field: "tipo_cliente", headerName: "Proveedor", width: 150 },
      { field: "city", headerName: "Ciudad", width: 140 },
      {
        field: "status",
        headerName: "Estado",
        width: 120,
        renderCell: (params) => (
          <Chip label={params.value || "Activo"} size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 'bold' }} />
        )
      }
    ];
  }, []);

  // Filtrar filas según el tab y el filtro de tipo
  const filteredRows = useMemo(() => {
    let filtered = rows;
    
    // Primero filtrar por tab
    if (tabValue === 0) {
      filtered = rows.filter(r => r.tipoServicio !== "IU"); // Servicios
    } else if (tabValue === 1) {
      filtered = rows.filter(r => r.tipoServicio === "IU"); // Enlaces IU
    }
    
    // Luego aplicar el filtro de tipo si no es "Todos"
    if (filtroTipo !== "Todos") {
      filtered = filtered.filter(r => r.tipoServicio === filtroTipo);
    }
    
    return filtered;
  }, [rows, tabValue, filtroTipo]);

  // Contadores para los tabs
  const serviciosCount = rows.filter(r => r.tipoServicio !== "IU").length;
  const enlacesCount = rows.filter(r => r.tipoServicio === "IU").length;

  return (
    <>
      <ContainerBox title="Gestión de Servicios">
        {/* Tabs para separar Servicios y Enlaces IU */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="service tabs"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
              }
            }}
          >
            <Tab label={`Servicios (${serviciosCount})`} />
            <Tab label={`Enlaces IU (${enlacesCount})`} />
          </Tabs>
        </Box>

        <CustomDataGrid
          rows={filteredRows}
          columns={tabValue === 0 ? serviciosColumns : enlacesColumns}
          loading={loading}
          onCellClick={(params: GridCellParams) => {
            setSelectedService(params.row as Service);
            setIsDetailOpen(true);
          }}
          getRowId={(row) => row._id || row.id_netuno}
        />
      </ContainerBox>

      <FloatingAddButton onClick={() => { setSelectedService(null); setIsDialogOpen(true); }} />

      <FullScreenServiceDialog
        isOpen={isDialogOpen}
        onClose={() => { setIsDialogOpen(false); fetchServices(); }}
        title={selectedService ? "Editar Servicio" : "Nuevo Servicio"}
        initialData={selectedService}
      />

      <CardSeeServiceModal
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        service={selectedService ? {
          ...selectedService,
          id_circuito: selectedService.id_circuito || ""
        } as any : null}
        onEditClick={() => { setIsDetailOpen(false); setIsDialogOpen(true); }}
      />
    </>
  );
}