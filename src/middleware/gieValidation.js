const GIE = require('../models/GIE');

// Middleware pour valider l'existence et le statut d'un GIE avant les opérations d'investissement
const validateGIEMiddleware = async (req, res, next) => {
  try {
    const gieId = req.params.gieId;

    if (!gieId) {
      return res.status(400).json({
        success: false,
        message: 'ID du GIE requis',
        code: 'MISSING_GIE_ID'
      });
    }

    // Vérifier l'existence du GIE
    const gie = await GIE.findById(gieId);
    
    if (!gie) {
      return res.status(404).json({
        success: false,
        message: 'GIE non trouvé. Veuillez vous assurer que le GIE est enregistré.',
        code: 'GIE_NOT_FOUND'
      });
    }

    // Vérifier le statut du GIE
    if (gie.statutAdhesion !== 'validee') {
      return res.status(403).json({
        success: false,
        message: `Le GIE "${gie.nomGIE}" n'est pas encore validé. Statut actuel: ${gie.statutAdhesion}. Veuillez attendre la validation de votre adhésion.`,
        code: 'GIE_NOT_VALIDATED',
        data: {
          gieStatut: gie.statutAdhesion,
          nomGIE: gie.nomGIE,
          identifiantGIE: gie.identifiantGIE,
          dateCreation: gie.dateCreation
        }
      });
    }

    // Ajouter les informations du GIE à la requête pour les utiliser dans les contrôleurs
    req.gie = gie;
    next();

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la validation du GIE',
      error: error.message
    });
  }
};

// Middleware pour valider l'existence d'un GIE (sans vérifier le statut)
const validateGIEExistenceMiddleware = async (req, res, next) => {
  try {
    const gieId = req.params.gieId;

    if (!gieId) {
      return res.status(400).json({
        success: false,
        message: 'ID du GIE requis',
        code: 'MISSING_GIE_ID'
      });
    }

    // Vérifier l'existence du GIE
    const gie = await GIE.findById(gieId);
    
    if (!gie) {
      return res.status(404).json({
        success: false,
        message: 'GIE non trouvé',
        code: 'GIE_NOT_FOUND'
      });
    }

    // Vérifier le statut du GIE pour ce middleware aussi
    if (gie.statutAdhesion !== 'validee') {
      return res.status(403).json({
        success: false,
        message: `Le GIE "${gie.nomGIE}" n'est pas encore validé. Statut actuel: ${gie.statutAdhesion}. Veuillez attendre la validation de votre adhésion.`,
        code: 'GIE_NOT_VALIDATED',
        data: {
          gieStatut: gie.statutAdhesion,
          nomGIE: gie.nomGIE,
          identifiantGIE: gie.identifiantGIE,
          dateCreation: gie.dateCreation
        }
      });
    }

    // Ajouter les informations du GIE à la requête
    req.gie = gie;
    next();

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la validation du GIE',
      error: error.message
    });
  }
};

module.exports = {
  validateGIEMiddleware,
  validateGIEExistenceMiddleware
};
