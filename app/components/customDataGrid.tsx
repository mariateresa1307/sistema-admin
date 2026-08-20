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

export type SelectFieldOption = { value: string; label: string };

interface CustomDataGridProps extends Omit<DataGridProps, 'rows' | 'sx'> {
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
  ...restProps
}: CustomDataGridProps) {

  const columns = Array.isArray(rawColumns)
    ? rawColumns.filter((col): col is GridColDef => Boolean(col) && typeof col === 'object')
    : [];

  useEffect(() => {
    if (!Array.isArray(rawColumns) || rawColumns.length === 0) {
      console.warn("⚠️ [CustomDataGrid] El prop 'columns' está vacío o no es un array.");
    }
  }, [rawColumns]);

  const isServiciosModule = useMemo(() => columns.some(col => col.field === 'tipoServicio'), [columns]);

  const dropdownOptions = useMemo(() => {
    if (!Array.isArray(columns) || columns.length === 0) return [];

    const DEFAULT_EXCLUDED = [
      'gestionarLocalidades',
      'gestionarSubcategorias',
      'acciones',
      'activo',
    ];
    const excluded = new Set([...DEFAULT_EXCLUDED, ...excludeSearchFields]);
    const searchableCols = columns.filter(col => !excluded.has(col.field));
    const caseNumberCol = searchableCols.find(col => col.field === 'caseNumber');
    const otherCols = searchableCols.filter(col => col.field !== 'caseNumber');
    let options = caseNumberCol ? [caseNumberCol, ...otherCols] : searchableCols;


    if (isServiciosModule) {
      if (!options.some(opt => opt.field === 'nodos')) {
        options = [{ field: 'nodos', headerName: 'Nodos' }, ...options];
      }
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
useEffect(() => {
  onSearchRef.current = onSearch;
}, [onSearch]);


  const isUserStatusField = useMemo(() => searchField === 'isActive', [searchField]);
  const isStatusField = useMemo(() => searchField === 'status', [searchField]);
  const isTipoServicioField = useMemo(() => searchField === 'tipoServicio', [searchField]);


  const isSelectSearchField = isUserStatusField || isStatusField || isTipoServicioField;

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    if (isApiSearch || (searchTerm || isSelectSearchField)) return;
    setSearchResults(rows);
  }, [rows, searchTerm, isApiSearch, isSelectSearchField]);

  const mockApiSearch = useCallback(async (field: string, value: string) => {
    return new Promise<any[]>((resolve) => {
      setTimeout(() => {
        if (!value) { resolve(rows); return; }
        const filtered = rows.filter((row: any) => {
          if (field === 'isActive') return String(row[field]) === value;
          if (field === 'tipoServicio' || field === 'status') return row[field] === value;
          return String(row[field] || "").toLowerCase().includes(value.toLowerCase());
        });
        resolve(filtered);
      }, debounceMs);
    });
  }, [rows, debounceMs]);

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

useEffect(() => {
  if (!onSearchRef.current) return;
  if (skipInitialSearch.current) { 
    skipInitialSearch.current = false; 
    return; 
  }
  const timer = setTimeout(() => { 
    onSearchRef.current?.({ field: searchField, value: searchTerm }); 
  }, debounceMs);
  return () => clearTimeout(timer);
}, [searchTerm, searchField, debounceMs]); //

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
        <Box key="grid-view" sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center", flexWrap: "wrap" }}>
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
      items.push(<MenuItem key="gestion" value={TICKET_STATUS.EN_GESTION}>EN GESTIÓN</MenuItem>);
      items.push(<MenuItem key="activo" value={TICKET_STATUS.ACTIVO}>ACTIVO</MenuItem>);
      items.push(<MenuItem key="cerrado" value={TICKET_STATUS.CERRADO}>CERRADO</MenuItem>);
    }
    return items;
  };

  const baseSx: SxProps<Theme> = {
    borderRadius: "12px",
    border: '1px solid #eaedf1',
    "& .MuiDataGrid-columnHeaders": {
      backgroundColor: "#080769 !important",
      color: "#FFFFFF !important",
      borderBottom: '2px solid #06054a',
    },
    "& .MuiDataGrid-columnHeader": {
      backgroundColor: "#080769 !important",
      color: "#FFFFFF !important",
      fontWeight: 700,
    },
    "& .MuiDataGrid-columnHeaderTitle": {
      fontWeight: 700,
      color: "#FFFFFF !important",
    },
    "& .MuiDataGrid-row:hover": {
      backgroundColor: "#f5f5f5 !important",
    },
    ...externalSx,
  };

  const renderSearchInput = () => {
    if (isTipoServicioField) {
      return (
        <TextField
          select
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 200, flex: 1, maxWidth: 500 }}
          label="Filtrar por tipo"
        >
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
        <TextField
          select
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 200, maxWidth: 500, flex: 1 }}
          label="Filtrar por estado"
        >
          {renderStatusMenuItems()}
        </TextField>
      );
    }

    if (isUserStatusField) {
      return (
        <TextField
          select
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 200, maxWidth: 500, flex: 1 }}
          label="Filtrar por estado"
        >
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