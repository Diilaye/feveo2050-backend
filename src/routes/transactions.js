const express = require('express');
const router = express.Router();

// Import des contrôleurs
const transactionController = require('../controllers/transactionController');

// Import des middlewares
const { validatePaiement, validateConfirmPaiement } = require('../middleware/validation');
const { 
  injectPaymentConfig, 
  validatePaymentConfig 
} = require('../middleware/paymentConfig');
const auth = require('../middleware/auth');

// Routes CRUD standard avec authentification
//router.get('/', auth, transactionController.all);
//router.get('/:id', auth, transactionController.one);
//router.put('/:id', auth, transactionController.update);
//router.delete('/:id', auth, transactionController.delete);

// Route de création de transaction avec middlewares de paiement
router.post('/', 
  validatePaiement, 
  injectPaymentConfig, 
  transactionController.store
);

// Routes spécifiques FEVEO 2050
//router.get('/gie/:gieCode', auth, transactionController.getByGieCode);
//router.post('/confirm', auth, validateConfirmPaiement, transactionController.confirmPayment);

// Callbacks Wave (pas d'auth nécessaire pour les callbacks)
router.get('/success-wave', transactionController.successWave);
router.get('/error-wave', transactionController.errorWave);

// Callbacks Orange Money (pas d'auth nécessaire pour les callbacks)
//router.get('/successOrange', transactionController.successOrange);
//router.get('/errorOrange', transactionController.errorOrange);

module.exports = router;
