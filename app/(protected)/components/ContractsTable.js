'use client';

import { useState, useEffect } from 'react';
import {
 Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
 Paper, CircularProgress, Box, Typography, FormControl, InputLabel,
 Select, MenuItem, TableSortLabel, TablePagination, Chip, Stack,
 TextField, Button, Modal, IconButton, Grid
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import minMax from 'dayjs/plugin/minMax';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import 'dayjs/locale/es';
import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');
dayjs.locale('es');
dayjs.extend(minMax);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);

const COLUMNS = [
 { id: 'user', label: 'Usuario', sortable: true },
 { id: 'folio', label: 'Folio', sortable: true },
 { id: 'fecha', label: 'Fecha', sortable: true },
 { id: 'fecha_inicio', label: 'Inicio', sortable: true },
 { id: 'fecha_fin', label: 'Fin', sortable: true },
 { id: 'estado_id', label: 'Estado Contrato', sortable: true },
 { id: 'departamentoSubEstado', label: 'Estado Depto', sortable: true },
 { id: 'fecha_ultima_modificacion', label: 'Última modificación', sortable: true }
];

const USERS = ['todos', 'birent', 'amplo', 'principal'];

const ESTADOS_CONTRATOS = {
  "100": { "nombre": "Creado", "id": 100 },
  "200": { "nombre": "Pendiente Firma", "id": 200 },
  "201": { "nombre": "Pendiente Firma Manual", "id": 201 },
  "210": { "nombre": "Error Firma", "id": 210 },
  "290": { "nombre": "Firmado", "id": 290 },
  "291": { "nombre": "Firmado Manual", "id": 291 },
  "300": { "nombre": "Activo", "id": 300 },
  "400": { "nombre": "Finalizado", "id": 400 },
  "410": { "nombre": "Finalizado Anticipadamente", "id": 410 },
  "0": { "nombre": "Anulado", "id": 0 }
};

const ESTADOS_RESUMEN = {
  ACTIVO: 300,
  PENDIENTE_FIRMA: 200,
  PENDIENTE_FIRMA_MANUAL: 201,
  CREADO: 100,
  FIRMADO: 290,
  FIRMADO_MANUAL: 291,
  ERROR_FIRMA: 210,
  FINALIZADO: 400,
  FINALIZADO_ANTICIPADO: 410,
  ANULADO: 0
};

const SUB_ESTADOS = {
 '0': '...',
 '100': 'Por Vencer',
 '200': 'Por Renovar',
 '300': 'Renovado',
 '400': 'Avisado',
 '500': 'En Espera Obra',
 '510': 'En Obra',
 '600': 'Por arrendar',
 '700': 'Por liberar',
 '800': 'Reservada'
};

