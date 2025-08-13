// Configuration centralisée pour les paiements Wave et Orange Money
const paymentConfig = {
  wave: {
    apiUrl: 'https://api.wave.com/v1/checkout/sessions',
    token: process.env.WAVE_API_TOKEN || 'wave_sn_prod_FIdhHNGkeoAFnuGNxuh8WD3L9XjEBqjRCKx2zEZ87H7LWSwHs2v2aA_5q_ZJGwaLfphltYSRawKP-voVugCpwWB2FMH3ZTtC0w',
    currency: 'XOF',
    // URLs de callback pour FEVEO 2050
    callbacks: {
      success: process.env.CALLBACK_SUCCESS_URL || 'https://api.feveo2050.sn/api/wallet/payment-success',
      error: process.env.CALLBACK_ERROR_URL || 'https://api.feveo2050.sn/api/wallet/payment-error'
    }
  },
  orangeMoney: {
    apiUrl: 'https://api.sandbox.orange-sonatel.com/api/eWallet/v4/qrcode',
    tokenUrl: 'https://api.sandbox.orange-sonatel.com/oauth/token',
    clientId: process.env.OM_CLIENT_ID || '',
    clientSecret: process.env.OM_CLIENT_SECRET || '',
    currency: 'XOF',
    validity: 15, // minutes
    merchantCode: 159515,
    merchantName: 'FEVEO2050',
    // URLs de callback pour FEVEO 2050
    callbacks: {
      success: process.env.CALLBACK_SUCCESS_URL_OM || 'https://api.feveo2050.sn/api/wallet/payment-success-om',
      error: process.env.CALLBACK_ERROR_URL_OM || 'https://api.feveo2050.sn/api/wallet/payment-error-om'
    }
  }
};

// Middleware pour injecter la configuration de paiement dans req
const injectPaymentConfig = (req, res, next) => {
  req.paymentConfig = paymentConfig;
  next();
};

// Middleware pour obtenir le token Orange Money
const getOrangeMoneyToken = async (req, res, next) => {
  if (req.body.method === 'OM') {
    try {
      const axios = require('axios');
      
      const tokenResponse = await axios.post(paymentConfig.orangeMoney.tokenUrl, {
        grant_type: 'client_credentials'
      }, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${paymentConfig.orangeMoney.clientId}:${paymentConfig.orangeMoney.clientSecret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      req.tokenOM = tokenResponse.data.access_token;
      console.log('🟠 Token Orange Money obtenu avec succès');
      next();
    } catch (error) {
      console.error('❌ Erreur lors de l\'obtention du token Orange Money:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'authentification Orange Money',
        error: error.message
      });
    }
  } else {
    next();
  }
};

// Middleware pour valider la configuration avant le paiement
const validatePaymentConfig = (req, res, next) => {
  const { method } = req.body;
  
  if (method === 'WAVE') {
    if (!paymentConfig.wave.token) {
      return res.status(500).json({
        success: false,
        message: 'Configuration Wave incomplète'
      });
    }
  } else if (method === 'OM') {
    if (!paymentConfig.orangeMoney.clientId || !paymentConfig.orangeMoney.clientSecret) {
      return res.status(500).json({
        success: false,
        message: 'Configuration Orange Money incomplète'
      });
    }
  }
  
  next();
};

module.exports = {
  paymentConfig,
  injectPaymentConfig,
  getOrangeMoneyToken,
  validatePaymentConfig
};
