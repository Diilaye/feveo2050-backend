const Adhesion = require('../models/Adhesion');
const GIE = require('../models/GIE');

// @desc    Obtenir toutes les adhésions
// @route   GET /api/adhesions
// @access  Private
const getAllAdhesions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      statut,
      type,
      search
    } = req.query;

    // Construire le filtre
    const filter = {};
    if (statut) filter['validation.statut'] = statut;
    if (type) filter.typeAdhesion = type;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: {
        path: 'gieId',
        select: 'nomGIE identifiantGIE presidenteNom presidentePrenom region'
      }
    };

    // Si recherche, ajouter un filtre sur les GIE
    let adhesions;
    let total;

    if (search) {
      const gieIds = await GIE.find({
        $or: [
          { nomGIE: { $regex: search, $options: 'i' } },
          { identifiantGIE: { $regex: search, $options: 'i' } },
          { presidenteNom: { $regex: search, $options: 'i' } },
          { presidentePrenom: { $regex: search, $options: 'i' } }
        ]
      }).distinct('_id');

      filter.gieId = { $in: gieIds };
    }

    adhesions = await Adhesion.find(filter)
      .populate(options.populate)
      .sort(options.sort)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit);

    total = await Adhesion.countDocuments(filter);

    res.json({
      success: true,
      data: {
        adhesions,
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
      message: 'Erreur lors de la récupération des adhésions',
      error: error.message
    });
  }
};

// @desc    Obtenir une adhésion par ID
// @route   GET /api/adhesions/:id
// @access  Private
const getAdhesionById = async (req, res) => {
  try {
    const adhesion = await Adhesion.findById(req.params.id)
      .populate('gieId');

    if (!adhesion) {
      return res.status(404).json({
        success: false,
        message: 'Adhésion non trouvée'
      });
    }

    res.json({
      success: true,
      data: { adhesion }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'adhésion',
      error: error.message
    });
  }
};

// @desc    Obtenir l'adhésion d'un GIE
// @route   GET /api/adhesions/gie/:gieId
// @access  Private
const getAdhesionByGIE = async (req, res) => {
  try {
    const adhesion = await Adhesion.findOne({ gieId: req.params.gieId })
      .populate('gieId');

    if (!adhesion) {
      return res.status(404).json({
        success: false,
        message: 'Adhésion non trouvée pour ce GIE'
      });
    }

    res.json({
      success: true,
      data: { adhesion }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'adhésion',
      error: error.message
    });
  }
};

// @desc    Mettre à jour le statut de validation
// @route   PUT /api/adhesions/:id/validation
// @access  Private (Moderateur/Admin)
const updateValidationStatus = async (req, res) => {
  try {
    const { statut, commentaires, documentsVerifies } = req.body;
    
    const adhesion = await Adhesion.findById(req.params.id);

    if (!adhesion) {
      return res.status(404).json({
        success: false,
        message: 'Adhésion non trouvée'
      });
    }

    // Sauvegarder l'ancien statut pour l'historique
    const ancienStatut = adhesion.validation.statut;

    // Mettre à jour la validation
    adhesion.validation.statut = statut;
    adhesion.validation.dateValidation = new Date();
    adhesion.validation.validePar = req.utilisateur.id;
    
    if (commentaires) {
      adhesion.validation.commentaires = commentaires;
    }
    
    if (documentsVerifies) {
      adhesion.validation.documentsVerifies = {
        ...adhesion.validation.documentsVerifies,
        ...documentsVerifies
      };
    }

    // Ajouter à l'historique
    adhesion.historiqueStatuts.push({
      ancienStatut,
      nouveauStatut: statut,
      modifiePar: req.utilisateur.id,
      commentaire: commentaires
    });

    // Mettre à jour les étapes du processus
    if (statut === 'validee') {
      adhesion.completerEtape('validation');
      adhesion.completerEtape('activation');
      
      // Mettre à jour le statut du GIE
      await GIE.findByIdAndUpdate(adhesion.gieId, {
        statutAdhesion: 'validee'
      });
    } else if (statut === 'rejetee') {
      await GIE.findByIdAndUpdate(adhesion.gieId, {
        statutAdhesion: 'rejetee'
      });
    }

    await adhesion.save();

    res.json({
      success: true,
      message: 'Statut de validation mis à jour avec succès',
      data: { adhesion }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut',
      error: error.message
    });
  }
};

