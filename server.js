require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// ⛔ Substitui pelo teu domínio de frontend na Vercel:
const allowedOrigins = [
  'http://localhost:3000', // Desenvolvimento local
  'https://tp-2-pw-jvxa-pmllpdg6t-goncalomartinzs-projects.vercel.app', // Teu frontend Vercel
];

// ✅ CORS configurado para aceitar o domínio da Vercel
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  credentials: true
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessão com MongoDB
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 24 * 60 * 60
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Usa HTTPS em produção
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Rotas
app.use('/api/auth', require('./backend/routes/auth'));
app.use('/api/weather', require('./backend/routes/weather'));
app.use('/api/history', require('./backend/routes/history'));



// Fallback apenas para rotas inválidas da API
app.use((req, res, next) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Erros
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Inicia servidor
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

