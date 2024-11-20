"use client";

import React, { useState } from "react";
import { Button, Container, Typography, Box, CircularProgress, IconButton, Tooltip } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const NGCPage = () => {
  const [xmlData, setXmlData] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [originalFileName, setOriginalFileName] = useState("");

  const handleFileUpload = async (event) => {
    setLoading(true);
    const file = event.target.files[0];
    setOriginalFileName(file.name);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/ngc", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const xml = await response.text();
        setXmlData(xml);
      } else {
        alert("Error al procesar el archivo");
      }
    } catch (error) {
      alert("Error en la conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([xmlData], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const fileName = originalFileName.replace(/\.[^/.]+$/, '') || 'ngc-data';
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.xml`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(xmlData).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
    });
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Convertidor XLSX a XML NGC-CMF KAPTURE
        </Typography>
        <Typography variant="body1" gutterBottom sx={{ mb: 0 }}>
          Transforma sus reportes desde formato Excel a XML normalizado para la CMF
        </Typography>
        <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
          Los archivos son procesados localmente y eliminados inmediatamente después de la conversión
        </Typography>
        </Box>
        <Box sx={{ textAlign: "center", mt: 4 }}>
        <Button
          variant="contained"
          component="label"
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Subir Excel"}
          <input type="file" hidden onChange={handleFileUpload} />
        </Button>
        {xmlData && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6">XML generado:</Typography>
            <Box
              component="pre"
              sx={{
                textAlign: "left",
                backgroundColor: "#f4f4f4",
                padding: 2,
                borderRadius: 2,
                maxHeight: 300,
                overflow: "auto",
                mt: 2,
                position: "relative",
              }}
            >
              <code>{xmlData}</code>
              <Tooltip title={copied ? "Copiado" : "Copiar al portapapeles"}>
                <IconButton
                  onClick={handleCopy}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    color: copied ? "green" : "gray",
                  }}
                >
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Button
              variant="outlined"
              color="primary"
              sx={{ mt: 2 }}
              onClick={handleDownload}
            >
              Descargar XML
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default NGCPage;
