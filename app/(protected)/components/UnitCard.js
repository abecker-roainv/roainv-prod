'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';

const formatCLP = (amount) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP'
  }).format(amount);
};

const ESTADOS = {
  '100': { label: 'Disponible', color: '#4caf50' },
  '200': { label: 'Arrendado', color: '#ff9800' },
  '300': { label: 'Reservado', color: '#2196f3' },
  '400': { label: 'No Disponible', color: '#f44336' }
};

const UnitCard = ({ unit, properties, unitTypes, onViewClick }) => {
  const precioVigente = unit.precios?.find(p => 
    p.tipo === 'unidad_divisa_monto.tipo.vigente' && 
    p.concepto === 'Arriendo'
  )?.monto;

  return (
    <Card sx={{ 
        mb: 5, 
        mx: 1,
        border: '1px solid rgba(0,0,0,0.12)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        '&:hover': {
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        }
      }}>
        <CardContent sx={{ 
          p: 2, 
          '&:last-child': { pb: 2 },
          borderLeft: '4px solid',
          borderLeftColor: ESTADOS[unit.estado]?.color
        }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="subtitle2" sx={{ mr: 1, textTransform: 'uppercase' }}>
                {unit.user}
              </Typography>
              <Chip 
                label={ESTADOS[unit.estado]?.label} 
                size="small"
                sx={{ 
                  height: 20,
                  bgcolor: ESTADOS[unit.estado]?.color,
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            </Box>
            
            <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
              {properties[unit.propiedad_id]?.nombre || 'Sin nombre'}
            </Typography>

            <Box sx={{ display: 'flex', mt: 1, gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {unit.nombre} • {unit.superficie_util}m²
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {unitTypes[unit.unidad_tipo_id]}
              </Typography>
            </Box>

            <Typography variant="h6" sx={{ mt: 1, fontSize: '1.1rem' }}>
              {precioVigente ? formatCLP(precioVigente) : '-'}
            </Typography>
          </Box>

          <IconButton 
            onClick={() => onViewClick(unit)} 
            size="small"
            sx={{ ml: 1 }}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

export default UnitCard;