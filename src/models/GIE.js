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
    enum: ['Présidente', 'Vice-Présidente', 'Secrétaire', 'Trésorière', 'Membre'],
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
    unique: true,
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
  
  // Dates importantes
  dateConstitution: {
    type: Date,
    default: Date.now
  },
  dateCreation: {
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
  }
}, {
  timestamps: true
});

// Index pour la recherche
gieSchema.index({ nomGIE: 'text', identifiantGIE: 'text' });
gieSchema.index({ region: 1, departement: 1 });
gieSchema.index({ numeroProtocole: 1 });

// Validation personnalisée pour la composition des membres
gieSchema.pre('save', function(next) {
  const totalMembres = this.membres.length + 1; // +1 pour la présidente
  
  if (totalMembres !== 40) {
    return next(new Error('Le GIE doit avoir exactement 40 membres (incluant la présidente)'));
  }
  
  // Compter la composition
  const femmes = this.membres.filter(m => m.genre === 'femme').length + 1; // +1 présidente
  const jeunes = this.membres.filter(m => m.genre === 'jeune').length;
  const hommes = this.membres.filter(m => m.genre === 'homme').length;
  
  // Vérifier les règles FEVEO 2050
  const option1Valid = femmes === 40; // 100% femmes
  const option2Valid = femmes >= 25 && jeunes === 12 && hommes <= 3; // Composition mixte
  
  if (!option1Valid && !option2Valid) {
    return next(new Error('Composition des membres non conforme aux règles FEVEO 2050'));
  }
  
  next();
});

module.exports = mongoose.model('GIE', gieSchema);
