// Test complet du système WhatsApp avec renouvellement automatique
const whatsappService = require('./src/services/whatsappService');

async function testCompleteWhatsApp() {
  console.log('🧪 Test Complet WhatsApp avec Renouvellement Automatique');
  console.log('=========================================================\n');
  
  try {
    // Test 1: Vérification du token actuel
    console.log('1️⃣ Vérification du token actuel...');
    const isCurrentValid = await whatsappService.isCurrentTokenValid();
    console.log(`   Token actuel valide: ${isCurrentValid ? '✅ OUI' : '❌ NON'}\n`);
    
    // Test 2: Récupération d'un token valide
    console.log('2️⃣ Récupération d\'un token valide...');
    const validToken = await whatsappService.getValidToken();
    console.log(`   Token obtenu: ${validToken.substring(0, 20)}...`);
    console.log(`   Longueur: ${validToken.length} caractères\n`);
    
    // Test 3: Test de connexion avec le nouveau système
    console.log('3️⃣ Test de connexion...');
    const connectionTest = await whatsappService.testConnection();
    console.log(`   Connexion: ${connectionTest.success ? '✅ RÉUSSIE' : '❌ ÉCHEC'}`);
    if (connectionTest.error) {
      console.log(`   Erreur: ${connectionTest.error}`);
    }
    console.log('');
    
    // Test 4: Envoi de message de test
    console.log('4️⃣ Test d\'envoi de message...');
    const messageTest = await whatsappService.sendVerificationCode(
      '221772488807',
      'TEST123',
      'AUTO_TOKEN'
    );
    console.log(`   Envoi: ${messageTest.success ? '✅ RÉUSSI' : '❌ ÉCHEC'}`);
    console.log(`   Méthode: ${messageTest.method || 'N/A'}`);
    if (messageTest.messageId) {
      console.log(`   ID Message: ${messageTest.messageId}`);
    }
    console.log('');
    
    // Test 5: Vérification du cache de token
    console.log('5️⃣ Vérification du cache de token...');
    const cacheInfo = whatsappService.tokenCache;
    if (cacheInfo.token) {
      const timeLeft = Math.max(0, Math.floor((cacheInfo.expiresAt - Date.now()) / 1000 / 60));
      console.log(`   Token en cache: ✅ OUI`);
      console.log(`   Expire dans: ${timeLeft} minutes`);
    } else {
      console.log(`   Token en cache: ❌ NON`);
    }
    console.log('');
    
    // Résumé
    console.log('📊 RÉSUMÉ');
    console.log('----------');
    console.log(`✅ Token actuel: ${isCurrentValid ? 'Valide' : 'Invalide'}`);
    console.log(`🔄 Renouvellement: ${connectionTest.success ? 'Fonctionnel' : 'En mode fallback'}`);
    console.log(`📱 Envoi messages: ${messageTest.success ? 'Opérationnel' : 'Mode fallback'}`);
    console.log(`💾 Cache token: ${cacheInfo.token ? 'Actif' : 'Inactif'}`);
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Fonction pour afficher les variables d'environnement (masquées)
function showConfig() {
  console.log('\n🔧 CONFIGURATION ACTUELLE');
  console.log('---------------------------');
  console.log(`App ID: ${process.env.WHATSAPP_APP_ID || 'NON DÉFINI'}`);
  console.log(`Business ID: ${process.env.WHATSAPP_BUSINESS_ID || 'NON DÉFINI'}`);
  console.log(`Phone Number ID: ${process.env.WHATSAPP_PHONE_NUMBER_ID || 'NON DÉFINI'}`);
  console.log(`App Secret: ${process.env.WHATSAPP_APP_SECRET ? '✅ DÉFINI' : '❌ NON DÉFINI'}`);
  
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (token) {
    console.log(`Access Token: ${token.substring(0, 20)}...${token.substring(token.length - 10)} (${token.length} chars)`);
  } else {
    console.log(`Access Token: ❌ NON DÉFINI`);
  }
  console.log('');
}

// Exécution
async function main() {
  showConfig();
  await testCompleteWhatsApp();
  
  console.log('\n🎯 PROCHAINES ÉTAPES');
  console.log('---------------------');
  console.log('1. Si App Secret manque: Récupérez-le depuis la console Facebook');
  console.log('2. Si token invalide: Générez un nouveau token depuis WhatsApp API');
  console.log('3. Redémarrez le serveur après mise à jour de .env');
  console.log('4. Le système gérera automatiquement le renouvellement');
  
  console.log('\n📚 Guides disponibles:');
  console.log('- WHATSAPP_SETUP_GUIDE.md : Configuration complète');
  console.log('- WHATSAPP_TOKEN_RENEWAL.md : Renouvellement manuel');
}

main().catch(console.error);
