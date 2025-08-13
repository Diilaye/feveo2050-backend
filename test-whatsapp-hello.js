#!/usr/bin/env node

/**
 * Script de test pour vérifier l'envoi de messages WhatsApp
 * Équivalent à la commande cURL fournie
 */

const whatsappService = require('./src/services/whatsappService');

async function testWhatsAppHelloWorld() {
  console.log('🚀 Test du service WhatsApp - Template hello_world');
  console.log('=' .repeat(50));
  
  try {
    // Test de connexion d'abord
    console.log('1️⃣ Test de connexion à l\'API WhatsApp...');
    const connectionTest = await whatsappService.testConnection();
    
    if (connectionTest.success) {
      console.log('✅ Connexion API réussie !');
      console.log('📊 Données:', JSON.stringify(connectionTest.data, null, 2));
    } else {
      console.log('❌ Échec de connexion:', connectionTest.error);
      console.log('⚠️ Vérifiez votre token d\'accès WhatsApp');
      return;
    }
    
    console.log('\n2️⃣ Test d\'envoi du template hello_world...');
    
    // Utiliser le numéro de votre exemple cURL
    const testNumber = '221772488807';
    const result = await whatsappService.testHelloWorld(testNumber);
    
    if (result.success) {
      console.log('\n🎉 SUCCESS! Template hello_world envoyé avec succès');
      console.log(`📱 Destinataire: ${testNumber}`);
      console.log(`🆔 Message ID: ${result.messageId}`);
      console.log('\n📋 Détails de la réponse:');
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log('\n❌ ÉCHEC d\'envoi du template');
      console.log('🔍 Erreur:', result.error);
      
      // Diagnostics supplémentaires
      if (result.error?.error?.code === 131026) {
        console.log('\n💡 DIAGNOSTIC: Template "hello_world" non trouvé');
        console.log('   - Vérifiez que le template est approuvé dans WhatsApp Business');
        console.log('   - Ou utilisez un autre template disponible');
      }
      
      if (result.error?.error?.code === 131047) {
        console.log('\n💡 DIAGNOSTIC: Problème de re-engagement');
        console.log('   - Le destinataire doit avoir interagi récemment');
        console.log('   - Ou utilisez un template de notification approuvé');
      }
    }
    
  } catch (error) {
    console.error('\n💥 Erreur inattendue:', error);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🏁 Test terminé');
}

// Fonction pour tester différents templates
async function testSpecificTemplate(templateName, phoneNumber = '221772488807') {
  console.log(`\n🧪 Test template spécifique: ${templateName}`);
  
  try {
    const result = await whatsappService.sendTemplate(
      phoneNumber,
      templateName,
      'en_US'
    );
    
    console.log('Résultat:', JSON.stringify(result, null, 2));
    return result;
    
  } catch (error) {
    console.error('Erreur:', error);
    return { success: false, error: error.message };
  }
}

// Fonction pour tester un message texte simple (nécessite conversation active)
async function testTextMessage(phoneNumber = '221772488807') {
  console.log('\n📝 Test message texte simple...');
  
  try {
    const message = '🧪 Test message FEVEO 2050 - ' + new Date().toLocaleString();
    const result = await whatsappService.sendTextMessage(phoneNumber, message);
    
    console.log('Résultat message texte:', JSON.stringify(result, null, 2));
    return result;
    
  } catch (error) {
    console.error('Erreur message texte:', error);
    return { success: false, error: error.message };
  }
}

// Fonction principale
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Test par défaut
    await testWhatsAppHelloWorld();
  } else if (args[0] === 'template' && args[1]) {
    // Test d'un template spécifique
    await testSpecificTemplate(args[1], args[2]);
  } else if (args[0] === 'text') {
    // Test message texte
    await testTextMessage(args[1]);
  } else {node update-whatsapp-token.js
# Suivre les instructions affichées
    console.log('Usage:');
    console.log('  node test-whatsapp-hello.js                    # Test hello_world');
    console.log('  node test-whatsapp-hello.js template <name>    # Test template spécifique');
    console.log('  node test-whatsapp-hello.js text [phone]       # Test message texte');
  }
}

// Exécuter le script
main().catch(console.error);
