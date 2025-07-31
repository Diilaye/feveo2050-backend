const express = require('express');
const router = express.Router();
const whatsappService = require('../services/whatsappService');

// Test de l'API WhatsApp
router.post('/test-whatsapp', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Numéro de téléphone requis'
      });
    }

    // Test avec un message simple
    const testMessage = message || 'Test FEVEO 2050 - API WhatsApp fonctionnelle!';
    
    // Pour le test, on simule l'envoi d'un code
    const testCode = '123456';
    const success = await whatsappService.envoyerCodeVerification(
      phoneNumber,
      testCode,
      'TEST-GIE'
    );

    res.json({
      success,
      message: success ? 'Message WhatsApp envoyé avec succès' : 'Échec envoi WhatsApp',
      data: {
        phoneNumber,
        codeEnvoye: testCode,
        apiUrl: `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_ID}/messages`
      }
    });

  } catch (error) {
    console.error('Erreur test WhatsApp:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du test WhatsApp',
      error: error.message
    });
  }
});

// Test de connexion à l'API WhatsApp
router.get('/test-connexion', async (req, res) => {
  try {
    const success = await whatsappService.testerConnexion();

    res.json({
      success,
      message: success ? 'Connexion WhatsApp API réussie' : 'Échec connexion WhatsApp API',
      config: {
        apiVersion: process.env.WHATSAPP_API_VERSION || 'v22.0',
        phoneId: process.env.WHATSAPP_PHONE_ID || '658687160670733',
        tokenConfigured: !!process.env.WHATSAPP_TOKEN
      }
    });

  } catch (error) {
    console.error('Erreur test connexion WhatsApp:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du test de connexion',
      error: error.message
    });
  }
});

// Simuler l'envoi d'une notification d'investissement
router.post('/test-notification', async (req, res) => {
  try {
    const { phoneNumber, gieCode, montant, jour, solde } = req.body;

    if (!phoneNumber || !gieCode) {
      return res.status(400).json({
        success: false,
        message: 'Numéro de téléphone et code GIE requis'
      });
    }

    const success = await whatsappService.envoyerNotificationInvestissement(
      phoneNumber,
      gieCode,
      montant || 6000,
      jour || 1,
      solde || 66000
    );

    res.json({
      success,
      message: success ? 'Notification d\'investissement envoyée' : 'Échec envoi notification',
      data: {
        phoneNumber,
        gieCode,
        montant: montant || 6000,
        jour: jour || 1,
        solde: solde || 66000
      }
    });

  } catch (error) {
    console.error('Erreur test notification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du test de notification',
      error: error.message
    });
  }
});

module.exports = router;
