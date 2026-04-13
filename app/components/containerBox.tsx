"use client";
import { CustomDataGrid } from "app/components/customDataGrid";
import DashboardLayout from "../components/DashboardLayout";
import { Box, Divider, Typography } from "@mui/material";

interface Props {
  title: string;
  subtitle?: string | undefined,
  children: React.ReactNode;
}
const ContainerBox = (props: Props) => {
  return (
    <>
      <DashboardLayout>
        <Typography variant="h4" sx={{ fontWeight: 800, color: "primary.main" }}>
          {props.title}
        </Typography>
        { props.subtitle ?? <Typography variant="body2" sx={{ color: "primary.text" }}>{props.subtitle}</Typography> }

         <Divider sx={{ mb: 3, mt: 2 }} />

        <Box
          sx={{
            backgroundColor: "background.paper",
            borderRadius: 3,
            p: { xs: 2, md: 4 },
            marginTop: 3,
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            minHeight: "70vh",
          }}
        >
         
          
          {props.children}
        </Box>
      </DashboardLayout>
    </>
  );
};


export { ContainerBox }