// @desc    Mettre à jour le statut de paiement
// @route   PUT /api/adhesions/:id/paiement
// @access  Private
const updatePaiementStatus = async (req, res) => {
  try {
    const {
      statut,
      transactionId,
      referenceWave,
      montantPaye,
      methode = 'wave'
    } = req.body;

    const adhesion = await Adhesion.findById(req.params.id);

    if (!adhesion) {
      return res.status(404).json({
        success: false,
        message: 'Adhésion non trouvée'
      });
    }

    // Mettre à jour le paiement
    adhesion.paiement.statut = statut;
    adhesion.paiement.methode = methode;
    
    if (transactionId) adhesion.paiement.transactionId = transactionId;
    if (referenceWave) adhesion.paiement.referenceWave = referenceWave;
    if (montantPaye) adhesion.paiement.montantPaye = montantPaye;

    if (statut === 'complete') {
      adhesion.paiement.datePaiement = new Date();
      adhesion.completerEtape('paiement');
    }

    await adhesion.save();

    res.json({
      success: true,
      message: 'Statut de paiement mis à jour avec succès',
      data: { adhesion }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du paiement',
      error: error.message
    });
  }
};

// @desc    Obtenir les statistiques des adhésions
// @route   GET /api/adhesions/stats
// @access  Private
const getAdhesionStats = async (req, res) => {
  try {
    const stats = await Adhesion.aggregate([
      {
        $group: {
          _id: null,
          totalAdhesions: { $sum: 1 },
          parStatutValidation: {
            $push: '$validation.statut'
          },
          parStatutPaiement: {
            $push: '$paiement.statut'
          },
          parType: {
            $push: '$typeAdhesion'
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalAdhesions: 1,
          validation: {
            $reduce: {
              input: '$parStatutValidation',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $arrayToObject: [
                      [
                        {
                          k: '$$this',
                          v: {
                            $add: [
                              { $ifNull: [{ $getField: { field: '$$this', input: '$$value' } }, 0] },
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
          },
          paiement: {
            $reduce: {
              input: '$parStatutPaiement',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $arrayToObject: [
                      [
                        {
                          k: '$$this',
                          v: {
                            $add: [
                              { $ifNull: [{ $getField: { field: '$$this', input: '$$value' } }, 0] },
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
          },
          types: {
            $reduce: {
              input: '$parType',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $arrayToObject: [
                      [
                        {
                          k: '$$this',
                          v: {
                            $add: [
                              { $ifNull: [{ $getField: { field: '$$this', input: '$$value' } }, 0] },
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

    res.json({
      success: true,
      data: stats[0] || {
        totalAdhesions: 0,
        validation: {},
        paiement: {},
        types: {}
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

// @desc    Calculer la progression d'une adhésion
// @route   GET /api/adhesions/:id/progression
// @access  Private
const getProgression = async (req, res) => {
  try {
    const adhesion = await Adhesion.findById(req.params.id);

    if (!adhesion) {
      return res.status(404).json({
        success: false,
        message: 'Adhésion non trouvée'
      });
    }

    const progression = adhesion.calculerProgression();

    res.json({
      success: true,
      data: {
        progression,
        etapes: adhesion.etapesProcessus
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du calcul de la progression',
      error: error.message
    });
  }
};

module.exports = {
  getAllAdhesions,
  getAdhesionById,
  getAdhesionByGIE,
  updateValidationStatus,
  updatePaiementStatus,
  getAdhesionStats,
  getProgression
};
