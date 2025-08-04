const twilio = require('twilio');

class TwilioService {
  constructor() {
    this.client = null;
    this.initialized = false;
    this.init();
  }

  init() {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

      if (!accountSid || !authToken || !phoneNumber) {
        console.warn('⚠️  Configuration Twilio manquante. SMS désactivés.');
        return;
      }

      this.client = twilio(accountSid, authToken);
      this.phoneNumber = phoneNumber;
      this.initialized = true;
      console.log('✅ Service Twilio initialisé');
    } catch (error) {
      console.error('❌ Erreur initialisation Twilio:', error.message);
    }
  }

  /**
   * Formater un numéro de téléphone sénégalais au format international
   */
  formatPhoneNumber(phoneNumber) {
    // Supprimer tous les espaces et caractères spéciaux
    let cleanNumber = phoneNumber.replace(/\s+/g, '').replace(/[^\d+]/g, '');
    
    // Si le numéro commence par 77, 78, 70, 76, 75 (numéros sénégalais)
    if (/^(77|78|70|76|75)\d{7}$/.test(cleanNumber)) {
      return `+221${cleanNumber}`;
    }
    
    // Si le numéro commence par 221 (code Sénégal)
    if (/^221(77|78|70|76|75)\d{7}$/.test(cleanNumber)) {
      return `+${cleanNumber}`;
    }
    
    // Si le numéro commence déjà par +
    if (cleanNumber.startsWith('+')) {
      return cleanNumber;
    }
    
    // Pour les autres cas, ajouter +221 par défaut (Sénégal)
    return `+221${cleanNumber}`;
  }

  /**
   * Envoyer un SMS via Twilio
   */
  async envoyerSMS(phoneNumber, message) {
    try {
      if (!this.initialized) {
        throw new Error('Service Twilio non initialisé');
      }

      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      console.log(`📱 Envoi SMS vers ${formattedPhone}...`);
      
      const result = await this.client.messages.create({
        body: message,
        from: this.phoneNumber,
        to: formattedPhone
      });

      console.log(`✅ SMS envoyé avec succès. SID: ${result.sid}`);
      
      return {
        success: true,
        messageId: result.sid,
        status: result.status,
        to: formattedPhone
      };

    } catch (error) {
      console.error('❌ Erreur envoi SMS Twilio:', error.message);
      
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  /**
   * Envoyer un code de vérification pour la connexion GIE
   */
  async envoyerCodeConnexionGIE(phoneNumber, codeVerification, nomGIE) {
    const message = `🔐 FEVEO 2050 - Code de connexion GIE\n\n` +
                   `GIE: ${nomGIE}\n` +
                   `Code: ${codeVerification}\n\n` +
                   `Ce code expire dans 10 minutes.\n` +
                   `Ne le partagez avec personne.`;

    return await this.envoyerSMS(phoneNumber, message);
  }

  /**
   * Envoyer une notification de création de GIE
   */
  async envoyerNotificationCreationGIE(phoneNumber, nomGIE, codeGIE) {
    const message = `🎉 FEVEO 2050 - GIE créé avec succès!\n\n` +
                   `Nom: ${nomGIE}\n` +
                   `Code: ${codeGIE}\n\n` +
                   `Votre GIE est maintenant actif et prêt pour les investissements.`;

    return await this.envoyerSMS(phoneNumber, message);
  }

  /**
   * Envoyer une notification d'adhésion à un GIE
   */
  async envoyerNotificationAdhesionGIE(phoneNumber, nomGIE, nomMembre) {
    const message = `👥 FEVEO 2050 - Nouvelle adhésion\n\n` +
                   `${nomMembre} a rejoint votre GIE "${nomGIE}".\n\n` +
                   `Connectez-vous pour voir les détails.`;

    return await this.envoyerSMS(phoneNumber, message);
  }

  /**
   * Envoyer une notification d'investissement
   */
  async envoyerNotificationInvestissement(phoneNumber, nomGIE, montant, jourCycle, soldeTotal) {
    const message = `💰 FEVEO 2050 - Investissement reçu\n\n` +
                   `GIE: ${nomGIE}\n` +
                   `Montant: ${montant.toLocaleString()} FCFA\n` +
                   `Jour: ${jourCycle}/30\n` +
                   `Solde total: ${soldeTotal.toLocaleString()} FCFA\n\n` +
                   `Merci pour votre contribution!`;

    return await this.envoyerSMS(phoneNumber, message);
  }

  /**
   * Envoyer une notification de retrait
   */
  async envoyerNotificationRetrait(phoneNumber, nomGIE, montant, soldeRestant) {
    const message = `🏦 FEVEO 2050 - Retrait effectué\n\n` +
                   `GIE: ${nomGIE}\n` +
                   `Montant retiré: ${montant.toLocaleString()} FCFA\n` +
                   `Solde restant: ${soldeRestant.toLocaleString()} FCFA\n\n` +
                   `Transaction completée avec succès.`;

    return await this.envoyerSMS(phoneNumber, message);
  }

  /**
   * Tester la connexion Twilio
   */
  async testerConnexion() {
    try {
      if (!this.initialized) {
        return { success: false, message: 'Service Twilio non initialisé' };
      }

      // Test avec le numéro de validation Twilio
      const testResult = await this.client.validationRequests.create({
        friendlyName: 'FEVEO Test',
        phoneNumber: this.phoneNumber
      });

      return {
        success: true,
        message: 'Connexion Twilio réussie',
        accountSid: this.client.accountSid
      };

    } catch (error) {
      return {
        success: false,
        message: `Erreur connexion Twilio: ${error.message}`,
        error: error.code
      };
    }
  }

  /**
   * Vérifier le statut d'un message
   */
  async verifierStatutMessage(messageId) {
    try {
      if (!this.initialized) {
        throw new Error('Service Twilio non initialisé');
      }

      const message = await this.client.messages(messageId).fetch();
      
      return {
        success: true,
        status: message.status,
        dateCreated: message.dateCreated,
        dateSent: message.dateSent,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Instance singleton
const twilioService = new TwilioService();

module.exports = twilioService;
