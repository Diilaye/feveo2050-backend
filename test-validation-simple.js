// Test simple des règles de validation
console.log('🧪 Test des règles de validation GIE');
console.log('=====================================\n');

// Fonction de validation simulée
function validateGIE(membres) {
  const totalMembres = membres.length + 1; // +1 pour la présidente
  
  // Vérifier le nombre minimum de membres (3 minimum)
  if (totalMembres < 3) {
    return { valid: false, error: 'Le GIE doit avoir au minimum 3 membres (incluant la présidente)' };
  }
  
  // Vérifier les rôles obligatoires dans les membres
  const secretaire = membres.find(m => m.fonction === 'Secrétaire');
  const tresoriere = membres.find(m => m.fonction === 'Trésorière');
  
  if (!secretaire) {
    return { valid: false, error: 'Le GIE doit avoir une Secrétaire parmi ses membres' };
  }
  
  if (!tresoriere) {
    return { valid: false, error: 'Le GIE doit avoir une Trésorière parmi ses membres' };
  }
  
  // Si plus de 3 membres, vérifier les règles FEVEO 2050 pour la composition de genre
  if (totalMembres > 3) {
    // Compter la composition par genre
    const femmes = membres.filter(m => m.genre === 'femme').length + 1; // +1 présidente
    const jeunes = membres.filter(m => m.genre === 'jeune').length;
    const hommes = membres.filter(m => m.genre === 'homme').length;
    
    // Vérifier les règles FEVEO 2050
    const option1Valid = femmes === totalMembres; // 100% femmes
    const option2Valid = femmes >= Math.ceil(totalMembres * 0.625) && jeunes >= Math.ceil(totalMembres * 0.3) && hommes <= Math.floor(totalMembres * 0.075);
    
    if (!option1Valid && !option2Valid) {
      return { 
        valid: false, 
        error: 'Composition des membres non conforme aux règles FEVEO 2050: soit 100% femmes, soit minimum 62.5% femmes, 30% jeunes et maximum 7.5% hommes',
        details: { femmes, jeunes, hommes, totalMembres, option1Valid, option2Valid }
      };
    }
  }
  
  return { valid: true };
}

// Tests
const tests = [
  {
    name: 'GIE avec 1 seul membre',
    membres: [
      { nom: 'Diop', fonction: 'Secrétaire', genre: 'femme' }
    ]
  },
  {
    name: 'GIE sans Secrétaire',
    membres: [
      { nom: 'Diop', fonction: 'Trésorière', genre: 'femme' },
      { nom: 'Fall', fonction: 'Membre', genre: 'femme' }
    ]
  },
  {
    name: 'GIE sans Trésorière',
    membres: [
      { nom: 'Diop', fonction: 'Secrétaire', genre: 'femme' },
      { nom: 'Fall', fonction: 'Membre', genre: 'femme' }
    ]
  },
  {
    name: 'GIE valide avec 3 membres',
    membres: [
      { nom: 'Diop', fonction: 'Secrétaire', genre: 'femme' },
      { nom: 'Fall', fonction: 'Trésorière', genre: 'femme' }
    ]
  },
  {
    name: 'GIE avec 5 membres, 100% femmes',
    membres: [
      { nom: 'Diop', fonction: 'Secrétaire', genre: 'femme' },
      { nom: 'Fall', fonction: 'Trésorière', genre: 'femme' },
      { nom: 'Ndiaye', fonction: 'Membre', genre: 'femme' },
      { nom: 'Sow', fonction: 'Membre', genre: 'femme' }
    ]
  }
];

tests.forEach((test, index) => {
  console.log(`📋 Test ${index + 1}: ${test.name}`);
  const result = validateGIE(test.membres);
  
  if (result.valid) {
    console.log('✅ Validation réussie');
  } else {
    console.log('❌ Validation échouée:', result.error);
    if (result.details) {
      console.log('   Détails:', result.details);
    }
  }
  console.log('');
});

console.log('🎯 Résumé des nouvelles règles:');
console.log('- Minimum 3 membres (incluant la présidente)');
console.log('- Rôles obligatoires: Présidente + Secrétaire + Trésorière');
console.log('- Si plus de 3 membres: règles FEVEO 2050 appliquées');
