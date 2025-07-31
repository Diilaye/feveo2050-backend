const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectDB = require('../config/database');
const Utilisateur = require('../models/Utilisateur');
const GIE = require('../models/GIE');
const Adhesion = require('../models/Adhesion');
const CycleInvestissement = require('../models/CycleInvestissement');

const seedDatabase = async () => {
  try {
    // Connexion à la base de données
    await connectDB();

    // Nettoyer la base de données
    console.log('🧹 Nettoyage de la base de données...');
    await Promise.all([
      Utilisateur.deleteMany({}),
      GIE.deleteMany({}),
      Adhesion.deleteMany({}),
      CycleInvestissement.deleteMany({})
    ]);

    // Créer un utilisateur administrateur
    console.log('👤 Création de l\'utilisateur administrateur...');
    const admin = new Utilisateur({
      nom: 'Admin',
      prenom: 'FEVEO',
      email: 'admin@feveo2050.sn',
      motDePasse: 'admin123',
      telephone: '+221771234567',
      role: 'admin'
    });
    admin.assignerPermissions();
    await admin.save();

    // Créer un utilisateur modérateur
    const moderateur = new Utilisateur({
      nom: 'Moderateur',
      prenom: 'FEVEO',
      email: 'moderateur@feveo2050.sn',
      motDePasse: 'modo123',
      telephone: '+221771234568',
      role: 'moderateur'
    });
    moderateur.assignerPermissions();
    await moderateur.save();

    // Créer des GIE d'exemple
    console.log('🏢 Création de GIE d\'exemple...');
    
    const gieExemple1 = new GIE({
      nomGIE: 'FEVEO-01-01-01-01-001',
      identifiantGIE: 'FEVEO-01-01-01-01-001',
      numeroProtocole: '001',
      presidenteNom: 'Diallo',
      presidentePrenom: 'Aïssatou',
      presidenteCIN: '1234567890123',
      presidenteAdresse: 'Dakar Plateau',
      presidenteTelephone: '+221772488807',
      presidenteEmail: 'aissatou.diallo@email.com',
      region: 'DAKAR',
      departement: 'DAKAR',
      arrondissement: 'DAKAR-PLATEAU',
      commune: 'DAKAR-PLATEAU',
      codeRegion: '01',
      codeDepartement: '01',
      codeArrondissement: '01',
      codeCommune: '01',
      secteurPrincipal: 'Agriculture',
      activites: ['Production agricole bio', 'Maraîchage organique'],
      objectifs: 'Développer l\'agriculture biologique au Sénégal',
      membres: Array(39).fill().map((_, index) => ({
        nom: `Membre${index + 1}`,
        prenom: `Prénom${index + 1}`,
        fonction: index === 0 ? 'Vice-Présidente' : index === 1 ? 'Secrétaire' : index === 2 ? 'Trésorière' : 'Membre',
        cin: `123456789${index.toString().padStart(4, '0')}`,
        telephone: `+22177${index.toString().padStart(7, '0')}`,
        genre: 'femme'
      })),
      documentsGeneres: {
        statuts: true,
        reglementInterieur: true,
        procesVerbal: true,
        demandeAdhesion: true
      }
    });

    await gieExemple1.save();

    // Créer l'adhésion pour le GIE
    const adhesion1 = new Adhesion({
      gieId: gieExemple1._id,
      typeAdhesion: 'standard',
      validation: {
        statut: 'validee',
        dateValidation: new Date(),
        validePar: admin._id,
        documentsVerifies: {
          statuts: true,
          reglementInterieur: true,
          procesVerbal: true,
          pieceIdentite: true
        }
      },
      paiement: {
        statut: 'complete',
        methode: 'wave',
        transactionId: 'TXN-001-2025',
        datePaiement: new Date(),
        montantPaye: 20000
      }
    });

    // Marquer toutes les étapes comme complètes
    Object.keys(adhesion1.etapesProcessus).forEach(etape => {
      adhesion1.completerEtape(etape);
    });

    await adhesion1.save();

    // Créer le cycle d'investissement
    const cycle1 = new CycleInvestissement({
      gieId: gieExemple1._id
    });
    cycle1.genererCalendrier();
    
    // Simuler quelques investissements
    for (let i = 0; i < 10; i++) {
      cycle1.investissementsJournaliers[i].statut = 'investi';
      cycle1.walletGIE.soldeActuel += 6000;
      cycle1.walletGIE.historique.push({
        type: 'investissement',
        montant: 6000,
        description: `Investissement jour ${i + 1}`,
        soldeApres: cycle1.walletGIE.soldeActuel
      });
    }

    cycle1.calculerProgression();
    await cycle1.save();

    // Créer un deuxième GIE avec adhésion en attente
    const gieExemple2 = new GIE({
      nomGIE: 'FEVEO-02-01-01-01-002',
      identifiantGIE: 'FEVEO-02-01-01-01-002',
      numeroProtocole: '002',
      presidenteNom: 'Sow',
      presidentePrenom: 'Fatou',
      presidenteCIN: '2234567890123',
      presidenteAdresse: 'Thiès Nord',
      presidenteTelephone: '+221776543211',
      presidenteEmail: 'fatou.sow@email.com',
      region: 'THIES',
      departement: 'THIES',
      arrondissement: 'THIES-NORD',
      commune: 'THIES-NORD',
      codeRegion: '02',
      codeDepartement: '01',
      codeArrondissement: '01',
      codeCommune: '01',
      secteurPrincipal: 'Élevage',
      activites: ['Élevage de volailles', 'Élevage de petits ruminants'],
      objectifs: 'Développer l\'élevage moderne au Sénégal',
      membres: Array(39).fill().map((_, index) => ({
        nom: `Eleveur${index + 1}`,
        prenom: `Prénom${index + 1}`,
        fonction: index === 0 ? 'Vice-Présidente' : index === 1 ? 'Secrétaire' : index === 2 ? 'Trésorière' : 'Membre',
        cin: `223456789${index.toString().padStart(4, '0')}`,
        telephone: `+22177${(index + 1000).toString().padStart(7, '0')}`,
        genre: index < 25 ? 'femme' : index < 37 ? 'jeune' : 'homme'
      }))
    });

    await gieExemple2.save();

    // Adhésion en attente
    const adhesion2 = new Adhesion({
      gieId: gieExemple2._id,
      typeAdhesion: 'standard'
    });
    await adhesion2.save();

    // Cycle d'investissement
    const cycle2 = new CycleInvestissement({
      gieId: gieExemple2._id
    });
    cycle2.genererCalendrier();
    await cycle2.save();

    // Créer un utilisateur présidente associé au premier GIE
    const presidente = new Utilisateur({
      nom: 'Diallo',
      prenom: 'Aïssatou',
      email: 'presidente@feveo2050.sn',
      motDePasse: 'presidente123',
      telephone: '+221776543210',
      role: 'gie_president',
      gieAssocie: gieExemple1._id
    });
    presidente.assignerPermissions();
    await presidente.save();

    console.log('✅ Base de données initialisée avec succès!');
    console.log(`
📊 Données créées:
   👤 Utilisateurs: 3
      - Admin: admin@feveo2050.sn (mot de passe: admin123)
      - Modérateur: moderateur@feveo2050.sn (mot de passe: modo123)
      - Présidente: presidente@feveo2050.sn (mot de passe: presidente123)
   
   🏢 GIE: 2
      - FEVEO-01-01-01-01-001 (Adhésion validée, 10 jours d'investissement)
      - FEVEO-02-01-01-01-002 (Adhésion en attente)
   
   💰 Cycles d'investissement: 2
      - Cycle 1: 10 jours investis (60 000 FCFA)
      - Cycle 2: 0 jours investis
    `);

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connexion à la base de données fermée');
    process.exit(0);
  }
};

// Exécuter le script si appelé directement
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
