'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';

const UnitModal = ({ open, handleClose, unit }) => {
  if (!unit) return null;

  const sections = [
    {
      title: 'Información General',
      data: [
        { label: 'Propietario', value: unit.propietarios?.[0]?.nombre },
        { label: 'Precio GGCC', value: unit.precio_ggcc ? `${unit.precio_ggcc.toLocaleString()} CLP` : '-' },
        { label: 'D/B servicio', value: `${unit.dormitorio_servicio_cantidad || 0}/${unit.servicios_higenicos_servicio_cantidad || 0}` }
      ]
    },
    {
      title: 'Superficies',
      data: [
        { label: 'Sup. terreno m²', value: unit.superficie_terreno_mt2 },
        { label: 'Sup. total m²', value: unit.superficie_total },
        { label: 'Sup. ponderada m²', value: unit.superficie_ponderada }
      ]
    },
    {
      title: 'Características',
      data: [
        { label: 'Acepta mascotas', value: unit.acepta_mascota ? 'Sí' : 'No' },
        { label: 'Rol', value: unit.rol },
        { label: 'Centro de costos', value: unit.centro_costos }
      ]
    }
  ];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">
          Detalles de Unidad {unit.nombre}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          {sections.map((section) => (
            <Box key={section.title} sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                {section.title}
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableBody>
                    {section.data.map((row) => (
                      <TableRow key={row.label}>
                        <TableCell 
                          component="th" 
                          scope="row"
                          sx={{ 
                            width: '40%', 
                            backgroundColor: 'grey.50',
                            fontWeight: 500
                          }}
                        >
                          {row.label}
                        </TableCell>
                        <TableCell>{row.value || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ))}
          
          {unit.descripcion && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                Descripción
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {unit.descripcion || '-'}
                </Typography>
              </Paper>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UnitModal;