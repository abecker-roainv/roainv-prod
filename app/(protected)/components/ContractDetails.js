import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Button,
  Typography,
  Box,
  Chip,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ContractDetails = ({ contract, contactsMap, open, onClose }) => {
  const formatCurrency = (amount, currency = 'Peso') => {
    const currencyMap = {
      'Peso': 'CLP',
      'Dólar': 'USD',
      'Euro': 'EUR'
    };

    const currencyCode = currencyMap[currency] || 'CLP';

    return new Intl.NumberFormat('es-CL', { 
      style: 'currency', 
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getUnidadNombre = (unidad) => {
    const cargoConNombre = unidad.cargos.find(cargo => 
      cargo.nombre.includes('Departamento') || 
      cargo.nombre.includes('Bodega')
    );
  
    if (cargoConNombre) {
      return cargoConNombre.nombre;
    }
    
    return 'Unidad Sin Nombre';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const getEstadoLabel = (estadoId) => {
    const estados = {
      '300': 'Activo',
      '201': 'Pendiente'
    };
    return estados[estadoId] || estadoId;
  };

  if (!contract) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" component="span">
              Contrato {contract.folio}
            </Typography>
            <Chip 
              label={getEstadoLabel(contract.estado_id)}
              color={contract.estado_id === 300 ? "success" : "default"}
              size="small"
            />
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pb: 2 }}>
        <Grid container spacing={4} sx={{ mb: 3 }}>
          <Grid item xs={3}>
            <Typography variant="body2" color="text.secondary">Ejecutivo</Typography>
            <Typography>{contract.ejecutivo}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body2" color="text.secondary">Fecha Inicio</Typography>
            <Typography>{formatDate(contract.fecha_inicio)}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body2" color="text.secondary">Fecha Fin</Typography>
            <Typography>{formatDate(contract.fecha_fin)}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body2" color="text.secondary">Divisa de Cobro</Typography>
            <Typography>{contract.divisa_cobro}</Typography>
          </Grid>
        </Grid>

        {contract.unidades.map((unidad, index) => (
          <Box key={index} sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {getUnidadNombre(unidad)}
            </Typography>

            {/* Tabla de Participantes */}
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Participantes</Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Datos de Contacto</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tipo de Participante</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contract.participantes.map((participante) => {
                    const contactInfo = contactsMap[participante.contacto_id];
                    return (
                      <TableRow key={participante.contacto_id}>
                        <TableCell>
                          <Typography>
                            {participante.contrato_contacto_tipo}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {contactInfo ? (
                            <>
                              <Typography variant="body2">
                                {contactInfo.nombre} {contactInfo.apellido}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                {contactInfo.email || 'Sin email'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                {contactInfo.telefono || 'Sin teléfono'}
                              </Typography>
                              {contactInfo.identificador && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  RUT: {contactInfo.identificador}
                                </Typography>
                              )}
                            </>
                          ) : (
                            <CircularProgress size={20} />
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip 
                              size="small" 
                              label={participante.es_titular ? "Titular" : "No Titular"}
                              color={participante.es_titular ? "primary" : "default"}
                            />
                            <Chip 
                              size="small" 
                              label={participante.es_firmante ? "Firmante" : "No Firmante"}
                              color={participante.es_firmante ? "success" : "default"}
                            />
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Tabla de Gastos */}
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Gastos Asociados</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Concepto</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Monto</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Periodo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {unidad.cargos.map((cargo, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{cargo.nombre}</TableCell>
                      <TableCell>{formatDate(contract.fecha)}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(cargo.monto, cargo.divisa)}
                      </TableCell>
                      <TableCell>
                        {`${formatDate(contract.fecha_inicio)} - ${formatDate(contract.fecha_fin)}`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))}
      </DialogContent>
    </Dialog>
  );
};

export default ContractDetails;