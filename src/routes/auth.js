const express = require('express');
const router = express.Router();
const {
  login,
  register,
  getProfile,
  updateProfile,
  changePassword,
  logout
} = require('../controllers/authController');
const {
  validateLogin,
  validateRegister,
  validateProfilUpdate,
  validateMotDePasseChange
} = require('../middleware/validation');
const { auth } = require('../middleware/auth');

// @route   POST /api/auth/login
// @desc    Connexion utilisateur
// @access  Public
router.post('/login', validateLogin, login);

// @route   POST /api/auth/register
// @desc    Inscription utilisateur
// @access  Public
router.post('/register', validateRegister, register);

// @route   GET /api/auth/profile
// @desc    Obtenir le profil utilisateur
// @access  Private
router.get('/profile', auth, getProfile);

// @route   PUT /api/auth/profile
// @desc    Mettre à jour le profil
// @access  Private
router.put('/profile', auth, validateProfilUpdate, updateProfile);

// @route   PUT /api/auth/change-password
// @desc    Changer le mot de passe
// @access  Private
router.put('/change-password', auth, validateMotDePasseChange, changePassword);

// @route   POST /api/auth/logout
// @desc    Déconnexion
// @access  Private
router.post('/logout', auth, logout);

module.exports = router;
