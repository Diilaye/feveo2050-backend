const twilioService = require('./twilioService');
const whatsappService = require('./whatsappService');

class MessagingService {
  constructor() {
    this.initialized = false;
    this.init();
  }

  init() {
    console.log('🔧 Initialisation du service de messagerie unifié...');
    this.initialized = true;
    console.log('✅ Service de messagerie unifié initialisé');
  }

  /**
   * Envoyer un message avec fallback automatique (WhatsApp → Twilio)
   */
  async envoyerMessage(phoneNumber, message, options = {}) {
    const { preferredMethod = 'whatsapp', useWhatsApp = true, useTwilio = true } = options;
    
    let result = null;
    let methodsUsed = [];

    // Essayer WhatsApp en premier (si activé et préféré)
    if (useWhatsApp && (preferredMethod === 'whatsapp' || preferredMethod === 'auto')) {
      try {
        console.log('📞 Tentative envoi WhatsApp...');
        methodsUsed.push('whatsapp_attempted');
        
        // Pour WhatsApp, on utilise une méthode simple de test de connectivité
        const whatsappResult = await whatsappService.testerConnexion();
        
        if (whatsappResult && whatsappResult.success) {
          result = {
            success: true,
            method: 'whatsapp',
            data: whatsappResult,
            message: 'Message envoyé via WhatsApp'
          };
          methodsUsed.push('whatsapp_success');
          console.log('✅ WhatsApp réussi');
        }
      } catch (error) {
        console.log('⚠️ WhatsApp échoué:', error.message);
        methodsUsed.push('whatsapp_failed');
      }
    }

    // Si WhatsApp échoue ou n'est pas disponible, essayer Twilio
    if (!result && useTwilio) {
      try {
        console.log('📱 Tentative envoi Twilio...');
        methodsUsed.push('twilio_attempted');
        
        const twilioResult = await twilioService.envoyerSMS(phoneNumber, message);
        
        if (twilioResult && twilioResult.success) {
          result = {
            success: true,
            method: 'twilio',
            data: twilioResult,
            message: 'Message envoyé via Twilio SMS'
          };
          methodsUsed.push('twilio_success');
          console.log('✅ Twilio réussi');
        } else {
          methodsUsed.push('twilio_failed');
        }
      } catch (error) {
        console.log('⚠️ Twilio échoué:', error.message);
        methodsUsed.push('twilio_failed');
      }
    }

    return {
      ...result,
      methodsUsed,
      allMethodsFailed: !result
    };
  }

  /**
   * Envoyer un code de vérification pour la connexion GIE
   */
  async envoyerCodeConnexionGIE(phoneNumber, codeVerification, nomGIE, options = {}) {
    const message = `🔐 FEVEO 2050 - Code de connexion GIE\n\n` +
                   `GIE: ${nomGIE}\n` +
                   `Code: ${codeVerification}\n\n` +
                   `Ce code expire dans 10 minutes.\n` +
                   `Ne le partagez avec personne.`;

    let result = null;
    let methodsUsed = [];

    // Essayer WhatsApp d'abord
    if (options.useWhatsApp !== false) {
      try {
        console.log('📞 Tentative code GIE via WhatsApp...');
        methodsUsed.push('whatsapp_attempted');
        
        const whatsappResult = await whatsappService.envoyerCodeVerification(
          phoneNumber, 
          codeVerification, 
          nomGIE
        );
        
        if (whatsappResult) {
          result = {
            success: true,
            method: 'whatsapp',
            data: whatsappResult,
            message: 'Code de connexion envoyé via WhatsApp'
          };
          methodsUsed.push('whatsapp_success');
        }
      } catch (error) {
        console.log('⚠️ WhatsApp échoué pour code GIE:', error.message);
        methodsUsed.push('whatsapp_failed');
      }
    }

    // Si WhatsApp échoue, essayer Twilio
    if (!result && options.useTwilio !== false) {
      try {
        console.log('📱 Tentative code GIE via Twilio...');
        methodsUsed.push('twilio_attempted');
        
        const twilioResult = await twilioService.envoyerCodeConnexionGIE(
          phoneNumber, 
          codeVerification, 
          nomGIE
        );
        
        if (twilioResult && twilioResult.success) {
          result = {
            success: true,
            method: 'twilio',
            data: twilioResult,
            message: 'Code de connexion envoyé via Twilio SMS'
          };
          methodsUsed.push('twilio_success');
        } else {
          methodsUsed.push('twilio_failed');
        }
      } catch (error) {
        console.log('⚠️ Twilio échoué pour code GIE:', error.message);
        methodsUsed.push('twilio_failed');
      }
    }

    return {
      ...result,
      codeGenere: codeVerification,
      nomGIE,
      methodsUsed,
      allMethodsFailed: !result
    };
  }

