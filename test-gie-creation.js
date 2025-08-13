/**
 * Test API pour la création de GIE
 * Ce script teste l'endpoint POST /api/gie
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:4320/api';

// Données de test pour créer un GIE avec le format exact FEVEO
const testGIEData = {
  "nomGIE": "FEVEO-KD-KD-SM-01-02-005",
  "identifiantGIE": "FEVEO-KD-KD-SM-01-02-005",
  "numeroProtocole": "005",
  "presidenteNom": "Kane",
  "presidentePrenom": "Seydina Issa Laye",
  "presidenteCIN": "78569854125632",
  "presidenteTelephone": "+221772488856",
  "presidenteEmail": "diikaanedev@gmail.com",
  "presidenteAdresse": "Dakar,Camberene\nCamberene",
  "region": "KEDOUGOU",
  "departement": "SALEMATATA",
  "arrondissement": "SALEMATATA",
  "commune": "Dakately",
  "secteurPrincipal": "Agriculture",
  "objectifs": "GIE FEVEO-KD-KD-SM-01-02-005 spécialisé dans Agriculture",
  "activites": ["Production", "Commerce", "Formation"],
  "dateConstitution": "2025-08-04",
  "nombreMembres": 40,
  "membres": Array.from({length: 39}, (_, i) => ({
    "nom": `Membre${i+1}`,
    "prenom": `Prenom${i+1}`,
    "fonction": "Membre",
    "cin": `CIN${(i+1).toString().padStart(4, '0')}`,
    "telephone": `+22177${(i+1).toString().padStart(7, '0')}`,
    "genre": i < 25 ? "femme" : (i < 37 ? "jeune" : "homme")
  })),
  "secteurActivite": "Agriculture",
  "description": "GIE FEVEO-KD-KD-SM-01-02-005 spécialisé dans Agriculture",
  "besoinsFinancement": 500000
};


// Fonction pour tester l'enregistrement public d'un GIE (sans authentification)
async function testGIEEnregistrement() {
  try {
    console.log('\n📝 Test d\'enregistrement public de GIE...');
    console.log('🚀 Format testé:', testGIEData.identifiantGIE);
    console.log('📊 Données à envoyer:', JSON.stringify(testGIEData, null, 2));
    
    const response = await axios.post(`${API_BASE_URL}/gie/enregistrer`, testGIEData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success) {
      console.log('✅ GIE enregistré avec succès !');
      console.log('📊 Réponse du serveur:');
      console.log(JSON.stringify(response.data, null, 2));
      
      return response.data.data;
    } else {
      throw new Error('Échec de l\'enregistrement du GIE');
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'enregistrement du GIE:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data?.message || 'Erreur inconnue');
      console.error('Erreurs:', error.response.data?.errors || 'Aucune erreur détaillée');
    } else {
      console.error('Erreur:', error.message);
    }
    throw error;
  }
}

// Fonction principale pour exécuter le test d'enregistrement FEVEO
async function runFEVEOTest() {
  try {
    console.log('🚀 Démarrage du test d\'enregistrement GIE FEVEO');
    console.log('=' .repeat(60));
    
    // Test d'enregistrement public (sans authentification)
    const gieEnregistre = await testGIEEnregistrement();
    
    console.log('\n🎉 Test d\'enregistrement réussi !');
    console.log('📋 GIE enregistré:');
    console.log(`- Identifiant: ${gieEnregistre.identifiantGIE || gieEnregistre.nomGIE}`);
    console.log(`- Statut: ${gieEnregistre.statutEnregistrement || 'En attente'}`);
    
  } catch (error) {
    console.error('\n💥 Échec du test:', error.message);
  } finally {
    console.log('\n' + '=' .repeat(60));
    console.log('🏁 Test terminé');
  }
}

// Exporter les fonctions pour utilisation externe
module.exports = {
  testGIEEnregistrement,
  runFEVEOTest
};

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  runFEVEOTest();
}
