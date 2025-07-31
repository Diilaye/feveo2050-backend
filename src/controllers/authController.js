const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/Utilisateur');

// Générer un token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Connexion utilisateur
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    // Vérifier si l'utilisateur existe
    const utilisateur = await Utilisateur.findOne({ email });
    
    if (!utilisateur) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier si le compte est bloqué
    if (utilisateur.compteBloque) {
      if (utilisateur.dateDeblocage && utilisateur.dateDeblocage > new Date()) {
        return res.status(401).json({
          success: false,
          message: `Compte bloqué jusqu'au ${utilisateur.dateDeblocage.toLocaleString('fr-FR')}`
        });
      } else {
        // Débloquer automatiquement le compte si la date est passée
        utilisateur.compteBloque = false;
        utilisateur.tentativesConnexionEchouees = 0;
        utilisateur.dateDeblocage = undefined;
      }
    }

    // Vérifier le mot de passe
    const motDePasseValide = await utilisateur.verifierMotDePasse(motDePasse);
    
    if (!motDePasseValide) {
      // Incrémenter les tentatives échouées
      utilisateur.tentativesConnexionEchouees += 1;
      
      // Bloquer le compte après 5 tentatives
      if (utilisateur.tentativesConnexionEchouees >= 5) {
        utilisateur.compteBloque = true;
        utilisateur.dateDeblocage = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      }
      
      await utilisateur.save();
      
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect',
        tentativesRestantes: Math.max(0, 5 - utilisateur.tentativesConnexionEchouees)
      });
    }

    // Vérifier le statut du compte
    if (utilisateur.statut !== 'actif') {
      return res.status(401).json({
        success: false,
        message: 'Compte inactif ou suspendu'
      });
    }

    // Réinitialiser les tentatives échouées
    utilisateur.tentativesConnexionEchouees = 0;
    utilisateur.dernierLogin = new Date();
    await utilisateur.save();

    // Générer le token
    const token = generateToken(utilisateur._id);

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        token,
        utilisateur: {
          id: utilisateur._id,
          nom: utilisateur.nom,
          prenom: utilisateur.prenom,
          email: utilisateur.email,
          role: utilisateur.role,
          permissions: utilisateur.permissions,
          gieAssocie: utilisateur.gieAssocie
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
      error: error.message
    });
  }
};

// @desc    Inscription utilisateur
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, telephone, role = 'operateur' } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const utilisateurExistant = await Utilisateur.findOne({ email });
    
    if (utilisateurExistant) {
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }

    // Créer l'utilisateur
    const utilisateur = new Utilisateur({
      nom,
      prenom,
      email,
      motDePasse,
      telephone,
      role
    });

    // Assigner les permissions selon le rôle
    utilisateur.assignerPermissions();

    await utilisateur.save();

    // Générer le token
    const token = generateToken(utilisateur._id);

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
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
      message: 'Erreur lors de la création de l\'utilisateur',
      error: error.message
    });
  }
};

// @desc    Obtenir le profil utilisateur
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findById(req.utilisateur.id)
      .select('-motDePasse')
      .populate('gieAssocie', 'nomGIE identifiantGIE');

    res.json({
      success: true,
      data: {
        utilisateur
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil',
      error: error.message
    });
  }
};

// @desc    Mettre à jour le profil
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { nom, prenom, telephone, preferences } = req.body;

    const utilisateur = await Utilisateur.findById(req.utilisateur.id);

    if (nom) utilisateur.nom = nom;
    if (prenom) utilisateur.prenom = prenom;
    if (telephone) utilisateur.telephone = telephone;
    if (preferences) utilisateur.preferences = { ...utilisateur.preferences, ...preferences };

    await utilisateur.save();

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: {
        utilisateur: {
          id: utilisateur._id,
          nom: utilisateur.nom,
          prenom: utilisateur.prenom,
          email: utilisateur.email,
          telephone: utilisateur.telephone,
          role: utilisateur.role,
          preferences: utilisateur.preferences
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil',
      error: error.message
    });
  }
};

// @desc    Changer le mot de passe
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { ancienMotDePasse, nouveauMotDePasse } = req.body;

    const utilisateur = await Utilisateur.findById(req.utilisateur.id);

    // Vérifier l'ancien mot de passe
    const ancienMotDePasseValide = await utilisateur.verifierMotDePasse(ancienMotDePasse);
    
    if (!ancienMotDePasseValide) {
      return res.status(400).json({
        success: false,
        message: 'Ancien mot de passe incorrect'
      });
    }

    // Mettre à jour le mot de passe
    utilisateur.motDePasse = nouveauMotDePasse;
    await utilisateur.save();

    res.json({
      success: true,
      message: 'Mot de passe changé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de mot de passe',
      error: error.message
    });
  }
};

// @desc    Déconnexion
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Déconnexion réussie'
  });
};

module.exports = {
  login,
  register,
  getProfile,
  updateProfile,
  changePassword,
  logout
};
