import {
  DataGrid,
  GridColDef,
  GridToolbar,
  GridRenderCellParams,
  GridRowsProp,
} from "@mui/x-data-grid";

interface props {
  rows: Array<Object>,
  columns: Array<GridColDef>,
  loading: boolean,

}
const CustomDataGrid = (props: props) => {
  return (
    <DataGrid
      rows={props.rows}
      columns={props.columns}
      loading={props.loading}
      showToolbar={true}
      initialState={{
        pagination: { paginationModel: { page: 0, pageSize: 10 } },
      }}

      pageSizeOptions={[10, 25, 50]}
      checkboxSelection
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
  );
}


export { CustomDataGrid };
