const axios = require('axios');

async function testAddMemberNew() {
  try {
    console.log('🧪 Test d\'ajout avec nouveau téléphone...');
    
    const response = await axios({
      method: 'POST',
      url: 'http://localhost:4320/api/wallet/members/FEVEO-06-01-02-02-002/add',
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        nom: 'Diop',
        prenom: 'Fatou',
        telephone: '777999123', // Nouveau numéro
        fonction: 'Membre',
        genre: 'femme',
        cin: '123456789'
      },
      timeout: 10000
    });
    
    console.log('✅ Succès:', response.data);
  } catch (error) {
    console.error('❌ Erreur:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      stack: error.code
    });
  }
}

testAddMemberNew();
