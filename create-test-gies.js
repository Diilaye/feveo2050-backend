const mongoose = require('mongoose');

require('dotenv').config();

async function creerGiesTest() {
  try {
    // Connexion à la base de données
    await mongoose.connect('mongodb://admin:password123@localhost:27017/feveo2050?authSource=admin');
    console.log('Connecté à MongoDB');

    // Créer directement les GIEs en base sans validation stricte
    const db = mongoose.connection.db;
    
    // Supprimer complètement la collection et ses index
    try {
      await db.collection('gies').drop();
      console.log('Collection gies supprimée');
    } catch (error) {
      console.log('Collection gies n\'existait pas');
    }

    // Données simplifiées avec membres valides
    const giesSimples = [
      {
        nomGIE: "GIE FEMMES AGRICULTRICES DAKAR",
        identifiantGIE: "GIEAGRIDAK001",
        numeroProtocole: "001",
        presidenteNom: "Diop",
        presidentePrenom: "Fatou",
        presidenteCIN: "1234567890123",
        presidenteTelephone: "+221771234567",
        presidenteEmail: "fatou.diop@example.com",
        presidenteAdresse: "Plateau, Dakar",
        region: "DAKAR",
        departement: "Dakar",
        arrondissement: "Plateau",
        commune: "Plateau",
        codeRegion: "01",
        codeDepartement: "01",
        codeArrondissement: "01",
        codeCommune: "01",
        secteurPrincipal: "Agriculture",
        autresActivites: "Maraîchage, élevage",
        nomCoordinateur: "Aminata Seck",
        matriculeCoordinateur: "COORD-001",
        immatricule: true,
        numeroRegistre: "REG-001-2025",
        membres: [
          {
            nom: "Sow",
            prenom: "Awa",
            fonction: "Secrétaire",
            cin: "1111111111111",
            telephone: "+221771111111",
            genre: "femme",
            age: 35,
            email: "awa.sow@example.com"
          }
        ],
        documentWorkflow: {
          etapeActuelle: "validation",
          procesVerbal: true,
          demandeAdhesion: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nomGIE: "GIE TRANSFORMATION ALIMENTAIRE THIÈS",
        identifiantGIE: "GIETRANSTHIES002",
        numeroProtocole: "002",
        presidenteNom: "Ndiaye",
        presidentePrenom: "Aminata",
        presidenteCIN: "2345678901234",
        presidenteTelephone: "+221772345678",
        presidenteEmail: "aminata.ndiaye@example.com",
        presidenteAdresse: "Thiès Centre",
        region: "THIES",
        departement: "Thiès",
        arrondissement: "Thiès",
        commune: "Thiès",
        codeRegion: "02",
        codeDepartement: "01",
        codeArrondissement: "01",
        codeCommune: "01",
        secteurPrincipal: "Transformation alimentaire",
        autresActivites: "Production de jus, séchage",
        nomCoordinateur: "Khadija Fall",
        matriculeCoordinateur: "COORD-002",
        immatricule: true,
        numeroRegistre: "REG-002-2025",
        membres: [
          {
            nom: "Kane",
            prenom: "Mariama",
            fonction: "Trésorière",
            cin: "2222222222222",
            telephone: "+221772222222",
            genre: "femme",
            age: 42,
            email: "mariama.kane@example.com"
          }
        ],
        documentWorkflow: {
          etapeActuelle: "validation",
          procesVerbal: true,
          demandeAdhesion: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nomGIE: "GIE ARTISANAT SAINT-LOUIS",
        identifiantGIE: "GIEARTSTLOUIS003",
        numeroProtocole: "003",
        presidenteNom: "Ba",
        presidentePrenom: "Aissatou",
        presidenteCIN: "3456789012345",
        presidenteTelephone: "+221773456789",
        presidenteEmail: "aissatou.ba@example.com",
        presidenteAdresse: "Saint-Louis Centre",
        region: "SAINT-LOUIS",
        departement: "Saint-Louis",
        arrondissement: "Saint-Louis",
        commune: "Saint-Louis",
        codeRegion: "03",
        codeDepartement: "01",
        codeArrondissement: "01",
        codeCommune: "01",
        secteurPrincipal: "Artisanat",
        autresActivites: "Bijouterie, couture",
        nomCoordinateur: "Mariem Sy",
        matriculeCoordinateur: "COORD-003",
        immatricule: false,
        membres: [
          {
            nom: "Diallo",
            prenom: "Fatoumata",
            fonction: "Vice-Présidente",
            cin: "3333333333333",
            telephone: "+221773333333",
            genre: "femme",
            age: 38,
            email: "fatoumata.diallo@example.com"
          }
        ],
        documentWorkflow: {
          etapeActuelle: "validation",
          procesVerbal: true,
          demandeAdhesion: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Insérer les GIEs un par un pour éviter les conflits d'index
    let compteur = 0;
    for (const gie of giesSimples) {
      try {
        await db.collection('gies').insertOne(gie);
        compteur++;
      } catch (error) {
        console.error(`Erreur insertion GIE ${gie.nomGIE}:`, error.message);
      }
    }

    console.log(`${compteur} GIEs créés avec succès`);

    // Vérifier le total
    const totalGIEs = await db.collection('gies').countDocuments();
    console.log(`Total de GIEs en base: ${totalGIEs}`);

    // Fermer la connexion
    await mongoose.connection.close();
    console.log('Connexion fermée');

  } catch (error) {
    console.error('Erreur lors de la création des GIEs de test:', error);
    process.exit(1);
  }
}

// Lancer le script
creerGiesTest();
