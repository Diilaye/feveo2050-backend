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
const { getLocationDetails, getDepartementByCodeRegion, getDepartementsMapsByRegionCodeTS, getDepartementsMapsByRegionName , SENEGAL_GEOGRAPHIC_DATA } = require('../utils/geoData');

router.get('/gies/:id', adminAuth, async (req, res) => {
  try {
    const gie = await GIE.findById(req.params.id);

    if (!gie) {
      return res.status(404).json({
        success: false,
        message: 'GIE non trouvé'
      });
    }

    // Obtenir les détails des entités administratives à partir des codes
    const gieData = gie.toObject();
    const detailsGeographiques = getLocationDetails(
      gie.codeRegion,
      gie.codeDepartement,
      gie.codeArrondissement,
      gie.codeCommune
    );

    // Ajouter les noms complets aux données du GIE
    gieData.detailsGeographiques = {
      nomRegion: detailsGeographiques.region || gie.region,
      nomDepartement: detailsGeographiques.departement || gie.departement,
      // Ne pas afficher les codes si les noms ne sont pas trouvés
      nomArrondissement: detailsGeographiques.arrondissement || '',
      nomCommune: detailsGeographiques.commune || ''
    };

    console.log('Détails géographiques ajoutés aux données du GIE:', gieData.detailsGeographiques);

    res.json({
      success: true,
      data: gieData
    });
  } catch (error) {
    console.error('Erreur détaillée:', error);
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

// ====================== ENDPOINTS POUR LES RAPPORTS GÉOGRAPHIQUES ======================

// @route   GET /api/admin/reports/gies-by-region
// @desc    Récupérer le nombre de GIEs par région et la liste des GIEs
// @access  Admin only
router.get('/reports/gies-by-region', adminAuth, async (req, res) => {
  try {
    // Période optionnelle (7d, 30d, 3m, 12m)
    const period = req.query.period;
    let dateFilter = {};

    if (period) {
      const today = new Date();
      let startDate;

      switch (period) {
        case '7d':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 7);
          break;
        case '30d':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 30);
          break;
        case '3m':
          startDate = new Date(today);
          startDate.setMonth(today.getMonth() - 3);
          break;
        case '12m':
          startDate = new Date(today);
          startDate.setFullYear(today.getFullYear() - 1);
          break;
        default:
          // Pas de filtre de date
          break;
      }

      if (startDate) {
        dateFilter.dateCreation = { $gte: startDate };
      }
    }

    // Agréger les GIEs par région
    const giesByRegion = await GIE.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$region', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log(`Récupéré le nombre de GIEs pour ${giesByRegion.length} régions`);

    // Transformer le résultat en objet { region: count }
    const result = {};
    giesByRegion.forEach(item => {
      result[item._id] = item.count;
    });

    // Récupérer la liste complète des GIEs correspondant aux filtres
    const gies = await GIE.find(dateFilter)
      .select('nomGIE identifiantGIE region departement arrondissement commune dateCreation statutAdhesion statutEnregistrement')
      .sort({ dateCreation: -1 });

    res.json({
      success: true,
      data: result,
      gies: gies,
      totalGies: gies.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des GIEs par région:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques par région',
      error: error.message
    });
  }
});

/**
 * Récupère les départements par région à partir de la base de données et des données géographiques
 * @param {string|null} regionFilter - Filtre de région (optionnel)
 * @param {Object} filters - Filtres supplémentaires pour la requête
 * @returns {Object} - Un objet avec les départements regroupés par région
 */
async function getDepartementsByRegionFromDB(regionFilter = null, filters = {}) {
  const { getDepartementsByRegion, SENEGAL_GEOGRAPHIC_DATA } = require('../utils/geoData');
  const departementsByRegion = {};

  // Initialiser la structure si une région spécifique est demandée
  if (regionFilter) {
    departementsByRegion[regionFilter] = [];
  }

  try {
    // 1. Ajouter les départements depuis les données géographiques officielles
    if (regionFilter) {
      // Trouver le code de la région correspondant au nom
      let regionCode = '';
      Object.entries(SENEGAL_GEOGRAPHIC_DATA).forEach(([code, data]) => {
        if (data.nom.toUpperCase() === regionFilter) {
          regionCode = code;
        }
      });

      if (regionCode) {
        const departements = getDepartementsByRegion(regionCode);
        if (Array.isArray(departements)) {
          departements.forEach(dept => {
            departementsByRegion[regionFilter].push(dept.code);
          });
        }
      }
    } else {
      // Si aucune région n'est spécifiée, récupérer tous les départements
      Object.entries(SENEGAL_GEOGRAPHIC_DATA).forEach(([regionCode, regionData]) => {
        const regionName = regionData.nom.toUpperCase();
        departementsByRegion[regionName] = [];

        // Récupérer les départements de cette région
        Object.values(regionData.departements).forEach(dept => {
          departementsByRegion[regionName].push(dept.code);
        });
      });
    }

    // 2. Ajouter les départements depuis la base de données
    const queryFilter = regionFilter ? { ...filters, region: regionFilter } : filters;

    if (regionFilter) {
      // Pour une région spécifique
      const dbDepartements = await GIE.distinct('departement', queryFilter);
      dbDepartements.forEach(dept => {
        if (!departementsByRegion[regionFilter].includes(dept)) {
          departementsByRegion[regionFilter].push(dept);
        }
      });
    } else {
      // Pour toutes les régions
      const regionsInDb = await GIE.aggregate([
        { $match: filters },
        { $group: { _id: { region: '$region', departement: '$departement' } } }
      ]);

      regionsInDb.forEach(item => {
        const dbRegion = item._id.region;
        const dept = item._id.departement;

        if (!departementsByRegion[dbRegion]) {
          departementsByRegion[dbRegion] = [];
        }

        if (!departementsByRegion[dbRegion].includes(dept)) {
          departementsByRegion[dbRegion].push(dept);
        }
      });
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des départements:", error);
  }

  return departementsByRegion;
}

// Trouve la région (par nom humain ou clé) et renvoie { key, code, entry }
function resolveRegion(data, regionInput) {
  const target = normalizeLabel(regionInput);
  for (const [regionKey, regionVal] of Object.entries(data)) {
    if (!regionVal) continue;
    const byKey = normalizeLabel(regionKey) === target;
    const byName = normalizeLabel(regionVal.nom) === target;
    if ((byKey || byName) && regionVal.departements) {
      return { key: regionKey, code: regionVal.code, entry: regionVal };
    }
  }
  return null;
}

// Trouve le département dans une région via nom OU code (2 chiffres)
function resolveDepartement(regionEntry, departementInput) {
  if (!regionEntry?.departements) return null;
  const depTargetName = normalizeLabel(departementInput);
  const depTargetCode = String(departementInput).padStart(2, '0');

  for (const [depKey, depVal] of Object.entries(regionEntry.departements)) {
    if (!depVal) continue;
    const byNameKey = normalizeLabel(depKey) === depTargetName;
    const byNameProp = normalizeLabel(depVal.nom) === depTargetName;
    const byCode = depVal.code === depTargetCode;
    if (byNameKey || byNameProp || byCode) {
      return { key: depKey, code: depVal.code, nom: depVal.nom };
    }
  }
  return null;
}

// Helpers pour normaliser les libellés
function normalizeLabel(s) {
  return String(s)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s'-]+/g, '')
    .toUpperCase();
}


// @route   GET /api/admin/reports/gies-by-region-departement
// @desc    Récupérer le nombre de GIEs par région et département et la liste des GIEs par département
// @access  Admin only
router.get('/reports/gies-by-region-departement', adminAuth, async (req, res) => {
  try {

    console.log('Requête reçue avec les paramètres:', req.query);

    // Paramètres de la requête
    const region = req.query.region;
    const period = req.query.period;
    const search = req.query.search || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Construire les filtres
    const filter = {};
    if (region) filter.region = region.toUpperCase();


    // Ajouter un filtre de recherche si présent
    if (search) {
      filter.$or = [
        { nomGIE: { $regex: search, $options: 'i' } },
        { identifiantGIE: { $regex: search, $options: 'i' } }
      ];
    }

    // Filtre de période
    if (period) {
      const today = new Date();
      let startDate;

      switch (period) {
        case '7d':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 7);
          break;
        case '30d':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 30);
          break;
        case '3m':
          startDate = new Date(today);
          startDate.setMonth(today.getMonth() - 3);
          break;
        case '12m':
          startDate = new Date(today);
          startDate.setFullYear(today.getFullYear() - 1);
          break;
        default:
          // Pas de filtre de date
          break;
      }

      if (startDate) {
        filter.dateCreation = { $gte: startDate };
      }
    }

    const deptsRegion = [];

    Object.keys(SENEGAL_GEOGRAPHIC_DATA).forEach(regionKey => {
      if (!region || regionKey === region.toUpperCase()) {
        Object.values(SENEGAL_GEOGRAPHIC_DATA[regionKey].departements).forEach(dept => {
          deptsRegion.push({
            code: dept.code,
            nom: dept.nom,
            regionCode: SENEGAL_GEOGRAPHIC_DATA[regionKey].code,
            regionNom: SENEGAL_GEOGRAPHIC_DATA[regionKey].nom
          });
        });
      }
    });

    // Étape 2: Récupérer le total des GIEs correspondant aux filtres pour la pagination
    const totalGies = await GIE.countDocuments(filter);



    // Étape 3: Récupérer les GIEs avec pagination
    const gies = await GIE.find(filter)
      .lean()
      .sort({ dateCreation: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

      const giesByDepartement = new Map();

      for (const gie of gies) {

        for (const dept of deptsRegion) {
          if (dept.code === gie.codeDepartement) {
         
            if (giesByDepartement.has(`${dept.code}-${dept.nom}`)) {
                giesByDepartement.get(`${dept.code}-${dept.nom}`).gies.push(gie);
            }else {
              giesByDepartement.set(`${dept.code}-${dept.nom}`, {
                departementCode: dept.code,
                departementNom: dept.nom,
                gies: [gie]
              });
            }
          }

          
        }
      }

    res.json({
      success: true,
     data : {
      giesByDepartement: Array.from(giesByDepartement.values()),
      gies: gies,
      totalGies: totalGies,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalGies / limit)
      }
     }
     
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des GIEs par région et département:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques par région et département',
      error: error.message
    });
  }
});

