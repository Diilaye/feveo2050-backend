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
        'DAKAR': '14',
        'THIES': '13',
        'SAINT-LOUIS': '11', 
        'DIOURBEL': '12',
        'KAOLACK': '07',
        'FATICK': '06',
        'KOLDA': '08',
        'ZIGUINCHOR': '09',
        'LOUGA': '10',
        'MATAM': '15',
        'KAFFRINE': '16',
        'KEDOUGOU': '17',
        'SEDHIOU': '18',
        'TAMBACOUNDA': '19'
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
    const geoCodes = extractGeographicCodes(gieData);
    processedGieData.codeRegion = geoCodes.codeRegion;
    processedGieData.codeDepartement = geoCodes.codeDepartement;
    processedGieData.codeArrondissement = geoCodes.codeArrondissement;
    processedGieData.codeCommune = geoCodes.codeCommune;
    
    // Debug: afficher les codes mappés
    console.log('Codes géographiques mappés:', {
      region: processedGieData.region,
      departement: processedGieData.departement,
      codeRegion: processedGieData.codeRegion,
      codeDepartement: processedGieData.codeDepartement,
      codeArrondissement: processedGieData.codeArrondissement,
      codeCommune: processedGieData.codeCommune
    });
    
    // Vérifier l'unicité de l'identifiant et du protocole
    const existingGIE = await GIE.findOne({
      $or: [
        { identifiantGIE: processedGieData.identifiantGIE },
        { presidenteCIN: processedGieData.presidenteCIN }
      ]
    });

    console.log(existingGIE);

    if (existingGIE) {
      return res.status(400).json({
        success: false,
        message: 'GIE avec cet identifiant, protocole ou CIN présidente existe déjà'
      });
    }

    // Créer le GIE avec statut approprié
    const gie = new GIE({
      ...processedGieData,
      // Si c'est un enregistrement public, définir le statut en attente de paiement
      statutEnregistrement: isPublicRegistration ? 'en_attente_paiement' : 'valide'
    });
    await gie.save();

    // Créer automatiquement l'adhésion avec statut approprié
    const adhesion = new Adhesion({
      gieId: gie._id,
      typeAdhesion: 'standard',
      montantAdhesion: 50000, // Montant d'adhésion FEVEO 2050
      validation: {
        statut: isPublicRegistration ? 'en_attente' : 'en_cours',
        dateValidation: isPublicRegistration ? null : new Date()
      },
      paiement: {
        statut: isPublicRegistration ? 'en_attente' : 'en_cours',
        montantPaye: isPublicRegistration ? null : 50000
      }
    });
    await adhesion.save();

    // Créer le cycle d'investissement seulement si le GIE est validé
    let cycleInvestissement = null;
    if (!isPublicRegistration) {
      cycleInvestissement = new CycleInvestissement({
        gieId: gie._id
      });
      cycleInvestissement.genererCalendrier();
      await cycleInvestissement.save();
    }

    // Envoi de la notification de création via messaging
    try {
      if (gie.presidenteTelephone) {
        console.log(`Envoi notification création GIE à ${gie.presidenteTelephone}`);
        const messagingResult = await messagingService.envoyerNotificationCreationGIE(
          gie.presidenteTelephone,
          gie.nomGIE,
          gie.identifiantGIE
        );
        
        console.log('Résultat envoi notification:', messagingResult);
      }
    } catch (messagingError) {
      console.error('Erreur envoi notification création GIE:', messagingError.message);
      // Ne pas bloquer la création du GIE en cas d'échec d'envoi du message
    }

    const responseData = {
      gie,
      adhesion,
      message: isPublicRegistration 
        ? 'GIE enregistré avec succès. En attente de validation de paiement.'
        : 'GIE créé avec succès'
    };

    // Ajouter les informations de cycle d'investissement si créé
    if (cycleInvestissement) {
      responseData.cycleInvestissement = {
        id: cycleInvestissement._id,
        dateDebut: cycleInvestissement.dateDebut,
        dateFin: cycleInvestissement.dateFin,
        dureeJours: cycleInvestissement.dureeJours
      };
    }

    res.status(201).json({
      success: true,
      message: responseData.message,
      data: responseData
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

// @desc    Générer le prochain numéro de protocole
// @route   GET /api/gie/next-protocol
// @access  Private
const getNextProtocol = async (req, res) => {
  try {
    // Trouver le dernier protocole
    const dernierGIE = await GIE.findOne()
      .sort({ numeroProtocole: -1 })
      .select('numeroProtocole');

    let prochainNumero = '001';
    
    if (dernierGIE && dernierGIE.numeroProtocole) {
      const dernierNumero = parseInt(dernierGIE.numeroProtocole);
      prochainNumero = (dernierNumero + 1).toString().padStart(3, '0');
    }

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
    // Compter le nombre total de GIEs et calculer les vrais totaux
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

    // Calculer le nombre réel de membres en additionnant les membres de chaque GIE
    const membresAggregation = await GIE.aggregate([
      {
        $project: {
          nombreMembres: { $size: '$membres' }
        }
      },
      {
        $group: {
          _id: null,
          totalMembres: { $sum: '$nombreMembres' }
        }
      }
    ]);

    const totalMembres = membresAggregation.length > 0 ? membresAggregation[0].totalMembres : 0;

    // Estimation des différentes catégories basée sur les règles FEVEO 2050
    const estimationFemmes = Math.floor(totalMembres * 0.625); // 62.5% minimum
    const estimationJeunes = Math.floor(totalMembres * 0.3);   // 30% des jeunes
    const estimationAdultes = Math.floor(totalMembres * 0.175); // Reste adultes hommes

    // Calculer les jours d'investissement (chaque GIE investit pendant 1826 jours sur 5 ans)
    const joursInvestissement = totalGIEs * 1826;

    res.json({
      success: true,
      message: 'Statistiques publiques FEVEO 2050',
      data: {
        totalGIEs,
        totalMembres,
        estimations: {
          femmes: estimationFemmes,
          jeunes: estimationJeunes,
          adultes: estimationAdultes
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

module.exports = {
  createGIE,
  getAllGIE,
  getGIEById,
  updateGIE,
  deleteGIE,
  getGIEStats,
  getNextProtocol,
  envoyerCodeConnexionGIE,
  verifierCodeConnexionGIE,
  getStatsPubliques,
  validerPaiementGIE,
  getGIEsEnAttentePaiement
};
