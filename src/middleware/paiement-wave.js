const axios = require('axios');
const Transaction = require('../models/Transaction');

module.exports = async (req, res, next) => {
  try {
    const { amount, method, gieCode, rv } = req.body;
    
    // Configuration spécifique à FEVEO 2050
    const paymentConfig = req.paymentConfig || {
      wave: {
        apiUrl: 'https://api.wave.com/v1/checkout/sessions',
        token: process.env.WAVE_API_TOKEN || 'wave_sn_prod_t0CQb9rv21w50ooAfq8B8BjyyY9Ldx-g-eU6VS8zxYKqlHctymZX_ayTuPYPWnp8CJ4fBxpayxyXo7aa84d9zf7sl3XOBjwDKw'
      },
      orangeMoney: {
        apiUrl: 'https://api.sandbox.orange-sonatel.com/api/eWallet/v4/qrcode'
      }
    };

    // Configuration Orange Money
    let configOrangoMoney = {
      method: 'post',
      maxBodyLength: Infinity,
      url: paymentConfig.orangeMoney.apiUrl,
      headers: { 
        'Authorization': 'Bearer ' + req.tokenOM, 
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        "amount": {
          "unit": "XOF",
          "value": amount
        },
        "callbackCancelUrl": `https://api.feveo2050.sn/api/wallet/payment-error-om${rv ? '?rv=' + rv : ''}${gieCode ? '&gieCode=' + gieCode : ''}`,
        "callbackSuccessUrl": `https://api.feveo2050.sn/api/wallet/payment-success-om${rv ? '?rv=' + rv : ''}${gieCode ? '&gieCode=' + gieCode : ''}`,
        "code": 159515,
        "metadata": {
          "gieCode": gieCode || null,
          "rv": rv || null,
          "system": "FEVEO2050"
        },
        "name": "FEVEO 2050",
        "validity": 15
      })
    };
    
    
    if (method == "OM") {
      console.log('🟠 Génération du paiement Orange Money...');
      
      axios.request(configOrangoMoney)
        .then(async (response) => {
          console.log('✅ Paiement Orange Money généré:', JSON.stringify(response.data));
          
          // Créer l'entrée de transaction en base
          try {
            const transaction = new Transaction({
              reference: response.data.id || `OM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              amount: amount.toString(),
              method: 'OM',
              status: 'PENDING',
              token: response.data.id,
              gieId: req.gieId || null,
              adhesionId: req.adhesionId || null
            });
            
            await transaction.save();
            console.log('💾 Transaction Orange Money sauvegardée en base');
          } catch (dbError) {
            console.error('⚠️ Erreur sauvegarde transaction OM:', dbError.message);
          }
          
          req.paymentUrl = response.data['deepLink'];
          req.paymentReference = response.data.id;
          next();
        })
        .catch((error) => {
          console.error('❌ Erreur paiement Orange Money:', error.message);
          res.status(500).json({
            success: false,
            message: 'Erreur lors de la génération du paiement Orange Money',
            error: error.message
          });
        });
        
    } else {
      // Configuration Wave pour FEVEO 2050
      let WaveConfig = {
        method: 'post',
        maxBodyLength: Infinity,
        url: paymentConfig.wave.apiUrl,
        headers: { 
          'Authorization': 'Bearer ' + paymentConfig.wave.token, 
          'Content-Type': 'application/json'
        },
        data: JSON.stringify({
          "amount": amount,
          "currency": "XOF",
          "error_url": `https://api.feveo2050.sn/api/wallet/payment-error${rv ? '?rv=' + rv : ''}${gieCode ? '&gieCode=' + gieCode : ''}`,
          "success_url": `https://api.feveo2050.sn/api/wallet/payment-success${rv ? '?rv=' + rv : ''}${gieCode ? '&gieCode=' + gieCode : ''}`,
          "metadata": {
            "gieCode": gieCode || null,
            "rv": rv || null,
            "system": "FEVEO2050"
          }
        })
      };
      
      console.log('🌊 Génération du paiement Wave...');

      axios.request(WaveConfig)
        .then(async (response) => {
          console.log('✅ Paiement Wave généré:', JSON.stringify(response.data));
          
          // Créer l'entrée de transaction en base
          try {
            const transaction = new Transaction({
              reference: response.data.id || `WAVE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              amount: amount.toString(),
              method: 'WAVE',
              status: 'PENDING',
              token: response.data.id,
              gieId: req.gieId || null,
              adhesionId: req.adhesionId || null
            });
            
            await transaction.save();
            console.log('💾 Transaction Wave sauvegardée en base');
          } catch (dbError) {
            console.error('⚠️ Erreur sauvegarde transaction Wave:', dbError.message);
          }
          
          req.paymentUrl = response.data['wave_launch_url'];
          req.paymentReference = response.data.id;
          next();
        })
        .catch((error) => {
          console.error('❌ Erreur paiement Wave:', error.message);
          res.json({
            success: false,
            message: 'Erreur lors de la génération du paiement Wave',
            statusCode: 401,
            data: error.response?.data || error.message,
            status: 'NOT OK'
          });
        });
    }
    
  } catch (error) {
    console.error('❌ Erreur générale middleware paiement:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du middleware de paiement',
      error: error.message
    });
  }
};
