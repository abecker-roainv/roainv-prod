// app/(protected)/rc/condiciones-comerciales/page.js
"use client";

import { useState, useRef, useEffect } from 'react';
import { 
  Box,
  Container,
  Paper,
  TextField,
  IconButton,
  Typography,
  AppBar,
  Toolbar,
  Link,
  CircularProgress,
  Tooltip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import { styled } from '@mui/material/styles';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const ChatContainer = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[50]
}));

const MessageContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  '&:hover': {
    '& .message-actions': {
      opacity: 1
    }
  }
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  opacity: 0,
  transition: 'opacity 0.2s',
  marginTop: theme.spacing(1)
}));

// Modifica el TypeWriter para manejar markdown y referencias
const TypeWriter = ({ content, onComplete }) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const typeContent = async () => {
      setIsTyping(true);
      setDisplayedContent('');
      
      // Mejoramos la detección de tokens para incluir párrafos
      const tokens = content.match(/(\n\n|\n|:\s|\*\*[^*]+\*\*|\[[0-9]+\]|[^*\s\[\]]+|\s+)/g) || [];
      let currentText = '';

      for (const token of tokens) {
        if (!isMounted) break;
        
        currentText += token;
        setDisplayedContent(currentText);
        
        // Ajustamos las velocidades según el tipo de contenido
        const delay = 
          token === '\n\n' ? 400 : // Pausa más larga entre párrafos
          token === '\n' ? 200 : // Pausa media para saltos de línea
          token.match(/^:\s/) ? 300 : // Pausa para los dos puntos
          token.match(/^\s+$/) ? 10 : // Muy rápido para espacios
          token.match(/^\*\*|^\[\d+\]$/) ? 15 : // Rápido para formato
          30; // Normal para texto
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      setIsTyping(false);
      if (onComplete) onComplete();
    };

    typeContent();

    return () => {
      isMounted = false;
    };
  }, [content]);

  return (
    <Typography
      component="div"
      sx={{
        '& [data-reference]': {
          color: 'primary.main',
          cursor: 'pointer',
          fontWeight: 500,
          mx: 0.5,
          '&:hover': {
            textDecoration: 'underline'
          }
        },
        '& strong': {
          color: 'text.primary',
          fontWeight: 600
        },
        '& p': {
          marginBottom: 2,
          lineHeight: 1.6
        },
        whiteSpace: 'pre-line', // Mantiene los saltos de línea
        lineHeight: 1.6,
        fontSize: '0.95rem'
      }}
      dangerouslySetInnerHTML={{
        __html: displayedContent
          .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
          .replace(/\[(\d+)\]/g, '<span data-reference="$1">[$1]</span>')
          .replace(/\n\n/g, '</p><p>') // Convierte dobles saltos de línea en párrafos
          .replace(/\n/g, '<br />') // Convierte saltos simples en <br>
          .replace(/^(.+)/, '<p>$1') // Asegura que el contenido comience con <p>
          .replace(/(.+)$/, '$1</p>') // Asegura que el contenido termine con </p>
      }}
    />
  );
};

const MessageContent = ({ message }) => {
  const [isComplete, setIsComplete] = useState(false);

  if (message.role === 'user') {
    return <Typography>{message.content}</Typography>;
  }

  // Extraer números de referencia del contenido
  const extractReferences = (content) => {
    const matches = content.match(/\[(\d+)\]/g) || [];
    return [...new Set(matches.map(m => parseInt(m.match(/\d+/)[0])))]
      .sort((a, b) => a - b);
  };

  // Filtrar referencias usadas
  const usedRefs = extractReferences(message.content);
  const filteredRefs = message.references?.filter((_, idx) => 
    usedRefs.includes(idx + 1)
  );

  return (
    <Box>
      <TypeWriter 
        content={message.content} 
        onComplete={() => setIsComplete(true)}
      />
      
      {isComplete && filteredRefs?.length > 0 && (
        <Box sx={{ 
          mt: 3,
          pt: 2, 
          borderTop: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Referencias:
          </Typography>
          <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
            {filteredRefs.map((ref, idx) => (
              <Box
                component="li"
                key={usedRefs[idx]}
                sx={{
                  display: 'flex',
                  fontSize: '0.85rem',
                  color: 'text.secondary',
                  mb: 0.5
                }}
              >
                <Typography sx={{ 
                  minWidth: 24,
                  color: 'primary.main',
                  fontWeight: 500 
                }}>
                  [{usedRefs[idx]}]
                </Typography>
                <Link
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: 'inherit',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {ref.title}
                </Link>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setIsLoading(true);

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage }),
      });

      if (!response.ok) throw new Error('Error en la búsqueda');

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.summary,
        references: data.references
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu consulta.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // Opcional: Mostrar un snackbar de éxito
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar variant="dense" sx={{ 
          flexDirection: 'column', 
          alignItems: 'flex-start', 
          padding: 2
        }}>
          <Typography variant="h6" sx={{ fontSize: '1.1rem', mb: 2 }}>
            Asistente condiciones comerciales
          </Typography>
          <Typography variant="body1" gutterBottom sx={{ mb: 1.5 }}>
            Accede a información detallada sobre proyectos inmobiliarios, incluyendo condiciones comerciales, documentación legal y datos de contacto
          </Typography>
          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
            La disponibilidad de unidades debe consultarse directamente con cada inmobiliaria
          </Typography>
        </Toolbar>
      </AppBar>

      <ChatContainer>
        <Container maxWidth="md">
          {messages.map((message, index) => (
            <MessageContainer key={index}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: message.role === 'user' ? 'primary.main' : 'secondary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.8rem'
                  }}
                >
                  {message.role === 'user' ? 'U' : 'A'}
                </Box>

                <Box sx={{ flex: 1 }}>
                  <MessageContent message={message} />

                  <ActionButtons className="message-actions">
                    <Tooltip title="Me gusta">
                      <IconButton size="small"><ThumbUpIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="No me gusta">
                      <IconButton size="small"><ThumbDownIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Copiar">
                      <IconButton size="small" onClick={() => handleCopy(message.content)}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Escuchar">
                      <IconButton size="small">
                        <HeadphonesIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </ActionButtons>
                </Box>
              </Box>
            </MessageContainer>
          ))}
          <div ref={messagesEndRef} />
        </Container>
      </ChatContainer>

      <Paper 
        component="form" 
        onSubmit={handleSubmit}
        sx={{ 
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
        }}
        elevation={3}
      >
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Haz una pregunta sobre condiciones comerciales..."
              disabled={isLoading}
              size="small"
              sx={{ backgroundColor: 'background.paper' }}
            />
            <IconButton 
              type="submit" 
              disabled={isLoading}
              color="primary"
            >
              {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
            </IconButton>
          </Box>
        </Container>
      </Paper>
    </Box>
  );
}