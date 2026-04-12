'use client';

import * as React from 'react';
// Importamos las funciones específicas desde tu api.ts para mayor claridad
import { getUsers, createUser, updateUser, deleteUser } from '@/lib/api'; 
import { FloatingAddButton } from '../components/FloatingAddButton';
import { FullScreenUserDialog } from './AddUserModal'; 
import DashboardLayout from '../components/DashboardLayout';
import {  Grid, // Usando Grid2 para soportar la prop 'size' correctamente
  Box, Typography, Paper, Alert, Divider, ButtonGroup, Button, Tooltip 
} from '@mui/material';
import { DataGrid, GridColDef, GridToolbar, GridRenderCellParams } from '@mui/x-data-grid';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface Usuario {
  id: string;
  username: string; 
  email: string;
  primerNombre: string;
  primerApellido: string;
  is_active: boolean;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = React.useState<Usuario[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<Usuario | null>(null);

  // --- Funciones de Acción ---
  const fetchUsuarios = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUsers(); 
      setUsuarios(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      setError("No se pudo cargar la lista de usuarios.");
      setUsuarios([]); 
    } finally {
      setLoading(false);
    }
  }, []);

  const handleEdit = (usuario: Usuario) => {
    setSelectedUser(usuario);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedUser(null); // Limpiamos el usuario seleccionado al cerrar
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      try {
        await deleteUser(id);
        fetchUsuarios();
      } catch (err) {
        alert("Error al eliminar el usuario");
      }
    }
  };

  React.useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  // --- Definición de Columnas ---
  const columns: GridColDef[] = [
    { field: 'username', headerName: 'Usuario', flex: 1, minWidth: 120 },
    { 
      field: 'fullName', 
      headerName: 'Nombre Completo', 
      flex: 1.5, 
      minWidth: 200,
      valueGetter: (value, row) => `${row.primerNombre || ''} ${row.primerApellido || ''}`
    },
    { field: 'email', headerName: 'Correo Electrónico', flex: 1.5, minWidth: 200 },
    { 
      field: 'is_active', 
      headerName: 'Estado', 
      flex: 1, 
      minWidth: 120,
      renderCell: (params) => (params.value ? 'Activo' : 'Inactivo')
    },
    { 
      field: 'Action', 
      headerName: 'Acciones', 
      minWidth: 150,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<Usuario>) => (
        <ButtonGroup 
          variant="outlined" 
          size="small" 
          sx={{ height: '30px', '& .MuiButton-root': { borderColor: '#E2E8F0' } }}
        >
          <Tooltip title="Editar">
            <Button onClick={() => handleEdit(params.row)}>
              <EditIcon fontSize="small" sx={{ color: '#080769' }} />
            </Button>
          </Tooltip>
          <Tooltip title="Eliminar">
            <Button onClick={() => handleDelete(params.row.id)}>
              <DeleteIcon fontSize="small" sx={{ color: '#d32f2f' }} />
            </Button>
          </Tooltip>
        </ButtonGroup>
      )
    },
  ];

  return (
    <DashboardLayout>
      <Grid container sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
        <Grid size={{ xs: 12 }}>
          <Box sx={{ 
            bgcolor: 'white', 
            borderRadius: 3, 
            p: { xs: 2, md: 4 }, 
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            minHeight: '70vh'
          }}>
            
            <Box mb={2}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#080769' }}>
                Gestión de Usuarios
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Administración centralizada de accesos Netuno
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Paper elevation={0} sx={{ flexGrow: 1, width: '100%', minHeight: 400 }}>
              <DataGrid
                rows={usuarios}
                columns={columns}
                loading={loading}
                slots={{ toolbar: GridToolbar }}
                slotProps={{
                  toolbar: {
                    showQuickFilter: true,
                    quickFilterProps: { debounceMs: 500 },
                  },
                }}
                initialState={{
                  pagination: { paginationModel: { page: 0, pageSize: 10 } },
                }}
                pageSizeOptions={[10, 25, 50]}
                checkboxSelection
                disableRowSelectionOnClick
                sx={{
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  '& .MuiDataGrid-columnHeader': { bgcolor: '#080769' },
                  '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700, color: '#FFFFFF' },
                  '& .MuiDataGrid-virtualScroller': { overflowX: 'hidden !important' } 
                } as any}
              />
            </Paper>
          </Box>
        </Grid>
      </Grid>

      <FloatingAddButton onClick={() => {
        setSelectedUser(null);
        setIsDialogOpen(true);
      }} />
      
      <FullScreenUserDialog 
        isOpen={isDialogOpen} 
        onClose={handleCloseDialog} 
        title={selectedUser ? "Editar Usuario" : "Nuevo Usuario"}
        isEditMode={!!selectedUser}
        initialData={selectedUser}
        onSubmit={async (data) => { 
            try {
              if (selectedUser) {
                // Ahora usamos la función específica definida en tu api.ts
                await updateUser(selectedUser.id, data);
              } else {
                await createUser(data); 
              }
              await fetchUsuarios();
              handleCloseDialog(); 
            } catch (err: any) {
              console.error("Error al guardar:", err);
              // Podrías lanzar el error para que AddUserModal lo muestre
              throw err; 
            }
        }} 
      />
    </DashboardLayout>
  );
}