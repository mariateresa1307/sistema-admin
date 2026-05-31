"use client";
import { CustomDataGrid } from "app/components/customDataGrid";
import { useState, useCallback, useEffect } from "react";
import { ContainerBox } from "../components/containerBox";
import { FloatingAddButton } from "../components/FloatingAddButton";
import { FullScreenServiceDialog } from "./serviceModal";
import { CardSeeServiceModal } from "./cardSeeServiceModal"; // Importado
import { getService } from "@/lib/api";
import { GridCellParams } from "@mui/x-data-grid";

// Tu tipo original
type Service = {
  _id?: string;
  idNetuno: string;
  name: string;
  instalado: boolean;
  idRBS: string;
  city: string;
  nodeA: string;
  nodeB: string;
  oltnode: string;
  serialONT: string;
};

export default function RBSPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false); // Estado para el detalle
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Tus datos originales intactos
  const staticRows = [
    {
      _id: "123",
      idNetuno: "ID_26235_RBS_TMVE_Laguna_Casarapa_CGG_1G",
      serialONT: "251656516516",
      name: "monte cristo oeste",
      idServicio: "26226",
      city: "caracas",
      status: "Activo",
    },
  ];

  return (
    <>
      <ContainerBox title="Gestión de Servicios">
        <CustomDataGrid
          rows={staticRows} // Usamos tus valores originales
          columns={[
            { field: "idNetuno", headerName: "ID Netuno", flex: 1 },
            { field: "serialONT", headerName: "Serial ONT", flex: 1 },
            { field: "idServicio", headerName: "ID Servicio", flex: 1 },
            { field: "name", headerName: "Nombre", flex: 1 },
            { field: "city", headerName: "Ciudad", flex: 1 },
            { field: "status", headerName: "Estado", flex: 1 },
          ]}
          loading={false}
          // AQUÍ LA ACCIÓN: Al hacer clic, pasamos el servicio a 'selectedService' y abrimos el modal
          onCellClick={(params: GridCellParams) => {
            setSelectedService(params.row as Service);
            setIsDetailOpen(true);
          }}
          getRowId={(row) => row._id || row.idNetuno}
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
        onSubmit={async () => { /* tu lógica */ }}
      />

      {/* AGREGADO: Tu modal de detalle ahora recibe los valores de la tabla */}
      <CardSeeServiceModal
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        service={selectedService}
        onEditClick={() => {
          setIsDetailOpen(false);
          setIsDialogOpen(true);
        }}
      />
    </>
  );
}