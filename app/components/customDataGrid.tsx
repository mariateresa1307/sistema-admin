'use client';
import { DataGrid, GridColDef, DataGridProps } from "@mui/x-data-grid";
import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { SxProps } from "@mui/system";
import { Theme } from "@mui/material/styles";
import { TextField, Box, InputAdornment, MenuItem, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { TICKET_STATUS } from "app/utils/constants";

export type SearchParams = { field: string; value: string };

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

  // ✅ CREAR ARRAY ORDENADO SOLO PARA EL DROPDOWN (Ticket primero)
  const dropdownOptions = useMemo(() => {
    if (!Array.isArray(columns) || columns.length === 0) return [];
    
    const caseNumberCol = columns.find(col => col.field === 'caseNumber');
    const otherCols = columns.filter(col => col.field !== 'caseNumber');
    
    // Si existe caseNumber, la ponemos primera en el dropdown, luego el resto
    return caseNumberCol ? [caseNumberCol, ...otherCols] : columns;
  }, [columns]);

  const [isMounted, setIsMounted] = useState(false);
  const [searchField, setSearchField] = useState<string>(
    columns.find(col => col.field === 'caseNumber')?.field || 
    columns.find(col => col.field === 'name')?.field || 
    columns[0]?.field || ""
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState(rows);
  const [isSearching, setIsSearching] = useState(false);
  
  const isApiSearch = Boolean(onSearch);
  const skipInitialSearch = useRef(true);

  const isServiciosModule = useMemo(() => columns.some(col => col.field === 'tipoServicio'), [columns]);
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

  //  Envío al servidor (Padre)
  useEffect(() => {
    if (!onSearch) return;
    if (skipInitialSearch.current) { 
      skipInitialSearch.current = false; 
      return; 
    }
    const timer = setTimeout(() => { 
      onSearch({ field: searchField, value: searchTerm }); 
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [searchTerm, searchField, onSearch, debounceMs]);

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
          {/* ✅ USAR dropdownOptions (con Ticket primero) SOLO en el dropdown */}
          {dropdownOptions.map((col) => (
            <MenuItem key={col.field} value={col.field}>{col.headerName || col.field}</MenuItem>
          ))}
        </TextField>

        {isTipoServicioField ? (
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
        ) : isStatusField ? (
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
        ) : isUserStatusField ? (
          <TextField 
            select 
            size="small" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            sx={{ minWidth: 200, maxWidth: 500, flex: 1 }} 
            label="Filtrar por estado"
          >
            <MenuItem value="true">Activo</MenuItem>
            <MenuItem value="false">Inactivo</MenuItem>
          </TextField>
        ) : (
          <TextField
            fullWidth 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Buscar ${searchField}...`} 
            size="small"
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            sx={{ maxWidth: 500 }}
          />
        )}
      </Box>

      <DataGrid
        getRowId={(row) => String(row._id || row.id)}
        rows={displayRows}
        columns={columns} // ✅ La tabla usa columns ORIGINAL (sin reordenar)
        loading={loading || isSearching}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        pageSizeOptions={safePageSizeOptions}
        rowCount={rowCount ?? 0}
        paginationMode={paginationMode}
        disableRowSelectionOnClick
        sx={baseSx}
        {...restProps}
      />
    </Box>
  );
}