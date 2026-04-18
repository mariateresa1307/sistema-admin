"use client";
import { CustomDataGrid } from "app/components/customDataGrid";
import { Box, Typography } from "@mui/material";
import { ContainerBox } from "../components/containerBox";
import { useState, useCallback, useEffect } from "react";
import { FloatingAddButton } from "../components/FloatingAddButton";
import { FullScreenServiceDialog } from "./serviceModal";
import { getService, deleteService } from "@/lib/api";

type Service = {
  idNetuno: string;
  name: string;
  instalado: string;
  idRBS: string;
  city: string;
  nodeA: string;
  nodeB: string;
  oltnode: string;
  serialONT: string;
};

export default function RBSPage() {
   const [service, setService] = useState<Service[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

const fetchService = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getService();
      setService(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      setService([]);
    } finally {
      setLoading(false);
    }
  }, []);


  const handleDelete = async (id: string) => {
      if (window.confirm("¿Estás seguro de que deseas eliminar este servicio?")) {
        try {
          await deleteService(id);
          fetchService();
        } catch (err) {
          alert("Error al eliminar el servicio");
        }
      }
    };
  

useEffect(() => {
    fetchService();
  }, [fetchService]);
  return (
    <>
      <ContainerBox title="Gestión de Servicios">
        <CustomDataGrid
          rows={[
            {
              id: "123",
              idNetuno: "ID_266262_TMV_montecristo_CSS_1G",
              name: "monte cristo oeste",
              instalado: true,
              idRBS: "2222",
              city: "caracas",
              nodeA: "OLT_CCS_PQ-0", 
              nodeB: "OLT_CCS_PQ-1" ,
              oltnode: "CSSPQ0000",
              serialONT: "251656516516",
            },
          ]}
          columns={[
            { field: "idNetuno", headerName: "ID Netuno", flex: 1 },
            { field: "name", headerName: "Nombre", flex: 1 },
            { field: "instalado", headerName: "Instalado" , flex: 1 },
            { field: "idRBS", headerName: "ID RBS", flex: 1 },
            { field: "city", headerName: "Ciudad", flex: 1 },
            { field: "nodeA", headerName: "Nodo A", flex: 1 },
            { field: "nodeB", headerName: "Nodo B", flex: 1 },
            { field: "oltnode", headerName: "OLT Node", flex: 1 },
            { field: "serialONT", headerName: "Serial ONT", flex: 1 },
          ]}
          loading={false}
        />
      </ContainerBox>

        <FloatingAddButton
              onClick={() => {
                setSelectedService(null);
                setIsDialogOpen(true);
              }}
            />
               <FullScreenServiceDialog
                    isOpen={isDialogOpen}
                    onClose={() => setIsDialogOpen(false)}
                    title={selectedService ? "Editar Servicio" : "Nuevo Servicio"}
                    isEditMode={!!selectedService}
                    initialData={selectedService}
                    onSubmit={async () => {
                      fetchService();
                    }}
                  />
    </>
  );
}
