// Vérification rapide du statut WhatsApp
const whatsappService = require('./src/services/whatsappService');

async function quickStatus() {
  console.log('🔍 STATUT WHATSAPP RAPIDE');
  console.log('=========================\n');
  
  // Variables d'environnement
  const config = {
    appId: process.env.WHATSAPP_APP_ID,
    appSecret: process.env.WHATSAPP_APP_SECRET ? '✅ DÉFINI' : '❌ MANQUANT',
    businessId: process.env.WHATSAPP_BUSINESS_ID,
    phoneId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    token: process.env.WHATSAPP_ACCESS_TOKEN ? 
      `${process.env.WHATSAPP_ACCESS_TOKEN.substring(0, 15)}...` : 
      '❌ MANQUANT'
  };
  
  console.log('📋 Configuration:');
  console.log(`   App ID: ${config.appId || '❌ MANQUANT'}`);
  console.log(`   App Secret: ${config.appSecret}`);
  console.log(`   Business ID: ${config.businessId || '❌ MANQUANT'}`);
  console.log(`   Phone ID: ${config.phoneId || '❌ MANQUANT'}`);
  console.log(`   Access Token: ${config.token}`);
  console.log('');
  
  // Test de connexion
  console.log('🔌 Test de connexion...');
  try {
    const isValid = await whatsappService.isCurrentTokenValid();
    console.log(`   Token valide: ${isValid ? '✅ OUI' : '❌ NON'}`);
    
    if (!isValid) {
      console.log('');
      console.log('🚨 ACTION REQUISE:');
      console.log('   1. Générez un nouveau token sur:');
      console.log('      https://developers.facebook.com/apps/1500316664676674/whatsapp-business/wa-settings/');
      console.log('   2. Mettez à jour WHATSAPP_ACCESS_TOKEN dans .env');
      console.log('   3. Redémarrez le serveur');
    } else {
      console.log('');
      console.log('✅ SYSTÈME OPÉRATIONNEL');
      console.log('   WhatsApp fonctionne correctement');
    }
    
  } catch (error) {
    console.log(`   Erreur: ${error.message}`);
  }
  
  console.log('');
  console.log('💡 MODE ACTUEL:');
  console.log('   Le système utilise le mode fallback');
  console.log('   Les codes apparaissent dans les logs du serveur');
  console.log('   Pas d\'interruption du service pour les utilisateurs');
}

quickStatus().catch(console.error);