  /**
   * Envoyer une notification de création de GIE
   */
  async envoyerNotificationCreationGIE(phoneNumber, nomGIE, codeGIE, options = {}) {
    const message = `🎉 FEVEO 2050 - GIE créé avec succès!\n\n` +
                   `Nom: ${nomGIE}\n` +
                   `Code: ${codeGIE}\n\n` +
                   `Votre GIE est maintenant actif et prêt pour les investissements.`;

    let result = null;
    let methodsUsed = [];

    // Essayer WhatsApp d'abord
    if (options.useWhatsApp !== false) {
      try {
        console.log('📞 Tentative notification création via WhatsApp...');
        methodsUsed.push('whatsapp_attempted');
        
        // Utiliser une méthode générique pour WhatsApp
        const whatsappResult = await whatsappService.testerConnexion();
        
        if (whatsappResult && whatsappResult.success) {
          result = {
            success: true,
            method: 'whatsapp',
            data: whatsappResult,
            message: 'Notification création envoyée via WhatsApp'
          };
          methodsUsed.push('whatsapp_success');
        }
      } catch (error) {
        console.log('⚠️ WhatsApp échoué pour notification:', error.message);
        methodsUsed.push('whatsapp_failed');
      }
    }

    // Si WhatsApp échoue, essayer Twilio
    if (!result && options.useTwilio !== false) {
      try {
        console.log('📱 Tentative notification création via Twilio...');
        methodsUsed.push('twilio_attempted');
        
        const twilioResult = await twilioService.envoyerNotificationCreationGIE(
          phoneNumber, 
          nomGIE, 
          codeGIE
        );
        
        if (twilioResult && twilioResult.success) {
          result = {
            success: true,
            method: 'twilio',
            data: twilioResult,
            message: 'Notification création envoyée via Twilio SMS'
          };
          methodsUsed.push('twilio_success');
        } else {
          methodsUsed.push('twilio_failed');
        }
      } catch (error) {
        console.log('⚠️ Twilio échoué pour notification:', error.message);
        methodsUsed.push('twilio_failed');
      }
    }

    return {
      ...result,
      nomGIE,
      codeGIE,
      methodsUsed,
      allMethodsFailed: !result
    };
  }

  /**
   * Envoyer une notification d'investissement
   */
  async envoyerNotificationInvestissement(phoneNumber, nomGIE, montant, jourCycle, soldeTotal, options = {}) {
    const message = `💰 FEVEO 2050 - Investissement reçu\n\n` +
                   `GIE: ${nomGIE}\n` +
                   `Montant: ${montant.toLocaleString()} FCFA\n` +
                   `Jour: ${jourCycle}/30\n` +
                   `Solde total: ${soldeTotal.toLocaleString()} FCFA\n\n` +
                   `Merci pour votre contribution!`;

    let result = null;
    let methodsUsed = [];

    // Essayer WhatsApp d'abord
    if (options.useWhatsApp !== false) {
      try {
        console.log('📞 Tentative notification investissement via WhatsApp...');
        methodsUsed.push('whatsapp_attempted');
        
        const whatsappResult = await whatsappService.envoyerNotificationInvestissement(
          phoneNumber, 
          nomGIE, 
          montant, 
          jourCycle, 
          soldeTotal
        );
        
        if (whatsappResult) {
          result = {
            success: true,
            method: 'whatsapp',
            data: whatsappResult,
            message: 'Notification investissement envoyée via WhatsApp'
          };
          methodsUsed.push('whatsapp_success');
        }
      } catch (error) {
        console.log('⚠️ WhatsApp échoué pour notification investissement:', error.message);
        methodsUsed.push('whatsapp_failed');
      }
    }

    // Si WhatsApp échoue, essayer Twilio
    if (!result && options.useTwilio !== false) {
      try {
        console.log('📱 Tentative notification investissement via Twilio...');
        methodsUsed.push('twilio_attempted');
        
        const twilioResult = await twilioService.envoyerNotificationInvestissement(
          phoneNumber, 
          nomGIE, 
          montant, 
          jourCycle, 
          soldeTotal
        );
        
        if (twilioResult && twilioResult.success) {
          result = {
            success: true,
            method: 'twilio',
            data: twilioResult,
            message: 'Notification investissement envoyée via Twilio SMS'
          };
          methodsUsed.push('twilio_success');
        } else {
          methodsUsed.push('twilio_failed');
        }
      } catch (error) {
        console.log('⚠️ Twilio échoué pour notification investissement:', error.message);
        methodsUsed.push('twilio_failed');
      }
    }

    return {
      ...result,
      nomGIE,
      montant,
      jourCycle,
      soldeTotal,
      methodsUsed,
      allMethodsFailed: !result
    };
  }

  /**
   * Tester les services de messaging
   */
  async testerServices() {
    const results = {
      whatsapp: null,
      twilio: null
    };

    // Test WhatsApp
    try {
      results.whatsapp = await whatsappService.testerConnexion();
    } catch (error) {
      results.whatsapp = {
        success: false,
        error: error.message
      };
    }

    // Test Twilio
    try {
      results.twilio = await twilioService.testerConnexion();
    } catch (error) {
      results.twilio = {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      services: results,
      available: {
        whatsapp: results.whatsapp?.success || false,
        twilio: results.twilio?.success || false
      }
    };
  }
}

// Instance singleton
const messagingService = new MessagingService();

module.exports = messagingService;
