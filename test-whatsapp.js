// Test rapide du service WhatsApp
const whatsappService = require('./src/services/whatsappService');

async function testWhatsApp() {
  console.log('🧪 Test du service WhatsApp...\n');
  
  // Test 1: Vérifier la connexion
  console.log('1️⃣ Test de connexion...');
  const connectionTest = await whatsappService.testConnection();
  console.log('Résultat:', connectionTest);
  console.log('');
  
  // Test 2: Vérifier si le token est valide
  console.log('2️⃣ Validation du token...');
  const isValid = await whatsappService.isTokenValid();
  console.log('Token valide:', isValid);
  console.log('');
  
  // Test 3: Envoyer un code de vérification (mode fallback)
  console.log('3️⃣ Test envoi code de vérification...');
  const verificationTest = await whatsappService.sendVerificationCode(
    '221772488807',
    '123456',
    'TEST001'
  );
  console.log('Résultat:', verificationTest);
  console.log('');
  
  console.log('✅ Tests terminés');
}

testWhatsApp().catch(console.error);
