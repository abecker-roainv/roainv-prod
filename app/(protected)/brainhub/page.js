// /app/(protected)/brainhub/page.js
'use client';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Paper,
  Tooltip,
  useTheme
} from '@mui/material';
import Image from 'next/image';

// Datos de las secciones
const sections = [
  {
    title: "General",
    logo: "",
    buttons: [
      { 
        title: "Asesor Ejecutivo de Correos Corporativos",
        link: "https://chatgpt.com/g/g-GEDLNYPNb-asesor-ejecutivo-de-correos-corporativos",
        description: "Asesoría ejecutiva en la gestión de correos corporativos, ofreciendo soluciones para optimizar la comunicación empresarial."
      },
      { 
        title: "Asesor de Marketing Inmobiliario",
        link: "https://chatgpt.com/g/g-gq0FPaZJj-asesor-de-marketing-inmobiliario",
        description: "Asesor de marketing para estrategias inmobiliarias."
      }
    ]
  },
  {
    title: "Renta Capital",
    logo: "/img/logo-rentacapital.png",
    buttons: [
      { 
        title: "Conexa: Consultor Inmobiliario Inteligente",
        link: "https://chatgpt.com/g/g-leof9vOA9-conexa-consultor-inmobiliario-inteligente",
        description: "Asesoría avanzada en inversiones inmobiliarias con inteligencia artificial, enfocada en maximizar el retorno de inversión."
      },
      { 
        title: "Asesor Experto en Créditos Hipotecarios",
        link: "https://chatgpt.com/g/g-oMPvfCVlv-asesor-experto-en-creditos-hipotecarios",
        description: "Consejería personalizada para obtener el mejor crédito hipotecario, ajustado a las necesidades financieras."
      }
    ]
  },
  {
    title: "Bi-Rent",
    logo: "/img/logo-birent.png",
    buttons: [
      { 
        title: "BI-RENT: Experto en Arriendo Multifamily",
        link: "https://chatgpt.com/g/g-KQ0Hz8XBk-bi-rent-experto-en-arriendo-multifamily",
        description: "Consultor especializado en el arriendo multifamily, proporcionando estrategias para optimizar ocupación y rentabilidad."
      },
      { 
        title: "Consultor Virtual de BI-RENT",
        link: "https://chatgpt.com/g/g-pRhyHnxaW-consultor-virtual-de-bi-rent",
        description: "Gerente virtual para apoyo estratégico y operativo, con planes de acción y soluciones escalables para el equipo de BI-RENT."
      }
    ]
  }
];

export default function BrainHub() {
  const theme = useTheme();

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        BrainHub
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 4 }}>
        Bienvenidos a BrainHub, el centro de inteligencia artificial que impulsa nuestras capacidades y marca el inicio de una nueva etapa de escalabilidad. Cada asistente GPT está diseñado para optimizar decisiones, simplificar tareas y abrirnos a nuevas dimensiones de crecimiento. Activa tu potencial y llevemos juntos la eficiencia al siguiente nivel.
      </Typography>

      {sections.map((section, index) => (
        <Box key={section.title} sx={{ mb: 4 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              mb: 2
            }}
          >
            {section.logo ? (
              <Box
                component="img"
                src={section.logo}
                alt={`Logo de ${section.title}`}
                sx={{ 
                  height: '30px',
                  mb: 1
                }}
              />
            ) : (
              <Typography 
                variant="h5" 
                component="h2"
                sx={{ 
                  color: '#004a5a',
                  fontWeight: 500
                }}
              >
                {section.title}
              </Typography>
            )}
          </Box>

          <Grid container spacing={2}>
            {section.buttons.map((button) => (
              <Grid item xs={12} md={6} key={button.title}>
                <Tooltip 
                  title={button.description}
                  placement="bottom"
                  sx={{
                    fontStyle: 'italic',
                    width: '100%'
                  }}
                >
                  <Button
                    variant="contained"
                    href={button.link}
                    target="_blank"
                    fullWidth
                    sx={{
                      backgroundColor: '#004a5a',
                      '&:hover': {
                        backgroundColor: '#003946',
                      },
                      textAlign: 'left',
                      textTransform: 'none',
                      height: '100%',
                      whiteSpace: 'normal',
                      lineHeight: 1.2
                    }}
                  >
                    {button.title}
                  </Button>
                </Tooltip>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Box>
  );
}