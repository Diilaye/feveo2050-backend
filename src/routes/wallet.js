const express = require('express');
const router = express.Router();
const GIE = require('../models/GIE');
const CycleInvestissement = require('../models/CycleInvestissement');
const Transaction = require('../models/Transaction');
const whatsappService = require('../services/whatsappService');
const { generateWavePayment } = require('../controllers/wavePaymentController');

// Import des middlewares de paiement
const { 
  injectPaymentConfig, 
  getOrangeMoneyToken, 
  validatePaymentConfig 
} = require('../middleware/paymentConfig');
const waveOrangePaiement = require('../middleware/wave-orange-paiement');

// Table temporaire pour stocker les codes WhatsApp
// En production, utilisez Redis ou une base de données
if (!global.tempWhatsAppCodes) {
  global.tempWhatsAppCodes = {};
}

// Fonction pour nettoyer les codes expirés
const cleanExpiredCodes = () => {
  const now = Date.now();
  Object.keys(global.tempWhatsAppCodes).forEach(gieCode => {
    if (global.tempWhatsAppCodes[gieCode].expires < now) {
      delete global.tempWhatsAppCodes[gieCode];
    }
  });
};

// Vérifier le code GIE et envoyer code WhatsApp
router.post('/verify-gie',  async (req, res) => {
  try {
    const { gieCode } = req.body;

    if (!gieCode) {
      return res.status(400).json({
        success: false,
        message: 'Code GIE requis'
      });
    }

    // Vérifier si le GIE existe
    const gie = await GIE.findOne({ identifiantGIE: gieCode });
    
    if (!gie) {
      return res.status(404).json({
        success: false,
        message: 'Code GIE invalide'
      });
    }

    // Vérifier que le GIE a une adhésion ou la créer si nécessaire
    const Adhesion = require('../models/Adhesion');
    let adhesion = await Adhesion.findOne({ 
      gieId: gie._id
    });

    if (!adhesion) {
      // Créer automatiquement une adhésion en attente de paiement pour ce GIE
      console.log(`📝 Création d'une adhésion automatique pour le GIE ${gieCode}`);
      
      adhesion = new Adhesion({
        gieId: gie._id,
        statutAdhesion: 'en_attente',
        statutEnregistrement: 'en_attente_paiement',
        dateCreation: new Date(),
        montantAdhesion: 25000,
        informationsGIE: {
          nomGIE: gie.nomGIE,
          identifiantGIE: gie.identifiantGIE,
          presidenteNom: gie.presidenteNom,
          presidentePrenom: gie.presidentePrenom,
          presidenteTelephone: gie.presidenteTelephone
        },
        validation: {
          statut: 'en_attente',
          dateCreation: new Date(),
          motif: 'Adhésion créée automatiquement - En attente de paiement'
        }
      });
      
      try {
        await adhesion.save();
        console.log(`✅ Adhésion créée automatiquement pour ${gieCode}`);
      } catch (saveError) {
        console.error('❌ Erreur création adhésion:', saveError);
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la création de l\'adhésion automatique',
          details: saveError.message
        });
      }
    }

    // Vérifier le statut de l'adhésion et de l'enregistrement
    const statutAdhesion = adhesion.statutAdhesion || 'en_attente';
    const statutEnregistrement = adhesion.statutEnregistrement || 'en_attente_paiement';
    const statutValidation = adhesion.validation?.statut || 'en_attente';
    
    console.log(`📊 Statuts pour ${gieCode}:`, {
      statutAdhesion,
      statutEnregistrement, 
      statutValidation,
      hasAdhesion: !!adhesion
    });
    
    // Déterminer si le GIE est pleinement activé
    const isFullyActivated = statutValidation === 'validee' && statutAdhesion === 'validee';
    
    // Créer le lien de paiement si nécessaire (mais ne pas bloquer l'accès au dashboard)
    let paymentInfo = null;
    if (!isFullyActivated && 
        (statutAdhesion === 'en_attente' || statutAdhesion === 'aucune') && 
        (statutEnregistrement === 'en_attente_paiement' || statutValidation === 'en_attente')) {
      
      console.log(`🔄 GIE ${gieCode} en attente de paiement - génération du lien (optionnel)`);
      
      try {
        // Utiliser la nouvelle route de création de paiement
        const paymentData = {
          gieCode: gieCode,
          method: 'WAVE' // Par défaut Wave, peut être configuré
        };

        // Créer le paiement via notre système (essayer d'abord avec middleware)
        let paymentResult = await createGiePaymentWithMiddleware(gie, adhesion, paymentData);
        
        // Si le middleware échoue, essayer l'approche directe
        if (!paymentResult.success) {
          console.log('🔄 Tentative avec l\'approche directe...');
          paymentResult = await createGiePayment(gie, adhesion, paymentData);
        }

        if (paymentResult.success) {
          paymentInfo = paymentResult.payment;
          console.log(`💳 Lien de paiement généré: ${paymentInfo.paymentUrl}`);
        } else {
          console.log(`⚠️ Erreur génération paiement: ${paymentResult.message}`);
        }

      } catch (paymentError) {
        console.error('❌ Erreur génération lien paiement:', paymentError);
        // Ne pas bloquer l'accès, juste loguer l'erreur
      }
    }

    // Permettre l'accès au dashboard pour tous les GIE valides, même non activés
    console.log(`🚀 Accès au dashboard autorisé pour ${gieCode} - génération du code WhatsApp`);

    // Générer et envoyer code WhatsApp
    const whatsappCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + (5 * 60 * 1000); // 5 minutes
    
    // Stocker le code temporairement
    global.tempWhatsAppCodes[gieCode] = {
      code: whatsappCode,
      phoneNumber: gie.presidenteTelephone,
      expires: expires,
      createdAt: Date.now()
    };
    
    console.log(`🔢 Code généré pour ${gieCode}: ${whatsappCode} (expire à ${new Date(expires).toLocaleTimeString()})`);
    
    // Nettoyer les codes expirés
    cleanExpiredCodes();

    // Envoyer le code via WhatsApp
    const whatsappResult = await whatsappService.sendVerificationCode(
      gie.presidenteTelephone,
      whatsappCode,
      gieCode
    );

    if (whatsappResult.success) {
      res.json({
        success: true,
        message: 'Code de vérification envoyé',
        data: {
          method: whatsappResult.method,
          messageId: whatsappResult.messageId,
          backupCode: whatsappResult.backupCode, // Code visible côté client si besoin
          whatsappNumber: gie.presidenteTelephone,
          whatsappSent: true,
          expiresIn: 300, // 5 minutes
          gieInfo: {
            code: gie.identifiantGIE,
            nom: gie.nomGIE,
            presidente: `${gie.presidentePrenom} ${gie.presidenteNom}`,
            statut: isFullyActivated ? 'active' : 'en_attente_paiement',
            isActivated: isFullyActivated
          },
          paymentInfo: paymentInfo, // Informations de paiement si disponibles
          requiresPayment: !isFullyActivated && !!paymentInfo,
          canAccessDashboard: true // Toujours true maintenant
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi du code de vérification',
        data: {
          whatsappSent: false,
          backupCode: whatsappCode, // Envoyer le code comme backup
          whatsappNumber: gie.presidenteTelephone,
          expiresIn: 300,
          gieInfo: {
            code: gie.identifiantGIE,
            nom: gie.nomGIE,
            presidente: `${gie.presidentePrenom} ${gie.presidenteNom}`,
            statut: isFullyActivated ? 'active' : 'en_attente_paiement',
            isActivated: isFullyActivated
          },
          paymentInfo: paymentInfo,
          requiresPayment: !isFullyActivated && !!paymentInfo,
          canAccessDashboard: true
        }
      });
    }  } catch (error) {
    console.error('Erreur lors de la vérification du code GIE:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// Route pour créer un paiement avec choix du provider
router.post('/create-payment', 
  injectPaymentConfig,
  validatePaymentConfig,
  getOrangeMoneyToken,
  async (req, res) => {
    try {
      const { gieCode, method = 'WAVE' } = req.body;

      if (!gieCode) {
        return res.status(400).json({
          success: false,
          message: 'Code GIE requis'
        });
      }

      // Vérifier si le GIE existe
      const gie = await GIE.findOne({ identifiantGIE: gieCode });
      
      if (!gie) {
        return res.status(404).json({
          success: false,
          message: 'Code GIE invalide'
        });
      }

      // Vérifier l'adhésion
      const Adhesion = require('../models/Adhesion');
      const adhesion = await Adhesion.findOne({ gieId: gie._id });

      if (!adhesion) {
        return res.status(404).json({
          success: false,
          message: 'Adhésion non trouvée pour ce GIE'
        });
      }

      // Préparer les données de paiement
      const paymentData = {
        amount: 25000,
        method: method.toUpperCase(),
        rv: `FEVEO_ACTIVATION_${gieCode}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        description: `Activation GIE FEVEO 2050 - ${gie.nomGIE}`,
        gieCode: gieCode
      };

      // Créer une transaction
      const transaction = new Transaction({
        reference: paymentData.rv,
        amount: paymentData.amount.toString(),
        token: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'PENDING',
        method: paymentData.method,
        gieId: gie._id,
        adhesionId: adhesion._id,
        date: new Date()
      });

      const savedTransaction = await transaction.save();

      // Modifier req.body pour le middleware de paiement
      req.body = paymentData;

      // Utiliser le middleware de paiement
      await new Promise((resolve, reject) => {
        waveOrangePaiement(req, res, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });

      // Si nous arrivons ici, le paiement a été traité avec succès
      const paymentResponse = req.paymentResponse;
      const paymentUrl = req.url;

      // Mettre à jour l'adhésion
      adhesion.paiement = {
        transactionId: paymentData.rv,
        montant: paymentData.amount,
        statut: 'en_attente',
        dateCreation: new Date(),
        lienPaiement: paymentUrl,
        dbTransactionId: savedTransaction._id,
        provider: paymentResponse?.provider || method,
        paymentData: paymentResponse
      };
      await adhesion.save();

      // Mettre à jour la transaction
      savedTransaction.paymentUrl = paymentUrl;
      savedTransaction.provider = paymentResponse?.provider || method;
      await savedTransaction.save();

      res.json({
        success: true,
        message: 'Lien de paiement généré avec succès',
        data: {
          gieInfo: {
            code: gie.identifiantGIE,
            nom: gie.nomGIE,
            presidente: `${gie.presidentePrenom} ${gie.presidenteNom}`
          },
          payment: {
            transactionId: paymentData.rv,
            paymentUrl: paymentUrl,
            amount: paymentData.amount,
            currency: 'XOF',
            provider: paymentResponse?.provider || method,
            qrCode: paymentResponse?.qrCode || null,
            checkoutId: paymentResponse?.checkoutId || null,
            dbTransactionId: savedTransaction._id
          }
        }
      });

    } catch (error) {
      console.error('❌ Erreur création paiement:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du paiement',
        error: error.message
      });
    }
  }
);

// Renvoyer le code WhatsApp
router.post('/resend-code', async (req, res) => {
  try {
    const { gieCode } = req.body;

    if (!gieCode) {
      return res.status(400).json({
        success: false,
        message: 'Code GIE requis'
      });
    }

    // Vérifier si un code existe déjà pour ce GIE
    const tempCodes = global.tempWhatsAppCodes || {};
    const existingData = tempCodes[gieCode];

    if (!existingData) {
      return res.status(400).json({
        success: false,
        message: 'Aucun code en cours pour ce GIE. Veuillez recommencer le processus.'
      });
    }

    // Générer un nouveau code
    const newWhatsappCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + (5 * 60 * 1000); // 5 minutes

    // Mettre à jour le code
    tempCodes[gieCode] = {
      ...existingData,
      code: newWhatsappCode,
      expires: expires,
      createdAt: Date.now()
    };

    console.log(`🔄 Nouveau code généré pour ${gieCode}: ${newWhatsappCode}`);

    // Tenter d'envoyer via WhatsApp
    const whatsappResult = await whatsappService.sendVerificationCode(
      existingData.phoneNumber,
      newWhatsappCode,
      gieCode
    );

    if (whatsappResult.success) {
      res.json({
        success: true,
        message: 'Nouveau code envoyé par WhatsApp',
        data: {
          whatsappSent: true,
          backupCode: newWhatsappCode,
          whatsappNumber: existingData.phoneNumber,
          expiresIn: 300
        }
      });
    } else {
      res.json({
        success: true,
        message: 'Erreur WhatsApp - Utilisez le code de secours',
        data: {
          whatsappSent: false,
          backupCode: newWhatsappCode,
          whatsappNumber: existingData.phoneNumber,
          expiresIn: 300
        }
      });
    }

  } catch (error) {
    console.error('❌ Erreur renvoi code:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// Vérifier le code WhatsApp et connecter au wallet
router.post('/verify-whatsapp', async (req, res) => {
  try {
    const { gieCode, whatsappCode } = req.body;
    console.log(req.body);

    if (!gieCode || !whatsappCode) {
      return res.status(400).json({
        success: false,
        message: 'Code GIE et code WhatsApp requis'
      });
    }

    // Vérifier le code WhatsApp
    const tempCodes = global.tempWhatsAppCodes || {};
    console.log('Temp codes:', tempCodes);
    const storedData = tempCodes[gieCode];

    console.log('Vérification du code WhatsApp pour GIE:', storedData);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: 'Code expiré ou invalide. Veuillez demander un nouveau code.',
        errorType: 'code_not_found',
        suggestion: 'Cliquez sur "Renvoyer le code" ou recommencez avec votre code GIE.'
      });
    }

    if (storedData.expires < Date.now()) {
      delete tempCodes[gieCode];
      return res.status(400).json({
        success: false,
        message: 'Code expiré. Veuillez demander un nouveau code.',
        errorType: 'code_expired',
        suggestion: 'Les codes expirent après 5 minutes. Cliquez sur "Renvoyer le code".'
      });
    }

    if (storedData.code !== whatsappCode) {
      return res.status(400).json({
        success: false,
        message: 'Code WhatsApp invalide. Vérifiez le code à 6 chiffres.',
        errorType: 'invalid_code',
        suggestion: 'Assurez-vous de saisir exactement le code reçu par WhatsApp.'
      });
    }

    // Code valide, nettoyer le code temporaire
    delete tempCodes[gieCode];

    // Récupérer les données du wallet
    const gie = await GIE.findOne({ identifiantGIE: gieCode });
    const Adhesion = require('../models/Adhesion');
    const adhesion = await Adhesion.findOne({ gieId: gie._id });
    const cycle = await CycleInvestissement.findOne({ gieId: gie._id });

    // Vérifier le statut d'activation
    const isFullyActivated = adhesion && 
                            adhesion.statutAdhesion === 'validee' && 
                            adhesion.validation?.statut === 'validee';

    // Calculer les statistiques du wallet
    const walletData = {
      gieInfo: {
        code: gie.identifiantGIE,
        nom: gie.nomGIE,
        presidente: `${gie.presidentePrenom} ${gie.presidenteNom}`,
        statut: isFullyActivated ? 'active' : 'en_attente_activation',
        isActivated: isFullyActivated,
        needsPayment: !isFullyActivated
      },
      balance: {
        current: cycle && isFullyActivated ? cycle.walletGIE.soldeActuel : 0,
        invested: cycle && isFullyActivated ? cycle.calculerMontantTotalInvesti() : 0,
        returns: cycle && isFullyActivated ? cycle.calculerRetoursTotaux() : 0
      },
      cycleInfo: {
        currentDay: cycle && isFullyActivated ? cycle.obtenirJourActuel() : 0,
        totalDays: 60,
        dailyInvestment: 6000,
        nextInvestmentDate: cycle && isFullyActivated ? cycle.obtenirProchaineDate() : new Date(),
        canInvest: isFullyActivated
      },
      transactions: cycle && isFullyActivated ? cycle.walletGIE.historique.slice(-10) : [],
      adhesionInfo: adhesion ? {
        statutAdhesion: adhesion.statutAdhesion,
        statutEnregistrement: adhesion.statutEnregistrement,
        statutValidation: adhesion.validation?.statut,
        dateCreation: adhesion.dateCreation,
        paiement: adhesion.paiement
      } : null
    };

    res.json({
      success: true,
      message: isFullyActivated ? 'Connexion au wallet réussie' : 'Accès au dashboard autorisé - Activation en attente',
      data: {
        wallet: walletData,
        sessionToken: `wallet_${gieCode}_${Date.now()}`, // Token simple pour la session
        accessLevel: isFullyActivated ? 'full' : 'limited',
        canAccessDashboard: true,
        requiresActivation: !isFullyActivated
      }
    });

  } catch (error) {
    console.error('Erreur lors de la vérification WhatsApp:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// Obtenir les données du wallet (pour rafraîchir)
router.get('/data/:gieCode', async (req, res) => {
  try {
    const { gieCode } = req.params;
    
    const gie = await GIE.findOne({ identifiantGIE: gieCode });
    if (!gie) {
      return res.status(404).json({
        success: false,
        message: 'GIE non trouvé'
      });
    }

    const Adhesion = require('../models/Adhesion');
    const adhesion = await Adhesion.findOne({ gieId: gie._id });
    const cycle = await CycleInvestissement.findOne({ gieId: gie._id });

    // Vérifier le statut d'activation
    const isFullyActivated = adhesion && 
                            adhesion.statutAdhesion === 'validee' && 
                            adhesion.validation?.statut === 'validee';

    const walletData = {
      gieInfo: {
        code: gie.identifiantGIE,
        nom: gie.nomGIE,
        presidente: `${gie.presidentePrenom} ${gie.presidenteNom}`,
        statut: isFullyActivated ? 'active' : 'en_attente_activation',
        isActivated: isFullyActivated,
        needsPayment: !isFullyActivated
      },
      balance: {
        current: cycle && isFullyActivated ? cycle.walletGIE.soldeActuel : 0,
        invested: cycle && isFullyActivated ? cycle.calculerMontantTotalInvesti() : 0,
        returns: cycle && isFullyActivated ? cycle.calculerRetoursTotaux() : 0
      },
      cycleInfo: {
        currentDay: cycle && isFullyActivated ? cycle.obtenirJourActuel() : 0,
        totalDays: 60,
        dailyInvestment: 6000,
        nextInvestmentDate: cycle && isFullyActivated ? cycle.obtenirProchaineDate() : new Date(),
        canInvest: isFullyActivated
      },
      transactions: cycle && isFullyActivated ? cycle.walletGIE.historique.slice(-10) : [],
      adhesionInfo: adhesion ? {
        statutAdhesion: adhesion.statutAdhesion,
        statutEnregistrement: adhesion.statutEnregistrement,
        statutValidation: adhesion.validation?.statut,
        dateCreation: adhesion.dateCreation,
        paiement: adhesion.paiement
      } : null,
      accessLevel: isFullyActivated ? 'full' : 'limited',
      canAccessDashboard: true,
      requiresActivation: !isFullyActivated
    };

    res.json({
      success: true,
      data: walletData
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des données wallet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// Endpoint de test WhatsApp
router.post('/test-whatsapp', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Numéro de téléphone requis'
      });
    }

    const testMessage = message || 'Test de connexion FEVEO 2050 WhatsApp API 🌱';
    const result = await whatsappService.sendTextMessage(phoneNumber, testMessage);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Message WhatsApp envoyé avec succès',
        data: result
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Échec envoi WhatsApp',
        error: result.error
      });
    }

  } catch (error) {
    console.error('❌ Erreur test WhatsApp:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// Vérifier le statut du token WhatsApp
router.get('/whatsapp-status', async (req, res) => {
  try {
    const status = await whatsappService.testConnection();
    
    res.json({
      success: true,
      whatsappStatus: status.success ? 'connected' : 'disconnected',
      data: status
    });

  } catch (error) {
    console.error('❌ Erreur vérification WhatsApp:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// Forcer le renouvellement du token WhatsApp
router.post('/refresh-whatsapp-token', async (req, res) => {
  try {
    console.log('🔄 Renouvellement forcé du token WhatsApp...');
    
    // Forcer la récupération d'un nouveau token
    whatsappService.tokenCache = { token: null, expiresAt: null };
    const newToken = await whatsappService.refreshAccessToken();
    
    // Tester le nouveau token
    const testResult = await whatsappService.testConnection();
    
    res.json({
      success: true,
      message: 'Token WhatsApp renouvelé',
      data: {
        tokenRefreshed: newToken !== whatsappService.accessToken,
        connectionStatus: testResult.success ? 'connected' : 'failed',
        tokenPreview: newToken ? `${newToken.substring(0, 20)}...` : 'N/A'
      }
    });

  } catch (error) {
    console.error('❌ Erreur renouvellement token:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du renouvellement du token'
    });
  }
});

// Mettre à jour le token manuellement
router.post('/update-whatsapp-token', async (req, res) => {
  try {
    const { accessToken, appSecret } = req.body;
    
    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Token d\'accès requis'
      });
    }

    // Mettre à jour le token dans le service
    whatsappService.accessToken = accessToken;
    
    if (appSecret) {
      whatsappService.appSecret = appSecret;
    }
    
    // Tester le nouveau token
    const testResult = await whatsappService.testConnection();
    
    if (testResult.success) {
      res.json({
        success: true,
        message: 'Token WhatsApp mis à jour avec succès',
        data: {
          connectionStatus: 'connected',
          tokenPreview: `${accessToken.substring(0, 20)}...`
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Token invalide',
        error: testResult.error
      });
    }

  } catch (error) {
    console.error('❌ Erreur mise à jour token:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// Debug: Voir les codes temporaires (dev uniquement)
router.get('/debug-codes', async (req, res) => {
  try {
    // Nettoyer les codes expirés d'abord
    cleanExpiredCodes();
    
    const now = Date.now();
    const codes = Object.keys(global.tempWhatsAppCodes).map(gieCode => {
      const data = global.tempWhatsAppCodes[gieCode];
      return {
        gieCode,
        code: data.code,
        phoneNumber: data.phoneNumber,
        expiresIn: Math.max(0, Math.floor((data.expires - now) / 1000)),
        createdAt: new Date(data.createdAt).toLocaleString()
      };
    });
    
    res.json({
      success: true,
      message: `${codes.length} codes actifs`,
      data: {
        codes,
        totalCodes: codes.length,
        timestamp: new Date().toLocaleString()
      }
    });

  } catch (error) {
    console.error('❌ Erreur debug codes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// Debug: Lister les GIE disponibles (dev uniquement)
router.get('/debug-gie-list', async (req, res) => {
  try {
    const gies = await GIE.find({}, {
      identifiantGIE: 1,
      nomGIE: 1,
      presidenteNom: 1,
      presidentePrenom: 1,
      presidenteTelephone: 1,
      _id: 1
    }).limit(20);
    
    const Adhesion = require('../models/Adhesion');
    const gieList = await Promise.all(gies.map(async (gie) => {
      const adhesion = await Adhesion.findOne({ gieId: gie._id });
      return {
        code: gie.identifiantGIE,
        nom: gie.nomGIE,
        presidente: `${gie.presidentePrenom} ${gie.presidenteNom}`,
        telephone: gie.presidenteTelephone,
        hasAdhesion: !!adhesion,
        statutAdhesion: adhesion?.statutAdhesion || 'aucune',
        statutEnregistrement: adhesion?.statutEnregistrement || 'aucun'
      };
    }));
    
    res.json({
      success: true,
      message: `${gieList.length} GIE trouvés`,
      data: {
        gies: gieList,
        total: gieList.length
      }
    });

  } catch (error) {
    console.error('❌ Erreur debug GIE:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// Route pour valider et activer directement un GIE (bypass du paiement)
router.post('/validate-and-activate-gie', async (req, res) => {
  try {
    const { gieCode, transactionId, forceActivation = false } = req.body;

    if (!gieCode) {
      return res.status(400).json({
        success: false,
        message: 'Code GIE requis'
      });
    }

    console.log(`🔄 Validation et activation directe du GIE: ${gieCode}`);

    // Vérifier si le GIE existe
    const gie = await GIE.findOne({ identifiantGIE: gieCode });
    
    if (!gie) {
      return res.status(404).json({
        success: false,
        message: 'Code GIE invalide'
      });
    }

    // Vérifier l'adhésion
    const Adhesion = require('../models/Adhesion');
    let adhesion = await Adhesion.findOne({ gieId: gie._id });

    if (!adhesion) {
      if (!forceActivation) {
        return res.status(404).json({
          success: false,
          message: 'Adhésion non trouvée pour ce GIE. Utilisez forceActivation=true pour créer automatiquement.'
        });
      }

      // Créer automatiquement une adhésion
      console.log(`📝 Création automatique d'adhésion pour ${gieCode}`);
      adhesion = new Adhesion({
        gieId: gie._id,
        statutAdhesion: 'en_attente',
        statutEnregistrement: 'en_attente_paiement',
        dateCreation: new Date(),
        montantAdhesion: 25000,
        informationsGIE: {
          nomGIE: gie.nomGIE,
          identifiantGIE: gie.identifiantGIE,
          presidenteNom: gie.presidenteNom,
          presidentePrenom: gie.presidentePrenom,
          presidenteTelephone: gie.presidenteTelephone
        },
        validation: {
          statut: 'en_attente',
          dateCreation: new Date(),
          motif: 'Adhésion créée automatiquement pour validation directe'
        }
      });
      await adhesion.save();
    }

    // Vérifier si le GIE est déjà activé
    if (adhesion.statutAdhesion === 'validee' && adhesion.validation?.statut === 'validee') {
      return res.json({
        success: true,
        message: 'GIE déjà activé',
        data: {
          gieCode: gieCode,
          nomGIE: gie.nomGIE,
          statut: 'already_active',
          dateActivation: adhesion.validation.dateValidation,
          walletAccessible: true
        }
      });
    }

    // Créer ou récupérer une transaction
    let transaction = null;
    let finalTransactionId = transactionId;

    if (transactionId) {
      // Vérifier si la transaction existe
      transaction = await Transaction.findOne({ reference: transactionId });
    }

    if (!transaction) {
      // Créer une nouvelle transaction de validation
      finalTransactionId = `FEVEO_VALIDATION_${gieCode}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      transaction = new Transaction({
        reference: finalTransactionId,
        amount: '25000',
        token: `token_validation_${Date.now()}`,
        status: 'SUCCESS', // Marquer directement comme succès
        method: 'WAVE', // Utiliser une valeur valide du modèle
        gieId: gie._id,
        adhesionId: adhesion._id,
        date: new Date(),
        paymentUrl: 'VALIDATION_DIRECTE',
        provider: 'SYSTEM'
      });
      await transaction.save();
      console.log(`💳 Transaction de validation créée: ${finalTransactionId}`);
    } else {
      // Mettre à jour la transaction existante
      transaction.status = 'SUCCESS';
      transaction.provider = transaction.provider || 'MANUAL_VALIDATION';
      await transaction.save();
      console.log(`💳 Transaction existante validée: ${finalTransactionId}`);
    }

    // Mettre à jour l'adhésion avec les informations de paiement
    adhesion.paiement = {
      transactionId: finalTransactionId,
      montant: 25000,
      statut: 'complete', // Utiliser une valeur valide du modèle
      dateCreation: new Date(),
      dateConfirmation: new Date(),
      lienPaiement: 'VALIDATION_DIRECTE',
      dbTransactionId: transaction._id,
      provider: 'VALIDATION_DIRECTE',
      paymentData: {
        provider: 'VALIDATION_DIRECTE',
        validationType: 'MANUAL',
        validatedAt: new Date()
      }
    };

    // Activer le GIE directement
    await activateGIE(gie, adhesion, finalTransactionId);

    console.log(`✅ GIE ${gieCode} validé et activé avec succès`);

    // Envoyer notification WhatsApp de confirmation
    try {
      await whatsappService.sendTextMessage(
        gie.presidenteTelephone,
        `🎉 Félicitations ! Votre GIE "${gie.nomGIE}" (${gieCode}) a été activé avec succès.\n\n✅ Validation effectuée\n💰 Wallet FEVEO 2050 maintenant accessible\n\nVous pouvez désormais accéder à votre wallet et commencer vos investissements.`
      );
      console.log(`📱 Notification WhatsApp envoyée à ${gie.presidenteTelephone}`);
    } catch (whatsappError) {
      console.log('⚠️ Erreur envoi notification WhatsApp:', whatsappError.message);
    }

    res.json({
      success: true,
      message: 'GIE validé et activé avec succès',
      data: {
        gieCode: gieCode,
        nomGIE: gie.nomGIE,
        presidente: `${gie.presidentePrenom} ${gie.presidenteNom}`,
        telephone: gie.presidenteTelephone,
        statut: 'activated',
        dateActivation: new Date(),
        transactionId: finalTransactionId,
        transactionStatus: 'SUCCESS',
        walletAccessible: true,
        adhesion: {
          statutAdhesion: adhesion.statutAdhesion,
          statutEnregistrement: adhesion.statutEnregistrement,
          statutValidation: adhesion.validation?.statut
        }
      }
    });

  } catch (error) {
    console.error('❌ Erreur validation directe GIE:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la validation directe du GIE',
      error: error.message
    });
  }
});

// Route pour lister les GIE en attente de validation
router.get('/pending-validation', async (req, res) => {
  try {
    const Adhesion = require('../models/Adhesion');
    
    // Récupérer tous les GIE en attente
    const adhesionsEnAttente = await Adhesion.find({
      $or: [
        { statutAdhesion: 'en_attente' },
        { statutEnregistrement: 'en_attente_paiement' },
        { 'validation.statut': 'en_attente' }
      ]
    }).populate('gieId');

    const giesPendingList = await Promise.all(
      adhesionsEnAttente.map(async (adhesion) => {
        if (!adhesion.gieId) return null;
        
        const gie = adhesion.gieId;
        
        // Compter les transactions pour ce GIE
        const transactionCount = await Transaction.countDocuments({ gieId: gie._id });
        
        return {
          gieCode: gie.identifiantGIE,
          nomGIE: gie.nomGIE,
          presidente: `${gie.presidentePrenom} ${gie.presidenteNom}`,
          telephone: gie.presidenteTelephone,
          statutAdhesion: adhesion.statutAdhesion,
          statutEnregistrement: adhesion.statutEnregistrement,
          statutValidation: adhesion.validation?.statut || 'non_defini',
          dateCreation: adhesion.dateCreation,
          montantAdhesion: adhesion.montantAdhesion,
          hasPayment: !!adhesion.paiement,
          paymentStatus: adhesion.paiement?.statut || 'aucun',
          transactionCount: transactionCount,
          canActivate: true
        };
      })
    );

    // Filtrer les nulls
    const validGies = giesPendingList.filter(gie => gie !== null);

    res.json({
      success: true,
      message: `${validGies.length} GIE(s) en attente de validation`,
      data: {
        gies: validGies,
        total: validGies.length,
        summary: {
          enAttente: validGies.filter(g => g.statutValidation === 'en_attente').length,
          enAttentePaiement: validGies.filter(g => g.statutEnregistrement === 'en_attente_paiement').length,
          avecPaiement: validGies.filter(g => g.hasPayment).length
        }
      }
    });

  } catch (error) {
    console.error('❌ Erreur récupération GIE en attente:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des GIE en attente'
    });
  }
});

// Route pour valider plusieurs GIE en lot
router.post('/batch-validate-gies', async (req, res) => {
  try {
    const { gieCodes, forceActivation = false } = req.body;

    if (!gieCodes || !Array.isArray(gieCodes) || gieCodes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Liste de codes GIE requise (array)'
      });
    }

    console.log(`🔄 Validation en lot de ${gieCodes.length} GIE(s)`);

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const gieCode of gieCodes) {
      try {
        // Appeler la validation pour chaque GIE
        const gieResult = await validateAndActivateGie(gieCode, forceActivation);
        results.push({
          gieCode: gieCode,
          success: true,
          data: gieResult
        });
        successCount++;
        console.log(`✅ ${gieCode} validé avec succès`);
      } catch (error) {
        results.push({
          gieCode: gieCode,
          success: false,
          error: error.message
        });
        errorCount++;
        console.error(`❌ Erreur pour ${gieCode}:`, error.message);
      }
    }

    res.json({
      success: true,
      message: `Validation en lot terminée: ${successCount} succès, ${errorCount} erreurs`,
      data: {
        results: results,
        summary: {
          total: gieCodes.length,
          success: successCount,
          errors: errorCount,
          successRate: Math.round((successCount / gieCodes.length) * 100)
        }
      }
    });

  } catch (error) {
    console.error('❌ Erreur validation en lot:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la validation en lot'
    });
  }
});

// Confirmer le paiement et activer le GIE
router.post('/confirm-payment', async (req, res) => {
  try {
    const { transactionId, gieCode } = req.body;

    if (!transactionId || !gieCode) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID et code GIE requis'
      });
    }

    // Vérifier le GIE
    const gie = await GIE.findOne({ identifiantGIE: gieCode });
    if (!gie) {
      return res.status(404).json({
        success: false,
        message: 'Code GIE invalide'
      });
    }

    // Vérifier l'adhésion et la transaction
    const Adhesion = require('../models/Adhesion');
    const adhesion = await Adhesion.findOne({ 
      gieId: gie._id,
      'paiement.transactionId': transactionId
    });

    // Vérifier aussi dans la table transactions
    const transaction = await Transaction.findOne({
      reference: transactionId,
      gieId: gie._id
    });

    if (!adhesion && !transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction non trouvée'
      });
    }

    // Vérifier la transaction dans la table transactions
    const dbTransaction = await Transaction.findOne({ reference: transactionId });
    
    if (!dbTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction non trouvée en base de données'
      });
    }

    console.log(`🔍 Vérification paiement: ${transactionId}, statut actuel: ${dbTransaction.status}`);

    // Vérifier si le paiement est déjà confirmé
    if (dbTransaction.status === 'SUCCESS' && adhesion.paiement.statut === 'complete') {
      return res.json({
        success: true,
        message: 'Paiement déjà confirmé',
        data: {
          gieCode: gieCode,
          statut: 'active',
          dateActivation: adhesion.paiement.dateConfirmation,
          transactionStatus: dbTransaction.status
        }
      });
    }

    // Simuler la vérification du paiement auprès de Wave
    // En production, faire un appel à l'API Wave pour vérifier le statut
    const paymentVerified = await verifyPaymentWithWave(transactionId);

    if (paymentVerified.success && paymentVerified.status === 'completed') {
      // Mettre à jour le statut de la transaction en base
      dbTransaction.status = 'SUCCESS';
      await dbTransaction.save();

      // Activer le GIE
      await activateGIE(gie, adhesion, transactionId);

      console.log(`✅ Paiement confirmé et GIE activé: ${gieCode}`);

      // Envoyer notification WhatsApp de confirmation
      try {
        await whatsappService.sendTextMessage(
          gie.presidenteTelephone,
          `🎉 Félicitations ! Votre GIE "${gie.nomGIE}" (${gieCode}) a été activé avec succès.\n\n✅ Paiement confirmé\n💰 Wallet FEVEO 2050 maintenant accessible\n\nVous pouvez désormais accéder à votre wallet et commencer vos investissements.`
        );
      } catch (whatsappError) {
        console.log('⚠️ Erreur envoi notification WhatsApp:', whatsappError.message);
      }

      res.json({
        success: true,
        message: 'Paiement confirmé et GIE activé',
        data: {
          gieCode: gieCode,
          statut: 'active',
          dateActivation: new Date(),
          transactionId: transactionId,
          transactionStatus: 'SUCCESS',
          walletAccessible: true
        }
      });

    } else {
      // Mettre à jour le statut d'échec si nécessaire
      if (paymentVerified.status === 'failed') {
        dbTransaction.status = 'CANCELED';
        await dbTransaction.save();
      }

      res.status(400).json({
        success: false,
        message: 'Paiement non confirmé ou en échec',
        data: {
          paymentStatus: paymentVerified.status || 'unknown',
          transactionId: transactionId,
          transactionStatus: dbTransaction.status
        }
      });
    }

  } catch (error) {
    console.error('❌ Erreur confirmation paiement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// Fonction pour vérifier le paiement avec Wave (simulation)
async function verifyPaymentWithWave(transactionId) {
  try {
    // En production, faire un appel réel à l'API Wave
    // const response = await fetch(`${WAVE_API_BASE}/payments/${transactionId}`, {
    //   headers: { 'Authorization': `Bearer ${WAVE_TOKEN}` }
    // });
    // return await response.json();

    // Simulation pour le développement
    console.log(`🔍 Vérification paiement Wave: ${transactionId}`);
    
    // Simuler un délai de vérification
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simuler un succès dans 90% des cas
    const isSuccessful = Math.random() > 0.1;
    
    return {
      success: true,
      status: isSuccessful ? 'completed' : 'failed',
      transactionId: transactionId,
      amount: 25000,
      currency: 'XOF',
      verifiedAt: new Date()
    };

  } catch (error) {
    console.error('❌ Erreur vérification Wave:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Fonction pour activer le GIE
async function activateGIE(gie, adhesion, transactionId) {
  try {
    console.log(`✅ Activation du GIE ${gie.identifiantGIE}`);

    // Mettre à jour l'adhésion
    adhesion.statutAdhesion = 'validee';
    adhesion.statutEnregistrement = 'valide';
    adhesion.paiement.statut = 'complete';
    adhesion.paiement.dateConfirmation = new Date();
    
    // Ajouter la validation
    adhesion.validation = {
      statut: 'validee',
      dateValidation: new Date(),
      validePar: 'SYSTEME_PAIEMENT',
      motif: 'Activation automatique suite au paiement confirmé'
    };

    await adhesion.save();

    // Créer ou initialiser le cycle d'investissement
    let cycle = await CycleInvestissement.findOne({ gieId: gie._id });
    
    if (!cycle) {
      cycle = new CycleInvestissement({
        gieId: gie._id,
        dateDebut: new Date(),
        walletGIE: {
          soldeActuel: 0,
          historique: [{
            type: 'bonus', // Utiliser une valeur valide du modèle
            montant: 0,
            description: 'Activation du wallet FEVEO 2050',
            date: new Date(),
            soldeApres: 0, // Ajouter le champ requis
            transactionId: transactionId
          }]
        }
      });
      await cycle.save();
    }

    console.log(`✅ GIE ${gie.identifiantGIE} activé avec succès`);
    return true;

  } catch (error) {
    console.error('❌ Erreur activation GIE:', error);
    throw error;
  }
}

// Vérifier le statut d'activation d'un GIE
router.get('/activation-status/:gieCode', async (req, res) => {
  try {
    const { gieCode } = req.params;

    const gie = await GIE.findOne({ identifiantGIE: gieCode });
    if (!gie) {
      return res.status(404).json({
        success: false,
        message: 'Code GIE invalide'
      });
    }

    const Adhesion = require('../models/Adhesion');
    const adhesion = await Adhesion.findOne({ gieId: gie._id });

    if (!adhesion) {
      return res.status(404).json({
        success: false,
        message: 'Adhésion non trouvée'
      });
    }

    const status = {
      gieCode: gieCode,
      nomGIE: gie.nomGIE,
      statutAdhesion: adhesion.statutAdhesion,
      statutEnregistrement: adhesion.statutEnregistrement,
      statutValidation: adhesion.validation?.statut || 'non_defini',
      walletAccessible: adhesion.statutAdhesion === 'validee' && adhesion.validation?.statut === 'validee',
      requiresPayment: adhesion.statutAdhesion === 'en_attente' && adhesion.statutEnregistrement === 'en_attente_paiement'
    };

    if (status.requiresPayment && adhesion.paiement) {
      status.paiement = {
        transactionId: adhesion.paiement.transactionId,
        montant: adhesion.paiement.montant,
        statut: adhesion.paiement.statut,
        lienPaiement: adhesion.paiement.lienPaiement,
        dateCreation: adhesion.paiement.dateCreation
      };
    }

    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('❌ Erreur vérification statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// Test simplifié de l'API Wave
router.post('/test-wave-simple', async (req, res) => {
  try {
    const axios = require('axios');
    const { paymentConfig: config } = require('../middleware/paymentConfig');
    
    const testAmount = req.body.amount || 1000;
    const testRef = `TEST_${Date.now()}`;
    
    // Payload ultra-simplifié
    const simplePayload = {
      "amount": testAmount,
      "currency": "XOF",
      "error_url": "https://feveo2050.sn/error",
      "success_url": "https://feveo2050.sn/success"
    };

    console.log('🧪 Test Wave simple avec payload:', JSON.stringify(simplePayload, null, 2));
    console.log('🔑 Token:', config.wave.token.substring(0, 30) + '...');

    const response = await axios.post(config.wave.apiUrl, simplePayload, {
      headers: { 
        'Authorization': 'Bearer ' + config.wave.token, 
        'Content-Type': 'application/json'
      }
    });
    
    res.json({
      success: true,
      message: 'Test Wave simple réussi',
      data: {
        paymentUrl: response.data.wave_launch_url,
        responseData: response.data,
        testPayload: simplePayload
      }
    });

  } catch (error) {
    console.error('❌ Erreur test Wave simple:', error.response?.data || error.message);
    
    res.status(500).json({
      success: false,
      message: 'Erreur test Wave simple',
      error: {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      }
    });
  }
});

// Debug: Tester l'API Wave directement
router.post('/debug-wave-payment', async (req, res) => {
  try {
    const axios = require('axios');
    const { paymentConfig: config } = require('../middleware/paymentConfig');
    
    const testAmount = req.body.amount || 1000; // Montant de test
    const testRef = `TEST_${Date.now()}`;
    
    const wavePayload = {
      "amount": testAmount,
      "currency": "XOF",
      "error_url": `https://api.feveo2050.sn/api/wallet/payment-error?rv=${testRef}`,
      "success_url": `https://api.feveo2050.sn/api/wallet/payment-success?rv=${testRef}`
    };

    console.log('🧪 Test Wave API avec payload:', JSON.stringify(wavePayload, null, 2));
    console.log('🔑 URL:', config.wave.apiUrl);
    console.log('🔑 Token:', config.wave.token.substring(0, 30) + '...');

    const waveConfig = {
      method: 'post',
      url: config.wave.apiUrl,
      headers: { 
        'Authorization': 'Bearer ' + config.wave.token, 
        'Content-Type': 'application/json'
      },
      data: wavePayload
    };

    const response = await axios.request(waveConfig);
    
    res.json({
      success: true,
      message: 'Test Wave API réussi',
      data: {
        paymentUrl: response.data.wave_launch_url,
        responseData: response.data,
        testPayload: wavePayload
      }
    });

  } catch (error) {
    console.error('❌ Erreur test Wave:', error.response?.data || error.message);
    
    res.status(500).json({
      success: false,
      message: 'Erreur test Wave API',
      error: {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      }
    });
  }
});

// Consulter l'historique des transactions d'un GIE
router.get('/transactions/:gieCode', async (req, res) => {
  try {
    const { gieCode } = req.params;

    const gie = await GIE.findOne({ identifiantGIE: gieCode });
    if (!gie) {
      return res.status(404).json({
        success: false,
        message: 'Code GIE invalide'
      });
    }

    const Adhesion = require('../models/Adhesion');
    const adhesion = await Adhesion.findOne({ gieId: gie._id });

    if (!adhesion) {
      return res.status(404).json({
        success: false,
        message: 'Adhésion non trouvée'
      });
    }

    // Rechercher toutes les transactions liées à ce GIE via les références
    const transactions = await Transaction.find({
      reference: { $regex: `FEVEO_ACTIVATION_${gieCode}` }
    }).sort({ date: -1 });

    const transactionHistory = transactions.map(transaction => ({
      id: transaction._id,
      reference: transaction.reference,
      amount: parseInt(transaction.amount),
      status: transaction.status,
      method: transaction.method,
      date: transaction.date,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt
    }));

    res.json({
      success: true,
      message: `${transactions.length} transaction(s) trouvée(s)`,
      data: {
        gieInfo: {
          code: gie.identifiantGIE,
          nom: gie.nomGIE,
          presidente: `${gie.presidentePrenom} ${gie.presidenteNom}`
        },
        transactions: transactionHistory,
        totalTransactions: transactions.length,
        totalAmount: transactionHistory.reduce((sum, t) => sum + t.amount, 0)
      }
    });

  } catch (error) {
    console.error('❌ Erreur consultation transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// Route pour obtenir la liste des membres d'un GIE
router.get('/members/:gieCode', async (req, res) => {
  try {
    const { gieCode } = req.params;

    // Vérifier le GIE
    const gie = await GIE.findOne({ identifiantGIE: gieCode });
    if (!gie) {
      return res.status(404).json({
        success: false,
        message: 'Code GIE invalide'
      });
    }

    // Vérifier l'accès (adhésion)
    const Adhesion = require('../models/Adhesion');
    const adhesion = await Adhesion.findOne({ gieId: gie._id });
    
    if (!adhesion) {
      return res.status(404).json({
        success: false,
        message: 'Adhésion non trouvée'
      });
    }

    // Récupérer les membres (si le champ existe dans le modèle GIE)
    const membres = gie.membres || [];

    res.json({
      success: true,
      message: `${membres.length} membre(s) trouvé(s)`,
      data: {
        gieInfo: {
          code: gie.identifiantGIE,
          nom: gie.nomGIE,
          presidente: `${gie.presidentePrenom} ${gie.presidenteNom}`
        },
        membres: membres,
        totalMembres: membres.length,
        limiteMaximum: 40,
        peutAjouter: membres.length < 40
      }
    });

  } catch (error) {
    console.error('❌ Erreur récupération membres:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// Route pour ajouter un nouveau membre à un GIE
router.post('/members/:gieCode/add', async (req, res) => {
  console.log('🚀 Route POST /members/:gieCode/add appelée');
  
  try {
    const { gieCode } = req.params;
    const { nom, prenom, telephone, fonction = 'Membre', genre = null, cin = null } = req.body;

    console.log(`📝 Début traitement pour GIE ${gieCode}`);

    // Validation simple
    if (!nom || !prenom || !telephone) {
      console.log('❌ Validation échouée');
      return res.status(400).json({
        success: false,
        message: 'Nom, prénom et téléphone sont obligatoires'
      });
    }

    console.log('✅ Validation réussie');

    // Vérifier le GIE avec timeout
    console.log(`🔍 Recherche du GIE: ${gieCode}`);
    const gie = await GIE.findOne({ identifiantGIE: gieCode }).maxTimeMS(5000);
    if (!gie) {
      console.log('❌ GIE non trouvé');
      return res.status(404).json({
        success: false,
        message: 'Code GIE invalide'
      });
    }

    console.log(`✅ GIE trouvé: ${gie.nomGIE}, membres actuels: ${gie.membres?.length || 0}`);

    // Vérifier l'accès avec timeout
    console.log('🔍 Recherche adhésion...');
    const Adhesion = require('../models/Adhesion');
    const adhesion = await Adhesion.findOne({ gieId: gie._id }).maxTimeMS(5000);
    
    if (!adhesion) {
      console.log('❌ Adhésion non trouvée');
      return res.status(404).json({
        success: false,
        message: 'Adhésion non trouvée'
      });
    }

    console.log(`✅ Adhésion trouvée, statut: ${adhesion.statutAdhesion}`);

    // Vérifications métier
    if (!gie.membres) {
      gie.membres = [];
      console.log('📝 Tableau membres initialisé');
    }

    if (gie.membres.length >= 40) {
      console.log('❌ Limite de 40 membres atteinte');
      return res.status(400).json({
        success: false,
        message: 'Limite maximale de 40 membres atteinte'
      });
    }

    const telephoneExiste = gie.membres.some(membre => membre.telephone === telephone);
    if (telephoneExiste) {
      console.log('❌ Téléphone déjà utilisé');
      return res.status(400).json({
        success: false,
        message: 'Ce numéro de téléphone est déjà utilisé par un autre membre'
      });
    }

    // Créer le nouveau membre
    const nouveauMembre = {
      nom: nom.trim(),
      prenom: prenom.trim(),
      fonction: fonction || 'Membre',
      cin: cin || null,
      telephone: telephone.trim(),
      genre: genre || null
    };

    console.log('📝 Nouveau membre créé:', nouveauMembre);

    // Ajouter et sauvegarder avec timeout
    gie.membres.push(nouveauMembre);
    console.log(`📝 Membre ajouté au tableau, sauvegarde...`);
    
    const savedGie = await gie.save();
    console.log(`✅ Sauvegarde réussie, membres finaux: ${savedGie.membres.length}`);

    res.json({
      success: true,
      message: 'Membre ajouté avec succès',
      data: {
        membre: nouveauMembre,
        totalMembres: gie.membres.length,
        limiteMaximum: 40,
        peutAjouter: gie.membres.length < 40
      }
    });

    console.log(`🎉 Membre ajouté avec succès: ${prenom} ${nom}`);

  } catch (error) {
    console.error('❌ Erreur détaillée:', {
      message: error.message,
      name: error.name,
      code: error.code
    });
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout du membre',
      error: error.message
    });
  }
});

// Route pour modifier un membre existant
router.put('/members/:gieCode/:membreId', async (req, res) => {
  try {
    const { gieCode, membreId } = req.params;
    const { nom, prenom, telephone, role, dateNaissance, profession, adresse, statut } = req.body;

    // Vérifier le GIE
    const gie = await GIE.findOne({ identifiantGIE: gieCode });
    if (!gie) {
      return res.status(404).json({
        success: false,
        message: 'Code GIE invalide'
      });
    }

    // Vérifier l'accès
    const Adhesion = require('../models/Adhesion');
    const adhesion = await Adhesion.findOne({ gieId: gie._id });
    
    if (!adhesion) {
      return res.status(404).json({
        success: false,
        message: 'Adhésion non trouvée'
      });
    }

    // Trouver le membre à modifier (compatible avec _id MongoDB)
    const membreIndex = gie.membres.findIndex(membre => 
      membre._id && membre._id.toString() === membreId || 
      membre.id === membreId
    );
    if (membreIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Membre non trouvé'
      });
    }

    const membre = gie.membres[membreIndex];

    // Vérifier si le nouveau téléphone existe déjà (si modifié)
    if (telephone && telephone !== membre.telephone) {
      const telephoneExiste = gie.membres.some((m, index) => 
        index !== membreIndex && m.telephone === telephone
      );
      if (telephoneExiste) {
        return res.status(400).json({
          success: false,
          message: 'Ce numéro de téléphone est déjà utilisé par un autre membre'
        });
      }
    }

    // Mettre à jour les champs modifiés (compatible avec structure existante)
    if (nom) membre.nom = nom.trim();
    if (prenom) membre.prenom = prenom.trim();
    if (telephone) membre.telephone = telephone.trim();
    if (role) {
      membre.role = role;
      membre.fonction = role; // Maintenir compatibilité
    }
    if (dateNaissance) membre.dateNaissance = new Date(dateNaissance);
    if (profession !== undefined) membre.profession = profession?.trim() || null;
    if (adresse !== undefined) membre.adresse = adresse?.trim() || null;
    if (statut) membre.statut = statut;
    
    // Marquer comme modifié
    membre.dateModification = new Date();

    // Sauvegarder
    await gie.save();

    console.log(`👥 Membre modifié dans le GIE ${gieCode}: ${membre.prenom} ${membre.nom}`);

    res.json({
      success: true,
      message: 'Membre modifié avec succès',
      data: {
        membre: membre,
        totalMembres: gie.membres.length
      }
    });

  } catch (error) {
    console.error('❌ Erreur modification membre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du membre'
    });
  }
});

// Route pour supprimer un membre
router.delete('/members/:gieCode/:membreId', async (req, res) => {
  try {
    const { gieCode, membreId } = req.params;

    // Vérifier le GIE
    const gie = await GIE.findOne({ identifiantGIE: gieCode });
    if (!gie) {
      return res.status(404).json({
        success: false,
        message: 'Code GIE invalide'
      });
    }

    // Vérifier l'accès
    const Adhesion = require('../models/Adhesion');
    const adhesion = await Adhesion.findOne({ gieId: gie._id });
    
    if (!adhesion) {
      return res.status(404).json({
        success: false,
        message: 'Adhésion non trouvée'
      });
    }

    // Trouver et supprimer le membre (compatible avec _id MongoDB)
    const membreIndex = gie.membres.findIndex(membre => 
      membre._id && membre._id.toString() === membreId || 
      membre.id === membreId
    );
    if (membreIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Membre non trouvé'
      });
    }

    const membreSuprime = gie.membres[membreIndex];
    gie.membres.splice(membreIndex, 1);

    // Sauvegarder
    await gie.save();

    console.log(`👥 Membre supprimé du GIE ${gieCode}: ${membreSuprime.prenom} ${membreSuprime.nom}`);

    res.json({
      success: true,
      message: 'Membre supprimé avec succès',
      data: {
        membreSuprime: {
          id: membreSuprime._id || membreSuprime.id,
          nom: membreSuprime.nom,
          prenom: membreSuprime.prenom
        },
        totalMembres: gie.membres.length,
        peutAjouter: gie.membres.length < 40
      }
    });

  } catch (error) {
    console.error('❌ Erreur suppression membre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du membre'
    });
  }
});

// Route pour obtenir les statistiques des membres
router.get('/members/:gieCode/stats', async (req, res) => {
  try {
    const { gieCode } = req.params;

    // Vérifier le GIE
    const gie = await GIE.findOne({ identifiantGIE: gieCode });
    if (!gie) {
      return res.status(404).json({
        success: false,
        message: 'Code GIE invalide'
      });
    }

    const membres = gie.membres || [];

    // Calculer les statistiques
    const stats = {
      total: membres.length,
      actifs: membres.filter(m => m.statut === 'actif').length,
      inactifs: membres.filter(m => m.statut === 'inactif').length,
      limiteMaximum: 40,
      placesDisponibles: 40 - membres.length,
      peutAjouter: membres.length < 40,
      repartitionParRole: {},
      repartitionParProfession: {},
      dernierAjout: null
    };

    // Répartition par rôle (compatible avec les deux formats)
    membres.forEach(membre => {
      const role = membre.role || membre.fonction || 'membre';
      stats.repartitionParRole[role] = (stats.repartitionParRole[role] || 0) + 1;
    });

    // Répartition par profession
    membres.forEach(membre => {
      if (membre.profession) {
        const profession = membre.profession;
        stats.repartitionParProfession[profession] = (stats.repartitionParProfession[profession] || 0) + 1;
      }
    });

    // Dernier membre ajouté (compatible avec les deux formats de dates)
    if (membres.length > 0) {
      const dernierMembre = membres.reduce((latest, current) => {
        const latestDate = latest.dateAjout || latest.createdAt || new Date(0);
        const currentDate = current.dateAjout || current.createdAt || new Date(0);
        return new Date(currentDate) > new Date(latestDate) ? current : latest;
      });
      
      if (dernierMembre) {
        stats.dernierAjout = {
          nom: `${dernierMembre.prenom} ${dernierMembre.nom}`,
          date: dernierMembre.dateAjout || dernierMembre.createdAt || null
        };
      }
    }

    res.json({
      success: true,
      message: 'Statistiques des membres',
      data: {
        gieInfo: {
          code: gie.identifiantGIE,
          nom: gie.nomGIE
        },
        stats: stats
      }
    });

  } catch (error) {
    console.error('❌ Erreur stats membres:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// Fonction utilitaire pour créer un paiement GIE - Version avec middleware
async function createGiePaymentWithMiddleware(gie, adhesion, paymentConfig) {
  try {
    // Préparer les données de paiement
    const paymentData = {
      amount: 25000,
      method: paymentConfig.method || 'WAVE',
      rv: `FEVEO_ACTIVATION_${gie.identifiantGIE}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      description: `Activation GIE FEVEO 2050 - ${gie.nomGIE}`,
      gieCode: gie.identifiantGIE
    };

    // Créer une transaction en base
    const transaction = new Transaction({
      reference: paymentData.rv,
      amount: paymentData.amount.toString(),
      token: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'PENDING',
      method: paymentData.method,
      gieId: gie._id,
      adhesionId: adhesion._id,
      date: new Date()
    });

    const savedTransaction = await transaction.save();

    // Simuler req et res pour utiliser le middleware
    const mockReq = {
      body: paymentData,
      paymentConfig: null, // Sera injecté
      tokenOM: null // Sera injecté si nécessaire
    };

    let paymentResult = null;
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          throw new Error(`Middleware error ${code}: ${data.message}`);
        }
      }),
      json: (data) => {
        // Cette fonction ne devrait pas être appelée pour un succès
        paymentResult = data;
      }
    };

    // Appliquer les middlewares séquentiellement
    await new Promise((resolve, reject) => {
      // 1. Injecter la config
      injectPaymentConfig(mockReq, mockRes, (err) => {
        if (err) return reject(err);
        
        // 2. Valider la config
        validatePaymentConfig(mockReq, mockRes, (err) => {
          if (err) return reject(err);
          
          // 3. Token Orange Money si nécessaire
          getOrangeMoneyToken(mockReq, mockRes, (err) => {
            if (err) return reject(err);
            
            // 4. Traitement du paiement
            waveOrangePaiement(mockReq, mockRes, (err) => {
              if (err) return reject(err);
              resolve();
            });
          });
        });
      });
    });

    // Récupérer les résultats
    const paymentResponse = mockReq.paymentResponse;
    const paymentUrl = mockReq.url;

    if (!paymentUrl) {
      throw new Error('Aucune URL de paiement générée par le middleware');
    }

    // Mettre à jour l'adhésion
    adhesion.statutAdhesion = 'en_attente';
    adhesion.statutEnregistrement = 'en_attente_paiement';
    adhesion.paiement = {
      transactionId: paymentData.rv,
      montant: paymentData.amount,
      statut: 'en_attente',
      dateCreation: new Date(),
      lienPaiement: paymentUrl,
      dbTransactionId: savedTransaction._id,
      provider: paymentResponse?.provider || paymentData.method,
      paymentData: paymentResponse
    };
    await adhesion.save();

    // Mettre à jour la transaction
    savedTransaction.paymentUrl = paymentUrl;
    savedTransaction.provider = paymentResponse?.provider || paymentData.method;
    await savedTransaction.save();

    console.log(`✅ Paiement créé via middleware: ${paymentUrl}`);

    return {
      success: true,
      payment: {
        transactionId: paymentData.rv,
        paymentUrl: paymentUrl,
        amount: paymentData.amount,
        currency: 'XOF',
        description: paymentData.description,
        provider: paymentResponse?.provider || paymentData.method,
        dbTransactionId: savedTransaction._id,
        status: 'PENDING',
        qrCode: paymentResponse?.qrCode || null,
        checkoutId: paymentResponse?.checkoutId || null
      }
    };

  } catch (error) {
    console.error('❌ Erreur création paiement GIE (middleware):', error.message);
    return {
      success: false,
      message: `Erreur lors de la création du paiement: ${error.message}`
    };
  }
}

// Fonction utilitaire pour créer un paiement GIE
async function createGiePayment(gie, adhesion, paymentConfig) {
  try {
    const axios = require('axios');
    
    // Préparer les données de paiement
    const paymentData = {
      amount: 25000,
      method: paymentConfig.method || 'WAVE',
      rv: `FEVEO_ACTIVATION_${gie.identifiantGIE}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      description: `Activation GIE FEVEO 2050 - ${gie.nomGIE}`,
      gieCode: gie.identifiantGIE
    };

    // Créer une transaction en base
    const transaction = new Transaction({
      reference: paymentData.rv,
      amount: paymentData.amount.toString(),
      token: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'PENDING',
      method: paymentData.method,
      gieId: gie._id,
      adhesionId: adhesion._id,
      date: new Date()
    });

    const savedTransaction = await transaction.save();

    // Récupérer la configuration de paiement
    const { paymentConfig: config } = require('../middleware/paymentConfig');

    let paymentUrl = null;
    let paymentResponse = null;

    if (paymentData.method === 'WAVE') {
      // Appel direct à l'API Wave avec le format le plus simple possible
      const wavePayload = {
        "amount": paymentData.amount,
        "currency": config.wave.currency,
        "error_url": `${config.wave.callbacks.error}?rv=${paymentData.rv}`,
        "success_url": `${config.wave.callbacks.success}?rv=${paymentData.rv}`
      };

      console.log('🌊 Payload Wave simplifié:', JSON.stringify(wavePayload, null, 2));
      console.log('🔑 Token Wave utilisé:', config.wave.token.substring(0, 30) + '...');
      
      const waveConfig = {
        method: 'post',
        url: config.wave.apiUrl,
        headers: { 
          'Authorization': 'Bearer ' + config.wave.token, 
          'Content-Type': 'application/json'
        },
        data: wavePayload
      };

      try {
        const response = await axios.request(waveConfig);
        paymentUrl = response.data.wave_launch_url;
        paymentResponse = {
          provider: 'WAVE',
          paymentUrl: paymentUrl,
          transactionId: response.data.id || paymentData.rv,
          amount: paymentData.amount,
          currency: config.wave.currency,
          checkoutId: response.data.id
        };

        console.log('🌊 Paiement Wave créé avec succès:', paymentUrl);
        
      } catch (waveError) {
        console.error('❌ Erreur spécifique Wave:', {
          status: waveError.response?.status,
          data: waveError.response?.data,
          message: waveError.message
        });
        
        // Fallback: générer un lien de test en cas d'erreur
        console.log('🔄 Génération d\'un lien de test...');
        paymentUrl = `https://pay.wave.com/test-checkout?amount=${paymentData.amount}&ref=${paymentData.rv}`;
        paymentResponse = {
          provider: 'WAVE_TEST',
          paymentUrl: paymentUrl,
          transactionId: paymentData.rv,
          amount: paymentData.amount,
          currency: config.wave.currency,
          isTest: true
        };
        
        console.log('🔧 Lien de test généré:', paymentUrl);
      }

    } else if (paymentData.method === 'OM') {
      // Pour Orange Money, on aurait besoin du token d'accès
      // Simulation pour le moment
      paymentUrl = `https://api.sandbox.orange-sonatel.com/qr/${paymentData.rv}`;
      paymentResponse = {
        provider: 'ORANGE_MONEY',
        paymentUrl: paymentUrl,
        transactionId: paymentData.rv,
        amount: paymentData.amount,
        currency: config.orangeMoney.currency
      };

      console.log('🟠 Paiement Orange Money créé:', paymentUrl);
    }

    // Mettre à jour l'adhésion
    adhesion.statutAdhesion = 'en_attente';
    adhesion.statutEnregistrement = 'en_attente_paiement';
    adhesion.paiement = {
      transactionId: paymentData.rv,
      montant: paymentData.amount,
      statut: 'en_attente',
      dateCreation: new Date(),
      lienPaiement: paymentUrl,
      dbTransactionId: savedTransaction._id,
      provider: paymentResponse?.provider || paymentData.method,
      paymentData: paymentResponse
    };
    await adhesion.save();

    // Mettre à jour la transaction
    savedTransaction.paymentUrl = paymentUrl;
    savedTransaction.provider = paymentResponse?.provider || paymentData.method;
    await savedTransaction.save();

    return {
      success: true,
      payment: {
        transactionId: paymentData.rv,
        paymentUrl: paymentUrl,
        amount: paymentData.amount,
        currency: 'XOF',
        description: paymentData.description,
        provider: paymentResponse?.provider || paymentData.method,
        dbTransactionId: savedTransaction._id,
        status: 'PENDING',
        qrCode: paymentResponse?.qrCode || null,
        checkoutId: paymentResponse?.checkoutId || null
      }
    };

  } catch (error) {
    console.error('❌ Erreur création paiement GIE:', error.message);
    
    // Si c'est une erreur axios, loguer les détails de la réponse
    if (error.response) {
      console.error('📋 Détails erreur API:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url,
        method: error.config?.method,
        sentData: error.config?.data
      });
      
      // Si c'est une erreur Wave spécifique
      if (error.response.data && error.response.data.details) {
        console.error('🔍 Détails validation Wave:', error.response.data.details);
      }
    }
    
    return {
      success: false,
      message: `Erreur lors de la création du paiement: ${error.message}`,
      details: error.response?.data || null
    };
  }
}

// Fonction utilitaire pour valider et activer un GIE
async function validateAndActivateGie(gieCode, forceActivation = false) {
  try {
    console.log(`🔄 Validation utilitaire du GIE: ${gieCode}`);

    // Vérifier si le GIE existe
    const gie = await GIE.findOne({ identifiantGIE: gieCode });
    if (!gie) {
      throw new Error('Code GIE invalide');
    }

    // Vérifier l'adhésion
    const Adhesion = require('../models/Adhesion');
    let adhesion = await Adhesion.findOne({ gieId: gie._id });

    if (!adhesion) {
      if (!forceActivation) {
        throw new Error('Adhésion non trouvée pour ce GIE');
      }

      // Créer automatiquement une adhésion
      adhesion = new Adhesion({
        gieId: gie._id,
        statutAdhesion: 'en_attente',
        statutEnregistrement: 'en_attente_paiement',
        dateCreation: new Date(),
        montantAdhesion: 25000,
        informationsGIE: {
          nomGIE: gie.nomGIE,
          identifiantGIE: gie.identifiantGIE,
          presidenteNom: gie.presidenteNom,
          presidentePrenom: gie.presidentePrenom,
          presidenteTelephone: gie.presidenteTelephone
        },
        validation: {
          statut: 'en_attente',
          dateCreation: new Date(),
          motif: 'Adhésion créée automatiquement pour validation batch'
        }
      });
      await adhesion.save();
    }

    // Vérifier si le GIE est déjà activé
    if (adhesion.statutAdhesion === 'validee' && adhesion.validation?.statut === 'validee') {
      return {
        gieCode: gieCode,
        nomGIE: gie.nomGIE,
        statut: 'already_active',
        dateActivation: adhesion.validation.dateValidation,
        message: 'GIE déjà activé'
      };
    }

    // Créer une transaction de validation
    const transactionId = `FEVEO_BATCH_${gieCode}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const transaction = new Transaction({
      reference: transactionId,
      amount: '25000',
      token: `token_batch_${Date.now()}`,
      status: 'SUCCESS',
      method: 'WAVE', // Utiliser une valeur valide du modèle
      gieId: gie._id,
      adhesionId: adhesion._id,
      date: new Date(),
      paymentUrl: 'BATCH_VALIDATION',
      provider: 'SYSTEM_BATCH'
    });
    await transaction.save();

    // Mettre à jour l'adhésion
    adhesion.paiement = {
      transactionId: transactionId,
      montant: 25000,
      statut: 'complete', // Utiliser une valeur valide du modèle
      dateCreation: new Date(),
      dateConfirmation: new Date(),
      lienPaiement: 'BATCH_VALIDATION',
      dbTransactionId: transaction._id,
      provider: 'BATCH_VALIDATION',
      paymentData: {
        provider: 'BATCH_VALIDATION',
        validationType: 'BATCH',
        validatedAt: new Date()
      }
    };

    // Activer le GIE
    await activateGIE(gie, adhesion, transactionId);

    return {
      gieCode: gieCode,
      nomGIE: gie.nomGIE,
      presidente: `${gie.presidentePrenom} ${gie.presidenteNom}`,
      statut: 'activated',
      dateActivation: new Date(),
      transactionId: transactionId,
      walletAccessible: true
    };

  } catch (error) {
    console.error(`❌ Erreur validation utilitaire ${gieCode}:`, error);
    throw error;
  }
}

module.exports = router;
