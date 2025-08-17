const axios = require('axios');

/**
 * Middleware pour gérer les paiements Wave et Orange Money
 * Utilise la configuration centralisée de paymentConfig.js
 */
module.exports = async (req, res, next) => {
  try {
    const { method, amount, rv } = req.body;
    
    // Vérification des paramètres requis
    if (!method || !amount || !rv) {
      return res.status(400).json({
        success: false,
        message: 'Paramètres manquants: method, amount et rv sont requis',
        statusCode: 400,
        status: 'ERROR'
      });
    }

    // Récupération de la configuration depuis le middleware paymentConfig
    const paymentConfig = req.paymentConfig;
    
    if (!paymentConfig) {
      return res.status(500).json({
        success: false,
        message: 'Configuration de paiement non disponible',
        statusCode: 500,
        status: 'ERROR'
      });
    }

    if (method === "OM") {
      // Configuration Orange Money
      const configOrangeMoney = {
        method: 'post',
        maxBodyLength: Infinity,
        url: paymentConfig.orangeMoney.apiUrl,
        headers: { 
          'Authorization': 'Bearer ' + req.tokenOM, 
          'Content-Type': 'application/json'
        },
        data: JSON.stringify({
          "amount": {
            "unit": paymentConfig.orangeMoney.currency,
            "value": amount
          },
          "callbackCancelUrl": `${paymentConfig.orangeMoney.callbacks.error}?rv=${rv}`,
          "callbackSuccessUrl": `${paymentConfig.orangeMoney.callbacks.success}?rv=${rv}`,
          "code": paymentConfig.orangeMoney.merchantCode,
          "metadata": {
            "transactionId": rv,
            "platform": "FEVEO2050"
          },
          "name": paymentConfig.orangeMoney.merchantName,
          "validity": paymentConfig.orangeMoney.validity
        })
      };

      console.log('🟠 Initiation du paiement Orange Money...');
      
      const response = await axios.request(configOrangeMoney);
      
      console.log('🟠 Réponse Orange Money:', JSON.stringify(response.data));
      
      // Stocker les informations de paiement dans req pour le contrôleur
      req.paymentResponse = {
        provider: 'ORANGE_MONEY',
        paymentUrl: response.data.deepLink,
        qrCode: response.data.qrCode,
        transactionId: response.data.transactionId || rv,
        amount: amount,
        currency: paymentConfig.orangeMoney.currency
      };
      
      req.url = response.data.deepLink;
      next();

    } else if (method === "WAVE") {
      // Configuration Wave
      const waveConfig = {
        method: 'post',
        maxBodyLength: Infinity,
        url: paymentConfig.wave.apiUrl,
        headers: { 
          'Authorization': 'Bearer ' + paymentConfig.wave.token, 
          'Content-Type': 'application/json'
        },
        data: JSON.stringify({
          "amount": amount,
          "currency": paymentConfig.wave.currency,
          "error_url": `${paymentConfig.wave.callbacks.error}?rv=${rv}`,
          "success_url": `${paymentConfig.wave.callbacks.success}?rv=${rv}`
          // Suppression du metadata qui cause l'erreur
        })
      };


   

      console.log('🌊 Initiation du paiement Wave...');
      console.log('🌊 Payload Wave:', JSON.stringify(JSON.parse(waveConfig.data), null, 2));
      
      const response = await axios.request(waveConfig);
      
      console.log('🌊 Réponse Wave:', JSON.stringify(response.data));
      
      // Stocker les informations de paiement dans req pour le contrôleur
      req.paymentResponse = {
        provider: 'WAVE',
        paymentUrl: response.data.wave_launch_url,
        transactionId: response.data.id || rv,
        amount: amount,
        currency: paymentConfig.wave.currency,
        checkoutId: response.data.id
      };
      
      req.url = response.data.wave_launch_url;
      next();

    } else {
      return res.status(400).json({
        success: false,
        message: 'Méthode de paiement non supportée. Utilisez "OM" ou "WAVE"',
        statusCode: 400,
        status: 'ERROR'
      });
    }

  } catch (error) {
    console.error('❌ Erreur dans le middleware de paiement:', error.message);
    
    // Gestion spécifique des erreurs selon le provider
    let errorMessage = 'Erreur lors de l\'initialisation du paiement';
    let statusCode = 500;
    
    if (error.response) {
      // Erreur de l'API externe
      console.error('📋 Détails de l\'erreur:', error.response.data);
      
      // Extraire le message d'erreur spécifique
      const apiError = error.response.data;
      if (apiError.message) {
        errorMessage = `Erreur ${req.body.method}: ${apiError.message}`;
      }
      if (apiError.details && Array.isArray(apiError.details)) {
        console.error('🔍 Détails validation:', apiError.details);
        const detailsMsg = apiError.details.map(d => d.msg || d.type).join(', ');
        errorMessage += ` (${detailsMsg})`;
      }
      
      statusCode = error.response.status || 500;
    } else if (error.request) {
      // Pas de réponse de l'API
      errorMessage = `Impossible de contacter le service ${req.body.method}`;
      statusCode = 503;
    }
    
    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      statusCode: statusCode,
      status: 'ERROR',
      provider: req.body.method,
      error: process.env.NODE_ENV === 'development' ? {
        details: error.response?.data,
        message: error.message
      } : undefined
    });
  }
};