export default function ContractsTable() {
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const [startDate, setStartDate] = useState(null);
 const [endDate, setEndDate] = useState(null);
 const [initialDates, setInitialDates] = useState({ min: null, max: null });
 const [selectedState, setSelectedState] = useState(ESTADOS_RESUMEN.ACTIVO.toString());
 const [selectedSubEstado, setSelectedSubEstado] = useState('');
 const [selectedUser, setSelectedUser] = useState('todos');
 const [data, setData] = useState({
   contracts: [],
   properties: {}
 });
 const [lastUpdate, setLastUpdate] = useState(moment());
 const [orderBy, setOrderBy] = useState('fecha');
 const [order, setOrder] = useState('desc');
 const [page, setPage] = useState(0);
 const [rowsPerPage, setRowsPerPage] = useState(10);
 const [openModal, setOpenModal] = useState(false);

 useEffect(() => {
   const loadData = async () => {
     try {
       let allData = {
         contracts: [],
         properties: {}
       };

       for (const user of USERS.filter(u => u !== 'todos')) {
         const response = await fetch(`/api/contracts?user=${user}`);
         const result = await response.json();

         allData.contracts = [
           ...allData.contracts,
           ...(result.contracts || []).map(contract => ({
             ...contract,
             user
           }))
         ];
         allData.properties = { ...allData.properties, ...result.properties };
       }

       if (allData.contracts.length > 0) {
         const contractDates = allData.contracts
           .map(c => c.fecha ? dayjs(c.fecha) : null)
           .filter(date => date && date.isValid() && date.year() > 2000);

         if (contractDates.length > 0) {
           const minDate = dayjs.min(contractDates);
           const maxDate = dayjs();

           setInitialDates({ min: minDate, max: maxDate });
           setStartDate(minDate);
           setEndDate(maxDate);
         } else {
           const today = dayjs();
           setInitialDates({ min: today, max: today });
           setStartDate(today);
           setEndDate(today);
         }
       }

       setData(allData);
       setLastUpdate(moment());
     } catch (err) {
       console.error("Error cargando datos:", err);
       setError(err.message);
     } finally {
       setLoading(false);
     }
   };

   loadData();
 }, []);

 useEffect(() => {
   const timer = setInterval(() => {
     setLastUpdate(moment());
   }, 1000);
   return () => clearInterval(timer);
 }, []);

 

 const handleStartDateChange = (newDate) => {
   if (!newDate || !newDate.isValid()) return;
   setStartDate(newDate);
   if (endDate && newDate.isAfter(endDate)) {
     setEndDate(newDate);
   }
 };

 const handleEndDateChange = (newDate) => {
   if (!newDate || !newDate.isValid()) return;
   if (startDate && newDate.isBefore(startDate)) {
     setEndDate(startDate);
   } else {
     setEndDate(newDate);
   }
 };

 const handleSort = (property) => {
   const isAsc = orderBy === property && order === 'asc';
   setOrder(isAsc ? 'desc' : 'asc');
   setOrderBy(property);
 };

 const handleChangePage = (event, newPage) => {
   setPage(newPage);
 };

 const handleChangeRowsPerPage = (event) => {
   setRowsPerPage(parseInt(event.target.value, 10));
   setPage(0);
 };

 const getMonthlyExpirations = (contracts) => {
  const today = dayjs();
  const monthsData = {};
  
  for (let i = 0; i < 12; i++) {
    monthsData[i] = 0;
  }

  contracts
    .filter(contract => Number(contract.estado_id) === ESTADOS_RESUMEN.ACTIVO)
    .forEach(contract => {
      if (contract.fecha_fin) {
        const endDate = dayjs(contract.fecha_fin);
        if (endDate.isAfter(today) && endDate.year() === today.year()) {
          const month = endDate.month();
          monthsData[month]++;
        }
      }
    });

  return monthsData;
};

 const filteredContracts = data.contracts.filter(contract => {
   const contractDate = dayjs(contract.fecha);
   const isInDateRange = (!startDate || contractDate.isSameOrAfter(startDate, 'day')) &&
                        (!endDate || contractDate.isSameOrBefore(endDate, 'day'));
   const matchesState = !selectedState || contract.estado_id?.toString() === selectedState;
   const matchesUser = selectedUser === 'todos' || contract.user === selectedUser;
   const matchesSubEstado = !selectedSubEstado || contract.departamentoSubEstado === selectedSubEstado;

   return isInDateRange && matchesState && matchesUser && matchesSubEstado;
 });

 useEffect(() => {
  console.log('Contratos filtrados:', filteredContracts);
 }, [filteredContracts]);

 useEffect(() => {
  const timer = setInterval(() => setLastUpdate(moment()), 30000);
  return () => clearInterval(timer);
}, []);

 const estadorResumen = filteredContracts.reduce((acc, contract) => {
   const estadoId = contract.estado_id;
   const subEstadoId = contract.departamentoSubEstado;
   const estadoNombre = ESTADOS_CONTRATOS[estadoId]?.nombre || 'Sin estado';
   const subEstadoNombre = SUB_ESTADOS[subEstadoId] || 'Sin subestado';

   if (!acc[estadoNombre]) {
     acc[estadoNombre] = {
       total: 0,
       subEstados: {}
     };
   }

   acc[estadoNombre].total += 1;

   if (!acc[estadoNombre].subEstados[subEstadoNombre]) {
     acc[estadoNombre].subEstados[subEstadoNombre] = 0;
   }

   acc[estadoNombre].subEstados[subEstadoNombre] += 1;

   return acc;
 }, {});

 const resumenContratos = {
   arrendados: filteredContracts.filter(c => 
     Number(c.estado_id) === ESTADOS_RESUMEN.ACTIVO
   ).length,
   procesoFirmas: filteredContracts.filter(c => 
     [ESTADOS_RESUMEN.CREADO, ESTADOS_RESUMEN.PENDIENTE_FIRMA, ESTADOS_RESUMEN.PENDIENTE_FIRMA_MANUAL].includes(Number(c.estado_id))
   ).length,
  //  finalizados: filteredContracts.filter(c =>
  //    [ESTADOS_RESUMEN.FINALIZADO, ESTADOS_RESUMEN.FINALIZADO_ANTICIPADO].includes(Number(c.estado_id))
  //  ).length,
   reservados: filteredContracts.filter(c => 
     Number(c.departamentoSubEstado) === 800
   ).length
 };

 const estadosPorTipo = Object.keys(ESTADOS_CONTRATOS).reduce((acc, estadoId) => {
   acc[estadoId] = filteredContracts.filter(c => c.estado_id?.toString() === estadoId).length;
   return acc;
 }, {});

 const sortedData = [...filteredContracts].sort((a, b) => {
   let aValue = a[orderBy];
   let bValue = b[orderBy];

   if (orderBy === 'estado_id') {
     aValue = ESTADOS_CONTRATOS[a.estado_id]?.nombre;
     bValue = ESTADOS_CONTRATOS[b.estado_id]?.nombre;
   }

   if (order === 'desc') {
     [aValue, bValue] = [bValue, aValue];
   }

   return (aValue || '').toString().localeCompare((bValue || '').toString());
 });

 const paginatedData = sortedData.slice(
   page * rowsPerPage,
   page * rowsPerPage + rowsPerPage
 );

 if (loading) return <CircularProgress />;
 if (error) return <Typography color="error">Error: {error}</Typography>;



return (
  <Box sx={{ maxWidth: '100vw' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
          Última actualización: {lastUpdate.fromNow()}
        </Typography>
        <IconButton 
          size="small" 
          onClick={() => window.location.reload()}
          title="Refrescar datos"
        >
          <RefreshIcon />
        </IconButton>
      </Box>
      <Button 
        variant="outlined" 
        size="small"
        onClick={() => setOpenModal(true)}
      >
        Ver Resumen Detallado
      </Button>
      </Box>
 
    <Modal
      open={openModal}
      onClose={() => setOpenModal(false)}
      aria-labelledby="resumen-estadistico-modal"
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80%',
        maxWidth: 800,
        maxHeight: '90vh',
        overflow: 'auto',
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 1
      }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Resumen Estadístico de Contratos
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Estado</TableCell>
                <TableCell>Subestado</TableCell>
                <TableCell align="right">Cantidad</TableCell>
                <TableCell align="right">% del Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(estadorResumen).map(([estado, { total, subEstados }]) => (
                Object.entries(subEstados).map(([subEstado, cantidad], index) => (
                  <TableRow key={`${estado}-${subEstado}`} sx={{
                    backgroundColor: index === 0 ? 'action.hover' : 'inherit'
                  }}>
                    {index === 0 ? (
                      <TableCell rowSpan={Object.keys(subEstados).length}>
                        {estado} ({total})
                      </TableCell>
                    ) : null}
                    <TableCell>{subEstado}</TableCell>
                    <TableCell align="right">{cantidad}</TableCell>
                    <TableCell align="right">
                      {((cantidad / filteredContracts.length) * 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Modal>
 
    <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
        <Box sx={{ display: 'flex', gap: 2 }}>
          <DatePicker
            label="Fecha desde"
            value={startDate}
            onChange={handleStartDateChange}
            minDate={initialDates.min}
            maxDate={initialDates.max}
            format="DD/MM/YYYY"
            slotProps={{
              textField: {
                size: "small",
                sx: { width: 200 }
              }
            }}
          />
          <DatePicker
            label="Fecha hasta"
            value={endDate}
            onChange={handleEndDateChange}
            minDate={startDate}
            maxDate={initialDates.max}
            format="DD/MM/YYYY"
            slotProps={{
              textField: {
                size: "small",
                sx: { width: 200 }
              }
            }}
          />
        </Box>
      </LocalizationProvider>
 
      <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
      <FormControl sx={{ minWidth: 200, display: 'none' }} size="small">
         <InputLabel>Estado</InputLabel>
          <Select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            label="Estado"
          >
            <MenuItem value="">Todos</MenuItem>
            {Object.entries(ESTADOS_CONTRATOS).map(([id, state]) => (
              <MenuItem key={id} value={id}>{state.nombre}</MenuItem>
            ))}
          </Select>
        </FormControl>
 
        <FormControl sx={{ minWidth: 200, display:'none' }} size="small">
          <InputLabel>Subestado Departamento</InputLabel>
          <Select
            value={selectedSubEstado}
            onChange={(e) => setSelectedSubEstado(e.target.value)}
            label="Subestado Departamento"
          >
            <MenuItem value="">Todos</MenuItem>
            {Object.entries(SUB_ESTADOS).map(([id, nombre]) => (
              <MenuItem key={id} value={id}>{nombre}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
 
    <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
      {USERS.map(user => (
        <Chip
          key={user}
          label={user}
          onClick={() => setSelectedUser(user)}
          color={selectedUser === user ? "primary" : "default"}
          variant={selectedUser === user ? "filled" : "outlined"}
        />
      ))}
    </Stack>
 
    <Box sx={{ display: 'flex', gap: 4, mb: 4 }}>
      <Paper sx={{ p: 2, flex: 1 }}>
        <Typography variant="subtitle1" mb={1}>Resumen</Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={2}>
          <em>
            {startDate && endDate ? (
              <>
                Del <strong>{startDate.format('dddd D [de] MMMM')}</strong>
                {startDate.year() !== endDate.year() ? ` de ${startDate.year()}` : ''}
                &nbsp;al&nbsp;
                <strong>{endDate.format('dddd D [de] MMMM [de] YYYY')}</strong>
              </>
            ) : 'Período completo'}
          </em>
        </Typography>
 
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>Deptos. Arrendados:</Typography>
            <Typography>{resumenContratos.arrendados}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>En proceso de firmas:</Typography>
            <Typography>{resumenContratos.procesoFirmas}</Typography>
          </Box>
          {/* <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>Finalizados:</Typography>
            <Typography>{resumenContratos.finalizados}</Typography>
          </Box> */}
          {/* <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>Reservados:</Typography>
            <Typography>{resumenContratos.reservados}</Typography>
          </Box> */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: 1, borderColor: 'divider' }}>
            <Typography fontWeight="bold">Total:</Typography>
            <Typography fontWeight="bold">
              {resumenContratos.arrendados + resumenContratos.procesoFirmas}
            </Typography>
          </Box>
        </Stack>
      </Paper>
 
      {/* <Paper sx={{ p: 2, flex: 1 }}>
        <Typography variant="subtitle1" gutterBottom>Estados</Typography>
        <Table size="small" sx={{ '& td': { py: 0.5 } }}>
          <TableBody>
            {Object.entries(ESTADOS_CONTRATOS).map(([estadoId, estado]) => (
              <TableRow key={estadoId}>
                <TableCell sx={{ borderBottom: 'none' }}>{estado.nombre}</TableCell>
                <TableCell align="right" sx={{ borderBottom: 'none' }}>
                  {estadosPorTipo[estadoId] || 0}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper> */}
    </Box>
 
    <Box sx={{ mb: 4 }}>
      <Typography variant="subtitle1" gutterBottom>Vencimientos por mes 2025 <small><i>(según filtros actual)</i></small></Typography>
      <Grid container spacing={2}>
        {Object.entries(getMonthlyExpirations(filteredContracts)).map(([month, count]) => (
          <Grid item xs={12} sm={3} md={2} lg={1} key={month}>
            <Paper 
              sx={{ 
                p: 2,
                textAlign: 'center',
                bgcolor: count > 0 ? 'warning.light' : 'inherit',
                height: '100%'
              }}
            >
              <Typography variant="subtitle2">
                {dayjs().month(Number(month)).format('MMMM')}
              </Typography>
              <Typography>{count}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      </Box>

    <Paper>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {COLUMNS.map(col => (
                <TableCell key={col.id}>
                  {col.sortable ? (
                    <TableSortLabel
                      active={orderBy === col.id}
                      direction={orderBy === col.id ? order : 'asc'}
                      onClick={() => handleSort(col.id)}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((contract, i) => (
              <TableRow key={i} hover>
                {COLUMNS.map(col => (
                  <TableCell key={col.id}>
                    {col.id === 'estado_id' 
                      ? ESTADOS_CONTRATOS[contract[col.id]]?.nombre || '-'
                      : col.id === 'departamentoSubEstado'
                        ? SUB_ESTADOS[contract[col.id]] || '-'
                        : col.id === 'fecha_ultima_modificacion'
                          ? contract[col.id] 
                            ? moment(contract[col.id]).fromNow()
                            : '-'
                          : col.id.includes('fecha')
                            ? contract[col.id] 
                              ? dayjs(contract[col.id]).format('DD/MM/YYYY')
                              : '-'
                            : contract[col.id] || '-'
                    }
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={sortedData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  </Box>
 );
}