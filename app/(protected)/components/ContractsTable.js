"use client";
import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Button,
  CircularProgress,
  Alert,
  Typography,
  Box,
  Chip,
  TextField,
  InputAdornment,
  Collapse,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import {
  Person as PersonIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import ContractDetails from './ContractDetails';

const FiltersSection = ({ filters, onFilterChange, onClearFilters }) => {
  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Buscar"
            variant="outlined"
            size="small"
            value={filters.searchTerm}
            onChange={(e) => onFilterChange('searchTerm', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Estado</InputLabel>
            <Select
              value={filters.estado || ''}
              label="Estado"
              onChange={(e) => onFilterChange('estado', e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="300">Activo</MenuItem>
              <MenuItem value="201">Pendiente</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Ejecutivo</InputLabel>
            <Select
              value={filters.ejecutivo || ''}
              label="Ejecutivo"
              onChange={(e) => onFilterChange('ejecutivo', e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="Mariana Romero">Mariana Romero</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            type="date"
            label="Fecha desde"
            variant="outlined"
            size="small"
            value={filters.fechaDesde || ''}
            onChange={(e) => onFilterChange('fechaDesde', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={onClearFilters}
            fullWidth
          >
            Limpiar
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

const ContractsTable = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedContract, setSelectedContract] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [contactsMap, setContactsMap] = useState({});
  const [filters, setFilters] = useState({
    searchTerm: '',
    estado: '',
    ejecutivo: '',
    fechaDesde: ''
  });
  const [orderBy, setOrderBy] = useState('fecha');
  const [order, setOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(true);
  const contactsCache = useRef(new Map());

  const getToken = async () => {
    try {
      const response = await fetch('https://api.beta.pop.estate/api/estadisticas/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'birent_api_integracion',
          password: '9890dd76154659e5b97c82958c9addd9'
        }),
      });

      if (!response.ok) throw new Error('Error en la autenticación');
      const data = await response.json();
      return data.token;
    } catch (err) {
      setError(`Error al obtener el token: ${err.message}`);
      return null;
    }
  };

  const fetchAllContracts = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(
        'https://api.beta.pop.estate/api/estadisticas/contratos?limit=9999',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Error al obtener contratos');
      
      const result = await response.json();
      if (!result?.data?.contratos) {
        throw new Error('Estructura de datos inválida en la respuesta');
      }
      
      setContracts(result.data.contratos);
      setError(null);
    } catch (err) {
      setError(`Error al cargar los contratos: ${err.message}`);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async (token, contactIds) => {
    try {
      const uniqueIds = [...new Set(contactIds)].filter(id => !contactsCache.current.has(id));
      const newContactsData = { ...Object.fromEntries(contactsCache.current) };

      for (const id of uniqueIds) {
        const response = await fetch(
          `https://api.beta.pop.estate/api/estadisticas/contactos?filter[contacto_id]=${id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const result = await response.json();
          if (result.data.contactos && result.data.contactos.length > 0) {
            newContactsData[id] = result.data.contactos[0];
            contactsCache.current.set(id, result.data.contactos[0]);
          }
        }
      }

      setContactsMap(newContactsData);
    } catch (err) {
      console.error('Error al obtener contactos:', err);
    }
  };

  useEffect(() => {
    fetchAllContracts();
  }, []);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setPage(0);
  };

  const handleClearFilters = () => {
    setFilters({
      searchTerm: '',
      estado: '',
      ejecutivo: '',
      fechaDesde: ''
    });
    setPage(0);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleOpenDetails = async (contract) => {
    setSelectedContract(contract);
    setDialogOpen(true);
    
    const token = await getToken();
    if (token) {
      const contactIds = contract.participantes.map(p => p.contacto_id);
      await fetchContacts(token, contactIds);
    }
  };

  const handleCloseDetails = () => {
    setDialogOpen(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const filteredAndSortedContracts = useMemo(() => {
    return contracts
      .filter(contract => {
        const matchesSearch = filters.searchTerm === '' || 
          Object.values(contract).some(value => 
            String(value).toLowerCase().includes(filters.searchTerm.toLowerCase())
          );

        const matchesEstado = filters.estado === '' || 
          String(contract.estado_id) === filters.estado;

        const matchesEjecutivo = filters.ejecutivo === '' || 
          contract.ejecutivo === filters.ejecutivo;

        const matchesFechaDesde = !filters.fechaDesde || 
          new Date(contract.fecha) >= new Date(filters.fechaDesde);

        return matchesSearch && matchesEstado && matchesEjecutivo && matchesFechaDesde;
      })
      .sort((a, b) => {
        const aValue = a[orderBy];
        const bValue = b[orderBy];

        if (!aValue || !bValue) return 0;

        let comparison = 0;
        if (typeof aValue === 'string') {
          comparison = aValue.localeCompare(bValue);
        } else {
          comparison = aValue - bValue;
        }

        return order === 'desc' ? -comparison : comparison;
      });
  }, [contracts, filters, orderBy, order]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const TableSortCell = ({ id, label }) => (
    <TableCell sortDirection={orderBy === id ? order : false}>
      <TableSortLabel
        active={orderBy === id}
        direction={orderBy === id ? order : 'asc'}
        onClick={() => handleRequestSort(id)}
      >
        {label}
      </TableSortLabel>
    </TableCell>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Listado de Contratos
        </Typography>
        <Button
          startIcon={<FilterListIcon />}
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
        </Button>
      </Box>

      <Collapse in={showFilters}>
        <FiltersSection
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
      </Collapse>

      <Divider />

      <TableContainer sx={{ maxHeight: 640 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableSortCell id="folio" label="Folio" />
              <TableSortCell id="fecha" label="Fecha" />
              <TableSortCell id="ejecutivo" label="Ejecutivo" />
              <TableCell>Estado</TableCell>
              <TableSortCell id="fecha_inicio" label="Fecha Inicio" />
              <TableSortCell id="fecha_fin" label="Fecha Fin" />
              <TableCell>Participantes</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedContracts
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((contract) => (
                <TableRow 
                  hover 
                  key={contract.id}
                  sx={{ '&:hover': { cursor: 'pointer' } }}
                >
                  <TableCell>{contract.folio}</TableCell>
                  <TableCell>{formatDate(contract.fecha)}</TableCell>
                  <TableCell>{contract.ejecutivo}</TableCell>
                  <TableCell>
                    <Chip 
                      label={contract.estado_id}
                      color={contract.estado_id === 300 ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(contract.fecha_inicio)}</TableCell>
                  <TableCell>{formatDate(contract.fecha_fin)}</TableCell>
                  <TableCell>
                    <Chip 
                      icon={<PersonIcon />}
                      label={contract.participantes.length}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleOpenDetails(contract)}
                    >
                      Ver Detalles
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={filteredAndSortedContracts.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        labelRowsPerPage="Filas por página:"
      />

      <ContractDetails 
        contract={selectedContract} 
        contactsMap={contactsMap}
        open={dialogOpen}
        onClose={handleCloseDetails}
      />
    </Paper>
  );
};

export default ContractsTable;