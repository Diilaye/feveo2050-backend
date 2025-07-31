const mongoose = require('mongoose');

const adhesionSchema = new mongoose.Schema({
  gieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GIE',
    required: true,
    unique: true
  },
  
  // Type d'adhésion
  typeAdhesion: {
    type: String,
    enum: ['standard', 'premium'],
    default: 'standard'
  },
  
  // Montants
  montantAdhesion: {
    type: Number,
    required: true,
    default: 20000 // Standard
  },
  
  // Paiement
  paiement: {
    statut: {
      type: String,
      enum: ['en_attente', 'en_cours', 'complete', 'echec', 'rembourse'],
      default: 'en_attente'
    },
    methode: {
      type: String,
      enum: ['wave', 'orange_money', 'virement', 'especes'],
      default: 'wave'
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true
    },
    referenceWave: {
      type: String
    },
    datePaiement: {
      type: Date
    },
    montantPaye: {
      type: Number
    }
  },
  
  // Validation
  validation: {
    statut: {
      type: String,
      enum: ['en_attente', 'en_cours', 'validee', 'rejetee'],
      default: 'en_attente'
    },
    dateValidation: {
      type: Date
    },
    validePar: {
      type: String, // ID de l'administrateur
      trim: true
    },
    commentaires: {
      type: String,
      trim: true
    },
    documentsVerifies: {
      statuts: {
        type: Boolean,
        default: false
      },
      reglementInterieur: {
        type: Boolean,
        default: false
      },
      procesVerbal: {
        type: Boolean,
        default: false
      },
      pieceIdentite: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // Étapes du processus
  etapesProcessus: {
    soumission: {
      date: {
        type: Date,
        default: Date.now
      },
      complete: {
        type: Boolean,
        default: true
      }
    },
    verification: {
      date: {
        type: Date
      },
      complete: {
        type: Boolean,
        default: false
      }
    },
    paiement: {
      date: {
        type: Date
      },
      complete: {
        type: Boolean,
        default: false
      }
    },
    validation: {
      date: {
        type: Date
      },
      complete: {
        type: Boolean,
        default: false
      }
    },
    activation: {
      date: {
        type: Date
      },
      complete: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // Avantages selon le type
  avantagesInclus: {
    acceFinancements: {
      type: Boolean,
      default: true
    },
    formationBase: {
      type: Boolean,
      default: true
    },
    supportTechnique: {
      type: Boolean,
      default: true
    },
    reseauFeveo: {
      type: Boolean,
      default: true
    },
    walletGIE: {
      type: Boolean,
      default: true
    },
    mentoringDedie: {
      type: Boolean,
      default: false
    },
    accesMartheInternational: {
      type: Boolean,
      default: false
    },
    formationAvancee: {
      type: Boolean,
      default: false
    }
  },
  
  // Historique des modifications
  historiqueStatuts: [{
    ancienStatut: String,
    nouveauStatut: String,
    date: {
      type: Date,
      default: Date.now
    },
    modifiePar: String,
    commentaire: String
  }]
}, {
  timestamps: true
});

// Index pour les requêtes
adhesionSchema.index({ gieId: 1 });
adhesionSchema.index({ 'paiement.statut': 1 });
adhesionSchema.index({ 'validation.statut': 1 });
adhesionSchema.index({ typeAdhesion: 1 });

// Middleware pour gérer les avantages selon le type
adhesionSchema.pre('save', function(next) {
  if (this.typeAdhesion === 'premium') {
    this.montantAdhesion = 50000;
    this.avantagesInclus.mentoringDedie = true;
    this.avantagesInclus.accesMartheInternational = true;
    this.avantagesInclus.formationAvancee = true;
  } else {
    this.montantAdhesion = 20000;
    this.avantagesInclus.mentoringDedie = false;
    this.avantagesInclus.accesMartheInternational = false;
    this.avantagesInclus.formationAvancee = false;
  }
  
  next();
});

// Méthode pour calculer le pourcentage de progression
adhesionSchema.methods.calculerProgression = function() {
  const etapes = Object.values(this.etapesProcessus);
  const etapesCompletes = etapes.filter(etape => etape.complete).length;
  return Math.round((etapesCompletes / etapes.length) * 100);
};

// Méthode pour marquer une étape comme complète
adhesionSchema.methods.completerEtape = function(nomEtape) {
  if (this.etapesProcessus[nomEtape]) {
    this.etapesProcessus[nomEtape].complete = true;
    this.etapesProcessus[nomEtape].date = new Date();
  }
};

module.exports = mongoose.model('Adhesion', adhesionSchema);
