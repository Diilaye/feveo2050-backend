const express = require('express');
const router = express.Router();
const GIE = require('../models/GIE');
const CycleInvestissement = require('../models/CycleInvestissement');
const whatsappService = require('../services/whatsappService');

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
router.post('/verify-gie', async (req, res) => {
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

    // Vérifier que le GIE a une adhésion validée
    const Adhesion = require('../models/Adhesion');
    const adhesion = await Adhesion.findOne({ 
      gieId: gie._id,
      'validation.statut': 'validee'
    });

    if (!adhesion) {
      return res.status(403).json({
        success: false,
        message: 'GIE non autorisé pour le wallet. Adhésion non validée.'
      });
    }

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
          expiresIn: 300 // 5 minutes
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi du code de vérification'
      });
    }  } catch (error) {
    console.error('Erreur lors de la vérification du code GIE:', error);
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
        message: 'Code expiré ou invalide'
      });
    }

    if (storedData.expires < Date.now()) {
      delete tempCodes[gieCode];
      return res.status(400).json({
        success: false,
        message: 'Code expiré'
      });
    }

    if (storedData.code !== whatsappCode) {
      return res.status(400).json({
        success: false,
        message: 'Code WhatsApp invalide'
      });
    }

    // Code valide, nettoyer le code temporaire
    delete tempCodes[gieCode];

    // Récupérer les données du wallet
    const gie = await GIE.findOne({ identifiantGIE: gieCode });
    const cycle = await CycleInvestissement.findOne({ gieId: gie._id });

    // Calculer les statistiques du wallet
    const walletData = {
      gieInfo: {
        code: gie.identifiantGIE,
        nom: gie.nomGIE,
        presidente: `${gie.presidentePrenom} ${gie.presidenteNom}`
      },
      balance: {
        current: cycle ? cycle.walletGIE.soldeActuel : 0,
        invested: cycle ? cycle.calculerMontantTotalInvesti() : 0,
        returns: cycle ? cycle.calculerRetoursTotaux() : 0
      },
      cycleInfo: {
        currentDay: cycle ? cycle.obtenirJourActuel() : 0,
        totalDays: 60,
        dailyInvestment: 6000,
        nextInvestmentDate: cycle ? cycle.obtenirProchaineDate() : new Date()
      },
      transactions: cycle ? cycle.walletGIE.historique.slice(-10) : []
    };

    res.json({
      success: true,
      message: 'Connexion au wallet réussie',
      data: {
        wallet: walletData,
        sessionToken: `wallet_${gieCode}_${Date.now()}` // Token simple pour la session
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

    const cycle = await CycleInvestissement.findOne({ gieId: gie._id });

    const walletData = {
      gieInfo: {
        code: gie.identifiantGIE,
        nom: gie.nomGIE,
        presidente: `${gie.presidentePrenom} ${gie.presidenteNom}`
      },
      balance: {
        current: cycle ? cycle.walletGIE.soldeActuel : 0,
        invested: cycle ? cycle.calculerMontantTotalInvesti() : 0,
        returns: cycle ? cycle.calculerRetoursTotaux() : 0
      },
      cycleInfo: {
        currentDay: cycle ? cycle.obtenirJourActuel() : 0,
        totalDays: 60,
        dailyInvestment: 6000,
        nextInvestmentDate: cycle ? cycle.obtenirProchaineDate() : new Date()
      },
      transactions: cycle ? cycle.walletGIE.historique.slice(-10) : []
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

module.exports = router;
