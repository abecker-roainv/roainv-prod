export const ESTADOS = {
    "100": { label: "Disponible", estado: "Nueva", color: "success" },
    "200": { label: "Disponible", estado: "Disponible", color: "success" },
    "300": { label: "No Disponible", estado: "Arrendada", color: "error" },
    "400": { label: "No Disponible", estado: "Vendida", color: "warning" },
    "500": { label: "No Disponible", estado: "No Disponible", color: "error" }
  };
  
  export const getEstadoInfo = (estadoId, subEstado) => {
    const info = ESTADOS[estadoId] || { label: "Desconocido", estado: "Desconocido", color: "default" };
    const displayText = `${info.estado}${subEstado ? ` - ${subEstado}` : ''}`;
    return {
      label: info.label,
      estado: info.estado,
      color: info.color,
      displayText
    };
  };