const express = require('express');
const router = express.Router();
const { adminLogin } = require('../controllers/adminAuthController');
const { validateLogin } = require('../middleware/validation');

// @route   POST /api/admin/login
// @desc    Connexion administrateur
// @access  Public
router.post('/login', validateLogin, adminLogin);

module.exports = router;
