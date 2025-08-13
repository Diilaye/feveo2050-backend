const { body, validationResult } = require('express-validator');

// Middleware pour traiter les erreurs de validation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Erreurs de validation',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// Validations pour l'authentification
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email valide requis'),
  body('motDePasse')
    .isLength({ min: 6 })
    .withMessage('Mot de passe de minimum 6 caractères requis'),
  handleValidationErrors
];

const validateRegister = [
  body('nom')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Nom de minimum 2 caractères requis'),
  body('prenom')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Prénom de minimum 2 caractères requis'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email valide requis'),
  body('motDePasse')
    .isLength({ min: 6 })
    .withMessage('Mot de passe de minimum 6 caractères requis'),
  body('telephone')
    .matches(/^(\+221)?[0-9]{9}$/)
    .withMessage('Numéro de téléphone sénégalais valide requis'),
  handleValidationErrors
];

// Validations pour les GIE
const validateGIE = [
  body('nomGIE')
    .trim()
    .matches(/^FEVEO-\d{2}-\d{2}-\d{2}-\d{2}-\d{3}$/)
    .withMessage('Format de nom GIE invalide (FEVEO-XX-XX-XX-XX-XXX)'),
  body('identifiantGIE')
    .trim()
    .matches(/^FEVEO-\d{2}-\d{2}-\d{2}-\d{2}-\d{3}$/)
    .withMessage('Format d\'identifiant GIE invalide'),
  body('numeroProtocole')
    .matches(/^\d{3}$/)
    .withMessage('Numéro de protocole doit être composé de 3 chiffres'),
  body('presidenteNom')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Nom de la présidente requis'),
  body('presidentePrenom')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Prénom de la présidente requis'),
  body('presidenteCIN')
    .trim()
    .isLength({ min: 10 })
    .withMessage('CIN de la présidente requis'),
  body('presidenteTelephone')
    .matches(/^(\+221)?[0-9]{9}$/)
    .withMessage('Téléphone de la présidente invalide'),
  body('region')
    .isIn(['DAKAR', 'THIES', 'SAINT-LOUIS', 'DIOURBEL', 'KAOLACK', 'FATICK', 'KOLDA', 'ZIGUINCHOR', 'LOUGA', 'MATAM', 'KAFFRINE', 'KEDOUGOU', 'SEDHIOU', 'TAMBACOUNDA'])
    .withMessage('Région invalide'),
  body('secteurPrincipal')
    .isIn(['Agriculture', 'Élevage', 'Transformation', 'Commerce & Distribution'])
    .withMessage('Secteur principal invalide'),
  body('membres')
    .isArray({ min: 2 })
    .withMessage('Le GIE doit avoir au minimum 3 membres (incluant la présidente)')
    .custom((membres) => {
      // Vérifier les rôles obligatoires
      const secretaire = membres.find(m => m.fonction === 'Secrétaire');
      const tresoriere = membres.find(m => m.fonction === 'Trésorière');
      
      if (!secretaire) {
        throw new Error('Le GIE doit avoir une Secrétaire parmi ses membres');
      }
      
      if (!tresoriere) {
        throw new Error('Le GIE doit avoir une Trésorière parmi ses membres');
      }
      
      return true;
    }),
  handleValidationErrors
];

// Validation pour les membres
const validateMembre = [
  body('nom')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Nom du membre requis'),
  body('prenom')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Prénom du membre requis'),
  body('cin')
    .trim()
    .isLength({ min: 10 })
    .withMessage('CIN du membre requis'),
  body('telephone')
    .matches(/^(\+221)?[0-9]{9}$/)
    .withMessage('Téléphone du membre invalide'),
  body('genre')
    .isIn(['femme', 'jeune', 'homme'])
    .withMessage('Genre invalide'),
  body('fonction')
    .isIn(['Présidente', 'Vice-Présidente', 'Secrétaire', 'Trésorière', 'Membre'])
    .withMessage('Fonction invalide'),
  handleValidationErrors
];

// Validation pour les adhésions
const validateAdhesion = [
  body('gieId')
    .isMongoId()
    .withMessage('ID GIE invalide'),
  body('typeAdhesion')
    .isIn(['standard', 'premium'])
    .withMessage('Type d\'adhésion invalide'),
  handleValidationErrors
];

// Validation pour les investissements
const validateInvestissement = [
  body('gieId')
    .isMongoId()
    .withMessage('ID GIE invalide'),
  body('montant')
    .isNumeric()
    .custom((value) => value === 6000)
    .withMessage('Montant d\'investissement doit être de 6000 FCFA'),
  body('date')
    .isISO8601()
    .withMessage('Date d\'investissement invalide'),
  handleValidationErrors
];

// Validation pour la mise à jour du profil
const validateProfilUpdate = [
  body('nom')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Nom de minimum 2 caractères requis'),
  body('prenom')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Prénom de minimum 2 caractères requis'),
  body('telephone')
    .optional()
    .matches(/^(\+221)?[0-9]{9}$/)
    .withMessage('Numéro de téléphone sénégalais valide requis'),
  handleValidationErrors
];

// Validation pour le changement de mot de passe
const validateMotDePasseChange = [
  body('ancienMotDePasse')
    .isLength({ min: 6 })
    .withMessage('Ancien mot de passe requis'),
  body('nouveauMotDePasse')
    .isLength({ min: 6 })
    .withMessage('Nouveau mot de passe de minimum 6 caractères requis'),
  body('confirmationMotDePasse')
    .custom((value, { req }) => {
      if (value !== req.body.nouveauMotDePasse) {
        throw new Error('La confirmation du mot de passe ne correspond pas');
      }
      return true;
    }),
  handleValidationErrors
];

// Validation pour les paiements
const validatePaiement = [
  body('amount')
    .isNumeric()
    .isFloat({ min: 100 })
    .withMessage('Montant du paiement doit être supérieur à 100 FCFA'),
  body('method')
    .isIn(['WAVE', 'OM'])
    .withMessage('Méthode de paiement invalide (WAVE ou OM uniquement)'),
  body('gieCode')
    .optional()
    .matches(/^FEVEO-\d{2}-\d{2}-\d{2}-\d{2}-\d{3}$/)
    .withMessage('Format de code GIE invalide'),
  body('rv')
    .optional()
    .isMongoId()
    .withMessage('ID rendez-vous invalide'),
  handleValidationErrors
];

// Validation pour la confirmation de paiement
const validateConfirmPaiement = [
  body('transactionId')
    .trim()
    .isLength({ min: 10 })
    .withMessage('ID de transaction requis'),
  body('gieCode')
    .optional()
    .matches(/^FEVEO-\d{2}-\d{2}-\d{2}-\d{2}-\d{3}$/)
    .withMessage('Format de code GIE invalide'),
  body('status')
    .optional()
    .isIn(['PENDING', 'SUCCESS', 'CANCELED', 'REFUND'])
    .withMessage('Statut de transaction invalide'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateLogin,
  validateRegister,
  validateGIE,
  validateMembre,
  validateAdhesion,
  validateInvestissement,
  validateProfilUpdate,
  validateMotDePasseChange,
  validatePaiement,
  validateConfirmPaiement
};
