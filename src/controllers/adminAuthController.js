const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/Utilisateur');

// Générer un token JWT pour admin
const generateAdminToken = (id) => {
  return jwt.sign({ id, isAdmin: true }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ADMIN_EXPIRES_IN || '1d',
  });
};

// @desc    Connexion administrateur
// @route   POST /api/auth/admin/login
// @access  Public
const adminLogin = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    // Vérifier si l'utilisateur existe
    const utilisateur = await Utilisateur.findOne({ email });
    
    if (!utilisateur) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants incorrects'
      });
    }

    // Vérifier le rôle (admin uniquement)
    if (utilisateur.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé. Réservé aux administrateurs.'
      });
    }

    // Vérifier le mot de passe
    const motDePasseValide = await utilisateur.verifierMotDePasse(motDePasse);
    
    if (!motDePasseValide) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants incorrects'
      });
    }

    // Vérifier le statut du compte
    if (utilisateur.statut !== 'actif') {
      return res.status(401).json({
        success: false,
        message: 'Compte inactif ou suspendu'
      });
    }

    // Mettre à jour la date de connexion
    utilisateur.dernierLogin = new Date();
    await utilisateur.save();

    // Générer le token admin
    const token = generateAdminToken(utilisateur._id);

    res.json({
      success: true,
      message: 'Connexion administrateur réussie',
      data: {
        token,
        utilisateur: {
          id: utilisateur._id,
          nom: utilisateur.nom,
          prenom: utilisateur.prenom,
          email: utilisateur.email,
          role: utilisateur.role,
          permissions: utilisateur.permissions
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion administrateur',
      error: error.message
    });
  }
};

module.exports = {
  adminLogin
};
