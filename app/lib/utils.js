// File: @/lib/utils.js
export const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES');
  };
  
  export const formatCurrency = (amount, currency = 'Peso') => {
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
  
  export const getUnidadNombre = (unidad) => {
    const cargoConNombre = unidad.cargos.find(cargo => 
      cargo.nombre.includes('Departamento') || 
      cargo.nombre.includes('Bodega')
    );
  
    if (cargoConNombre) {
      return cargoConNombre.nombre;
    }
    
    return 'Unidad Sin Nombre';
  };