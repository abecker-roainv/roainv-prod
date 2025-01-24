const USERS = {
  birent: {
    endpoint: 'https://api.beta.pop.estate/api/estadisticas/auth/login',
    basePath: 'https://api.beta.pop.estate/api/estadisticas',
    credentials: {
      username: 'birent_api_integracion',
      password: '9890dd76154659e5b97c82958c9addd9'
    }
  },
  amplo: {
    endpoint: 'https://api.beta.pop.estate/api/estadisticas/auth/login', 
    basePath: 'https://api.beta.pop.estate/api/estadisticas',
    credentials: {
      username: 'amplo_api_integracion',
      password: '7a43d63c6795e4f208b302b6f7edd438'
    }
  },
  principal: {
    endpoint: 'https://api.beta.pop.estate/api/estadisticas/auth/login',
    basePath: 'https://api.beta.pop.estate/api/estadisticas',
    credentials: {
      username: 'principal_api_integracion',
      password: '863495f0fc1151e7941a541586033da6'
    }
  }
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

 
 async function authenticate(user) {
  try {
    const userConfig = USERS[user];
    console.log('Intentando autenticar:', user, userConfig.endpoint);
    
    const response = await fetch(userConfig.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(userConfig.credentials)
    });
    
    console.log('Auth response status:', response.status);
    const data = await response.json();
    console.log('Auth response:', data);
    
    if (!response.ok) throw new Error(`Auth error: ${response.status}`);
    return data.token;
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
 }
 
 async function fetchWithAuth(url, token) {
  try {
    console.log('Fetching:', url);
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    console.log('Response status:', response.status);
    
    if (!response.ok) throw new Error(`Request error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
 }
 
 export async function getData(user = 'birent') {
  try {
    const token = await authenticate(user);
    const userConfig = USERS[user];
 
    const [properties, units, unitTypes, unidadEstados, unidadSubEstados] = await Promise.all([
      fetchWithAuth(`${userConfig.basePath}/propiedades?limit=5000`, token),
      fetchWithAuth(`${userConfig.basePath}/unidades?limit=5000`, token),
      fetchWithAuth(`${userConfig.basePath}/unidad-tipos`, token),
      fetchWithAuth(`${userConfig.basePath}/unidad-estados`, token),
      //fetchWithAuth('https://api.beta.pop.estate/api/unidades_subestado', token)
    ]);

    // Debug
    console.log('Property example:', properties.data.propiedades[0]);
 
    return {
      properties: properties.data.propiedades.reduce((acc, prop) => {
        acc[prop.id] = {
          nombre: prop.nombre || 'Sin nombre',
          comuna: prop.direccion_nivel_3 || '-'
        };
        return acc;
      }, {}),
      units: units.data.unidades,
      unitTypes: unitTypes.data.unidad_tipos.reduce((acc, type) => {
        acc[type.id] = type.nombre;
        return acc;
      }, {}),
      subStates: SUB_ESTADOS
    };
  } catch (error) {
    console.error('Error en getData:', error);
    throw error;
  }
}