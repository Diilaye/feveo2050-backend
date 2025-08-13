const mongoose = require('mongoose');

// Simuler le schéma GIE pour les tests
const membreSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  fonction: {
    type: String,
    enum: ['Présidente', 'Vice-Présidente', 'Secrétaire', 'Trésorière', 'Membre'],
    default: 'Membre'
  },
  cin: { type: String, required: true },
  telephone: { type: String, required: true },
  genre: {
    type: String,
    enum: ['femme', 'jeune', 'homme'],
    required: true
  }
});

const testSchema = new mongoose.Schema({
  nomGIE: { type: String, required: true },
  membres: [membreSchema]
});

// Copier la validation du GIE
testSchema.pre('save', function(next) {
  const totalMembres = this.membres.length + 1; // +1 pour la présidente
  
  // Vérifier le nombre minimum de membres (3 minimum)
  if (totalMembres < 3) {
    return next(new Error('Le GIE doit avoir au minimum 3 membres (incluant la présidente)'));
  }
  
  // Vérifier les rôles obligatoires dans les membres
  const secretaire = this.membres.find(m => m.fonction === 'Secrétaire');
  const tresoriere = this.membres.find(m => m.fonction === 'Trésorière');
  
  if (!secretaire) {
    return next(new Error('Le GIE doit avoir une Secrétaire parmi ses membres'));
  }
  
  if (!tresoriere) {
    return next(new Error('Le GIE doit avoir une Trésorière parmi ses membres'));
  }
  
  // Si plus de 3 membres, vérifier les règles FEVEO 2050 pour la composition de genre
  if (totalMembres > 3) {
    // Compter la composition par genre
    const femmes = this.membres.filter(m => m.genre === 'femme').length + 1; // +1 présidente
    const jeunes = this.membres.filter(m => m.genre === 'jeune').length;
    const hommes = this.membres.filter(m => m.genre === 'homme').length;
    
    // Vérifier les règles FEVEO 2050
    const option1Valid = femmes === totalMembres; // 100% femmes
    const option2Valid = femmes >= Math.ceil(totalMembres * 0.625) && jeunes >= Math.ceil(totalMembres * 0.3) && hommes <= Math.floor(totalMembres * 0.075); // Composition mixte proportionnelle
    
    if (!option1Valid && !option2Valid) {
      return next(new Error('Composition des membres non conforme aux règles FEVEO 2050: soit 100% femmes, soit minimum 62.5% femmes, 30% jeunes et maximum 7.5% hommes'));
    }
  }
  
  next();
});

console.log('🧪 Test de validation des membres GIE');
console.log('=======================================\n');

// Test 1: GIE avec moins de 3 membres (échec attendu)
console.log('📋 Test 1: GIE avec seulement 1 membre (échec attendu)');
const TestModel1 = mongoose.model('TestGIE1', testSchema);
const gie1 = new TestModel1({
  nomGIE: 'Test GIE 1',
  membres: [
    { nom: 'Diop', prenom: 'Fatou', fonction: 'Secrétaire', cin: '123456', telephone: '771234567', genre: 'femme' }
  ]
});

try {
  const error1 = gie1.validateSync();
  if (error1) {
    console.log('✅ Validation échoue correctement:', error1.message);
  } else {
    console.log('❌ Erreur: validation devrait échouer');
  }
} catch (e) {
  console.log('✅ Erreur capturée:', e.message);
}

// Test 2: GIE avec 3 membres mais sans secrétaire (échec attendu)
console.log('\n📋 Test 2: GIE sans Secrétaire (échec attendu)');
const TestModel2 = mongoose.model('TestGIE2', testSchema.clone());
const gie2 = new TestModel2({
  nomGIE: 'Test GIE 2',
  membres: [
    { nom: 'Diop', prenom: 'Fatou', fonction: 'Trésorière', cin: '123456', telephone: '771234567', genre: 'femme' },
    { nom: 'Fall', prenom: 'Awa', fonction: 'Membre', cin: '123457', telephone: '771234568', genre: 'femme' }
  ]
});

try {
  const error2 = gie2.validateSync();
  if (error2) {
    console.log('✅ Validation échoue correctement:', error2.message);
  } else {
    console.log('❌ Erreur: validation devrait échouer');
  }
} catch (e) {
  console.log('✅ Erreur capturée:', e.message);
}

// Test 3: GIE avec 3 membres valides (succès attendu)
console.log('\n📋 Test 3: GIE avec 3 membres valides (succès attendu)');
const TestModel3 = mongoose.model('TestGIE3', testSchema.clone());
const gie3 = new TestModel3({
  nomGIE: 'Test GIE 3',
  membres: [
    { nom: 'Diop', prenom: 'Fatou', fonction: 'Secrétaire', cin: '123456', telephone: '771234567', genre: 'femme' },
    { nom: 'Fall', prenom: 'Awa', fonction: 'Trésorière', cin: '123457', telephone: '771234568', genre: 'femme' }
  ]
});

try {
  const error3 = gie3.validateSync();
  if (!error3) {
    console.log('✅ Validation réussie pour 3 membres valides');
  } else {
    console.log('❌ Erreur inattendue:', error3.message);
  }
} catch (e) {
  console.log('❌ Erreur inattendue:', e.message);
}

// Test 4: GIE avec plus de 3 membres, composition 100% femmes (succès attendu)
console.log('\n📋 Test 4: GIE avec 5 membres, 100% femmes (succès attendu)');
const TestModel4 = mongoose.model('TestGIE4', testSchema.clone());
const gie4 = new TestModel4({
  nomGIE: 'Test GIE 4',
  membres: [
    { nom: 'Diop', prenom: 'Fatou', fonction: 'Secrétaire', cin: '123456', telephone: '771234567', genre: 'femme' },
    { nom: 'Fall', prenom: 'Awa', fonction: 'Trésorière', cin: '123457', telephone: '771234568', genre: 'femme' },
    { nom: 'Ndiaye', prenom: 'Aminata', fonction: 'Membre', cin: '123458', telephone: '771234569', genre: 'femme' },
    { nom: 'Sow', prenom: 'Mariama', fonction: 'Membre', cin: '123459', telephone: '771234570', genre: 'femme' }
  ]
});

try {
  const error4 = gie4.validateSync();
  if (!error4) {
    console.log('✅ Validation réussie pour composition 100% femmes');
  } else {
    console.log('❌ Erreur inattendue:', error4.message);
  }
} catch (e) {
  console.log('❌ Erreur inattendue:', e.message);
}

console.log('\n🎯 Résumé des nouvelles règles:');
console.log('- Minimum 3 membres (incluant la présidente)');
console.log('- Rôles obligatoires: Présidente + Secrétaire + Trésorière');
console.log('- Si plus de 3 membres: règles FEVEO 2050 appliquées');
console.log('- Option 1: 100% femmes');
console.log('- Option 2: 62.5% femmes, 30% jeunes, 7.5% hommes maximum');
