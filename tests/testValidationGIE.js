// Test de validation des GIEs pour l'investissement
// Ce script teste les différents cas de validation d'un GIE avant investissement

const request = require('supertest');
const app = require('../server');

const testValidationGIE = async () => {
  console.log('🧪 Test de validation des GIEs pour investissement');
  console.log('=' .repeat(60));

  // Cas 1: GIE inexistant
  console.log('\n1️⃣ Test avec GIE inexistant:');
  try {
    const gieIdInexistant = '6507d2b8e123456789abcdef';
    const response = await request(app)
      .get(`/api/investissements/gie/${gieIdInexistant}`)
      .set('Authorization', 'Bearer YOUR_TEST_TOKEN'); // Remplacer par un vrai token

    console.log(`   Status: ${response.status}`);
    console.log(`   Message: ${response.body.message}`);
    console.log(`   Code: ${response.body.code}`);
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}`);
  }

  // Cas 2: GIE non validé
  console.log('\n2️⃣ Test avec GIE non validé:');
  try {
    // Vous devrez remplacer par un ID de GIE réel avec statut 'en_attente'
    const gieIdNonValide = 'REMPLACER_PAR_ID_REEL';
    const response = await request(app)
      .get(`/api/investissements/gie/${gieIdNonValide}/calendrier`)
      .set('Authorization', 'Bearer YOUR_TEST_TOKEN'); // Remplacer par un vrai token

    console.log(`   Status: ${response.status}`);
    console.log(`   Message: ${response.body.message}`);
    console.log(`   Code: ${response.body.code}`);
    if (response.body.data) {
      console.log(`   Statut GIE: ${response.body.data.gieStatut}`);
      console.log(`   Nom GIE: ${response.body.data.nomGIE}`);
    }
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}`);
  }

  // Cas 3: GIE validé (succès attendu)
  console.log('\n3️⃣ Test avec GIE validé:');
  try {
    // Vous devrez remplacer par un ID de GIE réel avec statut 'validé'
    const gieIdValide = 'REMPLACER_PAR_ID_REEL';
    const response = await request(app)
      .get(`/api/investissements/gie/${gieIdValide}/stats`)
      .set('Authorization', 'Bearer YOUR_TEST_TOKEN'); // Remplacer par un vrai token

    console.log(`   Status: ${response.status}`);
    console.log(`   Message: ${response.body.message || 'Succès'}`);
    if (response.body.success) {
      console.log(`   ✅ Validation réussie`);
    }
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}`);
  }

  // Cas 4: Tentative d'investissement avec GIE non validé
  console.log('\n4️⃣ Test d\'investissement avec GIE non validé:');
  try {
    const gieIdNonValide = 'REMPLACER_PAR_ID_REEL';
    const response = await request(app)
      .post(`/api/investissements/gie/${gieIdNonValide}/investir`)
      .send({
        date: new Date().toISOString().split('T')[0],
        montant: 6000,
        commentaire: 'Test d\'investissement'
      })
      .set('Authorization', 'Bearer YOUR_TEST_TOKEN'); // Remplacer par un vrai token

    console.log(`   Status: ${response.status}`);
    console.log(`   Message: ${response.body.message}`);
    console.log(`   Code: ${response.body.code}`);
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}`);
  }

  console.log('\n🎉 Tests terminés !');
  console.log('\nCodes d\'erreur documentés:');
  console.log('   - GIE_NOT_FOUND: GIE inexistant');
  console.log('   - GIE_NOT_VALIDATED: GIE non validé pour investissement');
  console.log('   - CYCLE_NOT_FOUND: Cycle d\'investissement inexistant');
  console.log('   - MISSING_GIE_ID: ID du GIE manquant');
};

// Guide d'utilisation
console.log('📋 Guide d\'utilisation de la validation GIE:');
console.log('');
console.log('1. Middleware validateGIEMiddleware:');
console.log('   - Vérifie l\'existence du GIE');
console.log('   - Vérifie que le statut est "validé"');
console.log('   - Utilisé pour les opérations d\'investissement');
console.log('');
console.log('2. Middleware validateGIEExistenceMiddleware:');
console.log('   - Vérifie seulement l\'existence du GIE');
console.log('   - Utilisé pour la consultation de données');
console.log('');
console.log('3. Réponses d\'erreur structurées:');
console.log('   - success: false');
console.log('   - message: Description de l\'erreur');
console.log('   - code: Code d\'erreur standardisé');
console.log('   - data: Informations supplémentaires si nécessaire');
console.log('');
console.log('4. Utilisation dans les routes:');
console.log('   router.post(\'/investir\', auth, validateGIEMiddleware, controller);');
console.log('   router.get(\'/stats\', auth, validateGIEExistenceMiddleware, controller);');
console.log('');

// Exemples de réponses
console.log('📝 Exemples de réponses d\'erreur:');
console.log('');
console.log('GIE non trouvé:');
console.log(JSON.stringify({
  success: false,
  message: 'GIE non trouvé. Veuillez vous assurer que le GIE est enregistré.',
  code: 'GIE_NOT_FOUND'
}, null, 2));
console.log('');
console.log('GIE non validé:');
console.log(JSON.stringify({
  success: false,
  message: 'Le GIE "FEVEO-DK-DK-01-01-001" n\'est pas encore validé. Statut actuel: en_attente.',
  code: 'GIE_NOT_VALIDATED',
  data: {
    gieStatut: 'en_attente',
    nomGIE: 'FEVEO-DK-DK-01-01-001',
    identifiantGIE: 'FEVEO-DK-DK-01-01-001',
    dateCreation: '2025-07-30T12:00:00.000Z'
  }
}, null, 2));

module.exports = { testValidationGIE };
