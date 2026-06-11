"use client";
import { useMemo, ReactElement } from "react";
import { CustomDataGrid } from "app/components/customDataGrid";
import { GridCellParams, GridColDef } from "@mui/x-data-grid";
import { Chip, Box, IconButton, Tooltip, Typography } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlaceIcon from '@mui/icons-material/Place';
import MapIcon from '@mui/icons-material/Map';
import CategoryIcon from '@mui/icons-material/Category';
import { MiscellaneousItem } from "../miscellaneous/useMiscellaneous";

interface MiscellaneousTableProps {
  rows: MiscellaneousItem[];
  allItems: MiscellaneousItem[]; // ✅ NUEVO: Para acceder a las localidades
  loading: boolean;
  currentCategoria: string;
  onCellClick: (params: GridCellParams) => void;
  onEdit: (item: MiscellaneousItem) => void;
  onDelete: (item: MiscellaneousItem) => void;
  onOpenLocalidades: (item: MiscellaneousItem) => void;
  onOpenSubcategorias: (item: MiscellaneousItem) => void;
}

export const MiscellaneousTable = ({
  rows,
  allItems, // ✅ NUEVO
  loading,
  currentCategoria,
  onCellClick,
  onEdit,
  onDelete,
  onOpenLocalidades,
  onOpenSubcategorias,
}: MiscellaneousTableProps) => {
  
  // ✅ Función para obtener localidades de una ciudad
  const getLocalidadesByCiudad = (ciudadId: string) => {
    return allItems.filter(
      item => item.categoria === 'LOCALIDAD' && item.padreId === ciudadId && item.activo !== false
    );
  };

  const columns = useMemo((): GridColDef[] => {
    const baseColumns: GridColDef[] = [];

    // ✅ Columna Nombre (SIEMPRE visible)
    baseColumns.push({
      field: "valor",
      headerName: "Nombre",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{ bgcolor: '#e8eaf6', color: '#000027', fontWeight: 'bold', borderRadius: '8px' }}
        />
      ),
    });

    // ✅ Comportamiento diferente según el tab
    if (currentCategoria === 'CIUDAD') {
      // 📍 En CIUDAD: mostrar columna "Estado"
      baseColumns.push({
        field: "padreNombre",
        headerName: "Estado",
        flex: 1,
        minWidth: 150,
        renderCell: (params) => params.value ? (
          <Chip
            label={params.value}
            size="small"
            variant="outlined"
            icon={<MapIcon sx={{ fontSize: 16 }} />}
            sx={{ borderColor: '#1976d2', color: '#1976d2', fontWeight: 600 }}
          />
        ) : (
          <Typography variant="caption" color="error" sx={{ fontWeight: 600 }}>
            ⚠️ Sin estado
          </Typography>
        ),
      });

      // ✅ NUEVA: Columna "Localidades" - Muestra chips con las localidades
      baseColumns.push({
        field: "localidades",
        headerName: "Localidades",
        flex: 2,
        minWidth: 300,
        sortable: false,
        renderCell: (params) => {
          const ciudadId = params.row._id || params.row.id;
          const localidades = getLocalidadesByCiudad(ciudadId);
          
          if (localidades.length === 0) {
            return (
              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Sin localidades
              </Typography>
            );
          }

          return (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
              {localidades.slice(0, 3).map((loc) => (
                <Chip
                  key={loc._id || loc.id}
                  label={loc.valor}
                  size="small"
                  icon={<PlaceIcon sx={{ fontSize: 14 }} />}
                  sx={{
                    bgcolor: '#e3f2fd',
                    color: '#1976d2',
                    fontWeight: 500,
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    height: '24px'
                  }}
                />
              ))}
              {localidades.length > 3 && (
                <Chip
                  label={`+${localidades.length - 3}`}
                  size="small"
                  sx={{
                    bgcolor: '#f5f5f5',
                    color: '#616161',
                    fontWeight: 600,
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    height: '24px'
                  }}
                />
              )}
            </Box>
          );
        },
      });
    } else if (currentCategoria === 'SUBCATEGORIA') {
      // 📋 En SUBCATEGORIA: mostrar columna "Categoría"
      baseColumns.push({
        field: "padreNombre",
        headerName: "Categoría",
        flex: 1,
        minWidth: 150,
        renderCell: (params) => params.value ? (
          <Chip
            label={params.value}
            size="small"
            variant="outlined"
            icon={<CategoryIcon sx={{ fontSize: 16 }} />}
            sx={{ borderColor: '#7b1fa2', color: '#7b1fa2', fontWeight: 600 }}
          />
        ) : (
          <Typography variant="caption" color="error" sx={{ fontWeight: 600 }}>
            ⚠️ Sin categoría
          </Typography>
        ),
      });
    } else {
      // 📝 En otros tabs: mostrar columna "Detalles" con la descripción
      baseColumns.push({
        field: "descripcion",
        headerName: "Detalles",
        flex: 1.5,
        minWidth: 250,
        renderCell: (params) => params.value ? (
          <Typography variant="body2" sx={{ color: '#1e293b' }}>
            {params.value}
          </Typography>
        ) : (
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            Sin detalles
          </Typography>
        ),
      });

      // Columna "Estado" (activo/inactivo)
      baseColumns.push({
        field: "activo",
        headerName: "Estado",
        width: 120,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Chip
            label={params.value !== false ? "Activo" : "Inactivo"}
            size="small"
            sx={{
              bgcolor: params.value !== false ? '#e8f5e9' : '#ffebee',
              color: params.value !== false ? '#2e7d32' : '#c62828',
              fontWeight: 'bold',
            }}
          />
        ),
      });
    }

    // ✅ SOLO agregar columna de gestionar localidades en el tab CIUDAD
    if (currentCategoria === 'CIUDAD') {
      baseColumns.push({
        field: "gestionarLocalidades",
        headerName: "Gestionar",
        width: 100,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        renderCell: (params) => (
          <Tooltip title="Agregar/Editar localidades">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onOpenLocalidades(params.row as MiscellaneousItem);
              }}
              sx={{ color: '#1976d2', bgcolor: '#e3f2fd', '&:hover': { bgcolor: '#bbdefb' } }}
            >
              <PlaceIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      });
    }

    // ✅ SOLO agregar columna de subcategorías en el tab CATEGORIA_RED
    if (currentCategoria === 'CATEGORIA_RED') {
      baseColumns.push({
        field: "gestionarSubcategorias",
        headerName: "Subcategorías",
        width: 130,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        renderCell: (params) => (
          <Tooltip title="Gestionar subcategorías">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onOpenSubcategorias(params.row as MiscellaneousItem);
              }}
              sx={{ color: '#7b1fa2', bgcolor: '#f3e5f5', '&:hover': { bgcolor: '#e1bee7' } }}
            >
              <CategoryIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      });
    }

    return baseColumns;
  }, [currentCategoria, allItems, onEdit, onDelete, onOpenLocalidades, onOpenSubcategorias]);

  return (
    <Box sx={{
      '& .MuiDataGrid-row': { cursor: 'pointer', transition: 'background-color 0.15s ease' },
      '& .MuiDataGrid-row:hover': { bgcolor: '#f8fafc' },
    }}>
      <CustomDataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        onCellClick={onCellClick}
        getRowId={(row) => row._id || row.id || Math.random().toString()}
      />
    </Box>
  );
};