// pages/api/search.js
import { KendraClient, QueryCommand } from "@aws-sdk/client-kendra";
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const kendraClient = new KendraClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const preprocessQuery = async (query) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini-2024-07-18",
    messages: [
      {
        role: "system",
        content: "Extrae parámetros de búsqueda de consultas inmobiliarias y genera una búsqueda optimizada. Responde en JSON."
      },
      {
        role: "user",
        content: `Extrae los parámetros relevantes y genera una consulta optimizada para búsqueda.
        
        Ejemplos:
        Input: "condiciones comerciales euro"
        {
          "parametros": {
            "inmobiliaria": "euro",
            "tipo_consulta": "condiciones_comerciales"
          },
          "busqueda": "euro condiciones comerciales promociones descuentos"
        }

        Input: "departamentos 2D2B santiago"
        {
          "parametros": {
            "tipologia": "2D2B",
            "ubicacion": "santiago"
          },
          "busqueda": "2 dormitorios 2 baños santiago"
        }

        Analiza esta consulta: "${query}"`
      }
    ],
    temperature: 0,
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
};

const formatKendraResultsForAI = (results) => {
  return results.map((item, index) => ({
    id: index + 1,
    content: item.DocumentExcerpt?.Text || 'Sin contenido',
    title: item.DocumentTitle?.Text || 'Sin título',
    url: item.DocumentURI || '#'
  }));
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { query } = req.body;
    
    if (!query?.trim()) {
      return res.status(400).json({ message: "La consulta no puede estar vacía" });
    }

    console.log("Consulta original:", query);
    const { parametros, busqueda } = await preprocessQuery(query);
    console.log("Consulta procesada:", { parametros, busqueda });

    const command = new QueryCommand({
      IndexId: process.env.KENDRA_INDEX_ID,
      QueryText: busqueda,
      PageSize: 10,
      AttributeFilter: {
        AndAllFilters: [
          {
            EqualsTo: {
              Key: "_language_code",
              Value: { StringValue: "es" }
            }
          }
        ]
      },
      QueryResultTypeFilter: "DOCUMENT",
      AttributesToRetrieve: [
        "_created_at",
        "_file_type",
        "_source_uri"
      ]
    });

    const kendraResponse = await kendraClient.send(command);
    const kendraResults = formatKendraResultsForAI(kendraResponse.ResultItems || []);

    if (kendraResults.length === 0) {
      return res.status(200).json({ 
        results: [], 
        summary: "No se encontró información específica para la consulta realizada." 
      });
    }

    const promptTemplate = `Analiza los resultados para las condiciones comerciales de ${parametros.inmobiliaria?.toUpperCase() || 'la inmobiliaria'}.

    REGLAS ESTRICTAS:
    1. Si la consulta especifica una inmobiliaria (${parametros.inmobiliaria || 'no especificada'}):
      - SOLO incluir información de esa inmobiliaria
      - IGNORAR completamente información de otras inmobiliarias
      - Si una fuente menciona múltiples inmobiliarias, usar SOLO la información relevante
    2. Si la fuente no menciona explícitamente la inmobiliaria buscada, IGNORAR esa información
    3. Si no hay información específica de la inmobiliaria, indicarlo claramente
    4. NO repetir la sección de referencias al final

    FORMATO DE RESPUESTA:
    - Usar títulos en negrita (**Título**)
    - Incluir referencia [n] después de cada información
    - Estructurar en puntos concisos
    - NO repetir información

    RESULTADOS A ANALIZAR:
    ${JSON.stringify(kendraResults, null, 2)}`;

    const openAiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages: [
        { 
          role: "system", 
          content: "Eres un asistente experto en documentación comercial inmobiliaria. Proporciona respuestas precisas y estructuradas, usando markdown y citando fuentes."
        },
        { 
          role: "user", 
          content: promptTemplate
        },
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    return res.status(200).json({
      results: kendraResults.filter(result => 
        result.content.toLowerCase().includes(parametros.inmobiliaria?.toLowerCase() || '')),
      summary: openAiResponse.choices[0].message.content,
      references: kendraResults,
    });

  } catch (error) {
    console.error("Error en el procesamiento:", error);
    return res.status(500).json({ 
      message: "Error al procesar la consulta",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}