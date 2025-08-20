// @desc    Obtenir le prochain numeroProtocole pour une commune
// @route   GET /api/gie/next-protocol/:codeCommune
// @access  Public
const getNextProtocolForCommune = async (req, res) => {
  try {
    const { codeCommune } = req.params;
    if (!codeCommune) {
      return res.status(400).json({
        success: false,
        message: 'Code commune requis'
      });
    }
    const gieCount = await GIE.countDocuments({ codeCommune });
    if (gieCount >= 50) {
      return res.status(400).json({
        success: false,
        message: 'Cette commune a déjà atteint la limite de 50 GIE.'
      });
    }
    const nextNumero = (gieCount + 1).toString().padStart(3, '0');
    res.json({
      success: true,
      data: { nextNumeroProtocole: nextNumero }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du numéro de protocole',
      error: error.message
    });
  }
};
const GIE = require('../models/GIE');
const Adhesion = require('../models/Adhesion');
const CycleInvestissement = require('../models/CycleInvestissement');
const messagingService = require('../services/messagingService');

// @desc    Créer un nouveau GIE
// @route   POST /api/gie
// @access  Private
const createGIE = async (req, res) => {
  try {
    const gieData = req.body;

    console.log('Données GIE reçues:', gieData);

    // Validation personnalisée des membres avant la création
    const membres = gieData.membres || [];
    const totalMembres = membres.length + 1; // +1 pour la présidente
    
    // Vérifier le nombre minimum de membres (3 minimum)
    if (totalMembres < 2) {
      return res.status(400).json({
        success: false,
        message: 'Erreurs de validation',
        errors: [{
          field: 'membres',
          message: 'Le GIE doit avoir au minimum 3 membres (incluant la présidente)'
        }]
      });
    }
    
    // Vérifier les rôles obligatoires dans les membres
    const secretaire = membres.find(m => m.fonction === 'Secrétaire');
    const tresoriere = membres.find(m => m.fonction === 'Trésorière');
    
    const erreurs = [];
    
    if (!secretaire) {
      erreurs.push({
        field: 'membres',
        message: 'Le GIE doit avoir une Secrétaire parmi ses membres'
      });
    }
    
    if (!tresoriere) {
      erreurs.push({
        field: 'membres',
        message: 'Le GIE doit avoir une Trésorière parmi ses membres'
      });
    }
    
    // Si plus de 3 membres, vérifier les règles FEVEO 2050 pour la composition de genre
    if (totalMembres > 3) {
      const femmes = membres.filter(m => m.genre === 'femme').length + 1; // +1 présidente (femme)
      const jeunes = membres.filter(m => m.genre === 'jeune').length;
      const hommes = membres.filter(m => m.genre === 'homme').length;
      
      // Règles FEVEO 2050 : Option 1 (100% femmes) OU Option 2 (composition proportionnelle)
      const option1Valide = femmes === totalMembres; // 100% femmes
      const minFemmes = Math.ceil(totalMembres * 0.625); // 62.5%
      const minJeunes = Math.ceil(totalMembres * 0.3); // 30%
      const maxHommes = Math.floor(totalMembres * 0.075); // 7.5%
      const option2Valide = femmes >= minFemmes && jeunes >= minJeunes && hommes <= maxHommes;
      
      if (!option1Valide && !option2Valide) {
        erreurs.push({
          field: 'membres',
          message: `Composition non conforme aux règles FEVEO 2050. Options: 1) 100% femmes OU 2) Min ${minFemmes} femmes, ${minJeunes} jeunes, max ${maxHommes} hommes. Actuel: ${femmes} femmes, ${jeunes} jeunes, ${hommes} hommes`
        });
      }
    }
    
    // Retourner les erreurs s'il y en a
    if (erreurs.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Erreurs de validation',
        errors: erreurs
      });
    }
    
    // Déterminer si c'est un enregistrement public (sans auth) ou privé (avec auth)
    const isPublicRegistration = !req.user;
    
    // Mapper les codes géographiques si ils sont fournis sous forme de chaînes numériques
    const processedGieData = { ...gieData };
    
    // Fonction utilitaire pour extraire des codes à partir de données géographiques
    const extractGeographicCodes = (gieData) => {
      // Données géographiques du Sénégal (mapping basique)
      const regionCodes = {
        'DAKAR': '01',
        'THIES': '13',
        'SAINT-LOUIS': '10', 
        'DIOURBEL': '02',
        'KAOLACK': '05',
        'FATICK': '03',
        'KOLDA': '07',
        'ZIGUINCHOR': '14',
        'LOUGA': '08',
        'MATAM': '09',
        'KAFFRINE': '04',
        'KEDOUGOU': '06',
        'SEDHIOU': '11',
        'TAMBACOUNDA': '12'
      };
      
      // Mapping basique pour les départements principaux
      const departmentCodes = {
        'DAKAR': '01',
        'GUEDIAWAYE': '02',
        'PIKINE': '03',
        'RUFISQUE': '04',
        'THIES': '01',
        'TIVAOUANE': '02',
        'MBOUR': '03',
        'SAINT-LOUIS': '01',
        'DAGANA': '02',
        'PODOR': '03',
        'BIGNONA': '01',
        'OUSSOUYE': '02',
        'ZIGUINCHOR': '03'
      };
      
      const codes = {
        codeRegion: '14', // Dakar par défaut
        codeDepartement: '01',
        codeArrondissement: '01', 
        codeCommune: '01'
      };
      
      // Traiter la région
      if (gieData.region) {
        if (/^\d{2}$/.test(gieData.region)) {
          codes.codeRegion = gieData.region;
        } else if (regionCodes[gieData.region]) {
          codes.codeRegion = regionCodes[gieData.region];
        }
      }
      
      // Traiter le département
      if (gieData.departement) {
        if (/^\d{2}$/.test(gieData.departement)) {
          codes.codeDepartement = gieData.departement;
        } else if (departmentCodes[gieData.departement]) {
          codes.codeDepartement = departmentCodes[gieData.departement];
        }
      }
      
      // Traiter l'arrondissement et la commune
      if (gieData.arrondissement && /^\d{2}$/.test(gieData.arrondissement)) {
        codes.codeArrondissement = gieData.arrondissement;
      }
      
      if (gieData.commune && /^\d{2}$/.test(gieData.commune)) {
        codes.codeCommune = gieData.commune;
      }
      
      return codes;
    };
    
    // Extraire et assigner les codes géographiques
   // const geoCodes = extractGeographicCodes(gieData);
   // processedGieData.codeRegion = gieData.codeRegion;
   // processedGieData.codeDepartement = gieData.codeDepartement;
    //processedGieData.codeArrondissement = gieData.codeArrondissement;
    //processedGieData.codeCommune = gieData.codeCommune;

    // Debug: afficher les codes mappés
    console.log('Codes géographiques mappés:', {
      region: processedGieData.region,
      departement: processedGieData.departement,
      codeRegion: processedGieData.codeRegion,
      codeDepartement: processedGieData.codeDepartement,
      codeArrondissement: processedGieData.codeArrondissement,
      codeCommune: processedGieData.codeCommune
    });
    

    // 1. Vérifier le nombre de GIE pour la commune
    const gieCountForCommune = await GIE.countDocuments({ codeRegion: processedGieData.codeRegion, codeDepartement: processedGieData.codeDepartement, codeArrondissement: processedGieData.codeArrondissement, codeCommune: processedGieData.codeCommune });
    if (gieCountForCommune >= 50) {
      return res.status(400).json({
        success: false,
        message: 'Cette commune a déjà atteint la limite de 50 GIE.'
      });
    }

    // 2. Générer le numeroProtocole unique pour la commune
    const nextNumeroProtocole = (gieCountForCommune + 1).toString().padStart(3, '0');
    processedGieData.numeroProtocole = nextNumeroProtocole;

    // 3. Vérifier l'unicité de l'identifiant et du protocole dans la commune
    const existingGIE = await GIE.findOne({
      $or: [
        { identifiantGIE: processedGieData.identifiantGIE },
        { presidenteCIN: processedGieData.presidenteCIN },
        { numeroProtocole: processedGieData.numeroProtocole, codeRegion: processedGieData.codeRegion, codeDepartement: processedGieData.codeDepartement, codeArrondissement: processedGieData.codeArrondissement, codeCommune: processedGieData.codeCommune }
      ]
    });
    if (existingGIE) {
      return res.status(400).json({
        success: false,
        message: 'GIE avec cet identifiant, protocole (dans la commune) ou CIN présidente existe déjà'
      });
    }

    // Créer le GIE avec statut approprié
    const gie = new GIE({
      ...processedGieData,
      statutEnregistrement: isPublicRegistration ? 'en_attente_paiement' : 'valide'
    });
  const newGIE = await gie.save();

    res.status(201).json({
      success: true,
      message: 'success creation',
      data: newGIE
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du GIE',
      error: error.message
    });
  }
};

