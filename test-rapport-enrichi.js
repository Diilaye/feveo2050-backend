// Test direct de l'endpoint rapport modifié
const { getArrondissement, getCommune } = require('./src/utils/geoData');

console.log('=== Test des fonctions dans le contexte rapport ===\n');

// Simulation de données GIE avec codes géographiques
const testGies = [
  {
    codeRegion: '01',
    codeDepartement: '01',
    codeArrondissement: '01',
    codeCommune: '01',
    nomGIE: 'GIE Test Gorée'
  },
  {
    codeRegion: '01', 
    codeDepartement: '01',
    codeArrondissement: '02',
    codeCommune: '02',
    nomGIE: 'GIE Test Médina'
  }
];

// Test de l'enrichissement comme dans l'endpoint
console.log('Enrichissement des données GIE:');
const giesEnrichis = testGies.map(gie => ({
  ...gie,
  nomArrondissement: getArrondissement(gie.codeRegion, gie.codeDepartement, gie.codeArrondissement),
  nomCommune: getCommune(gie.codeRegion, gie.codeDepartement, gie.codeArrondissement, gie.codeCommune)
}));

giesEnrichis.forEach((gie, index) => {
  console.log(`\nGIE ${index + 1}: ${gie.nomGIE}`);
  console.log(`- Arrondissement: ${gie.nomArrondissement || 'Non trouvé'}`);
  console.log(`- Commune: ${gie.nomCommune || 'Non trouvée'}`);
});

console.log('\n=== Test terminé avec succès ===');