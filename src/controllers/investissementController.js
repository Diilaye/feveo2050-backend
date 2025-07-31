const CycleInvestissement = require('../models/CycleInvestissement');
const GIE = require('../models/GIE');

// @desc    Valider l'existence et le statut d'un GIE
// @route   POST /api/investissements/validate-gie
// @access  Public
const validateGIE = async (req, res) => {
  try {
    const { codeGIE } = req.body;

    if (!codeGIE || !codeGIE.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Code GIE requis',
        code: 'MISSING_GIE_ID'
      });
    }

    // Rechercher le GIE par identifiant
    const gie = await GIE.findOne({ identifiantGIE: codeGIE.trim() });

    if (!gie) {
      return res.status(404).json({
        success: false,
        message: `GIE avec le code "${codeGIE}" non trouvé`,
        code: 'GIE_NOT_FOUND'
      });
    }

    // Vérifier le statut d'adhésion
    if (gie.statutAdhesion !== 'validee') {
      return res.status(400).json({
        success: false,
        message: `Le GIE "${gie.nomGIE}" n'est pas validé. Statut actuel: ${gie.statutAdhesion}`,
        code: 'GIE_NOT_VALIDATED',
        data: {
          nomGIE: gie.nomGIE,
          statut: gie.statutAdhesion
        }
      });
    }

    // GIE valide
    return res.status(200).json({
      success: true,
      message: `GIE "${gie.nomGIE}" validé avec succès`,
      data: {
        _id: gie._id,
        nom: gie.nomGIE,
        identifiant: gie.identifiantGIE,
        localisation: `${gie.commune}, ${gie.departement}, ${gie.region}`,
        presidenteNom: gie.presidenteNom,
        presidentePrenom: gie.presidentePrenom,
        statut: gie.statutAdhesion
      }
    });

  } catch (error) {
    console.error('Erreur lors de la validation du GIE:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur lors de la validation du GIE',
      code: 'INTERNAL_ERROR'
    });
  }
};

// @desc    Obtenir le cycle d'investissement d'un GIE
// @route   GET /api/investissements/gie/:gieId
// @access  Private
const getCycleByGIE = async (req, res) => {
  try {
    const gieId = req.params.gieId;
    
    // Le GIE est déjà validé par le middleware
    const gie = req.gie;

    // Récupérer le cycle d'investissement
    const cycle = await CycleInvestissement.findOne({ gieId: gieId })
      .populate('gieId', 'nomGIE identifiantGIE presidenteNom presidentePrenom statut');

    if (!cycle) {
      return res.status(404).json({
        success: false,
        message: `Cycle d'investissement non trouvé pour le GIE "${gie.nomGIE}"`,
        code: 'CYCLE_NOT_FOUND',
        data: {
          nomGIE: gie.nomGIE,
          identifiantGIE: gie.identifiantGIE,
          statutGIE: gie.statut
        }
      });
    }

    res.json({
      success: true,
      data: { cycle }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du cycle',
      error: error.message
    });
  }
};

