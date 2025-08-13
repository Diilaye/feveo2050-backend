const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
require('dotenv').config();

const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { Twilio } = require("twilio");
const { body, validationResult } = require("express-validator");


const connectDB = require('./src/config/database');

// Import des routes
const authRoutes = require('./src/routes/auth');
const gieRoutes = require('./src/routes/gie');
const adhesionRoutes = require('./src/routes/adhesions');
const investissementRoutes = require('./src/routes/investissements');
const walletRoutes = require('./src/routes/wallet');
const paiementRoutes = require('./src/routes/paiements');
const paymentRoutes = require('./src/routes/payments');
const twilioTestRoutes = require('./src/routes/twilio-test');
const whatsappTestRoutes = require('./src/routes/whatsapp-test');
const messagingTestRoutes = require('./src/routes/messaging-test');


const app = express();

// Configuration du trust proxy pour Apache
app.set('trust proxy', 1); // Trust first proxy (Apache)

// Connexion à la base de données
connectDB();

// Middleware de sécurité
app.use(helmet({
  crossOriginEmbedderPolicy: false
}));

// Configuration CORS - Autoriser toutes les origines avec configuration explicite
app.use(cors({
  origin: function(origin, callback) {
    // Autoriser toutes les origines en développement et production
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  optionsSuccessStatus: 200, // Pour supporter les anciens navigateurs
  preflightContinue: false
}));

// Middleware OPTIONS explicite pour gérer les requêtes preflight
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Middleware de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('combined'));
}

// Health check
app.get('/health', (req, res) => {
  // Headers CORS explicites pour le health check
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  res.json({
    success: true,
    message: 'API FEVEO 2050 - Serveur opérationnel',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    server: 'Apache + Node.js',
    ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip,
    cors: 'enabled'
  });
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/gie', gieRoutes);
app.use('/api/adhesions', adhesionRoutes);
app.use('/api/investissements', investissementRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/paiements', paiementRoutes);
//app.use('/api/payments', paymentRoutes);
app.use('/api/twilio', twilioTestRoutes);
app.use('/api/whatsapp', whatsappTestRoutes);
app.use('/api/messaging', messagingTestRoutes);
app.use('/api/whatsapp', whatsappTestRoutes);

// Route de test
app.get('/api/test', (req, res) => {
  // Headers CORS explicites
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  
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
    ],
    cors: 'Configuration CORS active',
    timestamp: new Date().toISOString()
  });
});
// === OTP store en mémoire ===
const store = new Map(); // key: phone, value: { hash, expiresAt, attempts, lastSendAt }

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const ATTEMPT_LIMIT = 5;
const RESEND_COOLDOWN_MS = 60 * 1000;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 10;

// === Rate limit par IP (mémoire) ===
const rateBucket = new Map();

function rateLimit(ip) {
  const now = Date.now();
  const b = rateBucket.get(ip);
  if (!b || now - b.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateBucket.set(ip, { count: 1, windowStart: now });
    return;
  }
  b.count++;
  if (b.count > RATE_LIMIT_MAX) throw new Error("RATE_LIMIT");
}

// Nettoyage périodique des OTP expirés
setInterval(() => {
  const now = Date.now();
  for (const [phone, rec] of store.entries()) {
    if (rec.expiresAt <= now) store.delete(phone);
  }
}, 30_000);

// === Utils ===
const twilio = new Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

function generateOtp(len = 6) {
  return crypto.randomInt(0, 10 ** len).toString().padStart(len, "0");
}
function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}
function clientIp(req) {
  return (req.headers["x-forwarded-for"] || "").split(",")[0].trim()
    || req.socket.remoteAddress
    || "ip";
}

// === Routes ===


const PORT = process.env.PORT || 3051;

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
   🌐 Production: https://api.feveo2025.sn
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
