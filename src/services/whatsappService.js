const axios = require('axios');
require('dotenv').config();

class WhatsAppService {
  constructor() {
    this.baseURL = 'https://graph.facebook.com/v22.0';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '658687160670733';
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || 'EAAVUh7HZAQUIBPPAmu14piyW9NfkJpsB2BxM6D5ZB6NwQ0KGgadevay8jXGshodX73IlIIjjZBwM0dGWnZAxQies9ZCr8M2fhuOFUZB1drmvgopHuh7FYmSxlJ6HYI54ehHnmXvjsLyRU3QnkZB4TYPR71sMBSmMiLEoLnz2VXFs1DIigTSTEYcBclv81v3nRVRGUxrj9YPA6lKLpXXGYlDwmDwDCQF52MKgJwA0I5C467ZBkAZDZD';
    
    // Configuration pour la récupération automatique de token
    this.appId = process.env.WHATSAPP_APP_ID || '1500316664676674';
    this.appSecret = process.env.WHATSAPP_APP_SECRET;
    this.businessId = process.env.WHATSAPP_BUSINESS_ID || '1129220308584592';
    
    // Cache du token avec expiration
    this.tokenCache = {
      token: null,
      expiresAt: null
    };
  }

  /**
   * Récupérer un nouveau token d'accès automatiquement
   */
  async refreshAccessToken() {
    try {
      if (!this.appSecret) {
        console.log('⚠️ WHATSAPP_APP_SECRET non configuré, utilisation du token manuel');
        return this.accessToken;
      }

      // Vérifier si le token en cache est encore valide
      if (this.tokenCache.token && this.tokenCache.expiresAt > Date.now()) {
        console.log('✅ Utilisation du token en cache');
        return this.tokenCache.token;
      }

      console.log('🔄 Récupération d\'un nouveau token d\'accès...');
      
      // URL pour récupérer un token d'accès d'application
      const url = `${this.baseURL}/oauth/access_token`;
      
      const params = {
        grant_type: 'client_credentials',
        client_id: this.appId,
        client_secret: this.appSecret
      };

      const response = await axios.get(url, { params });
      
      if (response.data.access_token) {
        const newToken = response.data.access_token;
        const expiresIn = response.data.expires_in || 3600; // Par défaut 1h
        
        // Mettre en cache le token
        this.tokenCache = {
          token: newToken,
          expiresAt: Date.now() + (expiresIn * 1000) - 300000 // -5 minutes de sécurité
        };
        
        console.log('✅ Nouveau token récupéré et mis en cache');
        return newToken;
      }
      
      throw new Error('Pas de token dans la réponse');

    } catch (error) {
      console.error('❌ Erreur récupération token:', error.response?.data || error.message);
      console.log('🔄 Utilisation du token manuel en fallback');
      return this.accessToken;
    }
  }

  /**
   * Obtenir un token valide (avec refresh automatique)
   */
  async getValidToken() {
    // D'abord essayer le token actuel
    if (await this.isCurrentTokenValid()) {
      return this.accessToken;
    }
    
    // Si invalide, essayer de récupérer un nouveau token
    const newToken = await this.refreshAccessToken();
    
    // Mettre à jour le token actuel si un nouveau a été récupéré
    if (newToken !== this.accessToken) {
      this.accessToken = newToken;
    }
    
    return newToken;
  }