// @route   GET /api/admin/reports/gies-by-region-departement-arrondissement
// @desc    Récupérer le nombre de GIEs par région, département et arrondissement et la liste des GIEs
// @access  Admin only
router.get('/reports/gies-by-region-departement-arrondissement', adminAuth, async (req, res) => {
  try {
    // Filtres optionnels
    const region = req.query.region;
    const departement = req.query.departement;
    const period = req.query.period;

    // Construire les filtres
    const filter = {};
    if (region) filter.region = region.toUpperCase();
    if (departement) filter.departement = departement;

    // Filtre de période
    if (period) {
      const today = new Date();
      let startDate;

      switch (period) {
        case '7d':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 7);
          break;
        case '30d':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 30);
          break;
        case '3m':
          startDate = new Date(today);
          startDate.setMonth(today.getMonth() - 3);
          break;
        case '12m':
          startDate = new Date(today);
          startDate.setFullYear(today.getFullYear() - 1);
          break;
        default:
          // Pas de filtre de date
          break;
      }

      if (startDate) {
        filter.dateCreation = { $gte: startDate };
      }
    }

    // Agréger les GIEs par région, département et arrondissement
    const giesByLocation = await GIE.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            region: '$region',
            departement: '$departement',
            arrondissement: '$arrondissement'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.region': 1, '_id.departement': 1, '_id.arrondissement': 1 } }
    ]);

    // Transformer le résultat en structure hiérarchique
    const result = {};
    giesByLocation.forEach(item => {
      const region = item._id.region;
      const departement = item._id.departement;
      const arrondissement = item._id.arrondissement;

      if (!result[region]) {
        result[region] = {};
      }

      if (!result[region][departement]) {
        result[region][departement] = {};
      }

      result[region][departement][arrondissement] = item.count;
    });

    // Récupérer la liste complète des GIEs correspondant aux filtres
    const gies = await GIE.find(filter)
      .select('nomGIE identifiantGIE region departement arrondissement commune dateCreation statutAdhesion statutEnregistrement')
      .sort({ dateCreation: -1 });

    res.json({
      success: true,
      data: result,
      gies: gies,
      totalGies: gies.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des GIEs par localisation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques par localisation',
      error: error.message
    });
  }
});

