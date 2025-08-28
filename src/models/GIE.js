
const mongoose = require('mongoose');

const membreSchema = new mongoose.Schema({
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
  fonction: {
    type: String,
    enum: ['Présidente', 'Secrétaire', 'Trésorière', 'Membre'],
    default: 'Membre'
  },
  cin: {
    type: String,
    required: true,
    unique: true
  },
  telephone: {
    type: String,
    required: true
  },
  genre: {
    type: String,
    enum: ['femme', 'jeune', 'homme'],
    required: true
  },
  age: {
    type: Number,
    min: 18,
    max: 100
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  }
});

const gieSchema = new mongoose.Schema({
  // Identification
  nomGIE: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  identifiantGIE: {
    type: String,
    required: true,
    unique: true,
    match: /^FEVEO-\d{2}-\d{2}-\d{2}-\d{2}-\d{3}$/
  },
  numeroProtocole: {
    type: String,
    required: true,
    match: /^\d{3}$/
  },

  // Présidente
  presidenteNom: {
    type: String,
    required: true,
    trim: true
  },
  presidentePrenom: {
    type: String,
    required: true,
    trim: true
  },
  presidenteCIN: {
    type: String,
    required: true,
    unique: true
  },
  presidenteAdresse: {
    type: String,
    required: true
  },
  presidenteTelephone: {
    type: String,
    required: true
  },
  presidenteEmail: {
    type: String,
    lowercase: true,
    trim: true
  },

  // Localisation
  region: {
    type: String,
    required: true,
    enum: ['DAKAR', 'THIES', 'SAINT-LOUIS', 'DIOURBEL', 'KAOLACK', 'FATICK', 'KOLDA', 'ZIGUINCHOR', 'LOUGA', 'MATAM', 'KAFFRINE', 'KEDOUGOU', 'SEDHIOU', 'TAMBACOUNDA']
  },
  departement: {
    type: String,
    required: true
  },
  arrondissement: {
    type: String,
    required: true
  },
  commune: {
    type: String,
    required: true
  },
  codeRegion: {
    type: String,
    required: true,
    match: /^\d{2}$/
  },
  codeDepartement: {
    type: String,
    required: true,
    match: /^\d{2}$/
  },
  codeArrondissement: {
    type: String,
    required: true,
    match: /^\d{2}$/
  },
  codeCommune: {
    type: String,
    required: true,
    match: /^\d{2}$/
  },

  // Membres
  membres: [membreSchema],

  // Activités
  secteurPrincipal: {
    type: String,
    required: true,
    enum: ['Agriculture', 'Élevage', 'Transformation', 'Commerce & Distribution']
  },
  activites: [{
    type: String,
    trim: true
  }],
  objectifs: {
    type: String,
    trim: true
  },

    // Date de dernière mise à jour
  updatedAt: {
    type: Date,
    default: Date.now
  },

  // Statut
  statutAdhesion: {
    type: String,
    enum: ['en_attente', 'validee', 'rejetee', 'suspendue'],
    default: 'en_attente'
  },

  // Documents générés
  documentsGeneres: {
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
    demandeAdhesion: {
      type: Boolean,
      default: false
    }
  },

  // Statut d'enregistrement du GIE
  statutEnregistrement: {
    type: String,
    enum: ['en_attente_paiement', 'valide', 'rejete', 'suspendu'],
    default: 'en_attente_paiement'
  },

  daysInvestedSuccess: {
    type: Number,
    default: 0
  },


  // Code de connexion temporaire pour authentification
  codeConnexionTemporaire: {
    code: {
      type: String
    },
    dateExpiration: {
      type: Date
    },
    numeroTelephone: {
      type: String
    }
  },

  daysInvestedSuccess: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index pour la recherche
gieSchema.index({ nomGIE: 'text', identifiantGIE: 'text' });
gieSchema.index({ region: 1, departement: 1 });
gieSchema.index({ numeroProtocole: 1 });

// Statistiques publiques : nombre de membres par genre sur tous les GIE
gieSchema.statics.getStatsPubliques = async function () {
  // Récupère tous les GIEs avec leurs membres
  const gies = await this.find({}, { membres: 1 }).lean();
  let femmes = 0;
  let jeunes = 0;
  let hommes = 0;
  for (const gie of gies) {
    if (Array.isArray(gie.membres)) {
      for (const membre of gie.membres) {
        if (membre.genre === 'femme') femmes++;
        else if (membre.genre === 'jeune') jeunes++;
        else if (membre.genre === 'homme') hommes++;
      }
    }
  }
  return { femmes, jeunes, hommes };
};

// Validation personnalisée pour la composition des membres
gieSchema.pre('save', function (next) {
  const totalMembres = this.membres.length + 1; // +1 pour la présidente

  // Vérifier le nombre minimum de membres (3 minimum)
  if (totalMembres < 3) {
    return next(new Error('Le GIE doit avoir au minimum 3 membres (incluant la présidente)'));
  }

  // Vérifier les rôles obligatoires dans les membres
  const secretaire = this.membres.find(m => m.fonction === 'Secrétaire');
  const tresoriere = this.membres.find(m => m.fonction === 'Trésorière');

  if (!secretaire) {
    return next(new Error('Le GIE doit avoir une Secrétaire parmi ses membres'));
  }

  if (!tresoriere) {
    return next(new Error('Le GIE doit avoir une Trésorière parmi ses membres'));
  }

  // Si plus de 3 membres, vérifier les règles FEVEO 2050 pour la composition de genre
  if (totalMembres > 3) {
    // Compter la composition par genre
    const femmes = this.membres.filter(m => m.genre === 'femme').length + 1; // +1 présidente
    const jeunes = this.membres.filter(m => m.genre === 'jeune').length;
    const hommes = this.membres.filter(m => m.genre === 'homme').length;

    // Vérifier les règles FEVEO 2050
    const option1Valid = femmes === totalMembres; // 100% femmes
    const option2Valid = femmes >= Math.ceil(totalMembres * 0.625) && jeunes >= Math.ceil(totalMembres * 0.3) && hommes <= Math.floor(totalMembres * 0.075); // Composition mixte proportionnelle

    if (!option1Valid && !option2Valid) {
      return next(new Error('Composition des membres non conforme aux règles FEVEO 2050: soit 100% femmes, soit minimum 62.5% femmes, 30% jeunes et maximum 7.5% hommes'));
    }
  }

  next();
});

module.exports = mongoose.model('GIE', gieSchema);
