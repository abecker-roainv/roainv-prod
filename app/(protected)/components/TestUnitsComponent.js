'use client';

import React, { useState } from 'react';

const TestUnitsComponent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [selectedUser, setSelectedUser] = useState('birent');

  const testData = async () => {
    try {
      setLoading(true);
      setError(null);
      setData(null);
      
      const response = await fetch(`/api/units?user=${selectedUser}`);
      const result = await response.json();
      
      setData(result);
      
      if (!response.ok) {
        throw new Error(result.error || 'Error en la solicitud');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <select 
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="birent">Birent</option>
          <option value="amplo">Amplo</option>
          <option value="principal">Principal</option>
        </select>
        
        <button 
          onClick={testData}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? 'Cargando...' : 'Obtener Datos'}
        </button>
      </div>

      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded border border-red-300">
          Error: {error}
        </div>
      )}
      
      {data && (
        <div className="mt-4 space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Estados:</h3>
            <div className="p-4 bg-gray-50 rounded border">
              <pre className="whitespace-pre-wrap overflow-auto max-h-96">
                {JSON.stringify(data.states, null, 2)}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Subestados:</h3>
            <div className="p-4 bg-gray-50 rounded border">
              <pre className="whitespace-pre-wrap overflow-auto max-h-96">
                {JSON.stringify(data.subStates, null, 2)}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Unidades (5):</h3>
            <div className="p-4 bg-gray-50 rounded border">
              <pre className="whitespace-pre-wrap overflow-auto max-h-96">
                {JSON.stringify(data.units, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestUnitsComponent;