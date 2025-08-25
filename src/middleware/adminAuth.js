const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/Utilisateur');

// Middleware d'authentification pour les administrateurs
const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Accès refusé. Token manquant.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Vérifier si c'est un token admin
    if (!decoded.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Token admin requis.'
      });
    }
    
    const utilisateur = await Utilisateur.findById(decoded.id).select('-motDePasse');
    
    if (!utilisateur) {
      return res.status(401).json({
        success: false,
        message: 'Token invalide. Administrateur non trouvé.'
      });
    }

    // Vérifier que l'utilisateur est bien admin
    if (utilisateur.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé. Seuls les administrateurs peuvent accéder à cette ressource.'
      });
    }

    if (utilisateur.statut !== 'actif') {
      return res.status(401).json({
        success: false,
        message: 'Compte inactif ou suspendu.'
      });
    }

    req.admin = utilisateur;
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
      message: 'Token invalide.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  adminAuth
};
