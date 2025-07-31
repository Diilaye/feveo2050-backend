const GIE = require('../models/GIE');
const Adhesion = require('../models/Adhesion');
const CycleInvestissement = require('../models/CycleInvestissement');

// @desc    Créer un nouveau GIE
// @route   POST /api/gie
// @access  Private
const createGIE = async (req, res) => {
  try {
    const gieData = req.body;

    // Vérifier l'unicité de l'identifiant et du protocole
    const existingGIE = await GIE.findOne({
      $or: [
        { identifiantGIE: gieData.identifiantGIE },
        { numeroProtocole: gieData.numeroProtocole },
        { presidenteCIN: gieData.presidenteCIN }
      ]
    });

    if (existingGIE) {
      return res.status(400).json({
        success: false,
        message: 'GIE avec cet identifiant, protocole ou CIN présidente existe déjà'
      });
    }

    // Créer le GIE
    const gie = new GIE(gieData);
    await gie.save();

    // Créer automatiquement l'adhésion
    const adhesion = new Adhesion({
      gieId: gie._id,
      typeAdhesion: 'standard'
    });
    await adhesion.save();

    // Créer le cycle d'investissement
    const cycleInvestissement = new CycleInvestissement({
      gieId: gie._id
    });
    cycleInvestissement.genererCalendrier();
    await cycleInvestissement.save();

    res.status(201).json({
      success: true,
      message: 'GIE créé avec succès',
      data: {
        gie,
        adhesion,
        cycleInvestissement: {
          id: cycleInvestissement._id,
          dateDebut: cycleInvestissement.dateDebut,
          dateFin: cycleInvestissement.dateFin,
          dureeJours: cycleInvestissement.dureeJours
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du GIE',
      error: error.message
    });
  }
};

// @desc    Obtenir tous les GIE
// @route   GET /api/gie
// @access  Private
const getAllGIE = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      region,
      secteur,
      statut
    } = req.query;

    // Construire le filtre
    const filter = {};
    
    if (search) {
      filter.$or = [
        { nomGIE: { $regex: search, $options: 'i' } },
        { identifiantGIE: { $regex: search, $options: 'i' } },
        { presidenteNom: { $regex: search, $options: 'i' } },
        { presidentePrenom: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (region) filter.region = region;
    if (secteur) filter.secteurPrincipal = secteur;
    if (statut) filter.statutAdhesion = statut;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: [
        {
          path: 'adhesion',
          select: 'typeAdhesion validation.statut paiement.statut'
        }
      ]
    };

    // Utiliser une agrégation pour joindre les adhésions
    const agregation = [
      { $match: filter },
      {
        $lookup: {
          from: 'adhesions',
          localField: '_id',
          foreignField: 'gieId',
          as: 'adhesion'
        }
      },
      {
        $unwind: {
          path: '$adhesion',
          preserveNullAndEmptyArrays: true
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: (options.page - 1) * options.limit },
      { $limit: options.limit }
    ];

    const gie = await GIE.aggregate(agregation);
    const total = await GIE.countDocuments(filter);

    res.json({
      success: true,
      data: {
        gie,
        pagination: {
          page: options.page,
          limit: options.limit,
          total,
          pages: Math.ceil(total / options.limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des GIE',
      error: error.message
    });
  }
};

// @desc    Obtenir un GIE par ID
// @route   GET /api/gie/:id
// @access  Private
const getGIEById = async (req, res) => {
  try {
    const gie = await GIE.findById(req.params.id);

    if (!gie) {
      return res.status(404).json({
        success: false,
        message: 'GIE non trouvé'
      });
    }

    // Récupérer les informations d'adhésion
    const adhesion = await Adhesion.findOne({ gieId: gie._id });
    
    // Récupérer le cycle d'investissement
    const cycleInvestissement = await CycleInvestissement.findOne({ gieId: gie._id });

    res.json({
      success: true,
      data: {
        gie,
        adhesion,
        cycleInvestissement
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du GIE',
      error: error.message
    });
  }
};

// @desc    Mettre à jour un GIE
// @route   PUT /api/gie/:id
// @access  Private
const updateGIE = async (req, res) => {
  try {
    const gie = await GIE.findById(req.params.id);

    if (!gie) {
      return res.status(404).json({
        success: false,
        message: 'GIE non trouvé'
      });
    }

    // Empêcher la modification de certains champs critiques
    const champsProtégés = ['identifiantGIE', 'numeroProtocole', 'presidenteCIN'];
    champsProtégés.forEach(champ => {
      if (req.body[champ] && req.body[champ] !== gie[champ]) {
        return res.status(400).json({
          success: false,
          message: `Le champ '${champ}' ne peut pas être modifié`
        });
      }
    });

    // Mettre à jour les champs autorisés
    Object.keys(req.body).forEach(key => {
      if (!champsProtégés.includes(key)) {
        gie[key] = req.body[key];
      }
    });

    await gie.save();

    res.json({
      success: true,
      message: 'GIE mis à jour avec succès',
      data: { gie }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du GIE',
      error: error.message
    });
  }
};

// @desc    Supprimer un GIE
// @route   DELETE /api/gie/:id
// @access  Private (Admin seulement)
const deleteGIE = async (req, res) => {
  try {
    const gie = await GIE.findById(req.params.id);

    if (!gie) {
      return res.status(404).json({
        success: false,
        message: 'GIE non trouvé'
      });
    }

    // Supprimer les données associées
    await Promise.all([
      Adhesion.findOneAndDelete({ gieId: gie._id }),
      CycleInvestissement.findOneAndDelete({ gieId: gie._id })
    ]);

    await gie.deleteOne();

    res.json({
      success: true,
      message: 'GIE supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du GIE',
      error: error.message
    });
  }
};

// @desc    Obtenir les statistiques des GIE
// @route   GET /api/gie/stats
// @access  Private
const getGIEStats = async (req, res) => {
  try {
    const stats = await GIE.aggregate([
      {
        $group: {
          _id: null,
          totalGIE: { $sum: 1 },
          parRegion: {
            $push: {
              region: '$region',
              secteur: '$secteurPrincipal'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalGIE: 1,
          statistiquesRegion: {
            $reduce: {
              input: '$parRegion',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $arrayToObject: [
                      [
                        {
                          k: '$$this.region',
                          v: {
                            $add: [
                              { $ifNull: [{ $getField: { field: '$$this.region', input: '$$value' } }, 0] },
                              1
                            ]
                          }
                        }
                      ]
                    ]
                  }
                ]
              }
            }
          }
        }
      }
    ]);

    // Statistiques des adhésions
    const statsAdhesion = await Adhesion.aggregate([
      {
        $group: {
          _id: '$validation.statut',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        stats: stats[0] || { totalGIE: 0 },
        adhesions: statsAdhesion
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};

// @desc    Générer le prochain numéro de protocole
// @route   GET /api/gie/next-protocol
// @access  Private
const getNextProtocol = async (req, res) => {
  try {
    // Trouver le dernier protocole
    const dernierGIE = await GIE.findOne()
      .sort({ numeroProtocole: -1 })
      .select('numeroProtocole');

    let prochainNumero = '001';
    
    if (dernierGIE && dernierGIE.numeroProtocole) {
      const dernierNumero = parseInt(dernierGIE.numeroProtocole);
      prochainNumero = (dernierNumero + 1).toString().padStart(3, '0');
    }

    res.json({
      success: true,
      data: {
        prochainProtocole: prochainNumero
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du numéro de protocole',
      error: error.message
    });
  }
};

module.exports = {
  createGIE,
  getAllGIE,
  getGIEById,
  updateGIE,
  deleteGIE,
  getGIEStats,
  getNextProtocol
};
