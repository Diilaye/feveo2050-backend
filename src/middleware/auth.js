const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/Utilisateur');

// Middleware d'authentification
const auth = async (req, res, next) => {
  try {
    // Extraction du token depuis le header Authorization
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Accès refusé. Token manquant.'
      });
    }

    try {
      // Vérification du token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Récupération de l'utilisateur sans le mot de passe
      const utilisateur = await Utilisateur.findById(decoded.id).select('-motDePasse');
      
      if (!utilisateur) {
        return res.status(401).json({
          success: false,
          message: 'Token invalide. Utilisateur non trouvé.'
        });
      }

      if (utilisateur.statut !== 'actif') {
        return res.status(403).json({  // 403 Forbidden pour un utilisateur existant mais inactif
          success: false,
          message: 'Compte inactif ou suspendu.'
        });
      }

      req.utilisateur = utilisateur;
      next();
    } catch (jwtError) {
      // Gestion spécifique des erreurs JWT
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expiré.'
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Token malformé ou invalide.'
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Erreur de validation du token.'
        });
      }
    }
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur lors de l\'authentification.'
    });
  }
};

// Middleware pour vérifier les rôles
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.utilisateur) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise.'
      });
    }

    if (!roles.includes(req.utilisateur.role)) {
      return res.status(403).json({
        success: false,
        message: 'Permissions insuffisantes.'
      });
    }

    next();
  };
};

// Middleware pour vérifier les permissions
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.utilisateur) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise.'
      });
    }

    if (!req.utilisateur.aPermission(permission)) {
      return res.status(403).json({
        success: false,
        message: `Permission '${permission}' requise.`
      });
    }

    next();
  };
};

// Middleware pour vérifier si l'utilisateur peut accéder à un GIE spécifique
const requireGIEAccess = async (req, res, next) => {
  try {
    const gieId = req.params.gieId || req.body.gieId;
    
    if (!gieId) {
      return res.status(400).json({
        success: false,
        message: 'ID du GIE requis.'
      });
    }

    // Admin et modérateurs ont accès à tous les GIE
    if (['admin', 'moderateur', 'operateur'].includes(req.utilisateur.role)) {
      return next();
    }

    // Présidente ne peut accéder qu'à son GIE
    if (req.utilisateur.role === 'gie_president') {
      if (req.utilisateur.gieAssocie?.toString() === gieId) {
        return next();
      } else {
        return res.status(403).json({
          success: false,
          message: 'Accès limité à votre GIE uniquement.'
        });
      }
    }

    res.status(403).json({
      success: false,
      message: 'Accès non autorisé.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification des accès.',
      error: error.message
    });
  }
};

module.exports = {
  auth,
  requireRole,
  requirePermission,
  requireGIEAccess
};
