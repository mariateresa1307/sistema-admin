'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, CardActionArea, Stack, Avatar, Grid,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon, Delete as DeleteIcon, Person as PersonIcon,
  ReportProblem as WarningIcon, History as HistoryIcon,
} from '@mui/icons-material';
import AuditFilters from '../admin/auditFilters';
import AuditDetailModal from './auditDetailModal';
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
}

const cardsConfig: CardConfig[] = [
  { id: 'ediciones', title: 'Ediciones', description: 'Registros actualizados', icon: EditIcon, gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', statKey: 'ediciones' },
  { id: 'eliminados', title: 'Eliminados', description: 'Registros borrados', icon: DeleteIcon, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', statKey: 'eliminados' },
  { id: 'usuarios', title: 'Usuarios', description: 'Actividad de usuarios', icon: PersonIcon, gradient: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)', statKey: 'usuarios' },
  { id: 'incidentes', title: 'Incidentes', description: 'Alertas críticas', icon: WarningIcon, gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', statKey: 'incidentes' },
  { id: 'historial', title: 'Historial', description: 'Logs generales', icon: HistoryIcon, gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', statKey: 'historial' },
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
    setSelectedCard(id);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedCard(null);
  }, []);

  return (
    <ContainerBox title="AdminPage" subtitle="Auditoría de Registros">
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
                  boxShadow: isSelected ? '0 8px 20px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.05)',
                  background: card.gradient,
                  transition: 'all 0.3s ease',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  cursor: 'pointer',
                }}
              >
                <CardActionArea onClick={() => handleCardClick(card.id)} sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        {loading ? (
                          <CircularProgress size={32} sx={{ color: 'white' }} />
                        ) : (
                          <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', lineHeight: 1 }}>
                            {count}
                          </Typography>
                        )}
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 700, color: 'white',
                            textTransform: 'uppercase', fontSize: '0.7rem', mt: 1,
                          }}
                        >
                          {card.title}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                        <IconComponent fontSize="small" />
                      </Avatar>
                    </Stack>
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'rgba(255,255,255,0.85)', fontStyle: 'italic' }}>
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

      <AuditDetailModal
        open={!!selectedCard}
        onClose={handleCloseModal}
        actionFilter={selectedCard || undefined}
      />
    </ContainerBox>
  );
}