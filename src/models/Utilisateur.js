const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const utilisateurSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    trim: true
  },
  prenom: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  motDePasse: {
    type: String,
    required: true,
    minlength: 6
  },
  telephone: {
    type: String,
    required: true
  },
  
  // Rôle et permissions
  role: {
    type: String,
    enum: ['admin', 'moderateur', 'operateur', 'gie_president'],
    default: 'operateur'
  },
  permissions: [{
    type: String,
    enum: [
      'gestion_gie',
      'validation_adhesion',
      'gestion_investissement',
      'gestion_utilisateurs',
      'rapports_financiers',
      'configuration_systeme'
    ]
  }],
  
  // Association GIE (pour les présidentes)
  gieAssocie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GIE'
  },
  
  // Statut
  statut: {
    type: String,
    enum: ['actif', 'inactif', 'suspendu'],
    default: 'actif'
  },
  emailVerifie: {
    type: Boolean,
    default: false
  },
  
  // Sécurité
  dernierLogin: {
    type: Date
  },
  tentativesConnexionEchouees: {
    type: Number,
    default: 0
  },
  compteBloque: {
    type: Boolean,
    default: false
  },
  dateDeblocage: {
    type: Date
  },
  
  // Tokens
  tokenResetMotDePasse: {
    type: String
  },
  tokenResetExpire: {
    type: Date
  },
  tokenVerificationEmail: {
    type: String
  },
  
  // Préférences
  preferences: {
    langue: {
      type: String,
      enum: ['fr', 'wo', 'en'],
      default: 'fr'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      }
    },
    timezone: {
      type: String,
      default: 'Africa/Dakar'
    }
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances des recherches
// Note: email déjà indexé par unique: true
utilisateurSchema.index({ role: 1 });
utilisateurSchema.index({ statut: 1 });

// Hashage du mot de passe avant sauvegarde
utilisateurSchema.pre('save', async function(next) {
  if (!this.isModified('motDePasse')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour vérifier le mot de passe
utilisateurSchema.methods.verifierMotDePasse = async function(motDePasse) {
  return await bcrypt.compare(motDePasse, this.motDePasse);
};

// Méthode pour assigner les permissions selon le rôle
utilisateurSchema.methods.assignerPermissions = function() {
  switch (this.role) {
    case 'admin':
      this.permissions = [
        'gestion_gie',
        'validation_adhesion',
        'gestion_investissement',
        'gestion_utilisateurs',
        'rapports_financiers',
        'configuration_systeme'
      ];
      break;
    case 'moderateur':
      this.permissions = [
        'gestion_gie',
        'validation_adhesion',
        'gestion_investissement',
        'rapports_financiers'
      ];
      break;
    case 'operateur':
      this.permissions = [
        'gestion_gie',
        'validation_adhesion'
      ];
      break;
    case 'gie_president':
      this.permissions = ['gestion_investissement'];
      break;
    default:
      this.permissions = [];
  }
};

// Méthode pour vérifier une permission
utilisateurSchema.methods.aPermission = function(permission) {
  return this.permissions.includes(permission);
};

module.exports = mongoose.model('Utilisateur', utilisateurSchema);