// @desc    Enregistrer un investissement journalier
// @route   POST /api/investissements/gie/:gieId/investir
// @access  Private
const enregistrerInvestissement = async (req, res) => {
  try {
    const { date, montant = 6000, commentaire } = req.body;
    const gieId = req.params.gieId;

    // Le GIE est déjà validé par le middleware
    const gie = req.gie;

    // Vérifier l'existence du cycle d'investissement
    const cycle = await CycleInvestissement.findOne({ gieId });

    if (!cycle) {
      return res.status(404).json({
        success: false,
        message: `Cycle d'investissement non trouvé pour le GIE "${gie.nomGIE}". Veuillez contacter l'administration.`,
        code: 'CYCLE_NOT_FOUND',
        data: {
          nomGIE: gie.nomGIE,
          identifiantGIE: gie.identifiantGIE
        }
      });
    }

    // Vérifier le statut du cycle
    if (cycle.statutCycle !== 'actif') {
      return res.status(400).json({
        success: false,
        message: 'Le cycle d\'investissement n\'est pas actif'
      });
    }

    // Trouver l'investissement pour cette date
    const dateInvestissement = new Date(date);
    const investissement = cycle.investissementsJournaliers.find(inv => 
      inv.date.toDateString() === dateInvestissement.toDateString()
    );

    if (!investissement) {
      return res.status(400).json({
        success: false,
        message: 'Date d\'investissement non valide'
      });
    }

    if (investissement.statut === 'investi') {
      return res.status(400).json({
        success: false,
        message: 'Investissement déjà enregistré pour cette date'
      });
    }

    // Vérifier le montant
    if (montant !== 6000) {
      return res.status(400).json({
        success: false,
        message: 'Le montant d\'investissement doit être de 6000 FCFA'
      });
    }

    // Enregistrer l'investissement
    investissement.statut = 'investi';
    investissement.montant = montant;
    if (commentaire) investissement.commentaire = commentaire;

    // Mettre à jour le wallet
    cycle.walletGIE.soldeActuel += montant;
    cycle.walletGIE.historique.push({
      type: 'investissement',
      montant,
      description: `Investissement journalier du ${dateInvestissement.toLocaleDateString('fr-FR')}`,
      soldeApres: cycle.walletGIE.soldeActuel
    });

    // Mettre à jour les statistiques
    cycle.statistiques.dernierInvestissement = dateInvestissement;
    
    // Calculer les jours consécutifs
    const joursOrdonnes = cycle.investissementsJournaliers
      .filter(inv => inv.statut === 'investi')
      .sort((a, b) => b.date - a.date);

    let joursConsecutifs = 0;
    let dateActuelle = new Date();
    dateActuelle.setHours(0, 0, 0, 0);

    for (const inv of joursOrdonnes) {
      const dateInv = new Date(inv.date);
      dateInv.setHours(0, 0, 0, 0);
      
      const diffJours = (dateActuelle - dateInv) / (1000 * 60 * 60 * 24);
      
      if (diffJours === joursConsecutifs) {
        joursConsecutifs++;
        dateActuelle.setDate(dateActuelle.getDate() - 1);
      } else {
        break;
      }
    }

    cycle.statistiques.joursConsecutifs = joursConsecutifs;
    if (joursConsecutifs > cycle.statistiques.meilleureSequence) {
      cycle.statistiques.meilleureSequence = joursConsecutifs;
    }

    // Recalculer la progression
    cycle.calculerProgression();

    await cycle.save();

    res.json({
      success: true,
      message: 'Investissement enregistré avec succès',
      data: {
        investissement,
        progression: {
          joursInvestis: cycle.joursInvestis,
          joursRestants: cycle.joursRestants,
          pourcentageComplete: cycle.pourcentageComplete,
          montantTotalInvesti: cycle.montantTotalInvesti
        },
        wallet: {
          soldeActuel: cycle.walletGIE.soldeActuel
        },
        statistiques: cycle.statistiques
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'enregistrement de l\'investissement',
      error: error.message
    });
  }
};

// @desc    Obtenir le calendrier d'investissement
// @route   GET /api/investissements/gie/:gieId/calendrier
// @access  Private
const getCalendrier = async (req, res) => {
  try {
    const { 
      mois, 
      annee, 
      page = 1, 
      limit = 31 
    } = req.query;
    const gieId = req.params.gieId;

    // Le GIE est déjà validé par le middleware
    const gie = req.gie;

    const cycle = await CycleInvestissement.findOne({ gieId });

    if (!cycle) {
      return res.status(404).json({
        success: false,
        message: `Cycle d'investissement non trouvé pour le GIE "${gie.nomGIE}"`,
        code: 'CYCLE_NOT_FOUND'
      });
    }

    let investissements = cycle.investissementsJournaliers;

    // Filtrer par mois/année si spécifié
    if (mois && annee) {
      investissements = investissements.filter(inv => {
        const date = new Date(inv.date);
        return date.getMonth() + 1 === parseInt(mois) && 
               date.getFullYear() === parseInt(annee);
      });
    }

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const investissementsPagines = investissements.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        investissements: investissementsPagines,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: investissements.length,
          pages: Math.ceil(investissements.length / parseInt(limit))
        },
        progression: {
          joursInvestis: cycle.joursInvestis,
          joursRestants: cycle.joursRestants,
          pourcentageComplete: cycle.pourcentageComplete
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du calendrier',
      error: error.message
    });
  }
};

