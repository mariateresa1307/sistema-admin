import {
  DataGrid,
  GridColDef,
  GridToolbarQuickFilter,
  GridRenderCellParams,
  GridRowsProp,
} from "@mui/x-data-grid";
import { useMemo, useState, useEffect, useCallback } from "react";
import { TextField, Box, InputAdornment, Chip, MenuItem } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface props {
  rows: Array<Object>,
  columns: Array<GridColDef>,
  loading: boolean,
}

const CustomDataGrid = (props: props) => {
  const [isMounted, setIsMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState<string>(props.columns[0]?.field || "");
  const [searchResults, setSearchResults] = useState(props.rows);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update searchField if columns change and current field is invalid
  useEffect(() => {
    if (!props.columns.find(col => col.field === searchField)) {
      setSearchField(props.columns[0]?.field || "");
    }
  }, [props.columns, searchField]);

  // Mock API call for backend search
  const mockApiSearch = useCallback(async (field: string, value: string) => {
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/search?field=${field}&value=${value}`);
    // const data = await response.json();
    // return data;
    
    // Mock: simulate API delay and filter on frontend
    return new Promise<any[]>((resolve) => {
      setTimeout(() => {
        const filtered = props.rows.filter((row: any) => {
          const cellValue = String(row[field] || "").toLowerCase();
          return cellValue.includes(value.toLowerCase());
        });
        resolve(filtered);
      }, 300);
    });
  }, [props.rows]);

  // Handle search execution
  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      setSearchResults(props.rows);
      return;
    }

    setIsSearching(true);
    try {
      const results = await mockApiSearch(searchField, searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults(props.rows);
    } finally {
      setIsSearching(false);
    }
  }, [searchTerm, searchField, props.rows, mockApiSearch]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, searchField, handleSearch]);

  const initialState = useMemo(() => ({
    pagination: { paginationModel: { page: 0, pageSize: 10 } },
  }), []);

  if (!isMounted) {
    return null;
  }

  return (
    <Box>
      {/* Custom Search Bar */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center", flexWrap: "wrap" }}>
        <TextField
          select
          value={searchField}
          onChange={(e) => setSearchField(e.target.value)}
          label="Search by"
          size="small"
          sx={{ minWidth: 150 }}
        >
          {props.columns.map((col) => (
            <MenuItem key={col.field} value={col.field}>
              {col.headerName || col.field}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Search in ${props.columns.find(c => c.field === searchField)?.headerName || searchField}...`}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 500 }}
        />
        {searchTerm && (
          <Chip 
            label={`Searching: ${searchTerm}`} 
            onDelete={() => setSearchTerm("")}
            color="primary"
            variant="filled"
          />
        )}
      </Box>

      <DataGrid
        getRowId={(row) => row._id}
        rows={searchResults}
        columns={props.columns}
        loading={props.loading || isSearching}
        showToolbar={false}
        initialState={initialState}
        pageSizeOptions={[10, 25, 50]}
        checkboxSelection={false}
        disableRowSelectionOnClick
        sx={{
          borderRadius: "12px",
          "& .MuiDataGrid-columnHeader": { bgcolor: "primary.main" },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: 700,
            color: "#FFFFFF",
          },
          "& .MuiDataGrid-virtualScroller": {
            overflowX: "hidden !important",
          }
        }}
      />
    </Box>
  );
}

export { CustomDataGrid };
