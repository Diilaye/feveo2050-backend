/**
 * Test API pour la création de GIE
 * Ce script teste l'endpoint POST /api/gie
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const TEST_USER_EMAIL = 'test@feveo.sn';
const TEST_USER_PASSWORD = 'password123';

// Données de test pour créer un GIE
const testGIEData = {
  // Informations générales du GIE
  nomGIE: "GIE Test Agriculture Bio",
  identifiantGIE: "TEST-AGR-001",
  numeroProtocole: "PROT-2025-001",
  adresse: "Dakar, Sénégal",
  telephone: "+221 33 123 45 67",
  email: "test.gie@exemple.com",
  
  // Localisation
  region: "Dakar",
  departement: "Dakar",
  commune: "Dakar-Plateau",
  
  // Activité
  secteurPrincipal: "Agriculture",
  secteursSecondaires: ["Commerce", "Élevage"],
  activitePrincipale: "Production de légumes biologiques",
  activitesSecondaires: ["Vente directe", "Formation agricole"],
  
  // Informations de la présidente
  presidenteNom: "Diallo",
  presidentePrenom: "Fatou",
  presidenteCIN: "1234567890123",
  presidenteTelephone: "+221 77 123 45 67",
  presidenteEmail: "fatou.diallo@exemple.com",
  presidenteAdresse: "Médina, Dakar",
  
  // Membres du GIE
  membres: [
    {
      nom: "Diallo",
      prenom: "Fatou",
      fonction: "Présidente",
      cin: "1234567890123",
      telephone: "+221 77 123 45 67",
      genre: "femme",
      age: 35,
      email: "fatou.diallo@exemple.com"
    },
    {
      nom: "Sow",
      prenom: "Aminata",
      fonction: "Vice-Présidente",
      cin: "1234567890124",
      telephone: "+221 77 234 56 78",
      genre: "femme",
      age: 32,
      email: "aminata.sow@exemple.com"
    },
    {
      nom: "Ba",
      prenom: "Mariama",
      fonction: "Trésorière",
      cin: "1234567890125",
      telephone: "+221 77 345 67 89",
      genre: "femme",
      age: 28,
      email: "mariama.ba@exemple.com"
    },
    {
      nom: "Fall",
      prenom: "Awa",
      fonction: "Secrétaire",
      cin: "1234567890126",
      telephone: "+221 77 456 78 90",
      genre: "femme",
      age: 30,
      email: "awa.fall@exemple.com"
    },
    {
      nom: "Sarr",
      prenom: "Khady",
      fonction: "Membre",
      cin: "1234567890127",
      telephone: "+221 77 567 89 01",
      genre: "femme",
      age: 26,
      email: "khady.sarr@exemple.com"
    }
  ],
  
  // Informations financières
  capitalInitial: 500000,
  cotisationMensuelle: 25000,
  
  // Objectifs
  objectifsPrincipaux: [
    "Développer l'agriculture biologique",
    "Créer des emplois pour les femmes",
    "Améliorer les revenus des membres"
  ],
  
  // Statut
  statutAdhesion: "En attente",
  
  // Métadonnées
  dateCreation: new Date(),
  dateAdhesion: null
};

// Fonction pour s'authentifier et obtenir le token
async function authenticate() {
  try {
    console.log('🔐 Authentification en cours...');
    
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: TEST_USER_EMAIL,
      motDePasse: TEST_USER_PASSWORD
    });
    
    if (loginResponse.data.success) {
      console.log('✅ Authentification réussie');
      return loginResponse.data.data.token;
    } else {
      throw new Error('Échec de l\'authentification');
    }
  } catch (error) {
    console.error('❌ Erreur d\'authentification:', error.response?.data?.message || error.message);
    throw error;
  }
}

// Fonction pour tester la création d'un GIE
async function testGIECreation(token) {
  try {
    console.log('\n📝 Test de création de GIE...');
    console.log('Données à envoyer:', JSON.stringify(testGIEData, null, 2));
    
    const response = await axios.post(`${API_BASE_URL}/gie`, testGIEData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success) {
      console.log('✅ GIE créé avec succès !');
      console.log('📊 Réponse du serveur:');
      console.log(JSON.stringify(response.data, null, 2));
      
      return response.data.data.gie;
    } else {
      throw new Error('Échec de la création du GIE');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la création du GIE:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data?.message || 'Erreur inconnue');
      console.error('Détails:', error.response.data?.error || 'Aucun détail');
      if (error.response.data?.validationErrors) {
        console.error('Erreurs de validation:', error.response.data.validationErrors);
      }
    } else {
      console.error('Erreur:', error.message);
    }
    throw error;
  }
}

// Fonction pour vérifier le GIE créé
async function verifyGIECreation(token, gieId) {
  try {
    console.log('\n🔍 Vérification du GIE créé...');
    
    const response = await axios.get(`${API_BASE_URL}/gie/${gieId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.data.success) {
      console.log('✅ GIE trouvé et vérifié !');
      console.log('📋 Informations du GIE:');
      const gie = response.data.data;
      console.log(`- ID: ${gie._id}`);
      console.log(`- Nom: ${gie.nomGIE}`);
      console.log(`- Identifiant: ${gie.identifiantGIE}`);
      console.log(`- Présidente: ${gie.presidentePrenom} ${gie.presidenteNom}`);
      console.log(`- Membres: ${gie.membres?.length || 0}`);
      console.log(`- Statut: ${gie.statutAdhesion}`);
      
      return true;
    } else {
      throw new Error('GIE non trouvé');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.response?.data?.message || error.message);
    return false;
  }
}

// Fonction pour tester la récupération de la liste des GIE
async function testGIEList(token) {
  try {
    console.log('\n📋 Test de récupération de la liste des GIE...');
    
    const response = await axios.get(`${API_BASE_URL}/gie`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        page: 1,
        limit: 10
      }
    });
    
    if (response.data.success) {
      console.log('✅ Liste des GIE récupérée !');
      console.log(`📊 Total: ${response.data.pagination?.total || 0} GIE(s)`);
      
      if (response.data.data?.length > 0) {
        console.log('🏢 GIE trouvés:');
        response.data.data.forEach((gie, index) => {
          console.log(`  ${index + 1}. ${gie.nomGIE} (${gie.identifiantGIE})`);
        });
      }
      
      return true;
    } else {
      throw new Error('Échec de récupération de la liste');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de la liste:', error.response?.data?.message || error.message);
    return false;
  }
}

// Fonction pour tester les statistiques des GIE
async function testGIEStats(token) {
  try {
    console.log('\n📈 Test de récupération des statistiques...');
    
    const response = await axios.get(`${API_BASE_URL}/gie/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.data.success) {
      console.log('✅ Statistiques récupérées !');
      console.log('📊 Statistiques:');
      console.log(JSON.stringify(response.data.data, null, 2));
      
      return true;
    } else {
      throw new Error('Échec de récupération des statistiques');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des statistiques:', error.response?.data?.message || error.message);
    return false;
  }
}

// Fonction pour nettoyer (supprimer le GIE de test)
async function cleanupTestGIE(token, gieId) {
  try {
    console.log('\n🧹 Nettoyage du GIE de test...');
    
    const response = await axios.delete(`${API_BASE_URL}/gie/${gieId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.data.success || response.status === 200) {
      console.log('✅ GIE de test supprimé avec succès !');
      return true;
    } else {
      throw new Error('Échec de la suppression');
    }
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('ℹ️ GIE déjà supprimé ou non trouvé');
      return true;
    }
    console.error('❌ Erreur lors de la suppression:', error.response?.data?.message || error.message);
    return false;
  }
}

// Fonction principale pour exécuter tous les tests
async function runAllTests() {
  let token = null;
  let createdGIE = null;
  
  try {
    console.log('🚀 Démarrage des tests API pour la création de GIE');
    console.log('=' .repeat(60));
    
    // 1. Authentification
    token = await authenticate();
    
    // 2. Test de création de GIE
    createdGIE = await testGIECreation(token);
    
    // 3. Vérification du GIE créé
    await verifyGIECreation(token, createdGIE._id);
    
    // 4. Test de la liste des GIE
    await testGIEList(token);
    
    // 5. Test des statistiques
    await testGIEStats(token);
    
    console.log('\n🎉 Tous les tests ont été exécutés avec succès !');
    
  } catch (error) {
    console.error('\n💥 Échec des tests:', error.message);
  } finally {
    // 6. Nettoyage (optionnel - commentez si vous voulez garder le GIE de test)
    if (token && createdGIE) {
      console.log('\n⚠️ Voulez-vous supprimer le GIE de test ? (Commentez la ligne suivante pour le garder)');
      // await cleanupTestGIE(token, createdGIE._id);
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('🏁 Tests terminés');
  }
}

// Fonction pour tester avec des données invalides
async function testInvalidGIECreation(token) {
  try {
    console.log('\n❌ Test avec des données invalides...');
    
    const invalidData = {
      nomGIE: "", // Nom vide (invalide)
      identifiantGIE: "INVALID",
      // Manque des champs requis
    };
    
    const response = await axios.post(`${API_BASE_URL}/gie`, invalidData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('⚠️ La requête a réussi alors qu\'elle devrait échouer');
    
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Validation correcte - données invalides rejetées');
      console.log('📝 Erreurs de validation:', error.response.data?.message);
    } else {
      console.error('❌ Erreur inattendue:', error.response?.data?.message || error.message);
    }
  }
}

// Exporter les fonctions pour utilisation externe
module.exports = {
  authenticate,
  testGIECreation,
  verifyGIECreation,
  testGIEList,
  testGIEStats,
  cleanupTestGIE,
  runAllTests,
  testInvalidGIECreation
};

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  runAllTests();
}
