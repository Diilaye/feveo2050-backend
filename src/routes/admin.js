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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;
    const search = req.query.search;

    let query = {};
    
    // Si un terme de recherche est fourni
    if (search) {
      query = {
        $or: [
          { nom: { $regex: search, $options: 'i' } },
          { prenom: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { telephone: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Compter le nombre total de résultats pour la pagination
    const total = await Utilisateur.countDocuments(query);
    
    // Récupérer les utilisateurs avec pagination
    const utilisateurs = await Utilisateur.find(query)
      .select('-motDePasse')
      .sort({ dateCreation: -1 })
      .skip(skip)
      .limit(limit);
    
    res.json({
      success: true,
      data: utilisateurs,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
      error: error.message
    });
  }
});

// @route   GET /api/admin/utilisateurs/:id
// @desc    Récupérer un utilisateur spécifique
// @access  Admin only
router.get('/utilisateurs/:id', adminAuth, async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findById(req.params.id).select('-motDePasse');
    
    if (!utilisateur) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: utilisateur
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'utilisateur',
      error: error.message
    });
  }
});

// @route   POST /api/admin/utilisateurs
// @desc    Créer un nouvel utilisateur
// @access  Admin only
router.post('/utilisateurs', adminAuth, async (req, res) => {
  try {
    const { nom, prenom, email, telephone, role } = req.body;
    
    // Vérifier si l'email existe déjà
    const utilisateurExistant = await Utilisateur.findOne({ email });
    if (utilisateurExistant) {
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }
    
    // Générer un mot de passe temporaire aléatoire
    const motDePasseTemporaire = Math.random().toString(36).slice(-8);
    
    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const motDePasseHash = await bcrypt.hash(motDePasseTemporaire, salt);
    
    // Créer le nouvel utilisateur
    const nouvelUtilisateur = new Utilisateur({
      nom,
      prenom,
      email,
      telephone,
      role: role || 'operateur',
      motDePasse: motDePasseHash,
      dateCreation: new Date(),
      statut: 'actif'
    });
    
    await nouvelUtilisateur.save();
    
    // TODO: Envoyer un email avec le mot de passe temporaire
    
    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: {
        ...nouvelUtilisateur.toObject(),
        motDePasse: undefined,
        motDePasseTemporaire
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'utilisateur',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/utilisateurs/:id
// @desc    Modifier un utilisateur existant
// @access  Admin only
router.put('/utilisateurs/:id', adminAuth, async (req, res) => {
  try {
    const { nom, prenom, email, telephone, role } = req.body;
    
    // Vérifier si l'utilisateur existe
    const utilisateur = await Utilisateur.findById(req.params.id);
    if (!utilisateur) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email !== utilisateur.email) {
      const emailExistant = await Utilisateur.findOne({ email });
      if (emailExistant) {
        return res.status(400).json({
          success: false,
          message: 'Cet email est déjà utilisé par un autre utilisateur'
        });
      }
    }
    
    // Mettre à jour l'utilisateur
    utilisateur.nom = nom || utilisateur.nom;
    utilisateur.prenom = prenom || utilisateur.prenom;
    utilisateur.email = email || utilisateur.email;
    utilisateur.telephone = telephone || utilisateur.telephone;
    
    // Ne pas permettre de changer son propre rôle
    if (req.admin._id.toString() !== utilisateur._id.toString()) {
      utilisateur.role = role || utilisateur.role;
    }
    
    await utilisateur.save();
    
    res.json({
      success: true,
      message: 'Utilisateur modifié avec succès',
      data: utilisateur
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification de l\'utilisateur',
      error: error.message
    });
  }
});

// @route   PATCH /api/admin/utilisateurs/:id/statut
// @desc    Changer le statut d'un utilisateur (bloquer/débloquer)
// @access  Admin only
router.patch('/utilisateurs/:id/statut', adminAuth, async (req, res) => {
  try {
    const { statut } = req.body;
    console.log(req.body);
    
    // Vérifier si le statut est valide
    if (!['actif', 'inactif', 'suspendu'].includes(statut)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }
    
    // Vérifier si l'utilisateur existe
    const utilisateur = await Utilisateur.findById(req.params.id);
    console.log(utilisateur);
    if (!utilisateur) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Ne pas permettre de se bloquer soi-même
    if (req.admin._id.toString() === utilisateur._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez pas modifier votre propre statut'
      });
    }
    
    // Mettre à jour le statut
    utilisateur.statut = statut;
    
    if (statut === 'suspendu') {
      utilisateur.compteBloque = true;
    } else {
      utilisateur.compteBloque = false;
      utilisateur.tentativesConnexionEchouees = 0;
      utilisateur.dateDeblocage = null;
    }
    
    await utilisateur.save();
    
    res.json({
      success: true,
      message: `Statut de l'utilisateur modifié avec succès (${statut})`,
      data: {
        _id: utilisateur._id,
        statut: utilisateur.statut,
        compteBloque: utilisateur.compteBloque
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du statut',
      error: error.message
    });
  }
});

// @route   DELETE /api/admin/utilisateurs/:id
// @desc    Supprimer un utilisateur
// @access  Admin only
router.delete('/utilisateurs/:id', adminAuth, async (req, res) => {
  try {
    // Vérifier si l'utilisateur existe
    const utilisateur = await Utilisateur.findById(req.params.id);
    if (!utilisateur) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Ne pas permettre de se supprimer soi-même
    if (req.admin._id.toString() === utilisateur._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez pas supprimer votre propre compte'
      });
    }
    
    // Supprimer l'utilisateur
    await Utilisateur.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'utilisateur',
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
    
    // Si un terme de recherche est fourni, rechercher par téléphone, nom ou prénom de la présidente
    if (search) {
      // On construit une requête pour rechercher dans les formats ancien et nouveau
      query = {
        $or: [
          // Nouveau format (champs individuels)
          { 'presidenteTelephone': { $regex: search, $options: 'i' } },
          { 'presidenteNom': { $regex: search, $options: 'i' } },
          { 'presidentePrenom': { $regex: search, $options: 'i' } },
          
          // Ancien format (sous-document presidente)
          { 'presidente.telephone': { $regex: search, $options: 'i' } },
          { 'presidente.nom': { $regex: search, $options: 'i' } },
          { 'presidente.prenom': { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    // Compter le nombre total de résultats pour la pagination
    const total = await GIE.countDocuments(query);
    
    // Récupérer les GIEs avec pagination
    const gies = await GIE.find(query)
      .sort({ dateCreation: -1 })
      .skip(skip)
      .limit(limit);

      console.log(`Récupéré ${gies.length} GIEs`);

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

// @route   POST /api/admin/gies/:id/activer-investissement
// @desc    Activer l'investissement d'un GIE pour une période spécifiée
// @access  Admin only
router.post('/gies/:id/activer-investissement', adminAuth, async (req, res) => {
  try {
    const { dureeJours } = req.body;
    
    // Validation des données
    if (!dureeJours || dureeJours <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir une durée valide en jours'
      });
    }
    
    // Récupérer le GIE
    const gie = await GIE.findById(req.params.id);
    
    if (!gie) {
      return res.status(404).json({
        success: false,
        message: 'GIE non trouvé'
      });
    }
    
    // Vérifier si le GIE a une adhésion valide
    if (gie.statutAdhesion !== 'validee' || gie.statutEnregistrement !== 'valide') {
      return res.status(400).json({
        success: false,
        message: 'L\'adhésion du GIE doit être validée avant d\'activer l\'investissement'
      });
    }
 
    
    // Mettre à jour le statut d'investissement du GIE
    gie.daysInvestedSuccess += dureeJours;
    
    await gie.save();
    
    // Générer une référence unique pour la transaction
    const reference = `INV-${gie.identifiantGIE}-${Date.now().toString().substring(7)}`;
    
    // Créer une nouvelle transaction de type investissement
    const nouvelleTransaction = new Transaction({
      reference,
      amount: dureeJours * 6000, // Montant fixe pour l'investissement (à ajuster selon vos besoins)
      operationType: 'INVESTISSEMENT',
      gieId: gie._id,
      status: 'SUCCESS',
      method: 'ESPECES', // Par défaut, considérer comme un paiement en espèces
      date: new Date()
    });
    
    await nouvelleTransaction.save();
    
    res.json({
      success: true,
      message: `Investissement activé pour ${dureeJours} jours avec succès`,
      data: {
        gie,
        transaction: nouvelleTransaction,
        investissement: {
          actif: true,
          dureeJours
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'activation de l\'investissement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'activation de l\'investissement',
      error: error.message
    });
  }
});

module.exports = router;
