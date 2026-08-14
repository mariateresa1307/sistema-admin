"use client";
import React, { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import GroupIcon from '@mui/icons-material/Group';
import WifiIcon from '@mui/icons-material/Wifi';
import { ContainerBox } from "../components/containerBox";
import { AllUsersTab } from "./components/allUsersTab";
import { OnlineUsersTab } from "./components/onlineUsersTab";

export default function UsuariosPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <ContainerBox
      title="Gestión de Usuarios"
      subtitle="Administración centralizada de accesos Netuno"
    >
      {/* ✅ Tabs de navegación */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.95rem' },
            '& .MuiTabs-indicator': { bgcolor: '#080769', height: 3 },
          }}
        >
          <Tab icon={<GroupIcon />} iconPosition="start" label="Todos los Usuarios" />
          <Tab icon={<WifiIcon />} iconPosition="start" label="Usuarios en Línea" />
        </Tabs>
      </Box>

      {/* ✅ Renderizado condicional: solo monta el tab activo */}
      {activeTab === 0 && <AllUsersTab />}
      {activeTab === 1 && <OnlineUsersTab />}
    </ContainerBox>
  );
}