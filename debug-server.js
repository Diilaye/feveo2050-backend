const express = require('express');
require('dotenv').config();

const app = express();

// Middleware de base
app.use(express.json());

// Health check simple
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Test des routes une par une
console.log('🔧 Chargement des routes...');

try {
  console.log('1. Chargement auth...');
  const authRoutes = require('./src/routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth chargé');
} catch (error) {
  console.error('❌ Erreur auth:', error.message);
  process.exit(1);
}

try {
  console.log('2. Chargement GIE...');
  const gieRoutes = require('./src/routes/gie');
  app.use('/api/gie', gieRoutes);
  console.log('✅ GIE chargé');
} catch (error) {
  console.error('❌ Erreur GIE:', error.message);
  process.exit(1);
}

try {
  console.log('3. Chargement adhésions...');
  const adhesionRoutes = require('./src/routes/adhesions');
  app.use('/api/adhesions', adhesionRoutes);
  console.log('✅ Adhésions chargé');
} catch (error) {
  console.error('❌ Erreur adhésions:', error.message);
  process.exit(1);
}

try {
  console.log('4. Chargement investissements...');
  const investissementRoutes = require('./src/routes/investissements');
  app.use('/api/investissements', investissementRoutes);
  console.log('✅ Investissements chargé');
} catch (error) {
  console.error('❌ Erreur investissements:', error.message);
  process.exit(1);
}

const PORT = 5001;

app.listen(PORT, () => {
  console.log(`🚀 Serveur de debug démarré sur le port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
