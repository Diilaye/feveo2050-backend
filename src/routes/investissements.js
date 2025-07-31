const express = require('express');
const router = express.Router();
const {
  validateGIE,
  getCycleByGIE,
  enregistrerInvestissement,
  getCalendrier,
  getStatistiques,
  updateStatutJour,
  getHistoriqueWallet
} = require('../controllers/investissementController');
const {
  validateInvestissement
} = require('../middleware/validation');
const {
  auth,
  requirePermission,
  requireGIEAccess
} = require('../middleware/auth');
const {
  validateGIEMiddleware,
  validateGIEExistenceMiddleware
} = require('../middleware/gieValidation');

// @route   POST /api/investissements/validate-gie
// @desc    Valider l'existence et le statut d'un GIE
// @access  Public
router.post('/validate-gie', validateGIE);

// @route   GET /api/investissements/gie/:gieId
// @desc    Obtenir le cycle d'investissement d'un GIE
// @access  Private
router.get('/gie/:gieId', auth, requireGIEAccess, validateGIEMiddleware, getCycleByGIE);

// @route   GET /api/investissements/gie/:gieId/calendrier
// @desc    Obtenir le calendrier d'investissement
// @access  Private
router.get('/gie/:gieId/calendrier', auth, requireGIEAccess, validateGIEMiddleware, getCalendrier);

// @route   GET /api/investissements/gie/:gieId/stats
// @desc    Obtenir les statistiques d'investissement
// @access  Private
router.get('/gie/:gieId/stats', auth, requireGIEAccess, validateGIEMiddleware, getStatistiques);

// @route   GET /api/investissements/gie/:gieId/wallet/historique
// @desc    Obtenir l'historique du wallet
// @access  Private
router.get('/gie/:gieId/wallet/historique', auth, requireGIEAccess, validateGIEMiddleware, getHistoriqueWallet);

// @route   POST /api/investissements/gie/:gieId/investir
// @desc    Enregistrer un investissement journalier
// @access  Private
router.post('/gie/:gieId/investir', auth, requireGIEAccess, validateGIEMiddleware, requirePermission('gestion_investissement'), validateInvestissement, enregistrerInvestissement);

// @route   PUT /api/investissements/gie/:gieId/jour/:numeroJour
// @desc    Mettre à jour le statut d'un jour d'investissement
// @access  Private
router.put('/gie/:gieId/jour/:numeroJour', auth, requireGIEAccess, validateGIEMiddleware, requirePermission('gestion_investissement'), updateStatutJour);

module.exports = router;
