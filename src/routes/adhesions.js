const express = require('express');
const router = express.Router();
const {
  getAllAdhesions,
  getAdhesionById,
  getAdhesionByGIE,
  updateValidationStatus,
  updatePaiementStatus,
  getAdhesionStats,
  getProgression
} = require('../controllers/adhesionController');
const {
  auth,
  requirePermission,
  requireGIEAccess
} = require('../middleware/auth');

// @route   GET /api/adhesions
// @desc    Obtenir toutes les adhésions
// @access  Private
router.get('/', auth, requirePermission('validation_adhesion'), getAllAdhesions);

// @route   GET /api/adhesions/stats
// @desc    Obtenir les statistiques des adhésions
// @access  Private
router.get('/stats', auth, requirePermission('validation_adhesion'), getAdhesionStats);

// @route   GET /api/adhesions/gie/:gieId
// @desc    Obtenir l'adhésion d'un GIE
// @access  Private
router.get('/gie/:gieId', auth, requireGIEAccess, getAdhesionByGIE);

// @route   GET /api/adhesions/:id
// @desc    Obtenir une adhésion par ID
// @access  Private
router.get('/:id', auth, requirePermission('validation_adhesion'), getAdhesionById);

// @route   GET /api/adhesions/:id/progression
// @desc    Calculer la progression d'une adhésion
// @access  Private
router.get('/:id/progression', auth, requirePermission('validation_adhesion'), getProgression);

// @route   PUT /api/adhesions/:id/validation
// @desc    Mettre à jour le statut de validation
// @access  Private (Moderateur/Admin)
router.put('/:id/validation', auth, requirePermission('validation_adhesion'), updateValidationStatus);

// @route   PUT /api/adhesions/:id/paiement
// @desc    Mettre à jour le statut de paiement
// @access  Private
router.put('/:id/paiement', auth, requirePermission('validation_adhesion'), updatePaiementStatus);

module.exports = router;
