const { getArrondissement, getCommune } = require('./src/utils/geoData');

console.log('=== Test des nouvelles fonctions géographiques ===\n');

// Test de getArrondissement
console.log('1. Test getArrondissement:');
console.log('   - Dakar/Dakar/GOREE:', getArrondissement('01', '01', '01'));
console.log('   - Dakar/Dakar/DAKAR-PLATEAU:', getArrondissement('01', '01', '02'));
console.log('   - Code inexistant:', getArrondissement('99', '99', '99'));

console.log('\n2. Test getCommune:');
console.log('   - GOREE/GOREE:', getCommune('01', '01', '01', '01'));
console.log('   - DAKAR-PLATEAU/DAKAR-PLATEAU:', getCommune('01', '01', '02', '01'));
console.log('   - DAKAR-PLATEAU/MEDINA:', getCommune('01', '01', '02', '02'));
console.log('   - Code inexistant:', getCommune('99', '99', '99', '99'));

console.log('\n=== Fin des tests ===');