// Test de la nouvelle route /gie-senegal-region-departement
const axios = require('axios');

const baseURL = 'http://localhost:5001/api/rapport';

async function testRouteRegionDepartement() {
    console.log('=== Test de la route /gie-senegal-region-departement ===\n');
    
    try {
        // Test 1: Avec les paramètres requis
        console.log('Test 1: Récupération des arrondissements du département DAKAR de la région DAKAR');
        
        const response1 = await axios.get(`${baseURL}/gie-senegal-region-departement`, {
            params: {
                codeRegion: 'DAKAR',
                codeDepartement: 'DAKAR'
            }
        });
        
        console.log('✅ Statut:', response1.status);
        console.log('✅ Message:', response1.data.message);
        console.log('✅ Région demandée:', response1.data.regionDemandee);
        console.log('✅ Département demandé:', response1.data.departementDemande);
        
        if (response1.data.data && response1.data.data.length > 0) {
            const dept = response1.data.data[0];
            console.log(`✅ Département trouvé: ${dept.departement}`);
            console.log(`✅ Nombre total GIE: ${dept.nombreTotalGIE}`);
            console.log(`✅ Total adhérents: ${dept.totalTotalAdherents}`);
            console.log(`✅ Nombre d'arrondissements: ${dept.arrondissements ? dept.arrondissements.length : 0}`);
            
            if (dept.arrondissements && dept.arrondissements.length > 0) {
                console.log('\nArrondissements trouvés:');
                dept.arrondissements.forEach((arr, index) => {
                    console.log(`  ${index + 1}. ${arr.arrondissement} - ${arr.nombreGIE} GIE(s), ${arr.totalAdherents} adhérent(s)`);
                    
                    if (arr.gies && arr.gies.length > 0) {
                        console.log(`     Premier GIE: ${arr.gies[0].nomGIE}`);
                        console.log(`     - Arrondissement: ${arr.gies[0].nomArrondissement || 'Non trouvé'}`);
                        console.log(`     - Commune: ${arr.gies[0].nomCommune || 'Non trouvée'}`);
                    }
                });
            }
        } else {
            console.log('ℹ️  Aucune donnée trouvée pour ce département');
        }
        
    } catch (error) {
        if (error.response) {
            console.log('❌ Erreur HTTP:', error.response.status);
            console.log('❌ Message:', error.response.data.message);
        } else {
            console.log('❌ Erreur:', error.message);
        }
    }
    
    try {
        // Test 2: Sans paramètres (doit retourner une erreur)
        console.log('\n\nTest 2: Sans paramètres (test de validation)');
        
        const response2 = await axios.get(`${baseURL}/gie-senegal-region-departement`);
        console.log('⚠️  Réponse inattendue:', response2.data);
        
    } catch (error) {
        if (error.response && error.response.status === 400) {
            console.log('✅ Validation OK - Erreur 400 attendue');
            console.log('✅ Message:', error.response.data.message);
        } else {
            console.log('❌ Erreur inattendue:', error.message);
        }
    }
    
    console.log('\n=== Test terminé ===');
}

// Exécuter le test seulement si le fichier est lancé directement
if (require.main === module) {
    testRouteRegionDepartement();
}

module.exports = { testRouteRegionDepartement };