// @desc    Obtenir les statistiques d'investissement
// @route   GET /api/investissements/gie/:gieId/stats
// @access  Private
const getStatistiques = async (req, res) => {
  try {
    const gieId = req.params.gieId;

    // Le GIE est déjà validé par le middleware
    const gie = req.gie;

    const cycle = await CycleInvestissement.findOne({ gieId });

    if (!cycle) {
      return res.status(404).json({
        success: false,
        message: `Cycle d'investissement non trouvé pour le GIE "${gie.nomGIE}"`,
        code: 'CYCLE_NOT_FOUND'
      });
    }

    // Calculer les statistiques détaillées
    const investissements = cycle.investissementsJournaliers;
    const joursInvestis = investissements.filter(inv => inv.statut === 'investi');
    const joursManques = investissements.filter(inv => inv.statut === 'manque');

    // Statistiques par mois
    const parMois = {};
    joursInvestis.forEach(inv => {
      const date = new Date(inv.date);
      const moisAnnee = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!parMois[moisAnnee]) {
        parMois[moisAnnee] = {
          joursInvestis: 0,
          montantTotal: 0
        };
      }
      
      parMois[moisAnnee].joursInvestis++;
      parMois[moisAnnee].montantTotal += inv.montant;
    });

    res.json({
      success: true,
      data: {
        cycle: {
          dateDebut: cycle.dateDebut,
          dateFin: cycle.dateFin,
          dureeJours: cycle.dureeJours,
          statutCycle: cycle.statutCycle
        },
        progression: {
          joursInvestis: cycle.joursInvestis,
          joursRestants: cycle.joursRestants,
          pourcentageComplete: cycle.pourcentageComplete,
          montantTotalInvesti: cycle.montantTotalInvesti,
          montantTotalPrevu: cycle.montantTotalPrevu
        },
        wallet: cycle.walletGIE,
        statistiques: {
          ...cycle.statistiques,
          totalJoursManques: joursManques.length,
          moyenneInvestissementMensuel: Object.values(parMois).reduce((acc, mois) => acc + mois.montantTotal, 0) / Object.keys(parMois).length || 0
        },
        repartitionMensuelle: parMois
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

// @desc    Mettre à jour le statut d'un jour d'investissement
// @route   PUT /api/investissements/gie/:gieId/jour/:numeroJour
// @access  Private
const updateStatutJour = async (req, res) => {
  try {
    const { statut, commentaire } = req.body;
    const { gieId, numeroJour } = req.params;

    const cycle = await CycleInvestissement.findOne({ gieId });

    if (!cycle) {
      return res.status(404).json({
        success: false,
        message: 'Cycle d\'investissement non trouvé'
      });
    }

    const investissement = cycle.investissementsJournaliers.find(
      inv => inv.numeroJour === parseInt(numeroJour)
    );

    if (!investissement) {
      return res.status(404).json({
        success: false,
        message: 'Jour d\'investissement non trouvé'
      });
    }

    const ancienStatut = investissement.statut;
    investissement.statut = statut;
    if (commentaire) investissement.commentaire = commentaire;

    // Ajuster le wallet si changement de statut
    if (ancienStatut === 'investi' && statut !== 'investi') {
      // Retirer l'investissement du wallet
      cycle.walletGIE.soldeActuel -= investissement.montant;
      cycle.walletGIE.historique.push({
        type: 'retrait',
        montant: investissement.montant,
        description: `Annulation investissement jour ${numeroJour}`,
        soldeApres: cycle.walletGIE.soldeActuel
      });
    } else if (ancienStatut !== 'investi' && statut === 'investi') {
      // Ajouter l'investissement au wallet
      cycle.walletGIE.soldeActuel += investissement.montant;
      cycle.walletGIE.historique.push({
        type: 'investissement',
        montant: investissement.montant,
        description: `Investissement jour ${numeroJour}`,
        soldeApres: cycle.walletGIE.soldeActuel
      });
    }

    // Recalculer la progression
    cycle.calculerProgression();

    await cycle.save();

    res.json({
      success: true,
      message: 'Statut mis à jour avec succès',
      data: {
        investissement,
        progression: {
          joursInvestis: cycle.joursInvestis,
          joursRestants: cycle.joursRestants,
          pourcentageComplete: cycle.pourcentageComplete
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut',
      error: error.message
    });
  }
};

// @desc    Obtenir l'historique du wallet
// @route   GET /api/investissements/gie/:gieId/wallet/historique
// @access  Private
const getHistoriqueWallet = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const gieId = req.params.gieId;

    // Le GIE est déjà validé par le middleware
    const gie = req.gie;

    const cycle = await CycleInvestissement.findOne({ gieId });

    if (!cycle) {
      return res.status(404).json({
        success: false,
        message: `Cycle d'investissement non trouvé pour le GIE "${gie.nomGIE}"`,
        code: 'CYCLE_NOT_FOUND'
      });
    }

    const historique = cycle.walletGIE.historique
      .sort((a, b) => b.date - a.date)
      .slice((page - 1) * limit, page * limit);

    res.json({
      success: true,
      data: {
        soldeActuel: cycle.walletGIE.soldeActuel,
        historique,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: cycle.walletGIE.historique.length,
          pages: Math.ceil(cycle.walletGIE.historique.length / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'historique',
      error: error.message
    });
  }
};

module.exports = {
  validateGIE,
  getCycleByGIE,
  enregistrerInvestissement,
  getCalendrier,
  getStatistiques,
  updateStatutJour,
  getHistoriqueWallet
};
