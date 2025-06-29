require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração de CORS
const allowedOrigins = [
  'http://localhost:3000',                      // Frontend local
  'https://teu-frontend-na-vercel.vercel.app',  // Caso você suba na Vercel no futuro (pode remover se não quiser)
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Middleware para receber JSON
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
    secure: false, // Para produção com HTTPS, você pode depois mudar pra true
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Conexão com o MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Rotas da API
app.use('/api/auth', require('./backend/routes/auth'));
app.use('/api/weather', require('./backend/routes/weather'));
app.use('/api/history', require('./backend/routes/history'));

// Servir arquivos estáticos do frontend (se quiser fazer build futuramente)
app.use(express.static(path.join(__dirname, 'frontend')));

// Rota fallback (Single Page Applications como React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Inicializar o servidor
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

