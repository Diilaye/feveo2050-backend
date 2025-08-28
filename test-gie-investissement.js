/**
 * Test pour l'activation d'investissement d'un GIE
 */

const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Données d'authentification pour un admin
const adminCredentials = {
  email: 'admin@feveo2050.com',
  password: 'Feveo2050!'
};

// Fonction pour attendre un certain temps
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  let adminToken;
  let testGieId;
  
  console.log('=== Test d\'activation d\'investissement GIE ===');

  try {
    // Étape 1: Connexion en tant qu'admin
    console.log('1. Connexion admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/admin/login`, adminCredentials);
    adminToken = loginResponse.data.token;
    console.log('✅ Admin connecté avec succès');

    // Étape 2: Récupérer la liste des GIE
    console.log('2. Récupération des GIE...');
    const giesResponse = await axios.get(`${API_BASE_URL}/admin/gies`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    const gies = giesResponse.data.data;
    if (!gies || gies.length === 0) {
      throw new Error('Aucun GIE trouvé pour le test');
    }

    // Sélection d'un GIE avec adhésion validée
    const validGie = gies.find(g => g.statutAdhesion === 'validee' && g.statutEnregistrement === 'valide');
    if (!validGie) {
      throw new Error('Aucun GIE avec adhésion validée trouvé pour le test');
    }

    testGieId = validGie._id;
    console.log(`✅ GIE sélectionné: ${validGie.nomGIE} (${testGieId})`);

    // Étape 3: Activer l'investissement pour ce GIE
    console.log('3. Activation de l\'investissement...');
    const dureeJours = 30; // 30 jours d'investissement
    const activationResponse = await axios.post(
      `${API_BASE_URL}/admin/gies/${testGieId}/activer-investissement`,
      { dureeJours },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    console.log('Réponse activation:', JSON.stringify(activationResponse.data, null, 2));

    // Étape 4: Vérifier l'état d'investissement du GIE
    console.log('4. Vérification de l\'état après activation...');
    const gieDetailsResponse = await axios.get(
      `${API_BASE_URL}/admin/gies/${testGieId}`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    const updatedGie = gieDetailsResponse.data.data;
    
    // Vérification des informations d'investissement
    if (updatedGie.investissementActif) {
      console.log('✅ Investissement activé avec succès');
      console.log(`Date début: ${new Date(updatedGie.investissementDateDebut).toLocaleDateString()}`);
      console.log(`Date fin: ${new Date(updatedGie.investissementDateFin).toLocaleDateString()}`);
      console.log(`Durée: ${updatedGie.investissementDureeJours} jours`);
    } else {
      console.log('❌ L\'investissement n\'a pas été activé correctement');
    }

    console.log('=== Test terminé avec succès ===');
  } catch (error) {
    console.error('❌ Erreur pendant le test:', error.message);
    if (error.response) {
      console.error('Détails de l\'erreur:', error.response.data);
    }
  }
}

main().catch(console.error);
