const express = require('express');
const router = express.Router();

// Import des middlewares
const { validatePaiement, validateConfirmPaiement } = require('../middleware/validation');
const { injectPaymentConfig, getOrangeMoneyToken, validatePaymentConfig } = require('../middleware/paymentConfig');
const paiementWaveMiddleware = require('../middleware/paiement-wave');

// Route pour générer un paiement
router.post('/generate-payment', 
  validatePaiement,
  injectPaymentConfig,
  validatePaymentConfig,
  getOrangeMoneyToken,
  paiementWaveMiddleware,
  (req, res) => {
    // Le middleware a injecté l'URL de paiement dans req.paymentUrl
    res.json({
      success: true,
      message: 'Lien de paiement généré avec succès',
      data: {
        paymentUrl: req.paymentUrl,
        reference: req.paymentReference,
        method: req.body.method,
        amount: req.body.amount,
        currency: 'XOF'
      }
    });
  }
);

// Route de test pour les paiements FEVEO
router.post('/test-payment', 
  validatePaiement,
  injectPaymentConfig,
  (req, res) => {
    const { amount, method, gieCode } = req.body;
    
    res.json({
      success: true,
      message: 'Configuration de paiement validée',
      data: {
        amount,
        method,
        gieCode,
        config: {
          wave: !!req.paymentConfig.wave.token,
          orangeMoney: !!req.paymentConfig.orangeMoney.clientId
        }
      }
    });
  }
);

// Route pour les callbacks de succès Wave
router.get('/payment-success', (req, res) => {
  const { gieCode, rv } = req.query;
  
  console.log('✅ Callback succès Wave reçu:', { gieCode, rv });
  
  // Rediriger vers l'interface de confirmation
  if (gieCode) {
    res.redirect(`https://feveo2050.sn/wallet/payment-success?gieCode=${gieCode}`);
  } else {
    res.redirect('https://feveo2050.sn/payment-success');
  }
});

// Route pour les callbacks d'erreur Wave
router.get('/payment-error', (req, res) => {
  const { gieCode, rv } = req.query;
  
  console.log('❌ Callback erreur Wave reçu:', { gieCode, rv });
  
  // Rediriger vers l'interface d'erreur
  if (gieCode) {
    res.redirect(`https://feveo2050.sn/wallet/payment-error?gieCode=${gieCode}`);
  } else {
    res.redirect('https://feveo2050.sn/payment-error');
  }
});

// Routes similaires pour Orange Money
router.get('/payment-success-om', (req, res) => {
  const { gieCode, rv } = req.query;
  
  console.log('✅ Callback succès Orange Money reçu:', { gieCode, rv });
  
  if (gieCode) {
    res.redirect(`https://feveo2050.sn/wallet/payment-success?gieCode=${gieCode}&method=OM`);
  } else {
    res.redirect('https://feveo2050.sn/payment-success?method=OM');
  }
});

router.get('/payment-error-om', (req, res) => {
  const { gieCode, rv } = req.query;
  
  console.log('❌ Callback erreur Orange Money reçu:', { gieCode, rv });
  
  if (gieCode) {
    res.redirect(`https://feveo2050.sn/wallet/payment-error?gieCode=${gieCode}&method=OM`);
  } else {
    res.redirect('https://feveo2050.sn/payment-error?method=OM');
  }
});

module.exports = router;
