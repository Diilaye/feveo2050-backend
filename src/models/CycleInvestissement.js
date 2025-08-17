const mongoose = require('mongoose');

const investissementJournalierSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  montant: {
    type: Number,
    required: true,
    default: 6000 // Montant journalier FEVEO 2050
  },
  statut: {
    type: String,
    enum: ['programme', 'investi', 'manque', 'reporte'],
    default: 'programme'
  },
  numeroJour: {
    type: Number,
    required: true,
    min: 1,
    max: 1826
  },
  commentaire: {
    type: String,
    trim: true
  }
});

const cycleInvestissementSchema = new mongoose.Schema({
  gieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GIE',
    required: true,
    unique: true
  },
  
  // Informations du cycle
  dateDebut: {
    type: Date,
    required: true,
    default: () => new Date('2025-04-01') // 1er avril 2025
  },
  dateFin: {
    type: Date,
    required: true,
    default: function() {
      // Calculer automatiquement la date de fin si pas définie
      const dateDebut = this.dateDebut || new Date('2025-04-01');
      const dateFin = new Date(dateDebut);
      dateFin.setDate(dateFin.getDate() + (this.dureeJours || 1826));
      return dateFin;
    }
  },
  dureeJours: {
    type: Number,
    required: true,
    default: 1826
  },
  montantJournalier: {
    type: Number,
    required: true,
    default: 6000
  },
  montantTotalPrevu: {
    type: Number,
    required: true,
    default: 10956000 // 6000 * 1826
  },
  
  // Progression
  joursInvestis: {
    type: Number,
    default: 0
  },
  joursRestants: {
    type: Number,
    default: 1826
  },
  montantTotalInvesti: {
    type: Number,
    default: 0
  },
  pourcentageComplete: {
    type: Number,
    default: 0
  },
  
  // Investissements journaliers
  investissementsJournaliers: [investissementJournalierSchema],
  
  // Statut du cycle
  statutCycle: {
    type: String,
    enum: ['actif', 'suspendu', 'complete', 'annule'],
    default: 'actif'
  },
  
  // Wallet GIE
  walletGIE: {
    soldeActuel: {
      type: Number,
      default: 0
    },
    historique: [{
      date: {
        type: Date,
        default: Date.now
      },
      type: {
        type: String,
        enum: ['investissement', 'retrait', 'bonus', 'penalite'],
        required: true
      },
      montant: {
        type: Number,
        required: true
      },
      description: {
        type: String,
        trim: true
      },
      soldeApres: {
        type: Number,
        required: true
      }
    }]
  },
  
  // Statistiques
  statistiques: {
    joursConsecutifs: {
      type: Number,
      default: 0
    },
    meilleureSequence: {
      type: Number,
      default: 0
    },
    totalJoursManques: {
      type: Number,
      default: 0
    },
    dernierInvestissement: {
      type: Date
    }
  }
}, {
  timestamps: true
});

// Index pour les requêtes fréquentes
// Note: gieId déjà indexé par unique: true
cycleInvestissementSchema.index({ statutCycle: 1 });
cycleInvestissementSchema.index({ 'investissementsJournaliers.date': 1 });

// Méthodes du modèle
cycleInvestissementSchema.methods.calculerProgression = function() {
  this.joursInvestis = this.investissementsJournaliers.filter(inv => inv.statut === 'investi').length;
  this.joursRestants = this.dureeJours - this.joursInvestis;
  this.pourcentageComplete = (this.joursInvestis / this.dureeJours) * 100;
  this.montantTotalInvesti = this.joursInvestis * this.montantJournalier;
};

// Générer le calendrier d'investissement
cycleInvestissementSchema.methods.genererCalendrier = function() {
  const calendrier = [];
  const dateActuelle = new Date(this.dateDebut);
  
  for (let jour = 1; jour <= this.dureeJours; jour++) {
    calendrier.push({
      date: new Date(dateActuelle),
      montant: this.montantJournalier,
      statut: 'programme',
      numeroJour: jour
    });
    
    dateActuelle.setDate(dateActuelle.getDate() + 1);
  }
  
  this.investissementsJournaliers = calendrier;
};

// Méthodes pour le wallet
cycleInvestissementSchema.methods.calculerMontantTotalInvesti = function() {
  return this.investissementsJournaliers
    .filter(inv => inv.statut === 'investi')
    .reduce((total, inv) => total + inv.montant, 0);
};

cycleInvestissementSchema.methods.calculerRetoursTotaux = function() {
  // Simulation: 7% de retour sur investissement
  const montantInvesti = this.calculerMontantTotalInvesti();
  return Math.round(montantInvesti * 0.07);
};

cycleInvestissementSchema.methods.obtenirJourActuel = function() {
  const aujourdhui = new Date();
  const dateDebut = new Date(this.dateDebut);
  const diffTime = aujourdhui - dateDebut;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, Math.min(diffDays, this.dureeJours));
};

cycleInvestissementSchema.methods.obtenirProchaineDate = function() {
  const jourActuel = this.obtenirJourActuel();
  if (jourActuel >= this.dureeJours) {
    return null; // Cycle terminé
  }
  
  const prochainJour = new Date(this.dateDebut);
  prochainJour.setDate(prochainJour.getDate() + jourActuel);
  return prochainJour;
};

// Middleware pour calculer la date de fin
cycleInvestissementSchema.pre('save', function(next) {
  if (this.dateDebut && !this.dateFin) {
    this.dateFin = new Date(this.dateDebut);
    this.dateFin.setDate(this.dateFin.getDate() + this.dureeJours - 1);
  }
  
  // Recalculer la progression
  this.calculerProgression();
  
  next();
});

module.exports = mongoose.model('CycleInvestissement', cycleInvestissementSchema);
