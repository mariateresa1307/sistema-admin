'use client';
import { DataGrid, GridColDef, DataGridProps } from "@mui/x-data-grid";
import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { SxProps } from "@mui/system";
import { Theme } from "@mui/material/styles";
import { TextField, Box, InputAdornment, MenuItem, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { TICKET_STATUS } from "app/utils/constants";
import { TableSkeleton } from './skeletons';

export type SearchParams = { field: string; value: string };

export interface CustomDataGridProps extends Omit<DataGridProps, 'rows' | 'sx'> {
  rows: Array<any>;
  columns: Array<GridColDef>;
  loading?: boolean;
  onSearch?: (params: SearchParams) => void;
  debounceMs?: number;
  paginationModel?: { page: number; pageSize: number };
  onPaginationModelChange?: (model: { page: number; pageSize: number }) => void;
  pageSizeOptions?: number[];
  rowCount?: number;
  paginationMode?: 'client' | 'server';
  sx?: SxProps<Theme>;
  excludeSearchFields?: string[];
  filterOptions?: Record<string, { value: string; label: string }[]>;
}

export default function CustomDataGrid({
  rows,
  columns: rawColumns = [],
  loading,
  onSearch,
  debounceMs = 400,
  paginationModel,
  onPaginationModelChange,
  pageSizeOptions = [10, 25, 50],
  rowCount,
  paginationMode = 'server',
  sx: externalSx = {},
  excludeSearchFields = [],
  filterOptions,
  ...restProps
}: CustomDataGridProps) {

  const columns = Array.isArray(rawColumns)
    ? rawColumns.filter((col): col is GridColDef => Boolean(col) && typeof col === 'object')
    : [];

  const isServiciosModule = useMemo(() => columns.some(col => col.field === 'tipoServicio'), [columns]);

  const dropdownOptions = useMemo(() => {
    if (!Array.isArray(columns) || columns.length === 0) return [];
    const DEFAULT_EXCLUDED = ['gestionarLocalidades', 'gestionarSubcategorias', 'acciones', 'activo'];
    const excluded = new Set([...DEFAULT_EXCLUDED, ...excludeSearchFields]);
    const searchableCols = columns.filter(col => !excluded.has(col.field));
    const caseNumberCol = searchableCols.find(col => col.field === 'caseNumber');
    const otherCols = searchableCols.filter(col => col.field !== 'caseNumber');
    let options = caseNumberCol ? [caseNumberCol, ...otherCols] : searchableCols;

    if (isServiciosModule && !options.some(opt => opt.field === 'nodos')) {
      options = [{ field: 'nodos', headerName: 'Nodos' }, ...options];
    }
    return options;
  }, [columns, isServiciosModule, excludeSearchFields]);

  const [isMounted, setIsMounted] = useState(false);
  const [searchField, setSearchField] = useState<string>(
    columns.find(col => col.field === 'caseNumber' && !excludeSearchFields.includes('caseNumber'))?.field ||
    columns.find(col => col.field === 'name' && !excludeSearchFields.includes('name'))?.field ||
    columns.find(col => !excludeSearchFields.includes(col.field))?.field ||
    columns[0]?.field || ""
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState(rows);
  const [isSearching, setIsSearching] = useState(false);

  const isApiSearch = Boolean(onSearch);
  const skipInitialSearch = useRef(true);
  const onSearchRef = useRef(onSearch);

  useEffect(() => { onSearchRef.current = onSearch; }, [onSearch]);

  const isUserStatusField = useMemo(() => searchField === 'isActive', [searchField]);
  const isStatusField = useMemo(() => searchField === 'status', [searchField]);
  const isTipoServicioField = useMemo(() => searchField === 'tipoServicio', [searchField]);
  const isOperatorField = useMemo(() => 
    searchField === 'operatorResponsable' || searchField === 'operatorAsignado' || searchField === 'operador', 
    [searchField]
  );
  const isTipoClienteField = useMemo(() => searchField === 'tipoCliente', [searchField]);
  const isSelectSearchField = isUserStatusField || isStatusField || isTipoServicioField || isOperatorField || isTipoClienteField;

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    if (isApiSearch || (searchTerm || isSelectSearchField)) return;
    setSearchResults(rows);
  }, [rows, searchTerm, isApiSearch, isSelectSearchField]);

  const getFieldValue = useCallback((row: any, field: string) => {
    const val = row[field];
    if (val === null || val === undefined) return "";
    if (typeof val === 'object') {
      if (field === 'operatorResponsable' || field === 'operatorAsignado' || field === 'operador') {
        return `${val.primerNombre || ''} ${val.primerApellido || ''}`.trim() || val.username || val.email || "";
      }
      if (field === 'tipoCliente' || field === 'networkCategory' || field === 'causaRaiz' || field === 'SolucionCaso' || field === 'subcategoria' || field === 'detalle') {
        return val.valor || val.name || val.nombre || "";
      }
      return String(val);
    }
    return String(val);
  }, []);

  // ✅ OPERADOR OPTIONS - SIN searchTerm en dependencias (evita re-rendering)
  const operatorOptions = useMemo(() => {
    if (!isOperatorField) return [];
    if (filterOptions?.[searchField]) return filterOptions[searchField];
    
    const uniqueOperators = new Map<string, string>();

    rows.forEach((row: any) => {
      const val = row[searchField];
      if (val) {
        let id = '', name = '';
        if (typeof val === 'object' && val !== null) {
          id = String(val._id || val.id || '');
          name = `${val.primerNombre || ''} ${val.primerApellido || ''}`.trim() || val.username || val.email || 'Desconocido';
        } else if (typeof val === 'string') {
          id = val; name = val;
        }
        if (id && !uniqueOperators.has(id)) uniqueOperators.set(id, name);
      }
    });
    
    return Array.from(uniqueOperators.entries())
      .map(([id, name]) => ({ value: id, label: name }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [isOperatorField, searchField, rows, filterOptions]);

  // ✅ TIPO CLIENTE OPTIONS - SIN searchTerm en dependencias (evita re-rendering)
  // ✅ Extrae nombres correctamente del objeto poblado
  const tipoClienteOptions = useMemo(() => {
    if (!isTipoClienteField) return [];
    if (filterOptions?.['tipoCliente']) return filterOptions['tipoCliente'];
    
    const uniqueTypes = new Map<string, string>();

    rows.forEach((row: any) => {
      const tipoClienteVal = row.tipoCliente;
      const incidentType = row.incidentType || '';
      const incidentUpper = incidentType.toUpperCase();
      
      const esCategoriaCritica = 
        incidentUpper.includes('MASIVA') || 
        incidentUpper.includes('MANTENIMIENTO') || 
        incidentUpper.includes('VENTANA');
      
      if (esCategoriaCritica) {
        // Para categorías críticas, usar incidentType como value y label
        if (incidentType && !uniqueTypes.has(incidentType)) {
          uniqueTypes.set(incidentType, incidentType);
        }
      } else if (tipoClienteVal) {
        let id = '', name = '';
        if (typeof tipoClienteVal === 'object' && tipoClienteVal !== null) {
          // ✅ OBJETO POBLADO desde backend: extraer _id y valor
          id = String(tipoClienteVal._id || tipoClienteVal.id || '');
          name = tipoClienteVal.valor || tipoClienteVal.name || tipoClienteVal.nombre || 'Desconocido';
        } else if (typeof tipoClienteVal === 'string') {
          // ✅ STRING (ID sin poblar): usar el ID como value y label
          id = tipoClienteVal; 
          name = tipoClienteVal;
        }
        if (id && !uniqueTypes.has(id)) uniqueTypes.set(id, name);
      }
    });
    
    return Array.from(uniqueTypes.entries())
      .map(([id, name]) => ({ value: id, label: name }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [isTipoClienteField, rows, filterOptions]);

  const mockApiSearch = useCallback(async (field: string, value: string) => {
    return new Promise<any[]>((resolve) => {
      setTimeout(() => {
        if (!value) { resolve(rows); return; }
        
        const filtered = rows.filter((row: any) => {
          if (field === 'isActive') return String(row[field]) === value;
          
          if (field === 'operatorResponsable' || field === 'operatorAsignado' || field === 'operador') {
            const rowVal = row[field];
            if (typeof rowVal === 'object' && rowVal !== null) {
              return String(rowVal._id || rowVal.id) === value;
            }
            return String(rowVal) === value;
          }

          if (field === 'tipoCliente') {
            const searchUpper = value.toUpperCase();
            const esCategoriaCritica = 
              searchUpper.includes('MASIVA') || 
              searchUpper.includes('MANTENIMIENTO') || 
              searchUpper.includes('VENTANA');
            
            if (esCategoriaCritica) {
              const rowIncidentType = (row.incidentType || '').toUpperCase();
              return rowIncidentType.includes(searchUpper) || rowIncidentType === searchUpper;
            } else {
              const rowVal = row[field];
              if (typeof rowVal === 'object' && rowVal !== null) {
                return String(rowVal._id || rowVal.id) === value;
              }
              return String(rowVal) === value;
            }
          }
          
          const rowValue = getFieldValue(row, field).toLowerCase();
          const lowerValue = value.toLowerCase();
          
          if (field === 'status' || field === 'tipoServicio') {
            return rowValue === lowerValue || rowValue.includes(lowerValue);
          }
          
          return rowValue.includes(lowerValue);
        });
        resolve(filtered);
      }, debounceMs);
    });
  }, [rows, debounceMs, getFieldValue]);

  const handleSearch = useCallback(async () => {
    if (isApiSearch) return;
    setIsSearching(true);
    try {
      setSearchResults(await mockApiSearch(searchField, searchTerm));
    } catch {
      setSearchResults(rows);
    } finally {
      setIsSearching(false);
    }
  }, [searchTerm, searchField, rows, mockApiSearch, isApiSearch]);

  useEffect(() => {
    if (isApiSearch) return;
    const timer = setTimeout(() => { handleSearch(); }, debounceMs);
    return () => clearTimeout(timer);
  }, [searchTerm, searchField, handleSearch, debounceMs]);

  // ✅ CORREGIDO: Resetear skipInitialSearch cuando cambia searchField
   // ✅ CORREGIDO: Búsqueda que se dispara correctamente al cambiar searchTerm o searchField
  // ✅ SIMPLIFICADO: Siempre se dispara cuando cambia searchTerm o searchField
  useEffect(() => {
    if (!onSearchRef.current) {
      console.log('⚠️ [CustomDataGrid] onSearchRef.current es null');
      return;
    }
    
    // Saltar solo la primera ejecución al montar
    if (skipInitialSearch.current) {
      console.log('⏭️ [CustomDataGrid] Saltando búsqueda inicial');
      skipInitialSearch.current = false;
      return;
    }
    
    console.log(' [CustomDataGrid] Ejecutando búsqueda:', { field: searchField, value: searchTerm });
    
    const timer = setTimeout(() => { 
      onSearchRef.current?.({ field: searchField, value: searchTerm }); 
    }, debounceMs);
    
    return () => {
      console.log('🧹 [CustomDataGrid] Limpiando timer anterior');
      clearTimeout(timer);
    };
  }, [searchTerm, searchField, debounceMs]);

  const safePageSizeOptions = useMemo(() => {
    const currentSize = paginationModel?.pageSize ?? pageSizeOptions[0] ?? 10;
    return pageSizeOptions.includes(currentSize) ? pageSizeOptions : [...pageSizeOptions, currentSize].sort((a, b) => a - b);
  }, [pageSizeOptions, paginationModel?.pageSize]);

  const displayRows = isApiSearch ? rows : searchResults;

  if (!isMounted || columns.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary', border: '1px dashed #cbd5e1', borderRadius: '12px' }}>
        <Typography>Cargando configuración de la tabla o columnas no disponibles...</Typography>
      </Box>
    );
  }

  if (loading && displayRows.length === 0) {
    return (
      <Box key="skeleton-view">
        <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center", flexWrap: "wrap" }}>
          <TextField disabled value="" label="Buscar por" size="small" sx={{ minWidth: 150 }} />
          <TextField disabled value="" placeholder="Cargando datos..." size="small" fullWidth sx={{ maxWidth: 500 }}
            InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ color: '#cbd5e1' }} /></InputAdornment>) }}
          />
        </Box>
        <TableSkeleton rows={Math.min(paginationModel?.pageSize || 8, 15)} withSearch={false} />
      </Box>
    );
  }

  const renderStatusMenuItems = () => {
    const items = [<MenuItem key="all" value="">Todos</MenuItem>];
    if (isServiciosModule) {
      items.push(<MenuItem key="activo" value="Activo">Activo</MenuItem>);
      items.push(<MenuItem key="inactivo" value="Inactivo">Inactivo</MenuItem>);
    } else {
      items.push(<MenuItem key="activo" value={TICKET_STATUS.ACTIVO}>ACTIVO</MenuItem>);
      items.push(<MenuItem key="gestion" value={TICKET_STATUS.EN_GESTION}>EN GESTIÓN</MenuItem>);
    }
    return items;
  };

  const baseSx: SxProps<Theme> = {
    borderRadius: "12px",
    border: '1px solid #eaedf1',
    "& .MuiDataGrid-columnHeaders": { backgroundColor: "#080769 !important", color: "#FFFFFF !important", borderBottom: '2px solid #06054a' },
    "& .MuiDataGrid-columnHeader": { backgroundColor: "#080769 !important", color: "#FFFFFF !important", fontWeight: 700 },
    "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 700, color: "#FFFFFF !important" },
    "& .MuiDataGrid-row:hover": { backgroundColor: "#f5f5f5 !important" },
    ...externalSx,
  };

  const renderSearchInput = () => {
    if (isTipoClienteField) {
      return (
        <TextField
          select
          size="small"
          value={searchTerm}
          onChange={(e) => {
            const newValue = e.target.value;
            console.log('📝 [CustomDataGrid] Tipo Cliente seleccionado:', newValue);
            setSearchTerm(newValue);
          }}
          sx={{ minWidth: 200, maxWidth: 500, flex: 1 }}
          label="Filtrar por Tipo de Cliente"
        >
          <MenuItem value="">Todos</MenuItem>
          {tipoClienteOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      );
    }


    if (isOperatorField) {
      const fieldLabel = columns.find(c => c.field === searchField)?.headerName || 'Operador';
      return (
        <TextField
          select
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 200, maxWidth: 500, flex: 1 }}
          label={`Filtrar por ${fieldLabel}`}
        >
          <MenuItem value="">Todos</MenuItem>
          {operatorOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      );
    }

    if (isTipoServicioField) {
      return (
        <TextField select size="small" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ minWidth: 200, flex: 1, maxWidth: 500 }} label="Filtrar por tipo">
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="RBS">RBS</MenuItem>
          <MenuItem value="METROLAN">METROLAN</MenuItem>
          <MenuItem value="DOG">DOG</MenuItem>
          <MenuItem value="REDES COMPARTIDAS">REDES COMPARTIDAS</MenuItem>
        </TextField>
      );
    }

    if (isStatusField) {
      return (
        <TextField select size="small" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ minWidth: 200, maxWidth: 500, flex: 1 }} label="Filtrar por estado">
          {renderStatusMenuItems()}
        </TextField>
      );
    }

    if (isUserStatusField) {
      return (
        <TextField select size="small" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ minWidth: 200, maxWidth: 500, flex: 1 }} label="Filtrar por estado">
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="true">Activo</MenuItem>
          <MenuItem value="false">Inactivo</MenuItem>
        </TextField>
      );
    }
    
    const searchFieldLabel = columns.find(c => c.field === searchField)?.headerName || searchField;
    return (
      <TextField
        fullWidth
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={`Buscar ${searchField === 'nodos' ? 'Nodo (A, B u OLT)' : searchFieldLabel}...`}
        size="small"
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
        sx={{ maxWidth: 500 }}
      />
    );
  };

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center", flexWrap: "wrap" }}>
        <TextField
          select
          value={searchField}
          onChange={(e) => { setSearchField(e.target.value); setSearchTerm(""); }}
          label="Buscar por"
          size="small"
          sx={{ minWidth: 150 }}
        >
          {dropdownOptions.map((col) => (
            <MenuItem key={col.field} value={col.field}>{col.headerName || col.field}</MenuItem>
          ))}
        </TextField>
        {renderSearchInput()}
      </Box>

      <DataGrid
        getRowId={(row) => String(row._id || row.id)}
        rows={displayRows}
        columns={columns}
        loading={loading || isSearching}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        pageSizeOptions={safePageSizeOptions}
        rowCount={paginationMode === 'server' ? (rowCount ?? 0) : undefined}
        paginationMode={paginationMode}
        disableRowSelectionOnClick
        sx={baseSx}
        {...restProps}
      />
    </Box>
  );
}