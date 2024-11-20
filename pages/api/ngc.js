import formidable from "formidable";
import * as XLSX from "xlsx";
import { XMLBuilder } from "fast-xml-parser";

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseExcelToJson = (filePath) => {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  // Agrupar fondos y participantes
  const fondosMap = new Map();
  
  sheetData.forEach(row => {
    const fondoKey = `${row["rutFondo"]}-${row["digitoFondo"]}`;
    if (!fondosMap.has(fondoKey)) {
      fondosMap.set(fondoKey, {
        rutFondo: row["rutFondo"],
        digitoFondo: row["digitoFondo"],
        denominacionFondo: row["denominacionFondo"],
        valorActivos: parseFloat(row["valorActivos"]).toFixed(2),
        valorPasivos: parseFloat(row["valorPasivos"]).toFixed(2),
        criteriosContables: row["criteriosContables"],
        participes: []
      });
    }

    fondosMap.get(fondoKey).participes.push({
      rutAportante: row["rutAportante"] || null,
      digitoAportante: row["digitoAportante"] || null,
      extranjero: row["extranjero"] || null,
      apellidoPaterno: row["apellidoPaterno"] || null,
      apellidoMaterno: row["apellidoMaterno"] || null,
      primerNombre: row["primerNombre"] || null,
      segundoNombre: row["segundoNombre"] || null,
      montoParticipacion: parseFloat(row["montoParticipacion"]).toFixed(2),
      numeroCuotas: parseFloat(row["numeroCuotas"]).toFixed(2),
    });
  });

  return {
    informacionAFIP: {
      periodoInformacion: sheetData[0]["periodoInformacion"],
      rutEntidad: sheetData[0]["rutEntidad"],
      digitoEntidad: sheetData[0]["digitoEntidad"],
      fondos: {
        fondoInversionPrivado: Array.from(fondosMap.values()).map(fondo => ({
          ...fondo,
          participes: { aportante: fondo.participes }
        }))
      }
    }
  };
};

const handler = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const form = formidable({
    keepExtensions: true,
  });

  return new Promise((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.status(500).json({ error: "Error al procesar el archivo" });
        return resolve();
      }

      const file = files?.file?.[0] || files?.file;
      if (!file?.filepath) {
        res.status(400).json({ error: "No se encontró el archivo cargado" });
        return resolve();
      }

      try {
        const jsonData = parseExcelToJson(file.filepath);
        const builder = new XMLBuilder({
          format: true,
          indentBy: "  ",
          suppressEmptyNode: true,
          processEmptyNode: (nodeName) => `<${nodeName} />`,
        });
        
        let xmlData = builder.build(jsonData);
        xmlData = xmlData.replace(/\/>$/gm, ' />');

        // Agregar encabezado XML
        const xmlWithHeader = `<?xml version="1.0" encoding="utf-8"?>\n${xmlData.trimEnd()}`;

        res.setHeader("Content-Type", "application/xml");
        res.status(200).send(xmlWithHeader);
        resolve();
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al procesar el archivo Excel" });
        resolve();
      }
    });
  });
};

export default handler;