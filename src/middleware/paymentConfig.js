const axios = require('axios');

// Middleware pour injecter la configuration de paiement dans req
const injectPaymentConfig = (req, res, next) => {
  const paymentConfig  = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://api.wave.com/v1/checkout/sessions',
        headers: { 
          'Authorization': 'Bearer ' + (process.env.WAVE_API_TOKEN || ''),
          'Content-Type': 'application/json'
        },
        data : JSON.stringify({
          "amount": req.body.amount,
          "currency": "XOF",
          "error_url": "https://api.feveo2050.sn/api/transactions/payment-error",
          "success_url": "https://api.feveo2050.sn/api/transactions/payment-success"
        })
      };
  console.log('🔧 Configuration de paiement injectée dans la requête');

  axios.request(paymentConfig)
    .then((response) => {
      req.urlWave = response.data['wave_launch_url'];
      console.log(JSON.stringify(response.data));
      next();
    })
    .catch((error) => {
      console.error('❌ Erreur lors de l\'injection de la configuration de paiement:', error.message);
      res.json({
        message: 'unauthorized authentication required',
        statusCode: 401,
        data: error,
        status: 'NOT OK'
      });
    });
};



module.exports = {
  injectPaymentConfig,
};
