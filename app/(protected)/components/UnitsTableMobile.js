'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Drawer,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  CircularProgress,
  Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import UnitCard from './UnitCard';
import UnitModal from './UnitModal';

const ESTADOS = {
  '100': { label: 'Disponible', color: '#4caf50' },
  '200': { label: 'Arrendado', color: '#ff9800' },
  '300': { label: 'Reservado', color: '#2196f3' },
  '400': { label: 'No Disponible', color: '#f44336' }
};

function UnitsTableMobile() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [properties, setProperties] = useState({});
  const [unitTypes, setUnitTypes] = useState({});
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('100');
  const [selectedType, setSelectedType] = useState('');
  const [selectedTypology, setSelectedTypology] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const deptTypeId = useMemo(() => {
    return Object.entries(unitTypes).find(([id, nombre]) => 
      nombre.toLowerCase().includes('departamento')
    )?.[0] || '';
  }, [unitTypes]);

  useEffect(() => {
    if (deptTypeId && !selectedType) {
      setSelectedType(deptTypeId);
    }
  }, [deptTypeId]);

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        setError(null);
        const users = ['birent', 'amplo', 'principal'];
        let allUnits = [];
        let allProperties = {};
        let allUnitTypes = {};

        for (const user of users) {
          setLoadingMessage(`Cargando ${user}...`);
          const response = await fetch(`/api/units?user=${user}`);
          if (!response.ok) throw new Error(`Error cargando datos de ${user}`);
          const result = await response.json();
          
          allUnits = [...allUnits, ...(result.units || []).map(unit => ({ ...unit, user }))];
          allProperties = { ...allProperties, ...result.properties };
          if (!allUnitTypes.length) allUnitTypes = result.unitTypes;
        }

        setProperties(allProperties);
        setData(allUnits);
        setUnitTypes(allUnitTypes);
      } catch (err) {
        setError(err.message);
        console.error('Error:', err);
      } finally {
        setLoading(false);
        setLoadingMessage('');
      }
    };
    loadAllData();
  }, []);

  const stats = useMemo(() => {
    const departamentos = deptTypeId ? data.filter(unit => unit.unidad_tipo_id === deptTypeId) : [];
    const arrendados = departamentos.filter(unit => unit.estado === '200').length;
    const disponibles = departamentos.filter(unit => unit.estado === '100').length;
    const totalDepts = departamentos.length;

    return {
      totalDepts,
      disponibles,
      arrendados,
      porcentajeDisponible: totalDepts ? ((disponibles / totalDepts) * 100).toFixed(1) : "0.0",
      porcentajeArrendado: totalDepts ? ((arrendados / totalDepts) * 100).toFixed(1) : "0.0"
    };
  }, [data, deptTypeId]);

  const filteredData = useMemo(() => {
    let filtered = data;

    if (searchTerm) {
      filtered = filtered.filter(unit => {
        const searchFields = [
          properties[unit.propiedad_id]?.nombre,
          properties[unit.propiedad_id]?.comuna,
          unit.nombre,
          unitTypes[unit.unidad_tipo_id],
          unit.tipologia,
          unit.orientacion
        ];
        return searchFields.some(field => 
          field?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    if (selectedUser) {
      filtered = filtered.filter(unit => unit.user === selectedUser);
    }

    if (selectedStatus) {
      filtered = filtered.filter(unit => unit.estado === selectedStatus);
    }

    if (selectedType) {
      filtered = filtered.filter(unit => unit.unidad_tipo_id === selectedType);
    }

    if (selectedTypology) {
      filtered = filtered.filter(unit => unit.tipologia === selectedTypology);
    }

    return filtered;
  }, [data, searchTerm, selectedStatus, selectedType, selectedTypology, selectedUser, properties, unitTypes]);

  const handleViewClick = (unit) => {
    setSelectedUnit(unit);
    setModalOpen(true);
  };

  const Row = ({ index, style }) => {
    const unit = filteredData[index];
    if (!unit) return null;
    
    return (
      <div style={style}>
        <UnitCard
          unit={unit}
          properties={properties}
          unitTypes={unitTypes}
          onViewClick={handleViewClick}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', gap: 2 }}>
        <CircularProgress />
        <Typography>{loadingMessage}</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ color: 'error.main', mb: 2 }}>Error: {error}</Box>
    );
  }

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      {/* Stats Cards */}
      <Box sx={{ p: 2, display: 'flex', gap: 2, overflowX: 'auto' }}>
        <Paper sx={{ p: 2, minWidth: '150px', bgcolor: '#f8fafc', borderLeft: '4px solid #64748b' }}>
          <Typography variant="subtitle2" color="text.secondary">
            Deptos Totales
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            {stats.totalDepts}
          </Typography>
        </Paper>

        <Paper sx={{ p: 2, minWidth: '150px', bgcolor: '#fff7ed', borderLeft: '4px solid #f97316' }}>
          <Typography variant="subtitle2" color="#ea580c">
            Arrendados
          </Typography>
          <Typography variant="h5" fontWeight="bold" color="#ea580c">
            {stats.arrendados}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {stats.porcentajeArrendado}%
          </Typography>
        </Paper>

        <Paper sx={{ p: 2, minWidth: '150px', bgcolor: '#f0fdf4', borderLeft: '4px solid #22c55e' }}>
          <Typography variant="subtitle2" color="#16a34a">
            Disponibles
          </Typography>
          <Typography variant="h5" fontWeight="bold" color="#16a34a">
            {stats.disponibles}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {stats.porcentajeDisponible}%
          </Typography>
        </Paper>
      </Box>

      {/* Search and Filter Bar */}
      <Box sx={{ px: 2, py: 1, position: 'sticky', top: 0, zIndex: 1, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <IconButton onClick={() => setFilterDrawerOpen(true)}>
            <FilterListIcon />
          </IconButton>
        </Box>

        {/* Quick Filters */}
        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
          {Object.entries(ESTADOS).map(([value, { label, color }]) => (
            <Chip
              key={value}
              label={label}
              size="small"
              onClick={() => setSelectedStatus(value)}
              sx={{
                bgcolor: selectedStatus === value ? color : 'transparent',
                color: selectedStatus === value ? 'white' : 'inherit',
                borderColor: color,
                border: 1
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Virtualized List */}
      <Box sx={{ flex: 1 }}>
        <AutoSizer>
          {({ height, width }) => (
            <FixedSizeList
              height={height}
              width={width}
              itemCount={filteredData.length}
              itemSize={120}
            >
              {Row}
            </FixedSizeList>
          )}
        </AutoSizer>
      </Box>

      {/* Filters Drawer */}
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
      >
        <Box sx={{ width: 280, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Filtros</Typography>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Cliente</InputLabel>
            <Select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              label="Cliente"
            >
              <MenuItem value="">Todos los clientes</MenuItem>
              <MenuItem value="birent">Birent</MenuItem>
              <MenuItem value="amplo">Amplo</MenuItem>
              <MenuItem value="principal">Principal</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              label="Tipo"
            >
              <MenuItem value="">Todos los tipos</MenuItem>
              {Object.entries(unitTypes).map(([id, nombre]) => (
                <MenuItem key={id} value={id}>{nombre}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Tipología</InputLabel>
            <Select
              value={selectedTypology}
              onChange={(e) => setSelectedTypology(e.target.value)}
              label="Tipología"
            >
              <MenuItem value="">Todas las tipologías</MenuItem>
              {Array.from(new Set(data.map(unit => unit.tipologia)))
                .filter(tipo => tipo)
                .map(tipo => (
                  <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
                ))
              }
            </Select>
          </FormControl>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Mostrando {filteredData.length} de {data.length} unidades
            </Typography>
          </Box>
        </Box>
      </Drawer>

      <UnitModal
        open={modalOpen}
        handleClose={() => setModalOpen(false)}
        unit={selectedUnit}
      />
    </Box>
  );
}

export default UnitsTableMobile;