const axios = require('axios');

async function testConnectivity() {
  try {
    console.log('🧪 Test de connectivité basique...');
    
    // Test simple GET
    const response = await axios.get('http://localhost:4320/api/wallet/debug-gie-list', {
      timeout: 5000
    });
    
    console.log('✅ GET fonctionne, nombre de GIE:', response.data.data.total);
    
    // Test simple GET membres
    const membersResponse = await axios.get('http://localhost:4320/api/wallet/members/FEVEO-06-01-02-02-002', {
      timeout: 5000
    });
    
    console.log('✅ GET membres fonctionne, nombre:', membersResponse.data.data.totalMembres);
    
    console.log('🚀 Connectivity OK, problème spécifique au POST');
    
  } catch (error) {
    console.error('❌ Erreur connectivité:', error.message);
  }
}

testConnectivity();
