const express = require('express');
const router = express.Router();

// Import des contrôleurs
const transactionController = require('../controllers/transactionController');

// Import des modèles
const transactionModel = require('../models/Transaction');

// Import des middlewares
const { validatePaiement, validateConfirmPaiement } = require('../middleware/validation');
const { 
  injectPaymentConfig, 
  validatePaymentConfig 
} = require('../middleware/paymentConfig');
const auth = require('../middleware/auth');

// Routes spécifiques FEVEO 2050
//router.get('/gie/:gieCode', auth, transactionController.getByGieCode);
//router.post('/confirm', auth, validateConfirmPaiement, transactionController.confirmPayment);

// Route pour obtenir le volume total des transactions réussies (pour l'admin)
router.get('/volume-total', async (req, res) => {
  try {
    // Vérifier que l'utilisateur est un admin
   // if (req.user.role !== 'ADMIN') {
     // return res.status(403).json({ 
       // success: false, 
     //   message: 'Accès refusé. Seuls les administrateurs peuvent accéder à cette ressource.' 
    //  });
    //}
    
    // Aggrégation pour calculer le volume total des transactions avec status SUCCESS
    const result = await transactionModel.aggregate([
      { $match: { status: 'SUCCESS' } },
      { $addFields: { amountAsNumber: { $toDouble: "$amount" } } },
      { $group: { _id: null, volumeTotal: { $sum: "$amountAsNumber" } } }
    ]);
    
    const volumeTotal = result.length > 0 ? result[0].volumeTotal : 0;
    
    return res.status(200).json({
      success: true,
      volumeTotal
    });
  } catch (error) {
    console.error('Erreur lors du calcul du volume total des transactions:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors du calcul du volume total des transactions',
      error: error.message
    });
  }
});


// Routes CRUD standard avec authentification
router.get('/', transactionController.all);
//router.get('/:id', auth, transactionController.one);
//router.put('/:id', auth, transactionController.update);
//router.delete('/:id', auth, transactionController.delete);

// Route de création de transaction avec middlewares de paiement
router.post('/', 
  validatePaiement, 
  transactionController.store,
  injectPaymentConfig
);


// Callbacks Wave (pas d'auth nécessaire pour les callbacks)
router.get('/success-wave', transactionController.successWave);
router.get('/error-wave', transactionController.errorWave);

// Callbacks Orange Money (pas d'auth nécessaire pour les callbacks)
//router.get('/successOrange', transactionController.successOrange);
//router.get('/errorOrange', transactionController.errorOrange);

module.exports = router;
