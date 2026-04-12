"use client";
import { CustomDataGrid } from "app/components/customDataGrid";
import DashboardLayout from "../components/DashboardLayout";
import { Box, Typography } from "@mui/material";
import { ContainerBox } from "../components/containerBox";

export default function RBSPage() {
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
    </>
  );
}
