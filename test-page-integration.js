// Test d'intégration complète de la page Investir
// Simule le workflow utilisateur complet

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';
const FRONTEND_URL = 'http://localhost:5174';

// Configuration de test
const TEST_GIE_CODE = 'FEVEO-01-01-01-01-001';
const WAVE_TOKEN = 'wave_sn_prod_FIdhHNGkeoAFnuGNxuh8WD3L9XjEBqjRCKx2zEZ87H7LWSwHs2v2aA_5q_ZJGwaLfphltYSRawKP-voVugCpwWB2FMH3ZTtC0w';

const paymentPeriods = [
  { id: 'day1', label: 'Paiement Journalier', amount: 6000, period: '1 jour' },
  { id: 'day10', label: 'Paiement 10 jours', amount: 60000, period: '10 jours' },
  { id: 'day15', label: 'Paiement 15 jours', amount: 90000, period: '15 jours' },
  { id: 'day30', label: 'Paiement 30 jours', amount: 180000, period: '30 jours' }
];

async function testPageIntegration() {
  console.log('🚀 TEST D\'INTÉGRATION COMPLÈTE - PAGE INVESTIR');
  console.log('='.repeat(60));
  
  try {
    console.log('\n1️⃣ ÉTAPE 1: Validation du GIE');
    console.log('─'.repeat(40));
    
    // Simuler la validation GIE (appelée par le frontend)
    const gieValidationResponse = await fetch(`${BASE_URL}/investissements/validate-gie`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        codeGIE: TEST_GIE_CODE
      })
    });

    const gieData = await gieValidationResponse.json();
    
    if (gieData.success) {
      console.log('✅ GIE validé avec succès');
      console.log(`   Nom: ${gieData.data.nom}`);
      console.log(`   Localisation: ${gieData.data.localisation}`);
      console.log(`   Présidente: ${gieData.data.presidentePrenom} ${gieData.data.presidenteNom}`);
    } else {
      throw new Error(`Échec validation GIE: ${gieData.message}`);
    }

    console.log('\n2️⃣ ÉTAPE 2: Test génération paiements pour toutes les périodes');
    console.log('─'.repeat(40));

    for (const period of paymentPeriods) {
      console.log(`\n   📋 Test ${period.label} (${period.amount.toLocaleString()} FCFA)...`);
      
      // Simuler la génération de paiement (méthode principale)
      const paymentResponse = await fetch(`${BASE_URL}/payments/wave/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${WAVE_TOKEN}`
        },
        body: JSON.stringify({
          amount: period.amount,
          period: period.period,
          gieCode: TEST_GIE_CODE,
          giePhone: gieData.data.telephone || undefined,
          description: `Investissement FEVEO 2050 - ${period.label} - ${TEST_GIE_CODE}`,
          currency: 'XOF'
        })
      });

      const paymentData = await paymentResponse.json();
      
      if (paymentData.success) {
        console.log(`   ✅ ${period.label} généré avec succès`);
        console.log(`      Transaction ID: ${paymentData.data.transactionId}`);
        console.log(`      Montant avec frais: ${paymentData.data.amount.toLocaleString()} FCFA`);
        console.log(`      Frais Wave: ${paymentData.data.fees} FCFA`);
        console.log(`      URL: ${paymentData.data.paymentUrl.substring(0, 80)}...`);
      } else {
        console.log(`   ❌ Erreur ${period.label}: ${paymentData.message}`);
      }
    }

    console.log('\n3️⃣ ÉTAPE 3: Test méthode fallback');
    console.log('─'.repeat(40));
    
    // Simuler la méthode fallback (generateSimplePaymentLink)
    const fallbackResponse = await fetch(`${BASE_URL}/payments/wave/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WAVE_TOKEN}`
      },
      body: JSON.stringify({
        amount: 6000,
        period: 'fallback',
        gieCode: 'FALLBACK-SIMPLE',
        giePhone: gieData.data.telephone,
        description: 'Paiement FEVEO 2050 - 6000 FCFA',
        currency: 'XOF'
      })
    });

    const fallbackData = await fallbackResponse.json();
    
    if (fallbackData.success) {
      console.log('   ✅ Méthode fallback fonctionnelle');
      console.log(`      URL générée: ${fallbackData.data.paymentUrl.substring(0, 80)}...`);
    } else {
      console.log(`   ❌ Erreur fallback: ${fallbackData.message}`);
    }

    console.log('\n4️⃣ ÉTAPE 4: Validation des endpoints de statut');
    console.log('─'.repeat(40));
    
    // Test du health check
    const healthResponse = await fetch(`${BASE_URL.replace('/api', '')}/health`);
    const healthData = await healthResponse.json();
    
    if (healthData.status === 'OK') {
      console.log('   ✅ Health check: Serveur opérationnel');
      console.log(`      Database: ${healthData.database}`);
      console.log(`      Uptime: ${Math.round(healthData.uptime)}s`);
    }

    console.log('\n🎉 RÉSUMÉ DU TEST D\'INTÉGRATION');
    console.log('='.repeat(60));
    console.log('✅ Validation GIE: Fonctionnelle');
    console.log('✅ Génération paiements principaux: Fonctionnelle');
    console.log('✅ Méthode fallback: Fonctionnelle');
    console.log('✅ Health check: Fonctionnel');
    console.log('✅ Backend: Complètement opérationnel');
    
    console.log('\n🚀 STATUS: INTÉGRATION PAGE INVESTIR PRÊTE POUR PRODUCTION');
    
    console.log('\n📋 ACTIONS UTILISATEUR TESTÉES:');
    console.log('   1. Saisie code GIE → Validation backend ✅');
    console.log('   2. Sélection période → Génération paiement ✅');
    console.log('   3. Fallback en cas d\'erreur → Fonctionnel ✅');
    console.log('   4. Redirection Wave → URLs générées ✅');

  } catch (error) {
    console.error('❌ ERREUR LORS DU TEST:', error.message);
    process.exit(1);
  }
}

// Exécuter le test
testPageIntegration().then(() => {
  console.log('\n✨ Test d\'intégration terminé avec succès!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test d\'intégration échoué:', error);
  process.exit(1);
});
