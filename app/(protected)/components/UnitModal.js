'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';

const UnitModal = ({ open, handleClose, unit }) => {
  if (!unit) return null;

  const additionalFields = {
    'Tipología': unit.tipologia,
    'D/B servicio': `${unit.dormitorio_servicio_cantidad || 0}/${unit.servicios_higenicos_servicio_cantidad || 0}`,
    'Sup. útil m2': unit.superficie_util,
    'Sup. terreno m2': unit.superficie_terreno_mt2,
    'Sup. terraza m2': unit.superficie_terraza,
    'Sup. total m2': unit.superficie_total,
    'Sup. ponderada m2': unit.superficie_ponderada,
    'Acepta mascotas': unit.acepta_mascota ? 'Sí' : 'No',
    'Rol': unit.rol,
    'Centro de costos': unit.centro_costos,
    'Descripción': unit.descripcion
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Detalles de Unidad {unit.nombre}</DialogTitle>
      <DialogContent>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(additionalFields).map(([key, value]) => (
            <div key={key} className="py-2">
              <Typography variant="subtitle2" color="textSecondary">{key}</Typography>
              <Typography>{value || '-'}</Typography>
            </div>
          ))}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UnitModal;