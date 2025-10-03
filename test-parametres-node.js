// Test des paramètres améliorés pour l'endpoint
const axios = require('axios');

const baseURL = 'http://localhost:5001/api/rapport/gie-senegal-region-departement';

async function testParametresAmeliores() {
    console.log('=== Test des paramètres améliorés ===\n');
    
    const tests = [
        {
            nom: 'Format original',
            params: { codeRegion: 'DAKAR', codeDepartement: 'DAKAR' }
        },
        {
            nom: 'Format alternatif 1',
            params: { region: 'DAKAR', departement: 'DAKAR' }
        },
        {
            nom: 'Format alternatif 2',
            params: { codeRegion: 'DAKAR', departement: 'DAKAR' }
        },
        {
            nom: 'Format alternatif 3',
            params: { region: 'DAKAR', codeDept: 'DAKAR' }
        },
        {
            nom: 'Paramètre manquant (validation)',
            params: { codeRegion: 'DAKAR' }
        }
    ];
    
    for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        console.log(`Test ${i + 1}: ${test.nom}`);
        console.log(`Paramètres:`, test.params);
        
        try {
            const response = await axios.get(baseURL, { params: test.params });
            console.log('✅ Succès:', response.data.message);
            
            if (response.data.data && response.data.data.length > 0) {
                const dept = response.data.data[0];
                console.log(`   - Département: ${dept.departement}`);
                console.log(`   - Région: ${dept.region}`);
                console.log(`   - Nombre d'arrondissements: ${dept.arrondissements ? dept.arrondissements.length : 0}`);
            }
            
        } catch (error) {
            if (error.response) {
                console.log('⚠️  Erreur HTTP:', error.response.status);
                console.log('   Message:', error.response.data.message);
                
                if (error.response.data.exemples) {
                    console.log('   Exemples d\'utilisation:');
                    Object.entries(error.response.data.exemples).forEach(([key, url]) => {
                        console.log(`     ${key}: ${url}`);
                    });
                }
                
                if (error.response.data.recu) {
                    console.log('   Paramètres reçus:', error.response.data.recu);
                }
            } else {
                console.log('❌ Erreur:', error.message);
            }
        }
        
        console.log(''); // Ligne vide
    }
    
    // Test POST avec body
    console.log('Test POST avec body JSON:');
    try {
        const response = await axios.post(baseURL, {
            region: 'DAKAR',
            departement: 'DAKAR'
        });
        console.log('✅ POST Succès:', response.data.message);
    } catch (error) {
        if (error.response) {
            console.log('⚠️  POST Erreur:', error.response.status, error.response.data.message);
        } else {
            console.log('❌ POST Erreur:', error.message);
        }
    }
    
    console.log('\n=== Tests terminés ===');
}

// Exporter pour usage externe ou exécuter directement
if (require.main === module) {
    testParametresAmeliores().catch(console.error);
}

module.exports = { testParametresAmeliores };