// @route   GET /api/admin/reports/gies-by-region-departement-arrondissement-commune
// @desc    Récupérer le nombre de GIEs par région, département, arrondissement et commune et la liste des GIEs
// @access  Admin only
router.get('/reports/gies-by-region-departement-arrondissement-commune', adminAuth, async (req, res) => {
  try {
    // Filtres optionnels
    const region = req.query.region;
    const departement = req.query.departement;
    const arrondissement = req.query.arrondissement;
    const commune = req.query.commune;
    const period = req.query.period;

    // Construire les filtres
    const filter = {};
    if (region) filter.region = region.toUpperCase();
    if (departement) filter.departement = departement;
    if (arrondissement) filter.arrondissement = arrondissement;
    if (commune) filter.commune = commune;

    // Filtre de période
    if (period) {
      const today = new Date();
      let startDate;

      switch (period) {
        case '7d':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 7);
          break;
        case '30d':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 30);
          break;
        case '3m':
          startDate = new Date(today);
          startDate.setMonth(today.getMonth() - 3);
          break;
        case '12m':
          startDate = new Date(today);
          startDate.setFullYear(today.getFullYear() - 1);
          break;
        default:
          // Pas de filtre de date
          break;
      }

      if (startDate) {
        filter.dateCreation = { $gte: startDate };
      }
    }

    // Agréger les GIEs par région, département, arrondissement et commune
    const giesByLocation = await GIE.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            region: '$region',
            departement: '$departement',
            arrondissement: '$arrondissement',
            commune: '$commune'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.region': 1, '_id.departement': 1, '_id.arrondissement': 1, '_id.commune': 1 } }
    ]);

    // Transformer le résultat en structure hiérarchique
    const result = {};
    giesByLocation.forEach(item => {
      const region = item._id.region;
      const departement = item._id.departement;
      const arrondissement = item._id.arrondissement;
      const commune = item._id.commune;

      if (!result[region]) {
        result[region] = {};
      }

      if (!result[region][departement]) {
        result[region][departement] = {};
      }

      if (!result[region][departement][arrondissement]) {
        result[region][departement][arrondissement] = {};
      }

      result[region][departement][arrondissement][commune] = item.count;
    });

    // Récupérer la liste complète des GIEs correspondant aux filtres
    const gies = await GIE.find(filter)
      .select('nomGIE identifiantGIE region departement arrondissement commune dateCreation statutAdhesion statutEnregistrement')
      .sort({ dateCreation: -1 });

    res.json({
      success: true,
      data: result,
      gies: gies,
      totalGies: gies.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des GIEs par localisation détaillée:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques par localisation détaillée',
      error: error.message
    });
  }
});

