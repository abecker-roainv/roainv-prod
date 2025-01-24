// app/api/shared/services.js
export const USERS = {
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
   
   export async function authenticate(user) {
    try {
      const userConfig = USERS[user];
      const response = await fetch(userConfig.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(userConfig.credentials)
      });
   
      if (!response.ok) throw new Error(`Auth error: ${response.status}`);
      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
   }
   
   export async function fetchWithAuth(url, token) {
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error(`Request error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Fetch error:', error);
      throw error; 
    }
   }