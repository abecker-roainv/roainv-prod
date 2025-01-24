'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Grid,
  Chip,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

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

const SUB_ESTADOS = {
  '0': 'Inicial',
  '100': 'Por Vencer',
  '200': 'Por Renovar',
  '300': 'Renovado',
  '400': 'Avisado',
  '500': 'En Espera Obra',
  '510': 'En Obra',
  '600': 'Por arrendar',
  '700': 'Por liberar'
};

const InfoRow = ({ label, value }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
    <Typography variant="body2" color="text.secondary">{label}</Typography>
    <Typography variant="body2" sx={{ fontWeight: 500 }}>{value}</Typography>
  </Box>
);

const UnitModal = ({ open, handleClose, unit }) => {
  if (!unit) return null;

  const precioVigente = unit.precios?.find(p => 
    p.tipo === 'unidad_divisa_monto.tipo.vigente' && 
    p.concepto === 'Arriendo'
  )?.monto;

  const precioLista = unit.precio_lista;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" component="div">
            {unit.nombre}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
            Cliente: {unit.user}
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2 }}>
        <Grid container spacing={2}>
          {/* Estado y Precios */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Chip 
                label={ESTADOS[unit.estado]?.label} 
                sx={{ 
                  bgcolor: ESTADOS[unit.estado]?.color,
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {SUB_ESTADOS[unit.sub_estado]}
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary">Precio vigente</Typography>
            <Typography variant="h5" gutterBottom>
              {precioVigente ? formatCLP(precioVigente) : '-'}
            </Typography>
            
            <Typography variant="body2" color="text.secondary">Precio lista</Typography>
            <Typography variant="h6" gutterBottom>
              {precioLista ? formatCLP(precioLista) : '-'}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Información General */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>Detalles de la Unidad</Typography>
            <Box sx={{ '& > *:not(:last-child)': { borderBottom: '1px solid rgba(0,0,0,0.12)' } }}>
              <InfoRow label="Tipo" value={unit.unidad_tipo_id} />
              <InfoRow label="Tipología" value={unit.tipologia || '-'} />
              <InfoRow label="Superficie útil" value={`${unit.superficie_util} m²`} />
              <InfoRow label="Superficie terraza" value={`${unit.superficie_terraza} m²`} />
              <InfoRow label="Orientación" value={unit.orientacion || '-'} />
              <InfoRow label="Piso" value={unit.piso || '-'} />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Precios Adicionales */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>Precios y Fechas</Typography>
            <Box sx={{ '& > *:not(:last-child)': { borderBottom: '1px solid rgba(0,0,0,0.12)' } }}>
              {unit.precios?.map((precio, index) => (
                <InfoRow 
                  key={index}
                  label={precio.concepto} 
                  value={formatCLP(precio.monto)} 
                />
              ))}
              <InfoRow 
                label="Fecha creación" 
                value={new Date(unit.fecha_creacion).toLocaleDateString('es-CL')} 
              />
              {unit.fecha_actualizacion && (
                <InfoRow 
                  label="Última actualización" 
                  value={new Date(unit.fecha_actualizacion).toLocaleDateString('es-CL')} 
                />
              )}
            </Box>
          </Grid>

          {/* Metadata adicional si existe */}
          {unit.metadata && Object.keys(unit.metadata).length > 0 && (
            <>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>Información Adicional</Typography>
                <Box sx={{ '& > *:not(:last-child)': { borderBottom: '1px solid rgba(0,0,0,0.12)' } }}>
                  {Object.entries(unit.metadata).map(([key, value]) => (
                    <InfoRow 
                      key={key}
                      label={key} 
                      value={value?.toString() || '-'} 
                    />
                  ))}
                </Box>
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default UnitModal;