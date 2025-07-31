const express = require('express');
const router = express.Router();
const {
  generateWavePayment,
  checkPaymentStatus,
  handleWaveWebhook
} = require('../controllers/wavePaymentController');

// @route   POST /api/payments/wave/generate
// @desc    Générer un lien de paiement Wave
// @access  Public
router.post('/wave/generate', generateWavePayment);

// @route   GET /api/payments/wave/status/:transactionId
// @desc    Vérifier le statut d'un paiement
// @access  Public
router.get('/wave/status/:transactionId', checkPaymentStatus);

// @route   POST /api/payments/wave/webhook
// @desc    Webhook pour recevoir les notifications Wave
// @access  Public (mais sécurisé par signature)
router.post('/wave/webhook', handleWaveWebhook);

module.exports = router;
