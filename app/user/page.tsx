"use client";
import { ContainerBox } from "../components/containerBox";
import { CustomDataGrid } from "../components/customDataGrid";
import { CardSeeModal } from "./cardUserSeeModal";
import { useState, useCallback, useEffect } from "react";
import { getUsers } from "@/lib/api";

import { Box, Chip } from "@mui/material";
import { GridColDef, GridCellParams } from "@mui/x-data-grid";
import { FloatingAddButton } from "../components/FloatingAddButton";
import { FullScreenUserDialog } from "./userModal";

// 🔹 Unificado: Se elimina por completo 'is_active' dejando únicamente el tipo de la BD
type Usuario = {
  _id: string;
  username: string;
  email: string;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  isActive: boolean; 
};

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      
      // 🔹 Limpieza de datos: Mapeamos asegurando únicamente la propiedad 'isActive'
      const dataNormalizada = (Array.isArray(response.data) ? response.data : []).map((user: any) => ({
        _id: user._id,
        username: user.username,
        email: user.email,
        primerNombre: user.primerNombre,
        segundoNombre: user.segundoNombre,
        primerApellido: user.primerApellido,
        segundoApellido: user.segundoApellido,
        isActive: user.isActive !== undefined ? user.isActive : (user.is_active ?? true)
      }));

      setUsuarios(dataNormalizada);
    } catch (err: any) {
      console.error("Error al obtener usuarios:", err);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const columns: GridColDef[] = [
    { field: "username", headerName: "Usuario", flex: 1, minWidth: 120 },
    {
      field: "primerNombre",
      headerName: "Nombre Completo",
      flex: 1.5,
      minWidth: 200,
      valueGetter: (value, row) =>
        `${row?.primerNombre || ""} ${row?.primerApellido || ""}`.trim(),
    },
    { field: "email", headerName: "Correo Electrónico", flex: 1.5, minWidth: 200 },
    {
      field: "isActive", 
      headerName: "Estado",
      flex: 1,
      minWidth: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const activo = params.value; 
        return (
          <Chip 
            label={activo ? "Activo" : "Inactivo"} 
            size="small" 
            sx={{ 
              bgcolor: activo ? '#e8f5e9' : '#ffebee', 
              color: activo ? '#2e7d32' : '#c62828', 
              fontWeight: 'bold', 
              borderRadius: '6px', 
              px: 0.5 
            }} 
          />
        );
      },
    },
  ];

  const handleCellClick = (params: GridCellParams) => {
    if (params.row) {
      const rowData = params.row as Usuario;
      setSelectedUser(rowData);
      setIsDetailOpen(true);
    }
  };

  const handleTransitionToEdit = () => {
    setIsDetailOpen(false);
    setIsDialogOpen(true);
  };

  // Función unificada que se ejecuta al guardar de forma exitosa en el Formulario
  const handleFormSubmit = async () => {
    await fetchUsuarios();
    setSelectedUser(null);
  };

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  return (
    <>
      <ContainerBox
        title="Gestión de Usuarios"
        subtitle="Administración centralizada de accesos Netuno"
      >
        <Box sx={{ 
          '& .MuiDataGrid-row': { cursor: 'pointer', transition: 'background-color 0.15s ease' },
          '& .MuiDataGrid-row:hover': { bgcolor: '#f8fafc' } 
        }}>
          <CustomDataGrid 
            rows={usuarios} 
            columns={columns} 
            loading={loading} 
            onCellClick={handleCellClick}
            getRowId={(row) => row._id} 
          />
        </Box>
      </ContainerBox>

      <FloatingAddButton
        onClick={() => {
          setSelectedUser(null);
          setIsDialogOpen(true);
        }}
      />

      {/* Modal de Creación / Edición */}
      <FullScreenUserDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedUser(null);
        }}
        title={selectedUser ? "Editar Usuario" : "Nuevo Usuario"}
        isEditMode={!!selectedUser}
        initialData={selectedUser}
        onSubmit={handleFormSubmit} 
      />

      {/* Modal de Detalles (Visualización limpia) */}
      <CardSeeModal 
        open={isDetailOpen} 
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedUser(null);
        }} 
        user={selectedUser} // 🔹 Pasamos el objeto limpio con la propiedad estructurada 'isActive'
        onEditClick={handleTransitionToEdit} 
      />
    </>
  );
}