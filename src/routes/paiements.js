const express = require('express');
const router = express.Router();
const paiementController = require('../controllers/paiementController');
const { authenticateToken } = require('../middleware/auth');
const { validerCreationPaiement, validerPagination, validerFiltresPaiement } = require('../middleware/paiementValidation');

// Middleware d'authentification pour toutes les routes sauf webhook
router.use((req, res, next) => {
  // Exclure le webhook de l'authentification
  if (req.path === '/webhook/wave') {
    return next();
  }
  authenticateToken(req, res, next);
});

/**
 * @route   POST /api/paiements
 * @desc    Créer un nouveau paiement
 * @access  Private
 */
router.post('/', validerCreationPaiement, paiementController.creerPaiement);

/**
 * @route   GET /api/paiements
 * @desc    Lister les paiements de l'utilisateur connecté
 * @access  Private
 */
router.get('/', paiementController.listerPaiements);

/**
 * @route   GET /api/paiements/:id
 * @desc    Obtenir les détails d'un paiement par ID
 * @access  Private
 */
router.get('/:id', paiementController.obtenirPaiement);

/**
 * @route   GET /api/paiements/reference/:reference
 * @desc    Obtenir un paiement par référence
 * @access  Public (pour les redirections après paiement)
 */
router.get('/reference/:reference', paiementController.obtenirPaiementParReference);

/**
 * @route   PUT /api/paiements/:id/verifier-statut
 * @desc    Vérifier le statut d'un paiement Wave
 * @access  Private
 */
router.put('/:id/verifier-statut', paiementController.verifierStatutPaiement);

/**
 * @route   PUT /api/paiements/:id/annuler
 * @desc    Annuler un paiement
 * @access  Private
 */
router.put('/:id/annuler', paiementController.annulerPaiement);

/**
 * @route   POST /api/paiements/webhook/wave
 * @desc    Webhook pour les notifications Wave
 * @access  Public (webhook)
 */
router.post('/webhook/wave', paiementController.webhookWave);

module.exports = router;
