'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {  Box, Typography, Card, CardContent, CardActionArea, Stack, Avatar, Grid,
  CircularProgress,} from '@mui/material';
import {  Edit as EditIcon, Delete as DeleteIcon, Person as PersonIcon,  
  ReportProblem as WarningIcon, History as HistoryIcon,} from '@mui/icons-material';
import AuditFilters from './auditFilters';
import { ContainerBox } from '../components/containerBox';
import { getAuditStats } from '@/lib/api';
import { AuditStats } from '@/lib/types/audit';

interface CardConfig {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  statKey: keyof AuditStats;
  actionFilter?: string; 
}

const cardsConfig: CardConfig[] = [
  { 
    id: 'ediciones', 
    title: 'Ediciones', 
    description: 'Registros actualizados', 
    icon: EditIcon, 
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
    statKey: 'ediciones',
    actionFilter: 'UPDATE'
  },
  { 
    id: 'eliminados', 
    title: 'Eliminados', 
    description: 'Registros borrados', 
    icon: DeleteIcon, 
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', 
    statKey: 'eliminados',
    actionFilter: 'DELETE'
  },
  { 
    id: 'usuarios', 
    title: 'Usuarios', 
    description: 'Actividad de usuarios', 
    icon: PersonIcon, 
    gradient: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)', 
    statKey: 'usuarios',
    actionFilter: 'LOGIN'
  },
  { 
    id: 'incidentes', 
    title: 'Incidentes', 
    description: 'Alertas críticas', 
    icon: WarningIcon, 
    gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', 
    statKey: 'incidentes',
    actionFilter: 'LOGIN_FAILED'
  },
  { 
    id: 'historial', 
    title: 'Historial', 
    description: 'Logs generales', 
    icon: HistoryIcon, 
    gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', 
    statKey: 'historial',
    actionFilter: 'CREATE'
  },
];

export default function AdminPage() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAuditStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleCardClick = useCallback((id: string) => {
    setSelectedCard((prev) => (prev === id ? null : id));
    
    const card = cardsConfig.find((c) => c.id === id);
    if (card?.actionFilter) {
      window.dispatchEvent(new CustomEvent('audit-filter-action', {
        detail: { action: card.actionFilter }
      }));
    }
  }, []);

  return (
    <ContainerBox title="AdminPage" subtitle="Auditoría de Registros">
      {/* Cards de estadísticas */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {cardsConfig.map((card) => {
          const IconComponent = card.icon;
          const isSelected = selectedCard === card.id;
          const count = stats?.[card.statKey] ?? 0;

          return (
            <Grid key={card.id} size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card
                sx={{
                  borderRadius: '16px',
                  boxShadow: isSelected 
                    ? '0 8px 20px rgba(0,0,0,0.25), 0 0 0 3px rgba(8,7,105,0.3)' 
                    : '0 4px 12px rgba(0,0,0,0.05)',
                  background: card.gradient,
                  transition: 'all 0.3s ease',
                  transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <CardActionArea onClick={() => handleCardClick(card.id)} sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        {loading ? (
                          <CircularProgress size={32} sx={{ color: 'white' }} />
                        ) : (
                          <Typography 
                            variant="h4" 
                            sx={{ 
                              fontWeight: 800, 
                              color: 'white', 
                              lineHeight: 1,
                              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            }}
                          >
                            {count}
                          </Typography>
                        )}
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 700, 
                            color: 'white',
                            textTransform: 'uppercase', 
                            fontSize: '0.7rem', 
                            mt: 1,
                            textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                          }}
                        >
                          {card.title}
                        </Typography>
                      </Box>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.25)', 
                          color: 'white',
                          backdropFilter: 'blur(10px)',
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
                        color: 'rgba(255,255,255,0.9)', 
                        fontStyle: 'italic',
                        fontSize: '0.7rem',
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

      <AuditFilters />
    </ContainerBox>
  );
}