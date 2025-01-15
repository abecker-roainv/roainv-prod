'use client';

import { useState, useEffect, useMemo } from 'react';
import {
 Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
 TablePagination, TableSortLabel, Paper, IconButton, Tooltip,
 FormControl, Select, MenuItem, Box, CircularProgress, InputLabel,
 Typography
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import UnitModal from '../components/UnitModal';

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

function UnitsTable() {
 const [page, setPage] = useState(0);
 const [rowsPerPage, setRowsPerPage] = useState(10);
 const [orderBy, setOrderBy] = useState('propiedad');
 const [order, setOrder] = useState('asc');
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const [data, setData] = useState([]);
 const [properties, setProperties] = useState({});
 const [unitTypes, setUnitTypes] = useState({});
 const [subStates, setSubStates] = useState({});
 const [selectedUser, setSelectedUser] = useState('birent');
 const [selectedUnit, setSelectedUnit] = useState(null);
 const [modalOpen, setModalOpen] = useState(false);
 const [selectedStatus, setSelectedStatus] = useState('100');
 const [selectedType, setSelectedType] = useState('');

 const stats = useMemo(() => {
  const deptTypeId = Object.entries(unitTypes).find(([id, nombre]) => 
    nombre.toLowerCase().includes('departamento')
  )?.[0];
 
  const departamentos = deptTypeId ? data.filter(unit => unit.unidad_tipo_id === deptTypeId) : [];
  const arrendados = departamentos.filter(unit => unit.estado === '200').length;
  const disponibles = departamentos.filter(unit => unit.estado === '100').length;
  const totalDepts = arrendados + disponibles;

  return {
    totalDepts,
    disponibles,
    arrendados,
    porcentajeDisponible: ((disponibles / totalDepts) * 100).toFixed(1),
    porcentajeArrendado: ((arrendados / totalDepts) * 100).toFixed(1)
  };
 }, [data, unitTypes]);

 const COLUMNS = [
   { id: 'user', label: 'Usuario', sortable: true, getValue: () => selectedUser.charAt(0).toUpperCase() + selectedUser.slice(1) },
   { id: 'propiedad', label: 'Propiedad', sortable: true, getValue: (row) => properties[row.propiedad_id] || 'Sin nombre' },
   { id: 'tipo', label: 'Tipo', sortable: true, getValue: (row) => unitTypes[row.unidad_tipo_id] || 'Desconocido' },
   { id: 'nombre', label: 'Unidad', sortable: true, getValue: (row) => row.nombre || '-' },
   { id: 'estado', label: 'Estado', sortable: true, getValue: (row) => ESTADOS[row.estado]?.label || '-', getStyle: (row) => ({ color: ESTADOS[row.estado]?.color }) },
   { id: 'sub_estado', label: 'Subestado', sortable: true, getValue: (row) => subStates[row.sub_estado] || '...' },
   { id: 'propietario', label: 'Propietario', sortable: true, getValue: (row) => row.propietarios?.[0]?.nombre || '-' },
   { id: 'precio_lista', label: 'Precio lista', sortable: true, getValue: (row) => row.precio_lista ? `${row.precio_lista.toLocaleString()} CLP` : '-' },
   { id: 'precio_ggcc', label: 'Precio GGCC', sortable: true, getValue: (row) => row.precio_ggcc ? `${row.precio_ggcc.toLocaleString()} CLP` : '-' },
   { id: 'piso', label: 'Piso', sortable: true },
   { id: 'orientacion', label: 'Orientación', sortable: true },
   { id: 'actions', label: 'Acciones', sortable: false, getValue: (row, onViewClick) => (
     <Box>
       <Tooltip title="Ver detalles">
         <IconButton size="small" onClick={() => onViewClick(row)}>
           <VisibilityIcon fontSize="small" />
         </IconButton>
       </Tooltip>
     </Box>
   )}
 ];

 useEffect(() => {
   setPage(0);
   setLoading(true);
   fetchData();
 }, [selectedUser]);

 const fetchData = async () => {
   try {
     setLoading(true);
     setError(null);

     const response = await fetch(`/api/units?user=${selectedUser}`);
     const result = await response.json();

     if (!response.ok) throw new Error(result.error || 'Error al obtener datos');

     const { properties, units, unitTypes, subStates } = result;

     setProperties(properties || {});
     setData(units || []);
     setUnitTypes(unitTypes || {});
     setSubStates(subStates || {});
   } catch (err) {
     setError(err.message);
     console.error('Error:', err);
   } finally {
     setLoading(false);
   }
 };

 const handleSort = (property) => {
   const isAsc = orderBy === property && order === 'asc';
   setOrder(isAsc ? 'desc' : 'asc');
   setOrderBy(property);
 };

 const sortedData = useMemo(() => {
   let filteredData = data;

   if (selectedStatus) {
     filteredData = filteredData.filter(row => row.estado === selectedStatus);
   }

   if (selectedType) {
     filteredData = filteredData.filter(row => row.unidad_tipo_id === selectedType);
   }

   return [...filteredData].sort((a, b) => {
     const column = COLUMNS.find(col => col.id === orderBy);
     const aValue = column.getValue ? column.getValue(a) : a[orderBy];
     const bValue = column.getValue ? column.getValue(b) : b[orderBy];

     if (!aValue) return 1;
     if (!bValue) return -1;

     if (order === 'asc') {
       return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
     } else {
       return bValue < aValue ? -1 : bValue > aValue ? 1 : 0;
     }
   });
 }, [data, order, orderBy, selectedStatus, selectedType, properties]);

 const handleChangePage = (event, newPage) => setPage(newPage);

 const handleChangeRowsPerPage = (event) => {
   setRowsPerPage(parseInt(event.target.value, 10));
   setPage(0);
 };

 const handleViewClick = (unit) => {
   setSelectedUnit(unit);
   setModalOpen(true);
 };

 return (
   <Box>
     <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
       <FormControl size="small" sx={{ minWidth: 200 }}>
         <InputLabel>Usuario</InputLabel>
         <Select
           value={selectedUser}
           onChange={(e) => setSelectedUser(e.target.value)}
           label="Usuario"
         >
           <MenuItem value="birent">Birent</MenuItem>
           <MenuItem value="amplo">Amplo</MenuItem>
           <MenuItem value="principal">Principal</MenuItem>
         </Select>
       </FormControl>

       <FormControl size="small" sx={{ minWidth: 200 }}>
         <InputLabel>Estado</InputLabel>
         <Select
           value={selectedStatus}
           onChange={(e) => setSelectedStatus(e.target.value)}
           label="Estado"
         >
           <MenuItem value="">Todos los estados</MenuItem>
           {Object.entries(ESTADOS).map(([value, { label }]) => (
             <MenuItem key={value} value={value}>{label}</MenuItem>
           ))}
         </Select>
       </FormControl>

       <FormControl size="small" sx={{ minWidth: 200 }}>
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
     </Box>

     <Box sx={{ mb: 4, mt: 3, width: '50%' }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
        <Paper sx={{ p: 3, bgcolor: '#f8fafc', borderLeft: '4px solid #64748b' }}>
          <Typography variant="subtitle2" color="text.secondary">
            Deptos Totales
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            {stats.totalDepts}
          </Typography>
        </Paper>

        <Paper sx={{ p: 3, bgcolor: '#f0fdf4', borderLeft: '4px solid #22c55e' }}>
          <Typography variant="subtitle2" color="#16a34a">
            Deptos Disponibles
          </Typography>
          <Typography variant="h4" fontWeight="bold" color="#16a34a">
            {stats.disponibles}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {((stats.disponibles / stats.totalDepts) * 100).toFixed(1)}%
          </Typography>
        </Paper>

        <Paper sx={{ p: 3, bgcolor: '#fff7ed', borderLeft: '4px solid #f97316' }}>
          <Typography variant="subtitle2" color="#ea580c">
          Deptos Arrendados
          </Typography>
          <Typography variant="h4" fontWeight="bold" color="#ea580c">
            {stats.arrendados}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {((stats.arrendados / stats.totalDepts) * 100).toFixed(1)}%
          </Typography>
        </Paper>
      </Box>
      </Box>

     {loading ? (
       <CircularProgress />
     ) : error ? (
       <Box sx={{ color: 'error.main', mb: 2 }}>Error: {error}</Box>
     ) : (
       <Paper sx={{ width: '100%', overflow: 'hidden' }}>
         <TableContainer sx={{ maxHeight: 'calc(100vh - 200px)' }}>
           <Table stickyHeader size="small">
             <TableHead>
               <TableRow>
                 {COLUMNS.map((column) => (
                   <TableCell
                     key={column.id}
                     sortDirection={orderBy === column.id ? order : false}
                     sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}
                   >
                     {column.sortable ? (
                       <TableSortLabel
                         active={orderBy === column.id}
                         direction={orderBy === column.id ? order : 'asc'}
                         onClick={() => handleSort(column.id)}
                       >
                         {column.label}
                       </TableSortLabel>
                     ) : (
                       column.label
                     )}
                   </TableCell>
                 ))}
               </TableRow>
             </TableHead>
             <TableBody>
               {sortedData
                 .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                 .map((row, index) => (
                   <TableRow hover key={row.id || index}>
                     {COLUMNS.map((column) => (
                       <TableCell
                         key={column.id}
                         sx={column.getStyle ? column.getStyle(row) : undefined}
                       >
                         {column.getValue ?
                           column.getValue(row, handleViewClick) :
                           row[column.id] || '-'}
                       </TableCell>
                     ))}
                   </TableRow>
                 ))}
             </TableBody>
           </Table>
         </TableContainer>
         <TablePagination
           rowsPerPageOptions={[10, 25, 50, 100]}
           component="div"
           count={sortedData.length}
           rowsPerPage={rowsPerPage}
           page={page}
           onPageChange={handleChangePage}
           onRowsPerPageChange={handleChangeRowsPerPage}
           labelRowsPerPage="Filas por página:"
           labelDisplayedRows={({ from, to, count }) =>
             `${from}-${to} de ${count}`}
         />
       </Paper>
     )}

     <UnitModal
       open={modalOpen}
       handleClose={() => setModalOpen(false)}
       unit={selectedUnit}
     />
   </Box>
 );
}

export default UnitsTable;