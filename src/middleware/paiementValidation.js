const { body } = require('express-validator');

// Validation pour créer un paiement
exports.validerCreationPaiement = [
  body('montant')
    .isFloat({ min: 1 })
    .withMessage('Le montant doit être supérieur à 0'),
  
  body('devise')
    .optional()
    .isIn(['XOF', 'EUR', 'USD'])
    .withMessage('Devise non supportée'),
  
  body('typePaiement')
    .isIn(['adhesion_gie', 'investissement', 'cotisation', 'service', 'autre'])
    .withMessage('Type de paiement invalide'),
  
  body('entiteId')
    .isMongoId()
    .withMessage('ID d\'entité invalide'),
  
  body('typeEntite')
    .isIn(['GIE', 'CycleInvestissement', 'Adhesion', 'Utilisateur'])
    .withMessage('Type d\'entité invalide'),
  
  body('payeur.nom')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom du payeur doit contenir entre 2 et 50 caractères'),
  
  body('payeur.prenom')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom du payeur doit contenir entre 2 et 50 caractères'),
  
  body('payeur.telephone')
    .matches(/^(\+221|221)?[0-9]{9}$/)
    .withMessage('Numéro de téléphone sénégalais invalide'),
  
  body('payeur.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Adresse email invalide'),
  
  body('methodePaiement')
    .optional()
    .isIn(['wave', 'orange_money', 'free_money', 'carte_bancaire', 'virement', 'especes'])
    .withMessage('Méthode de paiement non supportée'),
  
  body('metadonnees')
    .optional()
    .isObject()
    .withMessage('Les métadonnées doivent être un objet')
];

// Validation pour les paramètres de pagination
exports.validerPagination = [
  body('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Le numéro de page doit être un entier positif'),
  
  body('limite')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être entre 1 et 100')
];

// Validation pour les filtres de recherche
exports.validerFiltresPaiement = [
  body('statut')
    .optional()
    .isIn(['en_attente', 'en_cours', 'reussi', 'echoue', 'annule', 'rembourse'])
    .withMessage('Statut invalide'),
  
  body('typePaiement')
    .optional()
    .isIn(['adhesion_gie', 'investissement', 'cotisation', 'service', 'autre'])
    .withMessage('Type de paiement invalide'),
  
  body('dateDebut')
    .optional()
    .isISO8601()
    .withMessage('Format de date de début invalide'),
  
  body('dateFin')
    .optional()
    .isISO8601()
    .withMessage('Format de date de fin invalide')
];
