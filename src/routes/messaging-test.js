const express = require('express');
const router = express.Router();
const messagingService = require('../services/messagingService');

// Test du service de messaging unifié
router.get('/test-services', async (req, res) => {
  try {
    const result = await messagingService.testerServices();

    res.json({
      success: true,
      message: 'Test des services de messaging',
      data: result
    });

  } catch (error) {
    console.error('Erreur test services messaging:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du test des services',
      error: error.message
    });
  }
});

// Test d'envoi de message avec fallback
router.post('/test-message-fallback', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Numéro de téléphone requis'
      });
    }

    const testMessage = message || 'Test FEVEO 2050 - Message avec fallback automatique!';
    
    const result = await messagingService.envoyerMessage(phoneNumber, testMessage);

    res.json({
      success: result.success || false,
      message: result.success ? result.message : 'Échec envoi via tous les services',
      data: {
        phoneNumber,
        result,
        methodsUsed: result.methodsUsed,
        allMethodsFailed: result.allMethodsFailed
      }
    });

  } catch (error) {
    console.error('Erreur test message fallback:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du test message fallback',
      error: error.message
    });
  }
});

// Test de code de connexion GIE avec fallback
router.post('/test-code-connexion-gie', async (req, res) => {
  try {
    const { phoneNumber, nomGIE } = req.body;

    if (!phoneNumber || !nomGIE) {
      return res.status(400).json({
        success: false,
        message: 'Numéro de téléphone et nom du GIE requis'
      });
    }

    // Générer un code de vérification à 6 chiffres
    const codeVerification = Math.floor(100000 + Math.random() * 900000).toString();
    
    const result = await messagingService.envoyerCodeConnexionGIE(
      phoneNumber, 
      codeVerification, 
      nomGIE
    );

    res.json({
      success: result.success || false,
      message: result.success ? result.message : 'Échec envoi code via tous les services',
      data: {
        phoneNumber,
        nomGIE,
        codeGenere: codeVerification,
        result,
        methodsUsed: result.methodsUsed,
        allMethodsFailed: result.allMethodsFailed
      }
    });

  } catch (error) {
    console.error('Erreur test code connexion GIE:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du test code connexion GIE',
      error: error.message
    });
  }
});

// Test de notification de création de GIE
router.post('/test-notification-creation-gie', async (req, res) => {
  try {
    const { phoneNumber, nomGIE } = req.body;

    if (!phoneNumber || !nomGIE) {
      return res.status(400).json({
        success: false,
        message: 'Numéro de téléphone et nom du GIE requis'
      });
    }

    const codeGIE = `GIE-${Date.now().toString().slice(-6)}`;
    
    const result = await messagingService.envoyerNotificationCreationGIE(
      phoneNumber, 
      nomGIE, 
      codeGIE
    );

    res.json({
      success: result.success || false,
      message: result.success ? result.message : 'Échec envoi notification via tous les services',
      data: {
        phoneNumber,
        nomGIE,
        codeGIE,
        result,
        methodsUsed: result.methodsUsed,
        allMethodsFailed: result.allMethodsFailed
      }
    });

  } catch (error) {
    console.error('Erreur test notification création GIE:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du test notification création GIE',
      error: error.message
    });
  }
});

// Test de notification d'investissement
router.post('/test-notification-investissement', async (req, res) => {
  try {
    const { phoneNumber, nomGIE, montant, jourCycle, soldeTotal } = req.body;

    if (!phoneNumber || !nomGIE) {
      return res.status(400).json({
        success: false,
        message: 'Numéro de téléphone et nom du GIE requis'
      });
    }

    const result = await messagingService.envoyerNotificationInvestissement(
      phoneNumber,
      nomGIE,
      montant || 6000,
      jourCycle || 1,
      soldeTotal || 66000
    );

    res.json({
      success: result.success || false,
      message: result.success ? result.message : 'Échec envoi notification via tous les services',
      data: {
        phoneNumber,
        nomGIE,
        montant: montant || 6000,
        jourCycle: jourCycle || 1,
        soldeTotal: soldeTotal || 66000,
        result,
        methodsUsed: result.methodsUsed,
        allMethodsFailed: result.allMethodsFailed
      }
    });

  } catch (error) {
    console.error('Erreur test notification investissement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du test notification investissement',
      error: error.message
    });
  }
});

module.exports = router;