  /**
   * Vérifier si le token actuel est valide
   */
  async isCurrentTokenValid() {
    try {
      const url = `${this.baseURL}/${this.phoneNumberId}`;
      
      await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Envoyer un message template WhatsApp
   * @param {string} to - Numéro de téléphone (format: 221772488807)
   * @param {string} templateName - Nom du template
   * @param {string} languageCode - Code de langue
   * @param {Array} components - Composants du template (optionnel)
   */
  async sendTemplate(to, templateName = 'hello_world', languageCode = 'en_US', components = []) {
    try {
      // Récupérer un token valide avant l'envoi
      const validToken = await this.getValidToken();
      
      const url = `${this.baseURL}/${this.phoneNumberId}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode
          }
        }
      };

      // Ajouter les composants si fournis
      if (components && components.length > 0) {
        payload.template.components = components;
      }

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${validToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`✅ Message WhatsApp envoyé à ${to}:`, response.data);
      return {
        success: true,
        messageId: response.data.messages[0].id,
        data: response.data
      };

    } catch (error) {
      console.error('❌ Erreur envoi WhatsApp:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Envoyer un message texte simple
   * @param {string} to - Numéro de téléphone
   * @param {string} message - Message à envoyer
   */
  async sendTextMessage(to, message) {
    try {
      // Récupérer un token valide avant l'envoi
      const validToken = await this.getValidToken();
      
      const url = `${this.baseURL}/${this.phoneNumberId}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: {
          body: message
        }
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${validToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`✅ Message texte WhatsApp envoyé à ${to}:`, response.data);
      return {
        success: true,
        messageId: response.data.messages[0].id,
        data: response.data
      };

    } catch (error) {
      console.error('❌ Erreur envoi message WhatsApp:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Envoyer un code de vérification via WhatsApp
   * @param {string} phoneNumber - Numéro de téléphone
   * @param {string} verificationCode - Code de vérification
   * @param {string} gieCode - Code GIE pour le contexte
   */
  async sendVerificationCode(phoneNumber, verificationCode, gieCode) {
    try {
      // Nettoyer le numéro de téléphone (enlever les espaces, + etc.)
      const cleanNumber = phoneNumber.replace(/[\s\-\+]/g, '');
      
      // Message de vérification
      const message = `🔐 FEVEO 2050 - Code de vérification

Votre code d'accès au wallet GIE : *${verificationCode}*

GIE : ${gieCode}

⏱️ Ce code expire dans 5 minutes.
🔒 Ne partagez jamais ce code.

Merci de votre confiance ! 🌱`;

      const result = await this.sendTextMessage(cleanNumber, message);
      
      if (result.success) {
        console.log(`📱 Code de vérification ${verificationCode} envoyé à ${phoneNumber} pour le GIE ${gieCode}`);
        
        // Mode hybride : toujours afficher le code même si WhatsApp fonctionne
        console.log(`🔢 CODE DE SECOURS - GIE ${gieCode}: ${verificationCode}`);
        console.log(`📞 Destinataire: ${phoneNumber}`);
        console.log(`⚠️ Si WhatsApp n'arrive pas, utilisez ce code affiché ci-dessus`);
        
        return {
          success: true,
          method: 'whatsapp_with_backup',
          messageId: result.messageId,
          backupCode: verificationCode,
          message: `Code envoyé par WhatsApp. Code de secours visible dans les logs: ${verificationCode}`
        };
      } else {
        // Mode fallback standard
        console.log(`⚠️ Échec envoi WhatsApp, utilisation du mode fallback. Code: ${verificationCode}`);
        console.log(`📱 Mode dev - Code de vérification pour ${gieCode}: ${verificationCode}`);
        
        return {
          success: true,
          method: 'fallback',
          backupCode: verificationCode,
          message: `Code envoyé via système de fallback (dev mode). Code: ${verificationCode}`
        };
      }

    } catch (error) {
      console.error('❌ Erreur envoi code de vérification:', error);
      
      // Mode fallback en cas d'erreur
      console.log(`⚠️ Mode fallback activé - Code: ${verificationCode} pour GIE: ${gieCode}`);
      return {
        success: true,
        method: 'fallback',
        backupCode: verificationCode,
        message: `Code généré en mode développement: ${verificationCode}`
      };
    }
  }

  /**
   * Envoyer une notification d'investissement
   * @param {string} phoneNumber - Numéro de téléphone
   * @param {Object} investmentData - Données de l'investissement
   */
  async sendInvestmentNotification(phoneNumber, investmentData) {
    try {
      const cleanNumber = phoneNumber.replace(/[\s\-\+]/g, '');
      
      const message = `💰 FEVEO 2050 - Investissement confirmé

GIE : ${investmentData.gieCode}
Montant : ${investmentData.amount.toLocaleString()} FCFA
Jour : ${investmentData.day}/${investmentData.totalDays}

Solde wallet : ${investmentData.newBalance.toLocaleString()} FCFA
Retours cumulés : ${investmentData.totalReturns.toLocaleString()} FCFA

✅ Investissement traité avec succès ! 🌱`;

      return await this.sendTextMessage(cleanNumber, message);

    } catch (error) {
      console.error('❌ Erreur notification investissement:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Tester la connexion à l'API WhatsApp
   */
  async testConnection() {
    try {
      // Vérifier si le token est valide
      const url = `${this.baseURL}/${this.phoneNumberId}`;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Connexion WhatsApp API réussie !');
      return { success: true, data: response.data };
      
    } catch (error) {
      console.log('❌ Échec du test de connexion WhatsApp:', error.response?.data || error.message);
      
      if (error.response?.data?.error?.code === 190) {
        console.log('🔑 Le token WhatsApp a expiré. Veuillez le renouveler.');
        return { 
          success: false, 
          error: 'TOKEN_EXPIRED',
          message: 'Token d\'accès WhatsApp expiré'
        };
      }
      
      return { 
        success: false, 
        error: error.response?.data || error.message 
      };
    }
  }

  /**
   * Vérifier la validité du token
   */
  async isTokenValid() {
    const testResult = await this.testConnection();
    return testResult.success;
  }

  /**
   * Formater un numéro de téléphone sénégalais
   * @param {string} phoneNumber - Numéro à formater
   */
  formatSenegalPhoneNumber(phoneNumber) {
    // Nettoyer le numéro
    let cleaned = phoneNumber.replace(/[\s\-\+]/g, '');
    
    // Si le numéro commence par 7, ajouter 221
    if (cleaned.startsWith('7') && cleaned.length === 9) {
      cleaned = '221' + cleaned;
    }
    
    // Si le numéro commence par 221, garder tel quel
    if (cleaned.startsWith('221') && cleaned.length === 12) {
      return cleaned;
    }
    
    // Autres formats, retourner tel quel
    return cleaned;
  }
}

// Instance singleton
const whatsappService = new WhatsAppService();

module.exports = whatsappService;
