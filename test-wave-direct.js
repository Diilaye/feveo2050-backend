// Test direct de l'API Wave avec payload minimal
const axios = require('axios');

const testWavePayment = async () => {
  const payloadMinimal = {
    "amount": 1000,
    "currency": "XOF",
    "error_url": "https://feveo2050.sn/error",
    "success_url": "https://feveo2050.sn/success"
  };

  const payloadAvecCallbacks = {
    "amount": 1000,
    "currency": "XOF",
    "error_url": "https://api.feveo2050.sn/api/wallet/payment-error?rv=TEST123",
    "success_url": "https://api.feveo2050.sn/api/wallet/payment-success?rv=TEST123"
  };

  const token = 'wave_sn_prod_FIdhHNGkeoAFnuGNxuh8WD3L9XjEBqjRCKx2zEZ87H7LWSwHs2v2aA_5q_ZJGwaLfphltYSRawKP-voVugCpwWB2FMH3ZTtC0w';

  console.log('🧪 Test 1: Payload minimal');
  try {
    const response1 = await axios.post('https://api.wave.com/v1/checkout/sessions', payloadMinimal, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Test 1 réussi:', response1.data.wave_launch_url);
  } catch (error1) {
    console.log('❌ Test 1 échoué:', error1.response?.data || error1.message);
  }

  console.log('\n🧪 Test 2: Payload avec callbacks complets');
  try {
    const response2 = await axios.post('https://api.wave.com/v1/checkout/sessions', payloadAvecCallbacks, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Test 2 réussi:', response2.data.wave_launch_url);
  } catch (error2) {
    console.log('❌ Test 2 échoué:', error2.response?.data || error2.message);
  }
};

// Exporter pour utilisation
module.exports = { testWavePayment };

// Si exécuté directement
if (require.main === module) {
  testWavePayment();
}
