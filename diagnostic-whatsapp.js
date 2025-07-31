// Diagnostic complet WhatsApp
const whatsappService = require('./src/services/whatsappService');

async function diagnosticComplet() {
  console.log('🔍 DIAGNOSTIC COMPLET WHATSAPP');
  console.log('==============================\n');
  
  // 1. Vérifier la configuration
  console.log('1️⃣ Configuration:');
  console.log(`   Phone Number ID: ${process.env.WHATSAPP_PHONE_NUMBER_ID}`);
  console.log(`   Business ID: ${process.env.WHATSAPP_BUSINESS_ID}`);
  console.log(`   Token: ${process.env.WHATSAPP_ACCESS_TOKEN ? 'Présent' : 'Manquant'}`);
  console.log('');
  
  // 2. Test de connexion
  console.log('2️⃣ Test de connexion API:');
  const connectionTest = await whatsappService.testConnection();
  console.log(`   Statut: ${connectionTest.success ? '✅ Connecté' : '❌ Échec'}`);
  console.log('');
  
  // 3. Test du numéro de téléphone
  console.log('3️⃣ Vérification du numéro:');
  const numeroTest = '221772488807';
  const numeroFormate = whatsappService.formatSenegalPhoneNumber(numeroTest);
  console.log(`   Numéro original: ${numeroTest}`);
  console.log(`   Numéro formaté: ${numeroFormate}`);
  console.log('');
  
  // 4. Test d'envoi avec template simple
  console.log('4️⃣ Test avec template hello_world:');
  try {
    const templateResult = await whatsappService.sendTemplate(
      numeroFormate, 
      'hello_world', 
      'en_US'
    );
    console.log(`   Résultat: ${templateResult.success ? '✅ Succès' : '❌ Échec'}`);
    if (templateResult.messageId) {
      console.log(`   Message ID: ${templateResult.messageId}`);
    }
    if (templateResult.error) {
      console.log(`   Erreur: ${JSON.stringify(templateResult.error, null, 2)}`);
    }
  } catch (error) {
    console.log(`   Erreur: ${error.message}`);
  }
  console.log('');
  
  // 5. Test d'envoi message texte simple
  console.log('5️⃣ Test message texte simple:');
  try {
    const textResult = await whatsappService.sendTextMessage(
      numeroFormate,
      'Test FEVEO 2050 - Message de vérification 🌱'
    );
    console.log(`   Résultat: ${textResult.success ? '✅ Succès' : '❌ Échec'}`);
    if (textResult.messageId) {
      console.log(`   Message ID: ${textResult.messageId}`);
    }
    if (textResult.error) {
      console.log(`   Erreur: ${JSON.stringify(textResult.error, null, 2)}`);
    }
  } catch (error) {
    console.log(`   Erreur: ${error.message}`);
  }
  console.log('');
  
  // 6. Conseils de dépannage
  console.log('🔧 CONSEILS DE DÉPANNAGE:');
  console.log('');
  console.log('Si le message n\'arrive pas:');
  console.log('   1. Vérifiez que le numéro 221772488807 est bien le vôtre');
  console.log('   2. Vérifiez que WhatsApp est installé sur ce numéro');
  console.log('   3. Le numéro doit être vérifié dans WhatsApp Business API');
  console.log('   4. Vérifiez les filtres de spam de WhatsApp');
  console.log('   5. Essayez avec un autre numéro de test');
  console.log('');
  console.log('🌐 Console WhatsApp Business:');
  console.log('   https://developers.facebook.com/apps/1500316664676674/whatsapp-business/wa-settings/');
  console.log('');
  console.log('📋 Vérifiez dans la console:');
  console.log('   • Numéros de téléphone autorisés');
  console.log('   • Statut du Business Account');
  console.log('   • Limites d\'envoi');
  console.log('   • Templates approuvés');
}

diagnosticComplet().catch(console.error);
