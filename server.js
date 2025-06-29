require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Define o origin do CORS via env var, ou aceita tudo para dev
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || '*';

app.use(cors({
  origin: CLIENT_ORIGIN,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração de Sessão com MongoDB
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 24 * 60 * 60 // 1 dia
  }),
  cookie: {
    // Em produção, geralmente queres secure: true, se usares HTTPS
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Conexão MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Rotas
app.use('/api/auth', require('./backend/routes/auth'));
app.use('/api/weather', require('./backend/routes/weather'));
app.use('/api/history', require('./backend/routes/history'));

// Servir frontend estático
app.use(express.static(path.join(__dirname, 'frontend')));

// Rota fallback para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
