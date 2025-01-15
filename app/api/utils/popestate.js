// app/api/utils/popestate.js
export async function getPropiedades(token) {
    const response = await fetch(`${API_BASE_URL}/propiedades`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
  
    if (!response.ok) throw new Error('Error al obtener propiedades');
    const data = await response.json();
    return data?.data?.propiedades || [];
  }
  
  export async function getUnidadesWithPropiedad(token, params = {}) {
    const [unidadesResponse, propiedades] = await Promise.all([
      fetch(`${API_BASE_URL}/unidades?${new URLSearchParams(params)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }),
      getPropiedades(token)
    ]);
  
    if (!unidadesResponse.ok) throw new Error('Error al obtener unidades');
    const unidadesData = await unidadesResponse.json();
  
    const propiedadesMap = propiedades.reduce((acc, prop) => {
      acc[prop.id] = prop.nombre;
      return acc;
    }, {});
  
    return {
      unidades: unidadesData.data.unidades.map(unit => ({
        ...unit,
        propiedad_nombre: propiedadesMap[unit.propiedad_id] || 'Desconocida'
      })),
      pager: unidadesData.data.pager
    };
  }