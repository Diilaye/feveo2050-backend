const express = require('express');
const router = express.Router();
const whatsappService = require('../services/whatsappService');
const twilioService = require('../services/twilioService');

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

// Test combiné WhatsApp + Twilio avec fallback
router.post('/test-message-fallback', async (req, res) => {
  try {
    const { phoneNumber, message, gieCode, type } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Numéro de téléphone requis'
      });
    }

    let whatsappResult = null;
    let twilioResult = null;
    let finalResult = null;

    // Type de message à envoyer
    const messageType = type || 'simple';
    const testMessage = message || 'Test FEVEO 2050 - Message combiné WhatsApp/SMS';
    const testCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Essayer WhatsApp en premier
    try {
      console.log('🔄 Tentative envoi WhatsApp...');
      
      if (messageType === 'code') {
        whatsappResult = await whatsappService.envoyerCodeVerification(
          phoneNumber,
          testCode,
          gieCode || 'TEST-GIE'
        );
      } else if (messageType === 'notification') {
        whatsappResult = await whatsappService.envoyerNotificationInvestissement(
          phoneNumber,
          gieCode || 'TEST-GIE',
          6000,
          1,
          66000
        );
      } else {
        // Message simple pour tester la connectivité
        whatsappResult = await whatsappService.testerConnexion();
      }

      if (whatsappResult) {
        finalResult = {
          success: true,
          method: 'whatsapp',
          data: whatsappResult
        };
      }
    } catch (whatsappError) {
      console.log('⚠️ WhatsApp échoué, tentative Twilio...', whatsappError.message);
    }

    // Si WhatsApp échoue, essayer Twilio
    if (!finalResult) {
      try {
        console.log('🔄 Tentative envoi Twilio...');
        
        if (messageType === 'code') {
          twilioResult = await twilioService.envoyerCodeConnexionGIE(
            phoneNumber,
            testCode,
            gieCode || 'TEST-GIE'
          );
        } else if (messageType === 'notification') {
          twilioResult = await twilioService.envoyerNotificationInvestissement(
            phoneNumber,
            gieCode || 'TEST-GIE',
            6000,
            1,
            66000
          );
        } else {
          twilioResult = await twilioService.envoyerSMS(phoneNumber, testMessage);
        }

        if (twilioResult && twilioResult.success) {
          finalResult = {
            success: true,
            method: 'twilio',
            data: twilioResult
          };
        }
      } catch (twilioError) {
        console.log('❌ Twilio aussi échoué:', twilioError.message);
      }
    }

    // Réponse finale
    if (finalResult) {
      res.json({
        success: true,
        message: `Message envoyé via ${finalResult.method}`,
        method: finalResult.method,
        data: {
          phoneNumber,
          messageType,
          ...(messageType === 'code' && { codeGenere: testCode }),
          result: finalResult.data
        },
        fallback: {
          whatsappTested: !!whatsappResult,
          twilioTested: !!twilioResult
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Échec envoi via WhatsApp ET Twilio',
        data: {
          phoneNumber,
          messageType,
          whatsappResult,
          twilioResult
        }
      });
    }

  } catch (error) {
    console.error('Erreur test message fallback:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du test message fallback',
      error: error.message
    });
  }
});

module.exports = router;
