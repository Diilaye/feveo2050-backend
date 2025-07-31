const express = require('express');
require('dotenv').config();

const app = express();

// Configuration de base
app.use(express.json());

console.log('🔧 Test de démarrage du serveur...');

// Test des routes une par une
try {
  console.log('📝 Chargement des routes d\'authentification...');
  const authRoutes = require('./src/routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('✅ Routes d\'authentification chargées');
} catch (error) {
  console.error('❌ Erreur routes auth:', error.message);
}

try {
  console.log('📝 Chargement des routes GIE...');
  const gieRoutes = require('./src/routes/gie');
  app.use('/api/gie', gieRoutes);
  console.log('✅ Routes GIE chargées');
} catch (error) {
  console.error('❌ Erreur routes GIE:', error.message);
}

try {
  console.log('📝 Chargement des routes adhésions...');
  const adhesionRoutes = require('./src/routes/adhesions');
  app.use('/api/adhesions', adhesionRoutes);
  console.log('✅ Routes adhésions chargées');
} catch (error) {
  console.error('❌ Erreur routes adhésions:', error.message);
}

try {
  console.log('📝 Chargement des routes investissements...');
  const investissementRoutes = require('./src/routes/investissements');
  app.use('/api/investissements', investissementRoutes);
  console.log('✅ Routes investissements chargées');
} catch (error) {
  console.error('❌ Erreur routes investissements:', error.message);
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur de test démarré sur le port ${PORT}`);
});
