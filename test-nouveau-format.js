const mongoose = require('mongoose');

// Test du nouveau format FEVEO-XX-XX-XX-XX-XXX (codes numériques)
console.log('🔧 Test du nouveau format d\'identifiant GIE');

const testFormats = [
  'FEVEO-14-01-01-01-001', // ✅ Nouveau format numérique
  'FEVEO-01-02-03-04-005', // ✅ Nouveau format numérique  
  'FEVEO-15-05-02-01-010', // ✅ Nouveau format numérique
  'FEVEO-KD-KD-SM-01-001', // ❌ Ancien format alphabétique
  'FEVEO-14-1-01-01-001',  // ❌ Code mal formaté
  'FEVEO-14-01-01-01-1',   // ❌ Numéro GIE mal formaté
];

const regexNouveau = /^FEVEO-\d{2}-\d{2}-\d{2}-\d{2}-\d{3}$/;

console.log('\n📋 Résultats des tests :');
console.log(''.padEnd(50, '='));

testFormats.forEach((format, index) => {
  const isValid = regexNouveau.test(format);
  const status = isValid ? '✅' : '❌';
  console.log(`${status} ${format.padEnd(30)} | ${isValid ? 'VALIDE' : 'INVALIDE'}`);
});

console.log('\n🎯 Résumé :');
console.log('- Format accepté : FEVEO-XX-XX-XX-XX-XXX (codes numériques)');
console.log('- Région : 2 chiffres (01-15)');
console.log('- Département : 2 chiffres');
console.log('- Arrondissement : 2 chiffres');
console.log('- Commune : 2 chiffres');
console.log('- Numéro GIE : 3 chiffres');

// Test de validation avec Mongoose
const testSchema = new mongoose.Schema({
  identifiantGIE: {
    type: String,
    required: true,
    match: regexNouveau
  }
});

console.log('\n🧪 Test avec Mongoose Schema...');

const TestModel = mongoose.model('TestGIE', testSchema);

// Test valide
try {
  const docValide = new TestModel({
    identifiantGIE: 'FEVEO-14-01-01-01-001'
  });
  
  const erreur = docValide.validateSync();
  if (!erreur) {
    console.log('✅ Validation Mongoose réussie pour : FEVEO-14-01-01-01-001');
  } else {
    console.log('❌ Erreur validation :', erreur.message);
  }
} catch (error) {
  console.log('❌ Erreur lors du test :', error.message);
}

// Test invalide
try {
  const docInvalide = new TestModel({
    identifiantGIE: 'FEVEO-KD-KD-SM-01-001'
  });
  
  const erreur = docInvalide.validateSync();
  if (erreur) {
    console.log('✅ Validation Mongoose échoue correctement pour format invalide');
  } else {
    console.log('❌ Erreur : format invalide accepté !');
  }
} catch (error) {
  console.log('✅ Format invalide rejeté correctement');
}

console.log('\n🚀 Test terminé !');
