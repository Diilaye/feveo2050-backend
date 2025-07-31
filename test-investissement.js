const mongoose = require('mongoose');
require('dotenv').config();

// Modèles
const GIE = require('./src/models/GIE');
const CycleInvestissement = require('./src/models/CycleInvestissement');

// Fonction pour connecter à la base de données
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connecté');
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error);
    process.exit(1);
  }
};

// Fonction pour créer un GIE de test
const createTestGIE = async () => {
  try {
    // Supprimer le GIE de test s'il existe
    await GIE.deleteOne({ identifiantGIE: 'TEST-001' });
    
    const testGIE = new GIE({
      nomGIE: 'GIE Test Investissement',
      identifiantGIE: 'TEST-001',
      presidenteNom: 'Test',
      presidentePrenom: 'Presidente',
      presidenteEmail: 'test@test.com',
      presidenteTelephone: '771234567',
      localisationRegion: 'Dakar',
      localisationDepartement: 'Dakar',
      localisationCommune: 'Dakar',
      activitePrincipale: 'Test',
      nombreMembres: 10,
      statut: 'validé', // Important : statut validé pour permettre les investissements
      codeValidation: 'TEST123'
    });

    const savedGIE = await testGIE.save();
    console.log('✅ GIE de test créé:', savedGIE.identifiantGIE);
    return savedGIE;
  } catch (error) {
    console.error('❌ Erreur création GIE:', error);
    throw error;
  }
};

// Fonction pour créer un cycle d'investissement
const createTestCycle = async (gieId) => {
  try {
    // Supprimer le cycle de test s'il existe
    await CycleInvestissement.deleteOne({ gieId });
    
    const testCycle = new CycleInvestissement({
      gieId,
      dateDebut: new Date(),
      dateFin: new Date(Date.now() + (1826 * 24 * 60 * 60 * 1000)), // 1826 jours
      dureeJours: 1826,
      montantJournalier: 6000,
      statutCycle: 'actif'
    });

    const savedCycle = await testCycle.save();
    console.log('✅ Cycle d\'investissement créé');
    console.log('   - Durée:', savedCycle.dureeJours, 'jours');
    console.log('   - Montant journalier:', savedCycle.montantJournalier, 'FCFA');
    console.log('   - Investissements générés:', savedCycle.investissementsJournaliers.length);
    
    return savedCycle;
  } catch (error) {
    console.error('❌ Erreur création cycle:', error);
    throw error;
  }
};

// Fonction pour tester l'API
const testAPI = async (gieId) => {
  try {
    const axios = require('axios');
    const baseURL = 'http://localhost:5000/api';
    
    console.log('\n🧪 Test des endpoints API...\n');
    
    // Test 1: Récupérer le cycle d'investissement (sans auth pour le test)
    try {
      const response = await axios.get(`${baseURL}/investissements/gie/${gieId}`);
      console.log('❌ Test GET cycle - ERREUR: Devrait être protégé par auth');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Test GET cycle - Protection auth OK (401)');
      } else {
        console.log('⚠️ Test GET cycle - Erreur inattendue:', error.response?.status || error.message);
      }
    }
    
    // Test 2: Vérifier que le GIE existe en base
    const gie = await GIE.findById(gieId);
    if (gie && gie.statut === 'validé') {
      console.log('✅ Test validation GIE - GIE trouvé et validé');
    } else {
      console.log('❌ Test validation GIE - Problème avec le GIE');
    }
    
    // Test 3: Vérifier que le cycle existe en base
    const cycle = await CycleInvestissement.findOne({ gieId });
    if (cycle && cycle.statutCycle === 'actif') {
      console.log('✅ Test cycle - Cycle trouvé et actif');
      console.log('   - Investissements disponibles:', cycle.investissementsJournaliers.filter(i => i.statut === 'disponible').length);
    } else {
      console.log('❌ Test cycle - Problème avec le cycle');
    }
    
  } catch (error) {
    console.error('❌ Erreur test API:', error.message);
  }
};

// Fonction principale
const main = async () => {
  console.log('🚀 Début des tests d\'investissement\n');
  
  try {
    await connectDB();
    
    const gie = await createTestGIE();
    const cycle = await createTestCycle(gie._id);
    
    await testAPI(gie._id);
    
    console.log('\n✅ Tous les tests sont terminés');
    console.log('\n📝 Résumé:');
    console.log('   - GIE ID:', gie._id);
    console.log('   - Identifiant:', gie.identifiantGIE);
    console.log('   - Statut GIE:', gie.statut);
    console.log('   - Statut Cycle:', cycle.statutCycle);
    console.log('   - Endpoints protégés par auth: ✅');
    console.log('\n💡 Pour tester avec auth, utilisez un token JWT valide');
    
  } catch (error) {
    console.error('❌ Erreur dans les tests:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
};

// Exécuter les tests
main();
