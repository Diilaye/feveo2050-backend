const Paiement = require('../models/Paiement');
const GIE = require('../models/GIE');
const WaveService = require('../services/WaveService');
const { validationResult } = require('express-validator');

class PaiementController {
  constructor() {
    this.waveService = new WaveService();
    
    // Binder les méthodes pour préserver le contexte 'this'
    this.creerPaiement = this.creerPaiement.bind(this);
    this.obtenirPaiement = this.obtenirPaiement.bind(this);
    this.obtenirPaiementParReference = this.obtenirPaiementParReference.bind(this);
    this.listerPaiements = this.listerPaiements.bind(this);
    this.verifierStatutPaiement = this.verifierStatutPaiement.bind(this);
    this.webhookWave = this.webhookWave.bind(this);
    this.annulerPaiement = this.annulerPaiement.bind(this);
    this.traiterPaiementReussi = this.traiterPaiementReussi.bind(this);
  }

  /**
   * Créer un nouveau paiement
   */
  async creerPaiement(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Données de paiement invalides',
          errors: errors.array()
        });
      }

      const {
        montant,
        devise = 'XOF',
        typePaiement,
        methodePaiement = 'wave',
        metadonnees = {}
      } = req.body;

      const gieCode = req.body.gieCode || null;

      // Vérifier si l'entité existe

      const gie = await GIE.findOne({ identifiantGIE: gieCode });

      if (!gie) {
        return res.status(404).json({
          success: false,
          message: 'GIE non trouvé'
        });
      }

      // Créer l'enregistrement de paiement
      const nouveauPaiement = new Paiement({
        montant,
        devise,
        typePaiement,
        entiteId: gie._id,
        typeEntite: 'GIE',
        methodePaiement,
        metadonnees,
        dateExpiration: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
      });

      await nouveauPaiement.save();

      // Si paiement Wave, créer le checkout
      if (methodePaiement === 'wave') {
        // Gestion des URLs pour Wave (exige HTTPS)
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const isLocalhost = frontendUrl.includes('localhost') || frontendUrl.includes('127.0.0.1');
        
        // URLs pour Wave - doit être HTTPS en production, URLs de test en développement
        let urlSucces, urlErreur;
        
        if (isLocalhost && process.env.NODE_ENV === 'development') {
          // URLs de test pour le développement local
          urlSucces = `https://httpbin.org/get?ref=${nouveauPaiement.referencePaiement}&status=success`;
          urlErreur = `https://httpbin.org/get?ref=${nouveauPaiement.referencePaiement}&status=error`;
        } else {
          // URLs de production (doivent être HTTPS)
          urlSucces = `${frontendUrl}/paiement/succes?ref=${nouveauPaiement.referencePaiement}`;
          urlErreur = `${frontendUrl}/paiement/erreur?ref=${nouveauPaiement.referencePaiement}`;
        }

        const donneesCheckout = {
          montant: montant, // Montant original, sera formaté dans le service
          devise,
          referenceClient: nouveauPaiement.referencePaiement,
          urlSucces: urlSucces,
          urlErreur: urlErreur
        };

        console.log('🔄 Création checkout Wave avec URLs:', {
          urlSucces,
          urlErreur,
          reference: nouveauPaiement.referencePaiement,
          montant,
          isLocalhost
        });

        const resultatCheckout = await this.waveService.creerCheckout(donneesCheckout);

        if (resultatCheckout.success) {
          // Mettre à jour le paiement avec les données Wave
          nouveauPaiement.waveTransactionId = resultatCheckout.data.id; // ID du checkout Wave
          nouveauPaiement.donneesWave = resultatCheckout.data;
          nouveauPaiement.statut = 'en_cours';
          nouveauPaiement.ajouterChangementStatut('en_cours', 'Checkout Wave créé', resultatCheckout.data);
          
          await nouveauPaiement.save();

          return res.status(201).json({
            success: true,
            message: 'Paiement créé avec succès',
            data: {
              paiement: nouveauPaiement,
              urlPaiement: resultatCheckout.data.wave_launch_url
            }
          });
        } else {
          // Échec de création du checkout Wave
          nouveauPaiement.marquerEchoue(
            resultatCheckout.error.message,
            resultatCheckout.error.code
          );
          await nouveauPaiement.save();

          return res.status(400).json({
            success: false,
            message: 'Erreur lors de la création du paiement Wave',
            error: resultatCheckout.error
          });
        }
      }

      // Pour les autres méthodes de paiement
      return res.status(201).json({
        success: true,
        message: 'Paiement créé avec succès',
        data: {
          paiement: nouveauPaiement
        }
      });

    } catch (error) {
      console.error('Erreur création paiement:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur',
        error: error.message
      });
    }
  }

  /**
   * Obtenir les détails d'un paiement
   */
  async obtenirPaiement(req, res) {
    try {
      const { id } = req.params;

      const paiement = await Paiement.findById(id)
        .populate('utilisateurId', 'nom prenom email')
        .populate('entiteId');

      if (!paiement) {
        return res.status(404).json({
          success: false,
          message: 'Paiement non trouvé'
        });
      }

      // Vérifier les permissions
      if (paiement.utilisateurId._id.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Accès non autorisé'
        });
      }

      res.json({
        success: true,
        data: { paiement }
      });

    } catch (error) {
      console.error('Erreur récupération paiement:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur',
        error: error.message
      });
    }
  }

  /**
   * Obtenir un paiement par référence
   */
  async obtenirPaiementParReference(req, res) {
    try {
      const { reference } = req.params;

      const paiement = await Paiement.findOne({ referencePaiement: reference })
        .populate('utilisateurId', 'nom prenom email')
        .populate('entiteId');

      if (!paiement) {
        return res.status(404).json({
          success: false,
          message: 'Paiement non trouvé'
        });
      }

      res.json({
        success: true,
        data: { paiement }
      });

    } catch (error) {
      console.error('Erreur récupération paiement par référence:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur',
        error: error.message
      });
    }
  }

  /**
   * Lister les paiements d'un utilisateur
   */
  async listerPaiements(req, res) {
    try {
      const {
        page = 1,
        limite = 10,
        statut,
        typePaiement,
        dateDebut,
        dateFin
      } = req.query;

      const filtres = { utilisateurId: req.user.id };

      if (statut) filtres.statut = statut;
      if (typePaiement) filtres.typePaiement = typePaiement;
      if (dateDebut || dateFin) {
        filtres.dateCreation = {};
        if (dateDebut) filtres.dateCreation.$gte = new Date(dateDebut);
        if (dateFin) filtres.dateCreation.$lte = new Date(dateFin);
      }

      const paiements = await Paiement.find(filtres)
        .populate('entiteId')
        .sort({ dateCreation: -1 })
        .limit(limite * 1)
        .skip((page - 1) * limite);

      const total = await Paiement.countDocuments(filtres);

      res.json({
        success: true,
        data: {
          paiements,
          pagination: {
            page: parseInt(page),
            limite: parseInt(limite),
            total,
            pages: Math.ceil(total / limite)
          }
        }
      });

    } catch (error) {
      console.error('Erreur listage paiements:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur',
        error: error.message
      });
    }
  }

  /**
   * Vérifier le statut d'un paiement Wave
   */
  async verifierStatutPaiement(req, res) {
    try {
      const { id } = req.params;

      const paiement = await Paiement.findById(id);

      if (!paiement) {
        return res.status(404).json({
          success: false,
          message: 'Paiement non trouvé'
        });
      }

      if (!paiement.waveTransactionId) {
        return res.status(400).json({
          success: false,
          message: 'Ce paiement n\'est pas associé à Wave'
        });
      }

      const resultatVerification = await this.waveService.verifierStatutPaiement(
        paiement.waveTransactionId
      );

      if (resultatVerification.success) {
        const checkoutData = resultatVerification.data;
        const statutWave = checkoutData.checkout_status;
        const paymentStatus = checkoutData.payment_status;
        
        // Mettre à jour le statut si nécessaire selon la documentation Wave
        if (statutWave === 'complete' && paymentStatus === 'succeeded' && paiement.statut !== 'reussi') {
          paiement.marquerReussi(checkoutData);
          await paiement.save();
        } else if (statutWave === 'expired' && paiement.statut !== 'annule') {
          paiement.statut = 'annule';
          paiement.ajouterChangementStatut('annule', 'Session Wave expirée');
          await paiement.save();
        } else if (paymentStatus === 'cancelled' && paiement.statut !== 'annule') {
          paiement.statut = 'annule';
          paiement.ajouterChangementStatut('annule', 'Paiement annulé par l\'utilisateur');
          await paiement.save();
        }

        res.json({
          success: true,
          data: {
            paiement,
            statutWave: checkoutData
          }
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erreur lors de la vérification du statut',
          error: resultatVerification.error
        });
      }

    } catch (error) {
      console.error('Erreur vérification statut:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur',
        error: error.message
      });
    }
  }

  /**
   * Webhook Wave pour les notifications de paiement
   */
  async webhookWave(req, res) {
    try {
      const { checkout_status, payment_status, client_reference, id } = req.body;

      // Trouver le paiement par référence
      const paiement = await Paiement.findOne({ referencePaiement: client_reference });

      if (!paiement) {
        console.error('Paiement non trouvé pour la référence:', client_reference);
        return res.status(404).json({ error: 'Paiement non trouvé' });
      }

      // Mettre à jour le statut selon la notification Wave
      if (checkout_status === 'complete' && payment_status === 'succeeded') {
        if (paiement.statut !== 'reussi') {
          paiement.marquerReussi(req.body);
          await paiement.save();
          
          // Traiter le paiement réussi
          await this.traiterPaiementReussi(paiement);
        }
      } else if (checkout_status === 'expired') {
        if (paiement.statut !== 'annule') {
          paiement.statut = 'annule';
          paiement.ajouterChangementStatut('annule', 'Session Wave expirée');
          await paiement.save();
        }
      } else if (payment_status === 'cancelled') {
        if (paiement.statut !== 'annule') {
          paiement.statut = 'annule';
          paiement.ajouterChangementStatut('annule', 'Paiement annulé via webhook Wave');
          await paiement.save();
        }
      } else if (payment_status === 'processing') {
        // Paiement en cours de traitement
        if (paiement.statut !== 'en_cours') {
          paiement.statut = 'en_cours';
          paiement.ajouterChangementStatut('en_cours', 'Paiement en cours de traitement');
          await paiement.save();
        }
      }

      res.status(200).json({ received: true });

    } catch (error) {
      console.error('Erreur webhook Wave:', error);
      res.status(500).json({ error: 'Erreur interne' });
    }
  }

  /**
   * Traiter un paiement réussi (logique métier)
   */
  async traiterPaiementReussi(paiement) {
    try {
      switch (paiement.typePaiement) {
        case 'adhesion_gie':
          // Valider l'adhésion au GIE
          const Adhesion = require('../models/Adhesion');
          await Adhesion.findByIdAndUpdate(paiement.entiteId, {
            statutPaiement: 'paye',
            datePaiement: new Date(),
            statutAdhesion: 'validee'
          });
          break;

        case 'investissement':
          // Confirmer l'investissement
          const CycleInvestissement = require('../models/CycleInvestissement');
          await CycleInvestissement.findByIdAndUpdate(paiement.entiteId, {
            statutPaiement: 'paye',
            datePaiement: new Date()
          });
          break;

        // Ajouter d'autres types de paiement selon vos besoins
      }
    } catch (error) {
      console.error('Erreur traitement paiement réussi:', error);
    }
  }

  /**
   * Annuler un paiement
   */
  async annulerPaiement(req, res) {
    try {
      const { id } = req.params;

      const paiement = await Paiement.findById(id);

      if (!paiement) {
        return res.status(404).json({
          success: false,
          message: 'Paiement non trouvé'
        });
      }

      // Vérifier les permissions
      if (paiement.utilisateurId.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Accès non autorisé'
        });
      }

      // Vérifier si le paiement peut être annulé
      if (!['en_attente', 'en_cours'].includes(paiement.statut)) {
        return res.status(400).json({
          success: false,
          message: 'Ce paiement ne peut pas être annulé'
        });
      }

      paiement.statut = 'annule';
      paiement.ajouterChangementStatut('annule', 'Annulé par l\'utilisateur');
      await paiement.save();

      res.json({
        success: true,
        message: 'Paiement annulé avec succès',
        data: { paiement }
      });

    } catch (error) {
      console.error('Erreur annulation paiement:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur',
        error: error.message
      });
    }
  }
}

module.exports = new PaiementController();