// @desc    Obtenir tous les GIE
// @route   GET /api/gie
// @access  Private
const getAllGIE = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      region,
      secteur,
      statut
    } = req.query;

    // Construire le filtre
    const filter = {};
    
    if (search) {
      filter.$or = [
        { nomGIE: { $regex: search, $options: 'i' } },
        { identifiantGIE: { $regex: search, $options: 'i' } },
        { presidenteNom: { $regex: search, $options: 'i' } },
        { presidentePrenom: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (region) filter.region = region;
    if (secteur) filter.secteurPrincipal = secteur;
    if (statut) filter.statutAdhesion = statut;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: [
        {
          path: 'adhesion',
          select: 'typeAdhesion validation.statut paiement.statut'
        }
      ]
    };

    // Utiliser une agrégation pour joindre les adhésions
    const agregation = [
      { $match: filter },
      {
        $lookup: {
          from: 'adhesions',
          localField: '_id',
          foreignField: 'gieId',
          as: 'adhesion'
        }
      },
      {
        $unwind: {
          path: '$adhesion',
          preserveNullAndEmptyArrays: true
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: (options.page - 1) * options.limit },
      { $limit: options.limit }
    ];

    const gie = await GIE.aggregate(agregation);
    const total = await GIE.countDocuments(filter);

    res.json({
      success: true,
      data: {
        gie,
        pagination: {
          page: options.page,
          limit: options.limit,
          total,
          pages: Math.ceil(total / options.limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des GIE',
      error: error.message
    });
  }
};

// @desc    Obtenir un GIE par ID
// @route   GET /api/gie/:id
// @access  Private
const getGIEById = async (req, res) => {
  try {
    const gie = await GIE.findById(req.params.id);

    if (!gie) {
      return res.status(404).json({
        success: false,
        message: 'GIE non trouvé'
      });
    }

    // Récupérer les informations d'adhésion
    const adhesion = await Adhesion.findOne({ gieId: gie._id });
    
    // Récupérer le cycle d'investissement
    const cycleInvestissement = await CycleInvestissement.findOne({ gieId: gie._id });

    res.json({
      success: true,
      data: {
        gie,
        adhesion,
        cycleInvestissement
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du GIE',
      error: error.message
    });
  }
};

// @desc    Mettre à jour un GIE
// @route   PUT /api/gie/:id
// @access  Private
const updateGIE = async (req, res) => {
  try {
    const gie = await GIE.findById(req.params.id);

    if (!gie) {
      return res.status(404).json({
        success: false,
        message: 'GIE non trouvé'
      });
    }

    // Empêcher la modification de certains champs critiques
    const champsProtégés = ['identifiantGIE', 'numeroProtocole', 'presidenteCIN'];
    champsProtégés.forEach(champ => {
      if (req.body[champ] && req.body[champ] !== gie[champ]) {
        return res.status(400).json({
          success: false,
          message: `Le champ '${champ}' ne peut pas être modifié`
        });
      }
    });

    // Mettre à jour les champs autorisés
    Object.keys(req.body).forEach(key => {
      if (!champsProtégés.includes(key)) {
        gie[key] = req.body[key];
      }
    });

    await gie.save();

    res.json({
      success: true,
      message: 'GIE mis à jour avec succès',
      data: { gie }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du GIE',
      error: error.message
    });
  }
};

// @desc    Supprimer un GIE
// @route   DELETE /api/gie/:id
// @access  Private (Admin seulement)
const deleteGIE = async (req, res) => {
  try {
    const gie = await GIE.findById(req.params.id);

    if (!gie) {
      return res.status(404).json({
        success: false,
        message: 'GIE non trouvé'
      });
    }

    // Supprimer les données associées
    await Promise.all([
      Adhesion.findOneAndDelete({ gieId: gie._id }),
      CycleInvestissement.findOneAndDelete({ gieId: gie._id })
    ]);

    await gie.deleteOne();

    res.json({
      success: true,
      message: 'GIE supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du GIE',
      error: error.message
    });
  }
};

// @desc    Obtenir les statistiques des GIE
// @route   GET /api/gie/stats
// @access  Private
const getGIEStats = async (req, res) => {
  try {
    const stats = await GIE.aggregate([
      {
        $group: {
          _id: null,
          totalGIE: { $sum: 1 },
          parRegion: {
            $push: {
              region: '$region',
              secteur: '$secteurPrincipal'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalGIE: 1,
          statistiquesRegion: {
            $reduce: {
              input: '$parRegion',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $arrayToObject: [
                      [
                        {
                          k: '$$this.region',
                          v: {
                            $add: [
                              { $ifNull: [{ $getField: { field: '$$this.region', input: '$$value' } }, 0] },
                              1
                            ]
                          }
                        }
                      ]
                    ]
                  }
                ]
              }
            }
          }
        }
      }
    ]);

    // Statistiques des adhésions
    const statsAdhesion = await Adhesion.aggregate([
      {
        $group: {
          _id: '$validation.statut',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        stats: stats[0] || { totalGIE: 0 },
        adhesions: statsAdhesion
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};

// @desc    Générer le prochain numéro de protocole pour une zone géographique
// @route   GET /api/gie/next-protocol
// @access  Private
const getNextProtocol = async (req, res) => {
  try {
    // Récupérer les codes depuis la query ou params
    const { codeRegion, codeDepartement, codeArrondissement, codeCommune } = req.query;
    console.log('Codes géographiques:', { codeRegion, codeDepartement, codeArrondissement, codeCommune });


    if (!codeRegion || !codeDepartement || !codeArrondissement || !codeCommune) {
      return res.status(400).json({
        success: false,
        message: 'Les codes région, département, arrondissement et commune sont requis.'
      });
    }

    // Chercher le GIE avec le plus grand numeroProtocole pour cette zone
    console.log('Recherche du dernier GIE pour la zone:', { codeRegion, codeDepartement, codeArrondissement, codeCommune });
    const dernierGIE = await GIE.find({
      codeRegion: codeRegion,
      codeDepartement: codeDepartement,
      codeArrondissement: codeArrondissement,
      codeCommune: codeCommune
    })
    //.sort({ numeroProtocole: -1 })
      .select('numeroProtocole');

    let prochainNumero = '001';


    if(dernierGIE) {
         if(dernierGIE.length > 9) {
          prochainNumero = '0'+(dernierGIE.length + 1).toString();
        }else {
          prochainNumero = '00'+ (dernierGIE.length + 1).toString();
        }

    }
      
    

    console.log('Prochain numéro de protocole:', prochainNumero);

    res.json({
      success: true,
      data: {
        prochainProtocole: prochainNumero
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du numéro de protocole',
      error: error.message
    });
  }
};

// @desc    Envoyer code de connexion GIE
// @route   POST /api/gie/envoyer-code-connexion
// @access  Private
const envoyerCodeConnexionGIE = async (req, res) => {
  try {
    const { identifiantGIE, phoneNumber } = req.body;

    if (!identifiantGIE) {
      return res.status(400).json({
        success: false,
        message: 'Identifiant GIE requis'
      });
    }

    // Rechercher le GIE
    const gie = await GIE.findOne({ 
      $or: [
        { identifiantGIE },
        { _id: identifiantGIE }
      ]
    });

    if (!gie) {
      return res.status(404).json({
        success: false,
        message: 'GIE non trouvé'
      });
    }

    // Utiliser le numéro fourni ou celui de la présidente
    const numeroDestination = phoneNumber || gie.presidenteTelephone;

    if (!numeroDestination) {
      return res.status(400).json({
        success: false,
        message: 'Aucun numéro de téléphone disponible'
      });
    }

    // Générer un code à 6 chiffres
    const codeConnexion = Math.floor(100000 + Math.random() * 900000).toString();

    // Stocker le code temporairement (expire après 15 minutes)
    gie.codeConnexionTemporaire = {
      code: codeConnexion,
      dateExpiration: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      numeroTelephone: numeroDestination
    };
    await gie.save();

    // Envoyer le code via messaging service
    const messagingResult = await messagingService.envoyerCodeConnexionGIE(
      numeroDestination,
      codeConnexion,
      gie.nomGIE
    );

    res.json({
      success: true,
      message: 'Code de connexion envoyé',
      data: {
        gieId: gie._id,
        nomGIE: gie.nomGIE,
        numeroDestination,
        codeEnvoye: true,
        messagingResult: {
          success: messagingResult.success,
          methodsUsed: messagingResult.methodsUsed,
          allMethodsFailed: messagingResult.allMethodsFailed
        },
        expirationCode: gie.codeConnexionTemporaire.dateExpiration
      }
    });

  } catch (error) {
    console.error('Erreur envoi code connexion GIE:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du code de connexion',
      error: error.message
    });
  }
};

// @desc    Vérifier code de connexion GIE
// @route   POST /api/gie/verifier-code-connexion
// @access  Public
const verifierCodeConnexionGIE = async (req, res) => {
  try {
    const { identifiantGIE, code, phoneNumber } = req.body;

    if (!identifiantGIE || !code) {
      return res.status(400).json({
        success: false,
        message: 'Identifiant GIE et code requis'
      });
    }

    // Rechercher le GIE
    const gie = await GIE.findOne({ 
      $or: [
        { identifiantGIE },
        { _id: identifiantGIE }
      ]
    });

    if (!gie) {
      return res.status(404).json({
        success: false,
        message: 'GIE non trouvé'
      });
    }

    // Vérifier si un code temporaire existe
    if (!gie.codeConnexionTemporaire) {
      return res.status(400).json({
        success: false,
        message: 'Aucun code de connexion en attente'
      });
    }

    // Vérifier l'expiration
    if (new Date() > gie.codeConnexionTemporaire.dateExpiration) {
      return res.status(400).json({
        success: false,
        message: 'Code de connexion expiré'
      });
    }

    // Vérifier le code
    if (gie.codeConnexionTemporaire.code !== code) {
      return res.status(400).json({
        success: false,
        message: 'Code de connexion invalide'
      });
    }

    // Vérifier le numéro de téléphone si fourni
    if (phoneNumber && gie.codeConnexionTemporaire.numeroTelephone !== phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Numéro de téléphone non autorisé'
      });
    }

    // Code valide - nettoyer le code temporaire
    gie.codeConnexionTemporaire = undefined;
    await gie.save();

    res.json({
      success: true,
      message: 'Code de connexion valide',
      data: {
        gieId: gie._id,
        nomGIE: gie.nomGIE,
        identifiantGIE: gie.identifiantGIE,
        connecte: true
      }
    });

  } catch (error) {
    console.error('Erreur vérification code connexion GIE:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification du code',
      error: error.message
    });
  }
};

// @desc    Obtenir les statistiques publiques des GIEs
// @route   GET /api/gie/stats-publiques
// @access  Public
const getStatsPubliques = async (req, res) => {
  try {
    // Compter le nombre total de GIEs
    const totalGIEs = await GIE.countDocuments();

    // Compter les GIEs par région
    const giesParRegion = await GIE.aggregate([
      {
        $group: {
          _id: '$region',
          nombre: { $sum: 1 }
        }
      }
    ]);

    // Compter les GIEs par secteur
    const giesParSecteur = await GIE.aggregate([
      {
        $group: {
          _id: '$secteurActivite',
          nombre: { $sum: 1 }
        }
      }
    ]);

    // Récupérer tous les GIEs pour compter les membres par genre
    const allGIEs = await GIE.find({}, { membres: 1, presidenteGenre: 1 });
    let totalMembres = 0;
    let totalFemmes = 0;
    let totalJeunes = 0;
    let totalHommes = 0;

    allGIEs.forEach(gie => {
      // Compter la présidente
      if (gie.presidenteGenre === 'femme') totalFemmes++;
      else if (gie.presidenteGenre === 'jeune') totalJeunes++;
      else if (gie.presidenteGenre === 'homme') totalHommes++;
      totalMembres++;

      // Compter les membres
      if (Array.isArray(gie.membres)) {
        gie.membres.forEach(m => {
          if (m.genre === 'femme') totalFemmes++;
          else if (m.genre === 'jeune') totalJeunes++;
          else if (m.genre === 'homme') totalHommes++;
          totalMembres++;
        });
      }
    });

    // Calculer les jours d'investissement (chaque GIE investit pendant 1826 jours sur 5 ans)
    const joursInvestissement = totalGIEs * 1826;

    res.json({
      success: true,
      message: 'Statistiques publiques FEVEO 2050',
      data: {
        totalGIEs,
        totalMembres,
        membresParGenre: {
          femmes: totalFemmes,
          jeunes: totalJeunes,
          hommes: totalHommes
        },
        // Format pour correspondre à l'interface StatsPubliques du frontend
        estimations: {
          femmes: totalFemmes,
          jeunes: totalJeunes,
          adultes: totalHommes  // 'adultes' dans le frontend correspond à 'hommes' dans le backend
        },
        joursInvestissement,
        repartition: {
          regions: giesParRegion,
          secteurs: giesParSecteur
        },
        derniereMiseAJour: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erreur récupération statistiques publiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};

// @desc    Valider le paiement d'un GIE et activer l'adhésion
// @route   POST /api/gie/:id/valider-paiement
// @access  Private (Admin)
const validerPaiementGIE = async (req, res) => {
  try {
    const { id } = req.params;
    const { montantPaye, referenceTransaction, methodePaiement } = req.body;

    // Rechercher le GIE
    const gie = await GIE.findById(id);
    if (!gie) {
      return res.status(404).json({
        success: false,
        message: 'GIE non trouvé'
      });
    }

    // Vérifier si le GIE est en attente de paiement
    if (gie.statutEnregistrement !== 'en_attente_paiement') {
      return res.status(400).json({
        success: false,
        message: 'Ce GIE n\'est pas en attente de paiement'
      });
    }

    // Rechercher l'adhésion
    const adhesion = await Adhesion.findOne({ gieId: gie._id });
    if (!adhesion) {
      return res.status(404).json({
        success: false,
        message: 'Adhésion non trouvée'
      });
    }

    // Mettre à jour le statut du GIE
    gie.statutEnregistrement = 'valide';
    await gie.save();

    // Mettre à jour l'adhésion
    adhesion.validation.statut = 'validee';
    adhesion.validation.dateValidation = new Date();
    adhesion.paiement.statut = 'confirme';
    adhesion.paiement.montantPaye = montantPaye || 50000;
    adhesion.paiement.datePaiement = new Date();
    adhesion.paiement.referenceTransaction = referenceTransaction;
    adhesion.paiement.methodePaiement = methodePaiement || 'virement';
    await adhesion.save();

    // Créer le cycle d'investissement maintenant que le paiement est validé
    let cycleInvestissement = await CycleInvestissement.findOne({ gieId: gie._id });
    if (!cycleInvestissement) {
      cycleInvestissement = new CycleInvestissement({
        gieId: gie._id
      });
      cycleInvestissement.genererCalendrier();
      await cycleInvestissement.save();
    }

    // Envoi de notification de validation
    try {
      if (gie.presidenteTelephone) {
        const messagingResult = await messagingService.envoyerMessage(
          gie.presidenteTelephone,
          `🎉 Félicitations! Votre GIE "${gie.nomGIE}" a été validé. Votre adhésion à FEVEO 2050 est maintenant active. Référence: ${gie.identifiantGIE}`
        );
        console.log('Résultat notification validation:', messagingResult);
      }
    } catch (messagingError) {
      console.error('Erreur envoi notification validation:', messagingError.message);
    }

    res.json({
      success: true,
      message: 'Paiement validé et GIE activé avec succès',
      data: {
        gie,
        adhesion,
        cycleInvestissement: {
          id: cycleInvestissement._id,
          dateDebut: cycleInvestissement.dateDebut,
          dateFin: cycleInvestissement.dateFin,
          dureeJours: cycleInvestissement.dureeJours
        }
      }
    });

  } catch (error) {
    console.error('Erreur validation paiement GIE:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la validation du paiement',
      error: error.message
    });
  }
};

// @desc    Obtenir les GIEs en attente de paiement
// @route   GET /api/gie/en-attente-paiement
// @access  Private (Admin)
const getGIEsEnAttentePaiement = async (req, res) => {
  try {
    const giesEnAttente = await GIE.find({ 
      statutEnregistrement: 'en_attente_paiement' 
    })
    .populate('geozoneDepartement')
    .populate('geozoneCommune')
    .sort({ dateCreation: -1 });

    // Récupérer les informations d'adhésion
    const giesAvecAdhesion = await Promise.all(
      giesEnAttente.map(async (gie) => {
        const adhesion = await Adhesion.findOne({ gieId: gie._id });
        return {
          ...gie.toObject(),
          adhesion
        };
      })
    );

    res.json({
      success: true,
      count: giesAvecAdhesion.length,
      data: giesAvecAdhesion
    });

  } catch (error) {
    console.error('Erreur récupération GIEs en attente:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des GIEs en attente de paiement',
      error: error.message
    });
  }
};

// @desc    Valider un GIE par son identifiant
// @route   GET /api/gie/validate/:identifiant
// @access  Public
const validateGieByIdentifiant = async (req, res) => {
  try {
    const { identifiant } = req.params;
    
    if (!identifiant) {
      return res.status(400).json({
        success: false,
        message: 'Identifiant GIE requis'
      });
    }

    console.log('🔍 Validation du GIE avec identifiant:', identifiant);

    // Rechercher le GIE par identifiantGIE en priorité
    let gie = await GIE.findOne({ identifiantGIE: identifiant });
    
    // Si pas trouvé et que l'identifiant ressemble à un ObjectId, essayer par _id
    if (!gie && identifiant.match(/^[0-9a-fA-F]{24}$/)) {
      gie = await GIE.findById(identifiant);
    }

    if (!gie) {
      return res.status(404).json({
        success: false,
        message: 'GIE non trouvé'
      });
    }

    // Vérifier l'éligibilité du GIE pour les investissements
    const eligibilite = {
      statut: gie.statutEnregistrement === 'valide',
      documentsComplets: true, // Assumé complet si enregistré
      dateCreationValide: true,
      validePourInvestissement: gie.statutEnregistrement === 'valide'
    };

    // Formater les informations du GIE pour la réponse
    const gieInfo = {
      id: gie._id,
      nom: gie.nomGIE,
      numeroRegistre: gie.identifiantGIE,
      secteurActivite: gie.secteurPrincipal || 'Agriculture',
      statut: gie.statutEnregistrement === 'valide' ? 'actif' : 'en_attente',
      validePourInvestissement: gie.statutEnregistrement === 'valide',
      documentsPourcentage: gie.statutEnregistrement === 'valide' ? 100 : 75,
      dateCreation: gie.dateEnregistrement || gie.createdAt,
      adresse: `${gie.commune}, ${gie.departement}, ${gie.region}`,
      description: gie.objectifs || `GIE spécialisé dans ${gie.secteurPrincipal}`,
      presidenteNom: gie.presidenteNom,
      presidentePrenom: gie.presidentePrenom,
      nombreMembres: gie.nombreMembres || (gie.membres ? gie.membres.length + 1 : 1),
      eligibilite
    };

    console.log('✅ GIE trouvé et validé:', gieInfo.nom);

    res.json({
      success: true,
      gie: gieInfo,
      message: 'GIE validé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur lors de la validation du GIE:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la validation du GIE',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createGIE,
  getAllGIE,
  getGIEById,
  updateGIE,
  deleteGIE,
  getGIEStats,
  getNextProtocol,
  getNextProtocolForCommune,
  envoyerCodeConnexionGIE,
  verifierCodeConnexionGIE,
  getStatsPubliques,
  validerPaiementGIE,
  getGIEsEnAttentePaiement,
  validateGieByIdentifiant
};
