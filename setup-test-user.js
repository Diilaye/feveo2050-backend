/**
 * S// Données pour créer l'utilisateur admin de test
const adminUser = {
  nom: "Admin",
  prenom: "FEVEO",
  email: "admin@feveo.sn",
  motDePasse: "password123",
  telephone: "771234567", // Mobile sénégalais (77 + 7 chiffres)
  role: "admin"
};r créer un utilisateur admin de test
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Données pour créer l'utilisateur admin de test
const adminUser = {
  nom: "Admin",
  prenom: "FEVEO",
  email: "admin@feveo.sn",
  motDePasse: "admin123",
  telephone: "771234567", // Format sénégalais mobile (77 + 7 chiffres)
  role: "admin"
};

async function createTestUser() {
  try {
    console.log('👤 Création de l\'utilisateur admin de test...');
    
    const response = await axios.post(`${API_BASE_URL}/auth/register`, adminUser);
    
    if (response.data.success) {
      console.log('✅ Utilisateur admin créé avec succès !');
      console.log('📧 Email:', adminUser.email);
      console.log('🔑 Mot de passe:', adminUser.motDePasse);
      console.log('👤 Rôle:', adminUser.role);
      
      return response.data;
    } else {
      throw new Error('Échec de la création de l\'utilisateur');
    }
  } catch (error) {
    if (error.response?.status === 400 && error.response.data?.message?.includes('existe déjà')) {
      console.log('ℹ️ L\'utilisateur admin existe déjà');
      return true;
    } else {
      console.error('❌ Erreur lors de la création de l\'utilisateur:');
      console.error('Message:', error.response?.data?.message || error.message);
      if (error.response?.data?.errors) {
        console.error('Détails:', error.response.data.errors);
      }
      throw error;
    }
  }
}

async function testLogin() {
  try {
    console.log('\n🔐 Test de connexion...');
    
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: adminUser.email,
      motDePasse: adminUser.motDePasse
    });
    
    if (response.data.success) {
      console.log('✅ Connexion réussie !');
      console.log('🎫 Token reçu:', response.data.data?.token ? 'Oui' : 'Non');
      console.log('👤 Utilisateur:', response.data.data?.utilisateur?.prenom, response.data.data?.utilisateur?.nom);
      
      return response.data.data?.token;
    } else {
      throw new Error('Échec de la connexion');
    }
  } catch (error) {
    console.error('❌ Erreur de connexion:');
    console.error('Message:', error.response?.data?.message || error.message);
    if (error.response?.data?.errors) {
      console.error('Détails:', error.response.data.errors);
    }
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Configuration de l\'utilisateur de test pour les API GIE');
    console.log('=' .repeat(60));
    
    // 1. Créer l'utilisateur admin
    await createTestUser();
    
    // 2. Tester la connexion
    const token = await testLogin();
    
    console.log('\n🎉 Configuration terminée avec succès !');
    console.log('💡 Vous pouvez maintenant lancer les tests de création de GIE');
    console.log('');
    console.log('Commandes disponibles:');
    console.log('  node test-gie-simple.js      # Test rapide');
    console.log('  node test-gie-creation.js    # Test complet');
    console.log('  ./run-tests.sh simple        # Via script bash');
    
  } catch (error) {
    console.error('\n💥 Échec de la configuration:', error.message);
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  main();
}

module.exports = { createTestUser, testLogin, adminUser };
