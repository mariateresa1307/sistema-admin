"use client";
import { CustomDataGrid } from "app/components/customDataGrid";
import { Box, Divider, Typography } from "@mui/material";
import { useTheme } from "../context/ThemeContext";

interface Props {
  title: string;
  subtitle?: string | undefined,
  children: React.ReactNode;
}
export const ContainerBox = (props: Props) => {
  const { isDark } = useTheme();

  return (
    <>
      <Typography variant="h4" sx={{ fontWeight: 800, color: isDark ? "contrast.main" : "primary.main" }}>
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
    </>
  );
};


