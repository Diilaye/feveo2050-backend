const axios = require('axios');

class WaveService {
  constructor() {
    this.apiKey = process.env.WAVE_API_KEY || '';
    this.baseURL = process.env.WAVE_BASE_URL || 'https://api.wave.com/v1';
    this.checkoutBaseURL = process.env.WAVE_CHECKOUT_BASE_URL || 'https://checkout.wave.com';
    this.webhookSecret = process.env.WAVE_WEBHOOK_SECRET;
    
    // Configuration axios pour Wave
    this.waveClient = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 secondes
    });
  }

  /**
   * Créer un checkout pour un paiement
   * @param {Object} donneesCheckout - Données du checkout
   * @returns {Object} Réponse de Wave avec les détails du checkout
   */
  async creerCheckout(donneesCheckout) {
    try {
      const response = await this.waveClient.post('/checkout/sessions', {
        amount: donneesCheckout.montant.toString(), // Wave attend une string
        currency: donneesCheckout.devise || 'XOF',
        error_url: donneesCheckout.urlErreur,
        success_url: donneesCheckout.urlSucces,
        client_reference: donneesCheckout.referenceClient,
        // restrict_payer_mobile: donneesCheckout.numeroTelephone, // Optionnel pour restreindre à un numéro
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur lors de la création du checkout Wave:', error.response?.data || error.message);
      return {
        success: false,
        error: {
          message: error.response?.data?.message || error.message,
          code: error.response?.data?.code || error.response?.status || 'UNKNOWN_ERROR',
          details: error.response?.data
        }
      };
    }
  }

  /**
   * Vérifier le statut d'un paiement
   * @param {string} checkoutId - ID du checkout Wave (commence par 'cos-')
   * @returns {Object} Statut du paiement
   */
  async verifierStatutPaiement(checkoutId) {
    try {
      const response = await this.waveClient.get(`/checkout/sessions/${checkoutId}`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur lors de la vérification du statut:', error.response?.data || error.message);
      return {
        success: false,
        error: {
          message: error.response?.data?.message || error.message,
          code: error.response?.data?.code || error.response?.status || 'UNKNOWN_ERROR',
          details: error.response?.data
        }
      };
    }
  }

  /**
   * Rembourser un paiement
   * @param {string} checkoutId - ID du checkout à rembourser (commence par 'cos-')
   * @returns {Object} Résultat du remboursement
   */
  async rembourserPaiement(checkoutId) {
    try {
      const response = await this.waveClient.post(`/checkout/sessions/${checkoutId}/refund`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur lors du remboursement:', error.response?.data || error.message);
      return {
        success: false,
        error: {
          message: error.response?.data?.message || error.message,
          code: error.response?.data?.code || error.response?.status || 'UNKNOWN_ERROR',
          details: error.response?.data
        }
      };
    }
  }

  /**
   * Rechercher des checkouts par client_reference
   * @param {string} clientReference - Référence client
   * @returns {Object} Liste des checkouts
   */
  async rechercherCheckouts(clientReference) {
    try {
      const params = new URLSearchParams();
      if (clientReference) params.append('client_reference', clientReference);

      const response = await this.waveClient.get(`/checkout/sessions/search?${params.toString()}`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur lors de la recherche des checkouts:', error.response?.data || error.message);
      return {
        success: false,
        error: {
          message: error.response?.data?.message || error.message,
          code: error.response?.data?.code || error.response?.status || 'UNKNOWN_ERROR',
          details: error.response?.data
        }
      };
    }
  }

  /**
   * Obtenir les détails d'un checkout spécifique
   * @param {string} checkoutId - ID du checkout (commence par 'cos-')
   * @returns {Object} Détails du checkout
   */
  async obtenirDetailsCheckout(checkoutId) {
    try {
      const response = await this.waveClient.get(`/checkout/sessions/${checkoutId}`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des détails:', error.response?.data || error.message);
      return {
        success: false,
        error: {
          message: error.response?.data?.message || error.message,
          code: error.response?.data?.code || error.response?.status || 'UNKNOWN_ERROR',
          details: error.response?.data
        }
      };
    }
  }

  /**
   * Valider une signature de webhook Wave
   * @param {string} payload - Corps de la requête
   * @param {string} signature - Signature Wave
   * @returns {boolean} Signature valide ou non
   */
  validerSignatureWebhook(payload, signature) {
    if (!this.webhookSecret) {
      console.warn('Aucun secret webhook configuré, validation ignorée');
      return true; // En dev, on peut ignorer la validation
    }
    
    // Implementation dépend de la méthode de signature utilisée par Wave
    // Généralement HMAC SHA256
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', this.webhookSecret);
    hmac.update(payload);
    const calculatedSignature = hmac.digest('hex');
    
    return signature === calculatedSignature;
  }

  /**
   * Expirer un checkout
   * @param {string} checkoutId - ID du checkout à expirer
   * @returns {Object} Résultat de l'expiration
   */
  async expirerCheckout(checkoutId) {
    try {
      const response = await this.waveClient.post(`/checkout/sessions/${checkoutId}/expire`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur lors de l\'expiration du checkout:', error.response?.data || error.message);
      return {
        success: false,
        error: {
          message: error.response?.data?.message || error.message,
          code: error.response?.data?.code || error.response?.status || 'UNKNOWN_ERROR',
          details: error.response?.data
        }
      };
    }
  }

  /**
   * Formater le montant pour Wave 
   * Pour XOF, Wave n'accepte pas de décimales selon la documentation
   * @param {number} montant - Montant en francs CFA
   * @returns {string} Montant formaté comme string sans décimales
   */
  formaterMontant(montant) {
    // Pour XOF, Wave attend le montant entier sans décimales
    return Math.round(montant).toString();
  }

  /**
   * Convertir le montant de Wave vers francs CFA
   * @param {string} montantString - Montant Wave comme string
   * @returns {number} Montant en francs CFA
   */
  convertirDepuisWave(montantString) {
    return parseInt(montantString, 10);
  }

  /**
   * Générer une URL de paiement directe (si nécessaire pour des cas simples)
   * @param {Object} donneesCheckout - Données du checkout
   * @returns {string} URL de paiement
   */
  genererUrlPaiement(donneesCheckout) {
    const params = new URLSearchParams({
      amount: this.formaterMontant(donneesCheckout.montant),
      currency: donneesCheckout.devise || 'XOF',
      client_reference: donneesCheckout.referenceClient,
      success_url: donneesCheckout.urlSucces,
      error_url: donneesCheckout.urlErreur
    });

    return `${this.checkoutBaseURL}/checkout?${params.toString()}`;
  }
}

module.exports = WaveService;
