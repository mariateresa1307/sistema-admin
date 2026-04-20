"use client";
import { ContainerBox } from "../components/containerBox";
import { CustomDataGrid } from "../components/customDataGrid";
import { useState, useCallback, useEffect } from "react";
import { getUsers, deleteUser } from "@/lib/api";

import ButtonGroup from "@mui/material/ButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { FloatingAddButton } from "../components/FloatingAddButton";
import { FullScreenUserDialog } from "./userModal";
import { ConfirmDialog } from "../components/ConfirmDialog"; 

type Usuario = {
  id: string;
  username: string;
  email: string;
  primerNombre: string;
  primerApellido: string;
  is_active: boolean;
};

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);

  // Estados para el Modal de Confirmación
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState<string | null>(null);

  const fetchUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      setUsuarios(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const columns: GridColDef[] = [
    { field: "username", headerName: "Usuario", flex: 1, minWidth: 120 },
    {
      field: "fullName",
      headerName: "Nombre Completo",
      flex: 1.5,
      minWidth: 200,
      valueGetter: (value, row) =>
        `${row.primerNombre || ""} ${row.primerApellido || ""}`,
    },
    {
      field: "email",
      headerName: "Correo Electrónico",
      flex: 1.5,
      minWidth: 200,
    },
    {
      field: "is_active",
      headerName: "Estado",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (params.value ? "Activo" : "Inactivo"),
    },
    {
      field: "Action",
      headerName: "Acciones",
      minWidth: 150,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<Usuario>) => (
        <ButtonGroup
          variant="outlined"
          size="small"
          sx={{
            height: "30px",
            "& .MuiButton-root": { borderColor: "#E2E8F0" },
          }}
        >
          <Tooltip title="Editar">
            <Button onClick={() => handleEdit(params.row)}>
              <EditIcon fontSize="small" sx={{ color: "#080769" }} />
            </Button>
          </Tooltip>
          <Tooltip title="Eliminar">
            <Button onClick={() => handleDelete(params.row.id)}>
              <DeleteIcon fontSize="small" sx={{ color: "#d32f2f" }} />
            </Button>
          </Tooltip>
        </ButtonGroup>
      ),
    },
  ];

  const handleEdit = (usuario: Usuario) => {
    console.log("Datos del usuario a editar:", usuario);
    setSelectedUser(usuario);
    setIsDialogOpen(true);
  };

  // Solo abre el modal y guarda el ID
  const handleDelete = (id: string) => {
    setUserIdToDelete(id);
    setDeleteConfirmOpen(true);
  };

  // Función que se ejecuta al confirmar en el modal
  const handleConfirmDelete = async () => {
    if (!userIdToDelete) return;
    try {
      await deleteUser(userIdToDelete);
      fetchUsuarios();
    } catch (err) {
      alert("Error al eliminar el usuario");
    } finally {
      setDeleteConfirmOpen(false);
      setUserIdToDelete(null);
    }
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
        <CustomDataGrid rows={usuarios} columns={columns} loading={loading} />
      </ContainerBox>

      <FloatingAddButton
        onClick={() => {
          setSelectedUser(null);
          setIsDialogOpen(true);
        }}
      />

      <FullScreenUserDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={selectedUser ? "Editar Usuario" : "Nuevo Usuario"}
        isEditMode={!!selectedUser}
        initialData={selectedUser}
        onSubmit={async () => {
          fetchUsuarios();
        }}
      />

   
      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="¿Confirmar eliminación?"
        description="Esta acción eliminará al usuario de forma permanente. ¿Deseas continuar?"
      />
    </>
  );
}