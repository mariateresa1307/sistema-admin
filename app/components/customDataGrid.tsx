'use client';
import {
  DataGrid,
  GridColDef,
  DataGridProps,
} from "@mui/x-data-grid";
import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { TextField, Box, InputAdornment, MenuItem } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { TICKET_STATUS } from "app/utils/constants";

export type SearchParams = {
  field: string;
  value: string;
};

interface CustomDataGridProps extends Omit<DataGridProps, 'rows'> {
  rows: Array<any>;
  columns: Array<GridColDef>;
 // loading?: boolean;
  onSearch?: (params: SearchParams) => void;
  debounceMs?: number;
  paginationModel?: { page: number; pageSize: number };
  onPaginationModelChange?: (model: { page: number; pageSize: number }) => void;
  pageSizeOptions?: number[];
  rowCount?: number;
  paginationMode?: 'client' | 'server';
}

const CustomDataGrid = ({
  rows,
  columns,
 // loading,
  onSearch,
  debounceMs = 400,
  paginationModel,
  onPaginationModelChange,
  pageSizeOptions = [10, 50, 100],
  rowCount,
  paginationMode = 'server',
  ...restProps
}: CustomDataGridProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [searchField, setSearchField] = useState<string>(
    columns.find(col => col.field === 'name') ? 'name' : (columns[0]?.field || "")
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState(rows);
  const [isSearching, setIsSearching] = useState(false);
  const isApiSearch = Boolean(onSearch);
  const skipInitialSearch = useRef(true);

  const isUserStatusField = useMemo(() => searchField === 'isActive', [searchField]);
  const isTicketStatusField = useMemo(() => searchField === 'status', [searchField]);
  const isTipoServicioField = useMemo(() => searchField === 'tipoServicio', [searchField]);
  const isSelectSearchField = isUserStatusField || isTicketStatusField || isTipoServicioField;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isApiSearch || (searchTerm || isSelectSearchField)) return;
    setSearchResults(rows);
  }, [rows, searchTerm, isApiSearch, isSelectSearchField]);

  const mockApiSearch = useCallback(async (field: string, value: string) => {
    return new Promise<any[]>((resolve) => {
      setTimeout(() => {
        if (!value) {
          resolve(rows);
          return;
        }
        const filtered = rows.filter((row: any) => {
          if (field === 'isActive') return String(row[field]) === value;
          if (field === 'tipoServicio') return row[field] === value;
          if (field === 'status') return row[field] === value;
          const cellValue = String(row[field] || "").toLowerCase();
          return cellValue.includes(value.toLowerCase());
        });
        resolve(filtered);
      }, debounceMs);
    });
  }, [rows, debounceMs]);

  const handleSearch = useCallback(async () => {
    setIsSearching(true);
    try {
      const results = await mockApiSearch(searchField, searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults(rows);
    } finally {
      setIsSearching(false);
    }
  }, [searchTerm, searchField, rows, mockApiSearch]);

  useEffect(() => {
    if (isApiSearch) return;
    const timer = setTimeout(() => { handleSearch(); }, debounceMs);
    return () => clearTimeout(timer);
  }, [searchTerm, searchField, handleSearch, isApiSearch, debounceMs]);

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

     if (pageSizeOptions.includes(currentSize)) {
      return pageSizeOptions;
    }
    return [...pageSizeOptions, currentSize].sort((a, b) => a - b);
  }, [pageSizeOptions, paginationModel?.pageSize]);

  const displayRows = isApiSearch ? rows : searchResults;

  if (!isMounted) return null;

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center", flexWrap: "wrap" }}>
        <TextField
          select
          value={searchField}
          onChange={(e) => {
            setSearchField(e.target.value);
            setSearchTerm("");
          }}
          label="Buscar por"
          size="small"
          sx={{ minWidth: 150 }}
        >
          {columns.map((col) => (
            <MenuItem key={col.field} value={col.field}>
              {col.headerName || col.field}
            </MenuItem>
          ))}
        </TextField>

        {isTipoServicioField ? (
          <TextField select size="small" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ minWidth: 200, flex: 1, maxWidth: 500 }} label="Filtrar por tipo">
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="RBS">RBS</MenuItem>
            <MenuItem value="METROLAN">METROLAN</MenuItem>
            <MenuItem value="IU">IU</MenuItem>
            <MenuItem value="DOG">DOG</MenuItem>
          </TextField>
        ) : isTicketStatusField ? (
          <TextField select size="small" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ minWidth: 200, maxWidth: 500, flex: 1 }} label="Filtrar por estado">
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value={TICKET_STATUS.EN_GESTION}>EN GESTIÓN</MenuItem>
            <MenuItem value={TICKET_STATUS.ACTIVO}>ACTIVO</MenuItem>
            <MenuItem value={TICKET_STATUS.CERRADO}>CERRADO</MenuItem>
          </TextField>
        ) : isUserStatusField ? (
          <TextField select size="small" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ minWidth: 200, maxWidth: 500, flex: 1 }} label="Filtrar por estado">
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
        getRowId={(row) => row._id || row.id}
        rows={displayRows}
        columns={columns}
       // loading={loading || isSearching}
        
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        pageSizeOptions={safePageSizeOptions}
        rowCount={rowCount ?? 0} // ✅ Garantiza que sea un número, nunca undefined
        paginationMode={paginationMode}
        
        disableRowSelectionOnClick
        sx={{
          borderRadius: "12px",
          border: '1px solid #eaedf1',
          "& .MuiDataGrid-columnHeaders": { backgroundColor: "rgb(8, 7, 105)" },
          "& .MuiDataGrid-columnHeader": { backgroundColor: "rgb(8, 7, 105)", color: "#FFFFFF !important" },
          "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 700, color: "#FFFFFF !important" },
        }}
        {...restProps}
      />
    </Box>
  );
}

export { CustomDataGrid };