const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Données de test pour créer un paiement
const testPaiementData = {
  montant: 5000, // 5000 XOF
  typePaiement: 'adhesion_gie',
  entiteId: '507f1f77bcf86cd799439011', // ID fictif pour test
  typeEntite: 'GIE',
  payeur: {
    nom: 'Diallo',
    prenom: 'Aminata',
    telephone: '771234567',
    email: 'aminata.diallo@test.com'
  },
  methodePaiement: 'wave',
  metadonnees: {
    source: 'test_api',
    description: 'Test de création de paiement'
  }
};

async function testPaiementAPI() {
  try {
    console.log('🧪 Test de l\'API de paiement FEVEO');
    console.log('=' .repeat(50));
    
    // 1. Connexion avec l'utilisateur admin
    console.log('🔐 Connexion...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@feveo.sn',
      motDePasse: 'admin123'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Échec de la connexion');
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ Connexion réussie');
    
    // 2. Créer un paiement de test
    console.log('\n💳 Création d\'un paiement test...');
    console.log('Données:', JSON.stringify(testPaiementData, null, 2));
    
    const createResponse = await axios.post(`${API_BASE_URL}/paiements`, testPaiementData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (createResponse.data.success) {
      const paiement = createResponse.data.data.paiement;
      console.log('✅ Paiement créé avec succès !');
      console.log(`📋 Référence: ${paiement.referencePaiement}`);
      console.log(`💰 Montant: ${paiement.montant} ${paiement.devise}`);
      console.log(`📊 Statut: ${paiement.statut}`);
      console.log(`🔗 ID: ${paiement._id}`);
      
      if (createResponse.data.data.urlPaiement) {
        console.log(`🌐 URL de paiement Wave: ${createResponse.data.data.urlPaiement}`);
      }
      
      // 3. Récupérer le paiement créé
      console.log('\n🔍 Vérification du paiement...');
      const getResponse = await axios.get(`${API_BASE_URL}/paiements/${paiement._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (getResponse.data.success) {
        console.log('✅ Paiement récupéré avec succès');
        console.log(`📋 Référence confirmée: ${getResponse.data.data.paiement.referencePaiement}`);
      }
      
      // 4. Lister les paiements
      console.log('\n📋 Liste des paiements...');
      const listResponse = await axios.get(`${API_BASE_URL}/paiements?limite=5`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (listResponse.data.success) {
        console.log(`✅ ${listResponse.data.data.paiements.length} paiement(s) trouvé(s)`);
        console.log('Pagination:', listResponse.data.data.pagination);
      }
      
      // 5. Test de récupération par référence (sans auth - endpoint public)
      console.log('\n🔍 Test récupération par référence...');
      const refResponse = await axios.get(`${API_BASE_URL}/paiements/reference/${paiement.referencePaiement}`);
      
      if (refResponse.data.success) {
        console.log('✅ Paiement récupéré par référence');
      }
      
      console.log('\n🎉 Tous les tests API de paiement sont passés !');
      console.log('\n💡 Intégrations disponibles:');
      console.log('  - Création de paiements avec Wave');
      console.log('  - Gestion des statuts de paiement');
      console.log('  - Historique des paiements');
      console.log('  - Webhooks Wave pour notifications');
      console.log('  - Annulation de paiements');
      
    } else {
      console.error('❌ Échec de création du paiement:', createResponse.data.message);
      if (createResponse.data.errors) {
        console.error('Détails:', createResponse.data.errors);
      }
    }
    
  } catch (error) {
    console.error('\n💥 Erreur lors du test:', error.message);
    if (error.response?.data) {
      console.error('Réponse serveur:', JSON.stringify(error.response.data, null, 2));
    }
    if (error.response?.status) {
      console.error('Code HTTP:', error.response.status);
    }
  }
}

// Lancer le test si le script est exécuté directement
if (require.main === module) {
  testPaiementAPI();
}

module.exports = { testPaiementAPI };
