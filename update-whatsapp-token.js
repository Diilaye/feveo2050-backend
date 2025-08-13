#!/usr/bin/env node

/**
 * Script pour aider à récupérer et mettre à jour le token WhatsApp
 */

const fs = require('fs');
const path = require('path');

function updateEnvToken(newToken) {
  const envPath = path.join(__dirname, '.env');
  
  try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Remplacer le token existant
    const tokenRegex = /WHATSAPP_ACCESS_TOKEN=.*/;
    if (tokenRegex.test(envContent)) {
      envContent = envContent.replace(tokenRegex, `WHATSAPP_ACCESS_TOKEN=${newToken}`);
    } else {
      envContent += `\nWHATSAPP_ACCESS_TOKEN=${newToken}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Token mis à jour dans le fichier .env');
    
  } catch (error) {
    console.error('❌ Erreur mise à jour .env:', error.message);
  }
}

function showTokenInfo() {
  console.log('🔑 Guide pour obtenir un nouveau token WhatsApp Business API');
  console.log('=' .repeat(60));
  console.log('');
  console.log('1️⃣ Aller sur: https://developers.facebook.com/apps');
  console.log('2️⃣ Sélectionner votre app WhatsApp Business');
  console.log('3️⃣ Aller dans "WhatsApp > Démarrage"');
  console.log('4️⃣ Dans "1. Sélectionnez numéros de téléphone", cliquer sur "Générer un token"');
  console.log('5️⃣ Copier le nouveau token généré');
  console.log('');
  console.log('📱 Votre Phone Number ID actuel: 658687160670733');
  console.log('');
  console.log('🔄 Pour mettre à jour le token:');
  console.log('   node update-whatsapp-token.js <NOUVEAU_TOKEN>');
  console.log('');
  console.log('⚠️ Note: Les tokens WhatsApp expirent régulièrement');
  console.log('   Vous devrez répéter cette opération périodiquement');
}

// Vérifier les arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  showTokenInfo();
} else if (args[0] === 'help' || args[0] === '--help') {
  showTokenInfo();
} else {
  const newToken = args[0];
  
  // Validation basique du token
  if (newToken.length < 50 || !newToken.startsWith('EAA')) {
    console.log('❌ Le token semble invalide');
    console.log('💡 Un token WhatsApp commence généralement par "EAA" et fait plus de 50 caractères');
    process.exit(1);
  }
  
  console.log(`🔄 Mise à jour du token WhatsApp...`);
  console.log(`📝 Nouveau token: ${newToken.substring(0, 20)}...`);
  
  updateEnvToken(newToken);
  
  console.log('');
  console.log('✅ Token mis à jour ! Vous pouvez maintenant tester:');
  console.log('   node test-whatsapp-hello.js');
  console.log('   ./test-curl-whatsapp.sh');
}
