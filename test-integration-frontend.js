// Test d'intégration frontend-backend pour l'investissement
// Ce script teste la page d'investissement avec validation GIE

const testInvestmentIntegration = async () => {
  console.log('🧪 Test d\'intégration Frontend-Backend Investissement\n');
  
  const BASE_URL = 'http://localhost:5000/api';
  const FRONTEND_URL = 'http://localhost:3000';
  
  // GIE de test disponibles
  const TEST_GIES = [
    {
      id: '68858062677053a96fa5cb54',
      identifiant: 'FEVEO-01-01-01-01-001',
      nom: 'FEVEO-01-01-01-01-001'
    },
    {
      id: '68858063677053a96fa5d2ad', 
      identifiant: 'FEVEO-02-01-01-01-002',
      nom: 'FEVEO-02-01-01-01-002'
    }
  ];
  
  console.log('🎯 Plan de test:');
  console.log('1. Vérifier l\'API backend');
  console.log('2. Tester la validation GIE sans auth (doit échouer)');
  console.log('3. Instructions pour test frontend complet\n');
  
  try {
    // Test 1: Vérifier que l'API est accessible
    console.log('1️⃣ Test API Backend...');
    const response = await fetch(`${BASE_URL}/test`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API accessible:', data.message);
    } else {
      console.log('❌ API non accessible');
      return;
    }
    
    // Test 2: Tester la validation GIE (sans auth)
    console.log('\n2️⃣ Test validation GIE (sans authentification)...');
    
    for (const gie of TEST_GIES) {
      console.log(`\n   Test GIE: ${gie.identifiant} (${gie.id})`);
      
      try {
        const gieResponse = await fetch(`${BASE_URL}/investissements/gie/${gie.id}`);
        console.log(`   ❌ ERREUR: GIE ${gie.id} accessible sans auth (statut: ${gieResponse.status})`);
      } catch (error) {
        if (error.message.includes('401')) {
          console.log(`   ✅ GIE ${gie.id} correctement protégé (401 Unauthorized)`);
        } else {
          console.log(`   ⚠️ GIE ${gie.id} erreur: ${error.message}`);
        }
      }
    }
    
    console.log('\n3️⃣ Instructions pour test frontend complet:');
    console.log('================================================');
    console.log('');
    console.log('🚀 Étapes pour tester l\'intégration complète:');
    console.log('');
    console.log('1. Démarrer le frontend React:');
    console.log('   cd /Users/diikaanedev/Documents/feveo-projet/feveo2050');
    console.log('   npm run dev');
    console.log('');
    console.log('2. Ouvrir la page d\'investissement:');
    console.log(`   ${FRONTEND_URL}/investir-new`);
    console.log('');
    console.log('3. Tester avec les ID GIE de test:');
    TEST_GIES.forEach((gie, index) => {
      console.log(`   ${index + 1}. ${gie.id}`);
      console.log(`      Nom: ${gie.identifiant}`);
    });
    console.log('');
    console.log('4. Résultats attendus:');
    console.log('   ❌ Erreur 401 (pas d\'authentification)');
    console.log('   ✅ Message d\'erreur affiché côté frontend');
    console.log('   ✅ Interface de récupération d\'erreur visible');
    console.log('');
    console.log('5. Pour tester avec authentification:');
    console.log('   a. Créer un compte: POST /api/auth/register');
    console.log('   b. Se connecter: POST /api/auth/login');
    console.log('   c. Utiliser le token dans localStorage');
    console.log('   d. Retester la validation GIE');
    console.log('');
    console.log('📋 Checklist de validation:');
    console.log('□ Page d\'investissement charge sans erreur');
    console.log('□ Champ ID GIE accepte les ID de test');
    console.log('□ Bouton "Valider le GIE" fonctionne');
    console.log('□ Erreur 401 gérée gracieusement');
    console.log('□ Message d\'erreur clair affiché');
    console.log('□ Bouton "Réessayer" disponible');
    console.log('□ Lien "Contacter" fonctionne');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
};

// Exécution si lancé directement
if (typeof require !== 'undefined' && require.main === module) {
  // Version Node.js
  testInvestmentIntegration();
} else if (typeof window !== 'undefined') {
  // Version navigateur
  window.testInvestmentIntegration = testInvestmentIntegration;
  console.log('🔧 Test d\'intégration chargé. Utilisez: testInvestmentIntegration()');
}

module.exports = testInvestmentIntegration;
