"use client";
import { CustomDataGrid } from "app/components/customDataGrid";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { ContainerBox } from "../components/containerBox";
import { FloatingAddButton } from "../components/FloatingAddButton";
import { FullScreenServiceDialog } from "./serviceModal";
import { CardSeeServiceModal } from "./cardSeeServiceModal";
import { GridCellParams, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Chip } from "@mui/material";

type Service = {
  _id?: string;
  tipoServicio: string;
  name: string;
  city: string;
  tipo_cliente: string;
  id_netuno: string;
  idRBS?: string;
  id_circuito?: string;
  serialONT?: string;
  nodoA?: string;
  nodoB?: string;
  oltnodo?: string;
  contrato?: number;
  vlan?: number | string;
  status?: string;
  instalado?: boolean;
};

export default function RBSPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [rows, setRows] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

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

  const renderDetalles = (row: Service) => {
    switch (row.tipoServicio) {
      case "METROLAN": return `VLAN: ${row.vlan } | NodoA: ${row.nodoA || '-'}`;
      case "RBS": return `ID RBS: ${row.idRBS } | Serial: ${row.serialONT || '-'}`;
      case "IU": return `ID: ${row.id_circuito } | Proveedor: ${row.tipo_cliente || '-'}`;
      case "DOG": return `Circuito: ${row.id_circuito } | Contrato: ${row.contrato || '-'}`;
      case "Redes Compartidas": return `VLAN: ${row.vlan } | Equipo: ${row.nodoA || '-'}`;
      default: return "N/A";
    }
  };

  const columns = useMemo((): GridColDef[] => {
    const base: GridColDef[] = [{ field: "tipoServicio", headerName: "Tipo", width: 100 }];

    const dynamicColumns = filtroTipo === "IU"
      ? [{ field: "id_circuito", headerName: "ID Circuito", flex: 1 }, { field: "city", headerName: "Proveedor", flex: 1 }]
      : [{ field: "name", headerName: "Nombre", flex: 1 }, {
        field: "detalles", headerName: "Detalles Técnicos", flex: 1.5,
        renderCell: (params: { row: Service; }) => renderDetalles(params.row as Service)
      }];
    console.log("Columnas renderizadas:", [...base, ...dynamicColumns, { field: "status", headerName: "Estado", width: 120 }]);
    return [
      ...base,
      ...dynamicColumns,
      {
        field: "status", headerName: "Estado", width: 120, renderCell: (params) => (
          <Chip label={params.value || "Activo"} size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 'bold' }} />
        )
      }];
  }, [filtroTipo]);


  const filteredRows = useMemo(() => {
    return filtroTipo === "Todos" ? rows : rows.filter(r => r.tipoServicio === filtroTipo);
  }, [rows, filtroTipo]);


  return (
    <>
      <ContainerBox title="Gestión de Servicios">
        <CustomDataGrid
          rows={filteredRows}
          columns={columns}
          loading={loading}
          onCellClick={(params: GridCellParams) => {
            setSelectedService(params.row as Service);
            setIsDetailOpen(true);
          }}
          getRowId={(row) => row._id || row.idNetuno}
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