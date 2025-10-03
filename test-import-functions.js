// Test simple des fonctions géographiques
try {
  const { getArrondissement, getCommune } = require('./src/utils/geoData');
  console.log('✅ Import des fonctions réussi');
  
  // Test simple
  const result1 = getArrondissement('01', '01', '01');
  console.log('✅ Test getArrondissement:', result1);
  
  const result2 = getCommune('01', '01', '01', '01');
  console.log('✅ Test getCommune:', result2);
  
  console.log('✅ Toutes les fonctions fonctionnent correctement');
} catch (error) {
  console.error('❌ Erreur:', error.message);
  console.error('❌ Stack:', error.stack);
}