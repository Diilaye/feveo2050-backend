const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./src/config/database');

// Import des routes
const authRoutes = require('./src/routes/auth');
const gieRoutes = require('./src/routes/gie');
const adhesionRoutes = require('./src/routes/adhesions');
const investissementRoutes = require('./src/routes/investissements');
const walletRoutes = require('./src/routes/wallet');
const paiementRoutes = require('./src/routes/paiements');
const paymentRoutes = require('./src/routes/payments');


const app = express();

// Connexion à la base de données
connectDB();

// Middleware de sécurité
app.use(helmet({
  crossOriginEmbedderPolicy: false
}));

// Configuration CORS - Autoriser toutes les origines
app.use(cors({
  origin: true, // Autoriser toutes les origines
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200 // Pour supporter les anciens navigateurs
}));

// Limitation du taux de requêtes
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limite chaque IP à 100 requêtes par windowMs
  message: {
    success: false,
    message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

// Middleware de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('combined'));
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API FEVEO 2050 - Serveur opérationnel',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV
  });
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/gie', gieRoutes);
app.use('/api/adhesions', adhesionRoutes);
app.use('/api/investissements', investissementRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/paiements', paiementRoutes);
app.use('/api/payments', paymentRoutes);

// Route de test
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API FEVEO 2050 fonctionne correctement!',
    features: [
      'Gestion des GIE',
      'Système d\'adhésion',
      'Cycle d\'investissement 1826 jours',
      'Wallet GIE',
      'Authentification JWT',
      'Validation des données'
    ]
  });
});

// Middleware de gestion des erreurs 404
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée',
    path: req.originalUrl,
    method: req.method
  });
});

// Middleware global de gestion des erreurs
app.use((error, req, res, next) => {
  console.error('🚨 Erreur serveur:', error);

  // Erreur de validation Mongoose
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Erreur de validation',
      errors
    });
  }

  // Erreur de duplication MongoDB
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} existe déjà`,
      field
    });
  }

  // Erreur CastError (ID MongoDB invalide)
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID invalide'
    });
  }

  // Erreur générique
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
🚀 ===============================================
   🌍 Serveur FEVEO 2050 démarré avec succès!
   📍 Port: ${PORT}
   🌐 Environment: ${process.env.NODE_ENV || 'development'}
   💾 Base de données: MongoDB
   🔗 URL: http://localhost:${PORT}
   🏥 Health check: http://localhost:${PORT}/health
   🧪 Test API: http://localhost:${PORT}/api/test
   📚 Documentation: En cours de développement
===============================================
  `);
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (err, promise) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  process.exit(1);
});

module.exports = app;
