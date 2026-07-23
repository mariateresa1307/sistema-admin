"use client";
import { ContainerBox } from "../components/containerBox";
import CustomDataGrid from "app/components/customDataGrid";
import { CardSeeModal } from "./cardUserSeeModal";
import { ConfirmDialog } from '../components/confirmDialog'; // ✅ Importado
import { useState, useCallback, useEffect } from "react";
import { getUsers, deleteUser } from "@/lib/api";
import { Box, Chip, Typography } from "@mui/material";
import { GridColDef, GridCellParams } from "@mui/x-data-grid";
import { FloatingAddButton } from "../components/FloatingAddButton";
import { Notification } from '../components/Notification';
import { FullScreenUserDialog } from "./userModal";

type Usuario = {
  _id: string;
  username: string;
  email: string;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  isActive: boolean;
  role: string;
};

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // ✅ Estado para el diálogo de confirmación
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    userId: '',
  });

  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const fetchUsuarios = useCallback(async () => {
    try {
      const response = await getUsers();
      const dataNormalizada = (Array.isArray(response.data) ? response.data : []).map((user: any) => ({
        _id: user._id,
        username: user.username,
        email: user.email,
        primerNombre: user.primerNombre,
        segundoNombre: user.segundoNombre,
        primerApellido: user.primerApellido,
        segundoApellido: user.segundoApellido,
        isActive: user.isActive !== undefined ? user.isActive : (user.is_active ?? true),
        role: user.role || 'editor'
      }));
      setUsuarios(dataNormalizada);
    } catch (err: any) {
      console.error("Error al obtener usuarios:", err);
      setUsuarios([]);
    }
  }, []);


  const handleDeleteUser = useCallback(async (userId: string) => {
    console.log('🗑️ [DELETE] Iniciando eliminación del usuario:', userId);
    try {
      await deleteUser(userId);
      await fetchUsuarios(); // Recarga la tabla
      
      // ✅ NUEVO: Cerrar el modal de detalles y limpiar el estado
      setIsDetailOpen(false);
      setSelectedUser(null);
      
      setNotification({
        open: true,
        message: "Usuario eliminado exitosamente",
        severity: "success",
      });
    } catch (error: any) {
      console.error('❌ [DELETE] Error al eliminar usuario:', error);
      setNotification({
        open: true,
        message: error.response?.data?.message || "Error al eliminar el usuario. Intente nuevamente.",
        severity: "error",
      });
    }
  }, [fetchUsuarios]);

  const columns: GridColDef[] = [
    { 
      field: "username", 
      headerName: "Usuario", 
      flex: 1.3, 
      minWidth: 120,
      renderCell: (params) => {
        const user = params.row as Usuario;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, height: '100%' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              @{user.username}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "primerNombre",
      headerName: "Nombre Completo",
      flex: 1.5,
      minWidth: 200,
      valueGetter: (value, row) => `${row?.primerNombre || ""} ${row?.primerApellido || ""}`.trim(),
    },
    { 
      field: "email", 
      headerName: "Correo Electrónico",
      flex: 1.5,
      minWidth: 200 
    },
    {
      field: "role",
      headerName: "Rol",
      flex: 1,
      minWidth: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const role = params.value || 'editor';
        const roleLabels: Record<string, string> = {
          admin: 'Administrador',
          operador: 'Operador',
          editor: 'Operator Editor'
        };
        return (
          <Chip
            label={roleLabels[role] || role}
            size="small"
            sx={{
              bgcolor: role === 'admin' ? '#e3f2fd' : role === 'operador' ? '#fff3e0' : '#f3e5f5',
              color: role === 'admin' ? '#1565c0' : role === 'operador' ? '#e65100' : '#6a1b9a',
              fontWeight: 'bold',
              borderRadius: '6px',
              px: 0.5
            }}
          />
        );
      },
    },
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
      setSelectedUser(params.row as Usuario);
      setIsDetailOpen(true);
    }
  };

  const handleTransitionToEdit = () => {
    setIsDetailOpen(false);
    setIsDialogOpen(true);
  };

  const handleFormSubmit = async () => {
    await fetchUsuarios();
    setSelectedUser(null);
    setNotification({
      open: true,
      message: selectedUser ? "Usuario actualizado exitosamente" : "Usuario creado exitosamente",
      severity: "success",
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
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

      <CardSeeModal
        open={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onEditClick={handleTransitionToEdit}
        onDeleteClick={() => {
          if (selectedUser) {
            setConfirmDialog({
              open: true,
              title: 'Eliminar Usuario',
              message: `¿Estás seguro de eliminar permanentemente a ${selectedUser.primerNombre} ${selectedUser.primerApellido}? Esta acción no se puede deshacer.`,
              userId: selectedUser._id,
            });
          }
        }}
      />

      {/* ✅ AQUÍ ESTABA EL FALTANTE: Renderizar el ConfirmDialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type="warning"
        onConfirm={() => {
          setConfirmDialog(prev => ({ ...prev, open: false })); // Cierra el diálogo
          handleDeleteUser(confirmDialog.userId); // Ejecuta la eliminación
        }}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
      />

      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />
    </>
  );
}