// @route   GET /api/admin/reports/gies-complete-list
// @desc    Récupérer la liste complète des GIEs avec leurs informations géographiques
// @access  Admin only
router.get('/reports/gies-complete-list', adminAuth, async (req, res) => {
  try {
    // Filtres optionnels
    const region = req.query.region;
    const departement = req.query.departement;
    const arrondissement = req.query.arrondissement;
    const commune = req.query.commune;
    const period = req.query.period;

    // Construire les filtres
    const filter = {};
    if (region) filter.region = region.toUpperCase();
    if (departement) filter.departement = departement;
    if (arrondissement) filter.arrondissement = arrondissement;
    if (commune) filter.commune = commune;

    // Filtre de période
    if (period) {
      const today = new Date();
      let startDate;

      switch (period) {
        case '7d':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 7);
          break;
        case '30d':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 30);
          break;
        case '3m':
          startDate = new Date(today);
          startDate.setMonth(today.getMonth() - 3);
          break;
        case '12m':
          startDate = new Date(today);
          startDate.setFullYear(today.getFullYear() - 1);
          break;
        default:
          // Pas de filtre de date
          break;
      }

      if (startDate) {
        filter.dateCreation = { $gte: startDate };
      }
    }

    // Récupérer les GIEs avec filtrage
    const gies = await GIE.find(filter)
      .select('nomGIE identifiantGIE region departement arrondissement commune dateCreation')
      .sort({ dateCreation: -1 });

    res.json({
      success: true,
      count: gies.length,
      data: gies
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la liste des GIEs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la liste des GIEs',
      error: error.message
    });
  }
});

module.exports = router;
