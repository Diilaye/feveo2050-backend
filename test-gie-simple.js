/**
 * Test API Simple pour la création de GIE
 * Version simplifiée pour tests rapides
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Données de test simplifiées avec identifiants uniques
const timestamp = Date.now().toString().slice(-6); // 6 derniers chiffres du timestamp
const simpleGIEData = {
  nomGIE: `FEVEO-01-01-01-01-${timestamp.slice(0,3)}`, // Format requis avec timestamp
  identifiantGIE: `FEVEO-01-01-01-01-${timestamp.slice(0,3)}`, // Format requis
  numeroProtocole: timestamp.slice(0,3), // 3 chiffres du timestamp
  adresse: "Dakar, Sénégal",
  telephone: "331112233",
  email: `simple${timestamp}@test.com`,
  region: "DAKAR", // En majuscules
  departement: "Dakar",
  commune: "Dakar-Plateau",
  secteurPrincipal: "Agriculture",
  activitePrincipale: "Maraîchage",
  presidenteNom: "Ndiaye",
  presidentePrenom: "Awa",
  presidenteCIN: `98765432101${timestamp.slice(0,2)}`, // CIN unique
  presidenteTelephone: "779998877", // Format sénégalais sans +
  presidenteEmail: `awa.ndiaye${timestamp}@test.com`,
  presidenteAdresse: "Pikine, Dakar",
  // 39 membres (sans la présidente)
  membres: Array.from({length: 39}, (_, i) => ({
    nom: `Membre${i + 1}`,
    prenom: `Prenom${i + 1}`,
    fonction: "Membre",
    cin: `123456789012${i.toString().padStart(2, '0')}`,
    telephone: `77${(1000000 + i).toString().slice(1)}`,
    genre: i % 2 === 0 ? "femme" : "homme",
    age: 25 + (i % 20),
    email: `membre${i + 1}@test.com`
  })),
  capitalInitial: 100000,
  cotisationMensuelle: 10000,
  objectifsPrincipaux: ["Test de création de GIE"],
  statutAdhesion: "En attente"
};

// Fonction de test rapide
async function quickTest() {
  try {
    console.log('🚀 Test rapide de création de GIE');
    console.log('================================');
    
    // 1. Authentification
    console.log('🔐 Authentification...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@feveo.sn',
      motDePasse: 'password123'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Échec authentification');
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ Authentification réussie');
    console.log('Token:', token.substring(0, 20) + '...');
    
    // 2. Création du GIE
    console.log('\n📝 Création du GIE...');
    const createResponse = await axios.post(`${API_BASE_URL}/gie`, simpleGIEData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (createResponse.data.success) {
      console.log('✅ GIE créé avec succès !');
      console.log(`📋 ID: ${createResponse.data.data.gie._id}`);
      console.log(`📋 Nom: ${createResponse.data.data.gie.nomGIE}`);
      console.log(`📋 Identifiant: ${createResponse.data.data.gie.identifiantGIE}`);
      
      // 3. Vérification
      console.log('\n🔍 Vérification...');
      const verifyResponse = await axios.get(`${API_BASE_URL}/gie/${createResponse.data.data.gie._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (verifyResponse.data.success) {
        console.log('✅ GIE vérifié avec succès !');
      }
      
      return createResponse.data.data.gie._id;
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data?.message || error.message);
    if (error.response?.data?.validationErrors) {
      console.error('📝 Erreurs de validation:', error.response.data.validationErrors);
    }
    if (error.response?.data) {
      console.error('📄 Réponse complète:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Exécution du test
if (require.main === module) {
  quickTest();
}

module.exports = { quickTest, simpleGIEData };
