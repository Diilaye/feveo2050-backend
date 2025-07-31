const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/Utilisateur');

// Middleware d'authentification
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Accès refusé. Token manquant.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const utilisateur = await Utilisateur.findById(decoded.id).select('-motDePasse');
    
    if (!utilisateur) {
      return res.status(401).json({
        success: false,
        message: 'Token invalide. Utilisateur non trouvé.'
      });
    }

    if (utilisateur.statut !== 'actif') {
      return res.status(401).json({
        success: false,
        message: 'Compte inactif ou suspendu.'
      });
    }

    req.utilisateur = utilisateur;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expiré.'
      });
    }
    
    res.status(401).json({
      success: false,
      message: 'Token invalide.'
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
