const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/adminAuth');
const Utilisateur = require('../models/Utilisateur');
const GIE = require('../models/GIE');
//const Investissement = require('../models/Investissement');
const Transaction = require('../models/Transaction');

// @route   GET /api/admin/dashboard
// @desc    Récupérer les statistiques pour le tableau de bord
// @access  Admin only
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    // Récupération des statistiques
    const utilisateurCount = await Utilisateur.countDocuments();
    const gieCount = await GIE.countDocuments();
    //const investissementCount = await Investissement.countDocuments();
    const transactionCount = await Transaction.countDocuments();

    // Derniers utilisateurs enregistrés
    const recentUsers = await Utilisateur.find()
      .select('nom prenom email role dateCreation')
      .sort({ dateCreation: -1 })
      .limit(5);
    
    // Derniers GIE créés
    const recentGIE = await GIE.find()
      .select('nomGIE identifiantGIE dateCreation')
      .sort({ dateCreation: -1 })
      .limit(5);

    // Dernières transactions
    const recentTransactions = await Transaction.find()
      .select('montant type statut dateCreation')
      .sort({ dateCreation: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        stats: {
          utilisateurs: utilisateurCount,
          gies: gieCount,
          investissements: investissementCount,
          transactions: transactionCount
        },
        recent: {
          utilisateurs: recentUsers,
          gies: recentGIE,
          transactions: recentTransactions
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
});

// @route   GET /api/admin/utilisateurs
// @desc    Récupérer la liste des utilisateurs
// @access  Admin only
router.get('/utilisateurs', adminAuth, async (req, res) => {
  try {
    const utilisateurs = await Utilisateur.find()
      .select('-motDePasse')
      .sort({ dateCreation: -1 });
    
    res.json({
      success: true,
      data: utilisateurs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
      error: error.message
    });
  }
});

// @route   GET /api/admin/gies
// @desc    Récupérer la liste des GIE
// @access  Admin only
router.get('/gies', adminAuth, async (req, res) => {
  try {
    const gies = await GIE.find().sort({ dateCreation: -1 });
    
    res.json({
      success: true,
      data: gies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des GIE',
      error: error.message
    });
  }
});

// @route   GET /api/admin/gies/count
// @desc    Récupérer le nombre total de GIE
// @access  Admin only
router.get('/gies/count', adminAuth, async (req, res) => {
  try {
    const count = await GIE.countDocuments();
    
    res.json({
      success: true,
      count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du comptage des GIE',
      error: error.message
    });
  }
});

// @route   GET /api/admin/gies
// @desc    Récupérer la liste de tous les GIEs avec pagination et filtres
// @access  Admin only
router.get('/gies', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search;
    
    let query = {};
    
    // Si un terme de recherche est fourni, rechercher par téléphone de la présidente
    if (search) {
      query['presidente.telephone'] = { $regex: search, $options: 'i' };
    }
    
    // Compter le nombre total de résultats pour la pagination
    const total = await GIE.countDocuments(query);
    
    // Récupérer les GIEs avec pagination
    const gies = await GIE.find(query)
      .sort({ dateCreation: -1 })
      .skip(skip)
      .limit(limit);
    
    res.json({
      success: true,
      data: gies,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des GIEs',
      error: error.message
    });
  }
});

// @route   GET /api/admin/gies/:id
// @desc    Récupérer les détails d'un GIE
// @access  Admin only
router.get('/gies/:id', adminAuth, async (req, res) => {
  try {
    const gie = await GIE.findById(req.params.id);
    
    if (!gie) {
      return res.status(404).json({
        success: false,
        message: 'GIE non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: gie
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des détails du GIE',
      error: error.message
    });
  }
});

// @route   POST /api/admin/gies/:id/activer-adhesion
// @desc    Activer l'adhésion d'un GIE
// @access  Admin only
router.post('/gies/:id/activer-adhesion', adminAuth, async (req, res) => {
  try {
    // Récupérer le GIE
    const gie = await GIE.findById(req.params.id);
    
    if (!gie) {
      return res.status(404).json({
        success: false,
        message: 'GIE non trouvé'
      });
    }
    
    // Vérifier si l'adhésion n'est pas déjà activée
    if (gie.statutAdhesion === 'validee' && gie.statutEnregistrement === 'valide') {
      return res.status(400).json({
        success: false,
        message: 'L\'adhésion du GIE est déjà activée'
      });
    }
    
    // Générer une référence unique pour la transaction
    const reference = `ADH-${gie.identifiantGIE}-${Date.now().toString().substring(7)}`;
    
    // Créer une nouvelle transaction de type adhésion
    const nouvelleTransaction = new Transaction({
      reference,
      amount: '25000', // Montant fixe pour l'adhésion
      operationType: 'ADHESION',
      gieId: gie._id,
      status: 'SUCCESS',
      method: 'ESPECES', // Par défaut, considérer comme un paiement en espèces
      date: new Date()
    });
    
    await nouvelleTransaction.save();
    
    // Mettre à jour le statut du GIE
    gie.statutAdhesion = 'validee';
    gie.statutEnregistrement = 'valide';
    await gie.save();
    
    res.json({
      success: true,
      message: 'Adhésion activée avec succès',
      data: {
        gie,
        transaction: nouvelleTransaction
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'activation de l\'adhésion',
      error: error.message
    });
  }
});

module.exports = router;
