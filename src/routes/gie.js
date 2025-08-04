const express = require('express');
const router = express.Router();
const {
  createGIE,
  getAllGIE,
  getGIEById,
  updateGIE,
  deleteGIE,
  getGIEStats,
  getNextProtocol,
  envoyerCodeConnexionGIE,
  verifierCodeConnexionGIE,
  getStatsPubliques
} = require('../controllers/gieController');
const {
  validateGIE
} = require('../middleware/validation');
const {
  auth,
  requireRole,
  requirePermission,
  requireGIEAccess
} = require('../middleware/auth');

// Routes publiques (doivent être avant les routes avec auth)
// @route   GET /api/gie/stats-publiques
// @desc    Obtenir les statistiques publiques des GIEs
// @access  Public
router.get('/stats-publiques', getStatsPubliques);

// @route   POST /api/gie/verifier-code-connexion
// @desc    Vérifier code de connexion GIE
// @access  Public
router.post('/verifier-code-connexion', verifierCodeConnexionGIE);

// Routes avec authentification
// @route   POST /api/gie
// @desc    Créer un nouveau GIE
// @access  Private
router.post('/', auth, requirePermission('gestion_gie'), validateGIE, createGIE);

// @route   GET /api/gie
// @desc    Obtenir tous les GIE
// @access  Private
router.get('/', auth, requirePermission('gestion_gie'), getAllGIE);

// @route   GET /api/gie/stats
// @desc    Obtenir les statistiques des GIE
// @access  Private
router.get('/stats', auth, requirePermission('gestion_gie'), getGIEStats);

// @route   GET /api/gie/next-protocol
// @desc    Générer le prochain numéro de protocole
// @access  Private
router.get('/next-protocol', auth, requirePermission('gestion_gie'), getNextProtocol);

// @route   GET /api/gie/:id
// @desc    Obtenir un GIE par ID
// @access  Private
router.get('/:id', auth, requireGIEAccess, getGIEById);

// @route   PUT /api/gie/:id
// @desc    Mettre à jour un GIE
// @access  Private
router.put('/:id', auth, requireGIEAccess, requirePermission('gestion_gie'), updateGIE);

// @route   DELETE /api/gie/:id
// @desc    Supprimer un GIE
// @access  Private (Admin seulement)
router.delete('/:id', auth, requireRole('admin'), deleteGIE);

// @route   POST /api/gie/envoyer-code-connexion
// @desc    Envoyer code de connexion GIE
// @access  Private
router.post('/envoyer-code-connexion', auth, requirePermission('gestion_gie'), envoyerCodeConnexionGIE);

module.exports = router;
