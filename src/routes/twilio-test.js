const express = require('express');
const router = express.Router();
const twilioService = require('../services/twilioService');

// Test d'envoi de SMS simple
router.post('/test-sms', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Numéro de téléphone requis'
      });
    }

    const testMessage = message || 'Test FEVEO 2050 - SMS envoyé via Twilio!';
    
    const result = await twilioService.envoyerSMS(phoneNumber, testMessage);

    res.json({
      success: result.success,
      message: result.success ? 'SMS envoyé avec succès' : 'Échec envoi SMS',
      data: result
    });

  } catch (error) {
    console.error('Erreur test SMS:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du test SMS',
      error: error.message
    });
  }
});

// Test de connexion Twilio
router.get('/test-connexion', async (req, res) => {
  try {
    const result = await twilioService.testerConnexion();

    res.json({
      success: result.success,
      message: result.message,
      config: {
        twilioInitialized: twilioService.initialized,
        phoneNumber: process.env.TWILIO_PHONE_NUMBER,
        accountConfigured: !!process.env.TWILIO_ACCOUNT_SID
      },
      data: result
    });

  } catch (error) {
    console.error('Erreur test connexion Twilio:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du test de connexion',
      error: error.message
    });
  }
});

// Test d'envoi de code de connexion GIE
router.post('/test-code-gie', async (req, res) => {
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
    
    const result = await twilioService.envoyerCodeConnexionGIE(
      phoneNumber, 
      codeVerification, 
      nomGIE
    );

    res.json({
      success: result.success,
      message: result.success ? 'Code de connexion GIE envoyé' : 'Échec envoi code',
      data: {
        ...result,
        codeGenere: codeVerification,
        nomGIE
      }
    });

  } catch (error) {
    console.error('Erreur test code GIE:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du test code GIE',
      error: error.message
    });
  }
});

// Test de notification de création de GIE
router.post('/test-notification-creation', async (req, res) => {
  try {
    const { phoneNumber, nomGIE, codeGIE } = req.body;

    if (!phoneNumber || !nomGIE) {
      return res.status(400).json({
        success: false,
        message: 'Numéro de téléphone et nom du GIE requis'
      });
    }

    const codeGenere = codeGIE || `GIE-${Date.now().toString().slice(-6)}`;
    
    const result = await twilioService.envoyerNotificationCreationGIE(
      phoneNumber, 
      nomGIE, 
      codeGenere
    );

    res.json({
      success: result.success,
      message: result.success ? 'Notification création GIE envoyée' : 'Échec envoi notification',
      data: {
        ...result,
        nomGIE,
        codeGIE: codeGenere
      }
    });

  } catch (error) {
    console.error('Erreur test notification création:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du test notification création',
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

    const result = await twilioService.envoyerNotificationInvestissement(
      phoneNumber,
      nomGIE,
      montant || 6000,
      jourCycle || 1,
      soldeTotal || 66000
    );

    res.json({
      success: result.success,
      message: result.success ? 'Notification investissement envoyée' : 'Échec envoi notification',
      data: {
        ...result,
        nomGIE,
        montant: montant || 6000,
        jourCycle: jourCycle || 1,
        soldeTotal: soldeTotal || 66000
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

// Vérifier le statut d'un message
router.get('/statut-message/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;

    const result = await twilioService.verifierStatutMessage(messageId);

    res.json({
      success: result.success,
      message: result.success ? 'Statut récupéré' : 'Erreur récupération statut',
      data: result
    });

  } catch (error) {
    console.error('Erreur vérification statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification du statut',
      error: error.message
    });
  }
});

module.exports = router;
