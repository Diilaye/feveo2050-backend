const mongoose = require('mongoose');

// Schéma pour les paiements
const paiementSchema = new mongoose.Schema({
  // Référence du paiement
  referencePaiement: {
    type: String,
    required: true,
    unique: true
  },
  
  // ID de la transaction Wave
  waveTransactionId: {
    type: String,
    sparse: true // Permet les valeurs null mais unique si présente
  },
  
  // Montant du paiement
  montant: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Devise (XOF pour le Sénégal)
  devise: {
    type: String,
    required: true,
    default: 'XOF',
    enum: ['XOF', 'EUR', 'USD']
  },
  
  // Statut du paiement
  statut: {
    type: String,
    required: true,
    enum: ['en_attente', 'en_cours', 'reussi', 'echoue', 'annule', 'rembourse'],
    default: 'en_attente'
  },
  
  // Type de paiement
  typePaiement: {
    type: String,
    required: true,
    enum: ['adhesion_gie', 'investissement', 'cotisation', 'service', 'autre']
  },
  
  // Référence de l'entité liée (GIE, Investissement, etc.)
  entiteId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  
  // Type d'entité
  typeEntite: {
    type: String,
    required: true,
    enum: ['GIE', 'CycleInvestissement', 'Adhesion', 'Utilisateur']
  },
  
  // Utilisateur qui effectue le paiement
  utilisateurId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  },
  
  // Informations du payeur
  payeur: {
    nom: {
      type: String,
      required: true
    },
    prenom: {
      type: String,
      required: true
    },
    telephone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },
  
  // Méthode de paiement
  methodePaiement: {
    type: String,
    required: true,
    enum: ['wave', 'orange_money', 'free_money', 'carte_bancaire', 'virement', 'especes'],
    default: 'wave'
  },
  
  // URL de callback Wave
  urlCallback: {
    type: String
  },
  
  // URL de retour après paiement
  urlRetour: {
    type: String
  },
  
  // Données de réponse Wave
  donneesWave: {
    checkout_status: String,
    id: String,
    wave_launch_url: String,
    when_created: Date,
    when_expires: Date,
    business_name: String,
    checkout_status: String
  },
  
  // Historique des changements de statut
  historiqueStatut: [{
    statut: {
      type: String,
      required: true
    },
    dateChangement: {
      type: Date,
      default: Date.now
    },
    commentaire: String,
    donneesSupplementaires: mongoose.Schema.Types.Mixed
  }],
  
  // Métadonnées supplémentaires
  metadonnees: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Dates importantes
  dateCreation: {
    type: Date,
    default: Date.now
  },
  
  dateExpiration: {
    type: Date
  },
  
  datePaiement: {
    type: Date
  },
  
  // Informations d'erreur en cas d'échec
  messageErreur: {
    type: String
  },
  
  codeErreur: {
    type: String
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances
paiementSchema.index({ utilisateurId: 1, dateCreation: -1 });
paiementSchema.index({ referencePaiement: 1 });
paiementSchema.index({ waveTransactionId: 1 });
paiementSchema.index({ statut: 1, dateCreation: -1 });
paiementSchema.index({ entiteId: 1, typeEntite: 1 });

// Méthode pour ajouter un changement de statut
paiementSchema.methods.ajouterChangementStatut = function(nouveauStatut, commentaire = '', donneesSupplementaires = {}) {
  this.historiqueStatut.push({
    statut: nouveauStatut,
    commentaire,
    donneesSupplementaires
  });
  this.statut = nouveauStatut;
};

// Méthode pour vérifier si le paiement est expiré
paiementSchema.methods.estExpire = function() {
  return this.dateExpiration && new Date() > this.dateExpiration;
};

// Méthode pour marquer comme réussi
paiementSchema.methods.marquerReussi = function(donneesWave = {}) {
  this.statut = 'reussi';
  this.datePaiement = new Date();
  this.donneesWave = { ...this.donneesWave, ...donneesWave };
  this.ajouterChangementStatut('reussi', 'Paiement confirmé par Wave', donneesWave);
};

// Méthode pour marquer comme échoué
paiementSchema.methods.marquerEchoue = function(messageErreur, codeErreur = '') {
  this.statut = 'echoue';
  this.messageErreur = messageErreur;
  this.codeErreur = codeErreur;
  this.ajouterChangementStatut('echoue', messageErreur, { codeErreur });
};

// Middleware pre-save pour générer une référence unique
paiementSchema.pre('save', function(next) {
  if (this.isNew && !this.referencePaiement) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.referencePaiement = `FEVEO-PAY-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Paiement', paiementSchema);
