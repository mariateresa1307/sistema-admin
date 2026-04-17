"use client";
import React from "react";
import { Box, Typography, Card, CardContent, CardActionArea, Stack, Avatar,Grid } from "@mui/material";
import  AuditFilters  from "app/admin/Audit Filters";
import { ContainerBox } from "../components/containerBox";
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Person as PersonIcon, 
  ReportProblem as WarningIcon, 
  History as HistoryIcon 
} from "@mui/icons-material";
import { ThemeProvider } from '../context/ThemeContext';

const cardsConfig = [
  {
    id: 1,
    title: 'Ediciones',
    description: 'Registros actualizados',
    icon: EditIcon,
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Azul
  },
  {
    id: 2,
    title: 'Eliminados',
    description: 'Registros borrados',
    icon: DeleteIcon,
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Verde
  },
  {
    id: 3,
    title: 'Usuarios',
    description: 'Actividad de usuarios',
    icon: PersonIcon,
    gradient: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)', // Púrpura/Naranja
  },
  {
    id: 4,
    title: 'Incidentes',
    description: 'Alertas críticas',
    icon: WarningIcon,
    gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', // Amarillo/Naranja
  },
  {
    id: 5,
    title: 'Historial',
    description: 'Logs generales',
    icon: HistoryIcon,
    gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', // Rosa
  },
];

export default function AdminPage() {
  const [selectedCard, setSelectedCard] = React.useState(0);

  return (
    <ContainerBox title="AdminPage" subtitle="Auditoría de Registros">
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {cardsConfig.map((card, index) => {
          const IconComponent = card.icon;
          const isSelected = selectedCard === index;

          return (
            <Grid key={card.id} size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card 
                sx={{ 
                  borderRadius: '16px',
                  boxShadow: isSelected ? '0 8px 20px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.05)',
                  background: card.gradient,
                  transition: 'all 0.3s ease',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  border: isSelected ? 'none' : '1px solid #e0e0e0',
                }}
              >
                <CardActionArea onClick={() => setSelectedCard(index)} sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography 
                          variant="h4" 
                          sx={{ 
                            fontWeight: 800, 
                            color: isSelected ? 'text.secondary' : 'text.primary',
                            lineHeight: 1
                          }}
                        >
                          {index + 5} 
                        </Typography>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontWeight: 700, 
                            color: isSelected ? 'text.secondary' : 'text.secondary',
                            textTransform: 'uppercase',
                            fontSize: '0.7rem',
                            mt: 1
                          }}
                        >
                          {card.title}
                        </Typography>
                      </Box>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.2)', 
                          color: isSelected ? 'white' : 'grey.400' 
                        }}
                      >
                        <IconComponent fontSize="small" />
                      </Avatar>
                    </Stack>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block',
                        mt: 1, 
                        color: isSelected ? 'rgba(255,255,255,0.8)' : 'text.disabled',
                        fontStyle: 'italic'
                      }}
                    >
                      {card.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <AuditFilters/> 
    </ContainerBox>
  );
}