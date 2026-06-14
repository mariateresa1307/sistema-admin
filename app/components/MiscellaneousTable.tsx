"use client";
import { useMemo } from "react";
import { CustomDataGrid } from "app/components/customDataGrid";
import { GridCellParams, GridColDef } from "@mui/x-data-grid";
import { Chip, Box, IconButton, Tooltip, Typography } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlaceIcon from '@mui/icons-material/Place';
import MapIcon from '@mui/icons-material/Map';
import CategoryIcon from '@mui/icons-material/Category';
import WarningIcon from '@mui/icons-material/Warning';
import { MiscellaneousItem } from "../miscellaneous/useMiscellaneous";

interface MiscellaneousTableProps {
  rows: MiscellaneousItem[];
  localidades: MiscellaneousItem[]; 
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
  localidades, 
  loading,
  currentCategoria,
  onCellClick,
  onEdit,
  onDelete,
  onOpenLocalidades,
  onOpenSubcategorias,
}: MiscellaneousTableProps) => {
  
  const getLocalidadesByCiudad = (ciudadId: string) => {
    if (!ciudadId) return [];
    
    const result = localidades.filter(
      item => 
        item.categoria === 'LOCALIDAD' && 
        item.padreId === ciudadId && 
        item.activo !== false
    );
    
    return result;
  };

  const getTipoIncidenciaConfig = (tipo: string) => {
    const tipoUpper = (tipo || '').toUpperCase();
    
    if (tipoUpper.includes('PUNTUAL')) {
      return { bgcolor: '#fff3e0', color: '#e65100', icon: '⚠️' };
    }
    if (tipoUpper.includes('MASIVA')) {
      return { bgcolor: '#ffebee', color: '#c62828', icon: '🚨' };
    }
    if (tipoUpper.includes('MANTENIMIENTO')) {
      return { bgcolor: '#e3f2fd', color: '#1565c0', icon: '🔧' };
    }
    return { bgcolor: '#f5f5f5', color: '#616161', icon: 'ℹ️' };
  };

  const columns = useMemo((): GridColDef[] => {
    const baseColumns: GridColDef[] = [];

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

    if (currentCategoria === 'CIUDAD') {
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

      baseColumns.push({
        field: "localidades",
        headerName: "Localidades",
        flex: 2,
        minWidth: 300,
        sortable: false,
        renderCell: (params) => {
          const ciudadId = params.row._id || params.row.id;
          const localidadesData = getLocalidadesByCiudad(ciudadId);
          
          if (localidadesData.length === 0) {
            return (
              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Sin localidades
              </Typography>
            );
          }

          return (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
              {localidadesData.slice(0, 3).map((loc) => (
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
              {localidadesData.length > 3 && (
                <Chip
                  label={`+${localidadesData.length - 3}`}
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

      // Columna Estado para CIUDAD
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

      // Botón gestionar localidades
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
    //  Caso SUBCATEGORIA
    else if (currentCategoria === 'SUBCATEGORIA') {
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

      // Columna Estado para SUBCATEGORIA
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
  
    else if (currentCategoria === 'CATEGORIA_RED') {
      baseColumns.push({
        field: "tipoIncidencia",
        headerName: "Tipo de Incidencia",
        flex: 1.2,
        minWidth: 200,
        renderCell: (params) => {
          const tipo = params.value;
          
          if (!tipo) {
            return (
              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Sin tipo de incidencia
              </Typography>
            );
          }

          const config = getTipoIncidenciaConfig(tipo);

          return (
            <Chip
              label={`${config.icon} ${tipo}`}
              size="small"
              sx={{
                bgcolor: config.bgcolor,
                color: config.color,
                fontWeight: 700,
                borderRadius: '6px',
                fontSize: '0.75rem',
                height: '28px',
                px: 1
              }}
            />
          );
        },
      });

      // Columna Estado para CATEGORIA_RED
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

      // Botón gestionar subcategorías
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
    
    else {
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

    return baseColumns;
  }, [currentCategoria, localidades, onEdit, onDelete, onOpenLocalidades, onOpenSubcategorias]);

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