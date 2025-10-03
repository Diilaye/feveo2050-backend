const { getArrondissement, getCommune, SENEGAL_GEOGRAPHIC_DATA } = require('./src/utils/geoData');

console.log('=== Exemple d\'utilisation des fonctions géographiques ===\n');

// Fonction utilitaire pour afficher les résultats
const afficherResultat = (operation, params, resultat) => {
  console.log(`${operation}(${params.join(', ')}) = "${resultat}"`);
};

// Exemples avec différentes régions
const exemples = [
  // Région Dakar
  { region: '01', dept: '01', arr: '01', commune: '01', regionNom: 'Dakar' },
  { region: '01', dept: '01', arr: '02', commune: '02', regionNom: 'Dakar' },
  
  // Région Thiès (si elle existe dans vos données)
  { region: '02', dept: '01', arr: '01', commune: '01', regionNom: 'Thiès' },
];

console.log('1. Tests avec différentes régions:\n');

exemples.forEach((ex, index) => {
  console.log(`Exemple ${index + 1} - Région ${ex.regionNom}:`);
  
  // Test getArrondissement
  const nomArrondissement = getArrondissement(ex.region, ex.dept, ex.arr);
  afficherResultat('getArrondissement', [ex.region, ex.dept, ex.arr], nomArrondissement);
  
  // Test getCommune
  const nomCommune = getCommune(ex.region, ex.dept, ex.arr, ex.commune);
  afficherResultat('getCommune', [ex.region, ex.dept, ex.arr, ex.commune], nomCommune);
  
  console.log('');
});

console.log('2. Utilisation dans un contexte réel:\n');

// Simulation d'un GIE avec codes géographiques
const gieExemple = {
  nomGIE: "GIE Exemple",
  codeRegion: "01",
  codeDepartement: "01", 
  codeArrondissement: "02",
  codeCommune: "01"
};

console.log('Données du GIE:', gieExemple);
console.log('Localisation complète:');
console.log(`- Arrondissement: ${getArrondissement(gieExemple.codeRegion, gieExemple.codeDepartement, gieExemple.codeArrondissement)}`);
console.log(`- Commune: ${getCommune(gieExemple.codeRegion, gieExemple.codeDepartement, gieExemple.codeArrondissement, gieExemple.codeCommune)}`);

console.log('\n=== Fin des exemples ===');