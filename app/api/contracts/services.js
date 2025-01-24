// app/api/contracts/services.js
import { USERS, authenticate, fetchWithAuth } from '../shared/services';

export async function getData(user = 'birent') {
  const DEPTO_ID = '27567871-07bd-46f2-a1ca-030329eeb680';
  const token = await authenticate(user);
  const userConfig = USERS[user];
 
  const [contracts, states, properties, unidades] = await Promise.all([
    fetchWithAuth(`${userConfig.basePath}/contratos?limit=5000`, token),
    fetchWithAuth(`${userConfig.basePath}/contrato-estados`, token),
    fetchWithAuth(`${userConfig.basePath}/propiedades?limit=5000`, token),
    fetchWithAuth(`${userConfig.basePath}/unidades?limit=5000`, token)
  ]);
 
  const unidadesMap = unidades.data.unidades.reduce((acc, unidad) => {
    if (unidad.unidad_tipo_id === DEPTO_ID) {
      acc[unidad.id] = {
        subEstado: unidad.sub_estado
      };
    }
    return acc;
  }, {});
 
  const contratosConDepartamentos = contracts.data.contratos.filter(contrato => 
    contrato.unidades.some(u => unidadesMap[u.unidad_id])
  ).map(contrato => {
    const departamento = contrato.unidades.find(u => unidadesMap[u.unidad_id]);
    return {
      ...contrato,
      estado_id: contrato.estado_id === '' ? 0 : contrato.estado_id,
      departamentoSubEstado: departamento ? unidadesMap[departamento.unidad_id].subEstado : null
    };
  });
 
  return {
    contracts: contratosConDepartamentos,
    states: states.data.contrato_estados.reduce((acc, state) => {
      acc[state.id] = { nombre: state.nombre, id: state.id };
      return acc;
    }, {}),
    properties: properties.data.propiedades.reduce((acc, prop) => {
      acc[prop.id] = { nombre: prop.nombre || 'Sin nombre', comuna: prop.direccion_nivel_3 || '-' };
      return acc;
    }, {})
  };
 }