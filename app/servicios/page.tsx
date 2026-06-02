"use client";
import { CustomDataGrid } from "app/components/customDataGrid";
import { useState, useEffect, useCallback, useMemo } from "react";
import { ContainerBox } from "../components/containerBox";
import { FloatingAddButton } from "../components/FloatingAddButton";
import { FullScreenServiceDialog } from "./serviceModal";
import { CardSeeServiceModal } from "./cardSeeServiceModal";
import { GridCellParams, GridColDef } from "@mui/x-data-grid";
import { Chip } from "@mui/material";

type Service = {
  _id?: string;
  tipoServicio: string;
  name: string;
  city: string;
  tipo_cliente: string;
  idNetuno: string;
  idRBS?: string;
  idDOG?: string;
  idServicio?: string; 
  serialONT?: string;
  nodeA?: string;
  nodeB?: string;
  oltnode?: string;
  contrato?: number;
  vlan?: number | string;
  status?: string;
  id_circuito?: string; 
  instalado?: boolean; 
};

export default function RBSPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [filtroTipo, setFiltroTipo] = useState("Todos"); 
  const [rows, setRows] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/services');
      const data = await res.json();
      console.log("Datos crudos del servidor:", data);

      const formattedData = data.map((s: any) => ({
        ...s,
        id_circuito: s.id_circuito ,
      }));
      
      setRows(formattedData);
    } catch (error) {
     console.error("Error al obtener servicios:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const columns = useMemo((): GridColDef[] => {
    const base: GridColDef[] = [{ field: "tipoServicio", headerName: "Tipo", width: 100 }];
    
    if (filtroTipo === "IU") {
      return [
        ...base,
        { field: "id_circuito", headerName: "ID Circuito", flex: 1 },
        { field: "city", headerName: "Proveedor", flex: 1 },
        { field: "tipo_cliente", headerName: "Tipo de Proveedor", flex: 1 },
        { field: "status", headerName: "Estado", width: 120 },
      ];
    }
    
    return [
      ...base,
      { field: "name", headerName: "Nombre", flex: 1 },
      { 
        field: "detalles", 
        headerName: "Detalles Técnicos", 
        flex: 1.5,
        renderCell: (params) => {
          const row = params.row as Service;
      debugger; 
    
    console.log("Fila procesada:", row);
          switch (row.tipoServicio) {
            case "METROLAN": return `VLAN: ${row.vlan || '-'} | NodoA: ${row.nodeA || '-'}`;
            case "RBS": return `ID RBS: ${row.idRBS || '-'} | Serial: ${row.serialONT || '-'}`;
            case "IU": return `ID: ${row.id_circuito || 'N/A'}`;
            case "DOG": return `Circuito: ${row.idDOG || '-'} | Contrato: ${row.contrato || '-'}`;
            default: return "N/A";
          }
        }
      },
      { field: "city", headerName: "Ciudad", flex: 1 },
      { field: "tipo_cliente", headerName: "Tipo Cliente / Proveedor", flex: 1 },
      { 
        field: "status", 
        headerName: "Estado", 
        minWidth: 120,
        renderCell: (params) => (
          <Chip
            label={params.value || "Activo"}
            size="small"
            sx={{
              bgcolor: '#e8f5e9',
              color: '#2e7d32',
              fontWeight: 'bold',
            }}
          />
        ),
      },
    ];
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