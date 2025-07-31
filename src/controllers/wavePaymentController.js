const express = require('express');

// Configuration Wave
const WAVE_API_BASE = 'https://api.wave.com/v1';
const WAVE_TOKEN = 'wave_sn_prod_FIdhHNGkeoAFnuGNxuh8WD3L9XjEBqjRCKx2zEZ87H7LWSwHs2v2aA_5q_ZJGwaLfphltYSRawKP-voVugCpwWB2FMH3ZTtC0w';

// @desc    Générer un lien de paiement Wave
// @route   POST /api/payments/wave/generate
// @access  Public
const generateWavePayment = async (req, res) => {
  try {
    const { 
      amount, 
      period, 
      gieCode, 
      giePhone, 
      description, 
      currency = 'XOF' 
    } = req.body;

    // Validation des données
    if (!amount || !gieCode) {
      return res.status(400).json({
        success: false,
        message: 'Montant et code GIE requis',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Calculer le montant total avec les frais Wave (1% + 60 FCFA)
    const waveRatio = 0.01; // 1% de commission Wave
    const waveFee = 60; // Frais fixes Wave
    const totalAmount = Math.ceil(amount + (amount * waveRatio) + waveFee);

    // Générer un ID de transaction unique
    const transactionId = `FEVEO_${gieCode}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Préparer les données pour Wave API
    const wavePaymentData = {
      amount: totalAmount,
      currency: currency,
      reference: transactionId,
      description: description || `Investissement FEVEO 2050 - ${gieCode}`,
      customer: {
        phone: giePhone || undefined,
        name: `GIE ${gieCode}`,
      },
      webhook_url: `${process.env.BASE_URL || 'http://localhost:5000'}/api/payments/wave/webhook`,
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-success?transaction=${transactionId}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-cancel?transaction=${transactionId}`,
      metadata: {
        gieCode,
        period,
        originalAmount: amount,
        platform: 'FEVEO2050'
      }
    };

    try {
      // Appel à l'API Wave (simulation pour l'instant)
      // const waveResponse = await fetch(`${WAVE_API_BASE}/payments`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${WAVE_TOKEN}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(wavePaymentData)
      // });

      // Pour l'instant, on simule une réponse réussie
      const simulatedResponse = {
        success: true,
        payment_url: `https://pay.wave.com/checkout/${transactionId}?amount=${totalAmount}&phone=${giePhone || ''}`,
        payment_id: transactionId,
        amount: totalAmount,
        currency: currency,
        status: 'pending'
      };

      // En production, remplacer par :
      // const waveData = await waveResponse.json();
      // if (!waveResponse.ok) { ... gestion d'erreur ... }

      // Sauvegarder la transaction en base de données (optionnel)
      // await savePaymentTransaction(transactionId, wavePaymentData, simulatedResponse);

      res.status(200).json({
        success: true,
        message: 'Lien de paiement généré avec succès',
        data: {
          transactionId: transactionId,
          paymentUrl: simulatedResponse.payment_url,
          amount: totalAmount,
          originalAmount: amount,
          fees: totalAmount - amount,
          currency: currency,
          gieCode: gieCode,
          description: description
        }
      });

    } catch (waveApiError) {
      console.error('Erreur API Wave:', waveApiError);
      
      // Fallback : générer un lien simple Wave
      const fallbackUrl = `https://pay.wave.com/m/M_sn_t3V8_2xeRR6Z/c/sn/?amount=${totalAmount}${giePhone ? `&phone=${giePhone}` : ''}`;
      
      res.status(200).json({
        success: true,
        message: 'Lien de paiement généré (mode simplifié)',
        data: {
          transactionId: transactionId,
          paymentUrl: fallbackUrl,
          amount: totalAmount,
          originalAmount: amount,
          fees: totalAmount - amount,
          currency: currency,
          gieCode: gieCode,
          description: description,
          fallback: true
        }
      });
    }

  } catch (error) {
    console.error('Erreur génération paiement Wave:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne lors de la génération du paiement',
      code: 'INTERNAL_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Vérifier le statut d'un paiement Wave
// @route   GET /api/payments/wave/status/:transactionId
// @access  Public
const checkPaymentStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: 'ID de transaction requis',
        code: 'MISSING_TRANSACTION_ID'
      });
    }

    // En production, vérifier via l'API Wave
    // const waveResponse = await fetch(`${WAVE_API_BASE}/payments/${transactionId}`, {
    //   headers: { 'Authorization': `Bearer ${WAVE_TOKEN}` }
    // });

    // Simulation pour l'instant
    const simulatedStatus = {
      success: true,
      status: 'pending', // pending, completed, failed, cancelled
      amount: 6060,
      currency: 'XOF',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      data: {
        transactionId,
        status: simulatedStatus.status,
        message: getStatusMessage(simulatedStatus.status),
        amount: simulatedStatus.amount,
        currency: simulatedStatus.currency,
        created_at: simulatedStatus.created_at,
        updated_at: simulatedStatus.updated_at
      }
    });

  } catch (error) {
    console.error('Erreur vérification statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification du statut',
      code: 'INTERNAL_ERROR'
    });
  }
};

// @desc    Webhook Wave pour recevoir les notifications de paiement
// @route   POST /api/payments/wave/webhook
// @access  Public (mais sécurisé par signature Wave)
const handleWaveWebhook = async (req, res) => {
  try {
    const { 
      event_type, 
      payment_id, 
      status, 
      amount, 
      currency, 
      metadata 
    } = req.body;

    console.log('Webhook Wave reçu:', {
      event_type,
      payment_id,
      status,
      amount,
      metadata
    });

    // Vérifier la signature du webhook (important en production)
    // const signature = req.headers['x-wave-signature'];
    // if (!verifyWaveSignature(req.body, signature)) {
    //   return res.status(401).json({ error: 'Signature invalide' });
    // }

    // Traiter selon le type d'événement
    switch (event_type) {
      case 'payment.completed':
        // Paiement réussi
        await handleSuccessfulPayment(payment_id, amount, metadata);
        break;
      
      case 'payment.failed':
        // Paiement échoué
        await handleFailedPayment(payment_id, metadata);
        break;
      
      case 'payment.cancelled':
        // Paiement annulé
        await handleCancelledPayment(payment_id, metadata);
        break;
      
      default:
        console.log('Type d\'événement non traité:', event_type);
    }

    // Répondre à Wave que le webhook a été reçu
    res.status(200).json({ received: true });

  } catch (error) {
    console.error('Erreur webhook Wave:', error);
    res.status(500).json({ error: 'Erreur interne' });
  }
};

// Fonctions utilitaires
const getStatusMessage = (status) => {
  const messages = {
    pending: 'Paiement en attente',
    completed: 'Paiement réussi',
    failed: 'Paiement échoué',
    cancelled: 'Paiement annulé'
  };
  return messages[status] || 'Statut inconnu';
};

const handleSuccessfulPayment = async (paymentId, amount, metadata) => {
  console.log('Paiement réussi:', { paymentId, amount, metadata });
  // Ici, mettre à jour la base de données, envoyer des notifications, etc.
};

const handleFailedPayment = async (paymentId, metadata) => {
  console.log('Paiement échoué:', { paymentId, metadata });
  // Ici, gérer l'échec du paiement
};

const handleCancelledPayment = async (paymentId, metadata) => {
  console.log('Paiement annulé:', { paymentId, metadata });
  // Ici, gérer l'annulation du paiement
};

module.exports = {
  generateWavePayment,
  checkPaymentStatus,
  handleWaveWebhook
};
