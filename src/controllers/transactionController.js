const transactionModel = require('../models/Transaction');
const GIE = require('../models/GIE');
const crypto = require('crypto');
const axios = require('axios');

const orderid = require('order-id')('diikaanedevfeveo');
const message = require('../utils/message');

// Configuration des services de paiement
const paymentServices = {
    WAVE: {
        baseUrl: process.env.WAVE_API_URL || 'https://api.wave.com',
        apiKey: process.env.WAVE_API_KEY || 'wave_api_key',
        secretKey: process.env.WAVE_SECRET_KEY || 'wave_secret_key',
        callbackUrl: process.env.WAVE_CALLBACK_URL || 'https://api.feveo2050.sn/api/transactions/wave/callback'
    },
    OM: {
        baseUrl: process.env.OM_API_URL || 'https://api.orange.com',
        apiKey: process.env.OM_API_KEY || 'om_api_key',
        secretKey: process.env.OM_SECRET_KEY || 'om_secret_key',
        callbackUrl: process.env.OM_CALLBACK_URL || 'https://api.feveo2050.sn/api/transactions/om/callback'
    },
    VIREMENT: {
        accountNumber: process.env.FEVEO_ACCOUNT_NUMBER || '123456789',
        bankName: process.env.FEVEO_BANK_NAME || 'Banque Atlantique',
        instructions: 'Veuillez inclure la référence de transaction dans votre virement bancaire.'
    },
    ESPECES: {
        offices: [
            { name: 'Bureau Dakar', address: 'Rue 123, Dakar', phone: '+221 33 123 45 67' },
            { name: 'Bureau Saint-Louis', address: 'Avenue ABC, Saint-Louis', phone: '+221 33 765 43 21' }
        ],
        instructions: 'Veuillez présenter votre ID et référence de transaction lors du paiement en espèces.'
    }
};

const populateObject = [ {
    path: 'gieId',
    select: 'identifiantGIE nomGIE presidenteNom presidentePrenom presidenteTelephone'
}, {
    path: 'cycleInvestissementId',
    select: 'nom dateDebut dateFin'
}];

/**
 * Génère un lien de paiement en fonction de la méthode choisie
 * @param {Object} transaction - La transaction
 * @param {String} baseUrl - L'URL de base pour le callback frontend
 * @returns {Object} - Informations de paiement incluant liens et instructions
 */
async function generatePaymentLink(transaction, baseUrl = 'https://feveo.org/payment') {
    try {
        const paymentInfo = {
            transactionId: transaction.reference,
            method: transaction.method,
            amount: transaction.amount,
            date: new Date(),
            links: {},
            instructions: null,
            qrCode: null,
            deepLink: null,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expire dans 24h
        };

        // URL de redirection après paiement
        const successUrl = `${baseUrl}/success?ref=${transaction.reference}&token=${transaction.token}`;
        const cancelUrl = `${baseUrl}/cancel?ref=${transaction.reference}&token=${transaction.token}`;
        
        switch (transaction.method) {
            case 'WAVE':
                // Intégration Wave (simulée)
                paymentInfo.links = {
                    payment: `${paymentServices.WAVE.baseUrl}/checkout/${transaction.reference}?amount=${transaction.amount}`,
                    success: successUrl,
                    cancel: cancelUrl
                };
                paymentInfo.deepLink = `wave://payment?recipient=FEVEO&amount=${transaction.amount}&reference=${transaction.reference}`;
                paymentInfo.qrCode = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(paymentInfo.deepLink)}&size=200x200`;
                break;
            
            case 'OM':
                // Intégration Orange Money (simulée)
                paymentInfo.links = {
                    payment: `${paymentServices.OM.baseUrl}/checkout/${transaction.reference}?amount=${transaction.amount}`,
                    success: successUrl,
                    cancel: cancelUrl
                };
                paymentInfo.deepLink = `om://payment?recipient=FEVEO&amount=${transaction.amount}&reference=${transaction.reference}`;
                paymentInfo.qrCode = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(paymentInfo.deepLink)}&size=200x200`;
                break;
            
            case 'VIREMENT':
                paymentInfo.links = {
                    verification: `${baseUrl}/verify?ref=${transaction.reference}`
                };
                paymentInfo.instructions = {
                    bankName: paymentServices.VIREMENT.bankName,
                    accountNumber: paymentServices.VIREMENT.accountNumber,
                    reference: transaction.reference,
                    instructions: `${paymentServices.VIREMENT.instructions} Référence à indiquer: ${transaction.reference}`
                };
                break;
                
            case 'ESPECES':
                paymentInfo.links = {
                    verification: `${baseUrl}/verify?ref=${transaction.reference}`
                };
                paymentInfo.instructions = {
                    offices: paymentServices.ESPECES.offices,
                    reference: transaction.reference,
                    instructions: `${paymentServices.ESPECES.instructions} Référence à présenter: ${transaction.reference}`
                };
                break;
        }
        
        // Stocker les informations de paiement dans la transaction
        transaction.paymentInfo = paymentInfo;
        await transaction.save();
        
        return paymentInfo;
    } catch (error) {
        console.error('Erreur génération lien de paiement:', error);
        throw error;
    }
}

exports.store = async (req, res, next) => {
    try {
        let { 
            amount, 
            method, 
            gieCode,
            operationType, 
            daysInvested // jours investis 1 , 10 , 15 , 30
        } = req.body;

        // Validation des champs requis
        if (!amount ) {
            return message.reponse(res, 'Montant  de paiement requis', 400, null);
        }

        // Validation du type d'opération
        if (operationType && !['ADHESION', 'INVESTISSEMENT'].includes(operationType)) {
            return message.reponse(res, 'Type d\'opération invalide', 400, null);
        }
        
        const id = orderid.generate();
        
        const transaction = new transactionModel();
        
        transaction.reference = orderid.getTime(id);
        transaction.token = id;
        transaction.amount = amount;
        transaction.method = method;

        // Définir le type d'opération
        transaction.operationType = operationType || 'INVESTISSEMENT'; // Par défaut INVESTISSEMENT

        // Support pour les GIE FEVEO 2050
        if (gieCode) {
            const gie = await GIE.findOne({ identifiantGIE: gieCode });
            if (gie) {
                transaction.gieId = gie._id;
            } else {
                return message.reponse(res, 'GIE non trouvé', 404 , null);
            }
        }

        // Pour les opérations d'investissement
        if (operationType === 'INVESTISSEMENT') {
            if (daysInvested) {
                transaction.daysInvested = daysInvested;
            } else {
                return message.reponse(res, 'Cycle d\'investissement requis pour une opération d\'investissement', 400, null);
            }
            
            // Les dates seront calculées automatiquement par les middleware pre-save
        }

        const saveTransaction = await transaction.save();

        
        // Récupérer la transaction complète avec les liens de paiement
        const findTransaction = await transactionModel.findById(saveTransaction.id)
            .populate(populateObject)
            .exec();

            req.transaction = findTransaction;

      next();

    } catch (error) {
        console.error("Erreur création transaction:", error);
        return message.reponse(res, message.error, 400, error);
    }
}

exports.all = async (req, res, next) => {
    try {
        // Support pour filtrer par GIE
        let query = { ...req.query };
        
        if (req.query.gieCode) {
            const gie = await GIE.findOne({ identifiantGIE: req.query.gieCode });
            if (gie) {
                query.gieId = gie._id;
                delete query.gieCode;
            }
        }

        const transactions = await transactionModel.find(query)
            .populate(populateObject)
            .sort({ createdAt: -1 })
            .exec(); 

        return message.reponse(res, message.findObject('transaction'), 200, transactions);

    } catch (error) {
        return message.reponse(res, message.error, 400, error);
    }
}

exports.one = async (req, res, next) => {
    try {
        const transaction = await transactionModel.findById(req.params.id)
            .populate(populateObject)
            .exec(); 
        
        if (!transaction) {
            return message.reponse(res, 'Transaction non trouvée', 404, null);
        }

        return message.reponse(res, message.findObject('transaction'), 200, transaction);
        
    } catch (error) {
        return message.reponse(res, message.error, 400, error);
    }
}

exports.update = async (req, res, next) => {
    try {
        let { status } = req.body;

        const transaction = await transactionModel.findById(req.params.id)
            .populate(populateObject)
            .exec();

        if (!transaction) {
            return message.reponse(res, 'Transaction non trouvée', 404, null);
        }

        if (status !== undefined) {
            transaction.status = status;
        }

        const saveTransaction = await transaction.save();

        // Si c'est une transaction GIE et que le statut devient SUCCESS, activer le GIE
        if (status === 'SUCCESS' && transaction.gieId) {
            await activateGIEAfterPayment(transaction.gieId);
        }

        return message.reponse(res, message.updateObject('Status'), 200, saveTransaction);

    } catch (error) {
        return message.reponse(res, message.error, 400, error);
    }
}

exports.delete = (req, res, next) => transactionModel.findByIdAndDelete(req.params.id)
    .then(result => {
        res.json({
            message: 'Suppression réussie',
            status: 'OK',
            data: result,
            statusCode: 200
        });
    })
    .catch(error => res.json({
        message: 'Erreur suppression',
        statusCode: 404,
        data: error,
        status: 'NOT OK'
}));


exports.successWave = async (req, res) => {
    try {
        let transaction = null;
        let redirectUrl = process.env.FRONTEND_URL || 'https://feveo2050.sn';

        console.log('req.query vers:', req.query);
        console.log('req.body vers:', req.body);
        console.log('req.headers vers:', req.headers);
        console.log('req.params vers:', req.params);
        console.log('req.transaction vers:', req.transaction);

        // Vérifier la signature Wave (en production)
       // const isValidCallback = validateWaveCallback(req);
        
       /* if (!isValidCallback && process.env.NODE_ENV === 'production') {
            console.warn("⚠️ Signature Wave invalide:", req.body);
            return res.status(403).json({ status: 'error', message: 'Signature invalide' });
        } */

        // Identifier la transaction par son ID ou référence
        if (req.query.token) {
            const transactionId = req.query.token;
            transaction = await transactionModel.findOne({ reference: transactionId });
        } 
        else if (req.query.token || req.body.token) {
            const token = req.query.token || req.body.token;
            transaction = await transactionModel.findOne({ token });
        }
        
        // Si transaction trouvée, la mettre à jour
        if (transaction) {
            // Enregistrer les détails de la réponse Wave
            const paymentDetails = {
                provider: 'WAVE',
                providerId: req.body.wavePaymentId || req.query.wavePaymentId,
                customerPhone: req.body.customerPhone || req.query.customerPhone,
                timestamp: new Date(),
                rawResponse: req.body
            };
            
            transaction.status = 'SUCCESS';
            transaction.paymentStatus = 'PAID';
            
            if (!transaction.paymentInfo) transaction.paymentInfo = {};
            transaction.paymentInfo.confirmation = paymentDetails;
            
            
            // Activer le GIE si applicable
            if (transaction.gieId && transaction.operationType === 'ADHESION') {
                await activateGIEAfterPayment(transaction.gieId);
            } else {
                transaction.daysInvestedSuccess += transaction.daysInvestedSuccess || 0; // Ajouter les jours investis
            }

            await transaction.save();

            
            // Configurer URL de redirection avec paramètres
            redirectUrl = `${redirectUrl}/payment/success?ref=${transaction.reference}&token=${transaction.token}`;
        } else {
            redirectUrl = `${redirectUrl}/payment/error?message=transaction_not_found`;
        }
        
        // API callback: renvoyer JSON
        if (req.headers['accept'] === 'application/json') {
            return res.json({
                status: transaction ? 'success' : 'error',
                message: transaction ? 'Paiement confirmé' : 'Transaction non trouvée',
                data: transaction ? {
                    reference: transaction.reference,
                    status: transaction.status
                } : null
            });
        }
        
        // Redirection frontend ou fermeture de fenêtre selon le contexte
        if (req.query.redirect === 'true') {
            return res.redirect(redirectUrl);
        } else {
            return res.send(`
                <!DOCTYPE html>
                <html lang="fr">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Paiement Wave Confirmé</title>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            background-color: #f8f9fa;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            height: 100vh;
                            margin: 0;
                            color: #333;
                            text-align: center;
                            padding: 20px;
                        }
                        .payment-container {
                            background-color: white;
                            border-radius: 10px;
                            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                            padding: 30px;
                            max-width: 400px;
                            width: 100%;
                        }
                        .success-icon {
                            color: #28a745;
                            font-size: 50px;
                            margin-bottom: 20px;
                        }
                        .reference {
                            background-color: #f1f1f1;
                            padding: 10px;
                            border-radius: 5px;
                            font-family: monospace;
                            margin: 20px 0;
                        }
                        h2 {
                            color: #28a745;
                            margin-top: 0;
                        }
                        .progress-bar {
                            width: 100%;
                            height: 6px;
                            background-color: #e9ecef;
                            border-radius: 3px;
                            margin-top: 20px;
                            overflow: hidden;
                        }
                        .progress {
                            height: 100%;
                            width: 100%;
                            background-color: #28a745;
                            animation: countdown 2s linear forwards;
                        }
                        @keyframes countdown {
                            from { width: 100%; }
                            to { width: 0%; }
                        }
                        .wave-logo {
                            max-width: 80px;
                            margin-bottom: 20px;
                        }
                    </style>
                </head>
                <body>
                    <div class="payment-container">
                        <div class="success-icon">✅</div>
                        <img src="https://wave.com/assets/logo-wave.png" alt="Wave" class="wave-logo">
                        <h2>Paiement confirmé!</h2>
                        <p>Votre transaction a été traitée avec succès.</p>
                        ${transaction ? `
                            <div class="reference">
                                Référence: ${transaction.reference}
                            </div>
                        ` : ''}
                        <p>Cette fenêtre se fermera automatiquement dans 2 secondes...</p>
                        <div class="progress-bar">
                            <div class="progress"></div>
                        </div>
                    </div>
                    
                    <script>
                        // Envoi d'un message à la fenêtre parent
                        window.opener && window.opener.postMessage({
                            status: 'success', 
                            provider: 'wave',
                            reference: '${transaction ? transaction.reference : ''}'
                        }, '*');
                        
                        // Fermeture automatique après 2 secondes
                        setTimeout(() => window.close(), 2000);
                    </script>
                </body>
                </html>
            `);
        }
    } catch (error) {
        console.error("❌ Erreur callback Wave:", error);
        return message.reponse(res, message.error, 400, error);
    }
}


exports.errorWave = async (req, res) => {
    try {
        // Support pour les transactions GIE directes
        if (req.query.transactionId) {
            const transaction = await transactionModel.findOne({ 
                reference: req.query.token 
            });
            
            if (transaction) {
                transaction.status = 'CANCELED';
                await transaction.save();
                return res.send(`
                    <!DOCTYPE html>
                    <html lang="fr">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Paiement Wave Annulé</title>
                        <style>
                            body {
                                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                                background-color: #f8f9fa;
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                justify-content: center;
                                height: 100vh;
                                margin: 0;
                                color: #333;
                                text-align: center;
                                padding: 20px;
                            }
                            .payment-container {
                                background-color: white;
                                border-radius: 10px;
                                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                                padding: 30px;
                                max-width: 400px;
                                width: 100%;
                            }
                            .error-icon {
                                color: #dc3545;
                                font-size: 50px;
                                margin-bottom: 20px;
                            }
                            .reference {
                                background-color: #f1f1f1;
                                padding: 10px;
                                border-radius: 5px;
                                font-family: monospace;
                                margin: 20px 0;
                            }
                            h2 {
                                color: #dc3545;
                                margin-top: 0;
                            }
                            .progress-bar {
                                width: 100%;
                                height: 6px;
                                background-color: #e9ecef;
                                border-radius: 3px;
                                margin-top: 20px;
                                overflow: hidden;
                            }
                            .progress {
                                height: 100%;
                                width: 100%;
                                background-color: #dc3545;
                                animation: countdown 2s linear forwards;
                            }
                            @keyframes countdown {
                                from { width: 100%; }
                                to { width: 0%; }
                            }
                            .wave-logo {
                                max-width: 80px;
                                margin-bottom: 20px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="payment-container">
                            <div class="error-icon">❌</div>
                            <img src="https://wave.com/assets/logo-wave.png" alt="Wave" class="wave-logo">
                            <h2>Paiement annulé</h2>
                            <p>Votre transaction a été annulée.</p>
                            <div class="reference">
                                Référence: ${transaction.reference}
                            </div>
                            <p>Cette fenêtre se fermera automatiquement dans 2 secondes...</p>
                            <div class="progress-bar">
                                <div class="progress"></div>
                            </div>
                        </div>
                        
                        <script>
                            // Envoi d'un message à la fenêtre parent
                            window.opener && window.opener.postMessage({
                                status: 'cancelled', 
                                provider: 'wave',
                                reference: '${transaction.reference}'
                            }, '*');
                            
                            // Fermeture automatique après 2 secondes
                            setTimeout(() => window.close(), 2000);
                        </script>
                    </body>
                    </html>
                `);
            }
        }

        return res.send(`
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Paiement Wave Annulé</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background-color: #f8f9fa;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                        margin: 0;
                        color: #333;
                        text-align: center;
                        padding: 20px;
                    }
                    .payment-container {
                        background-color: white;
                        border-radius: 10px;
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                        padding: 30px;
                        max-width: 400px;
                        width: 100%;
                    }
                    .error-icon {
                        color: #dc3545;
                        font-size: 50px;
                        margin-bottom: 20px;
                    }
                    h2 {
                        color: #dc3545;
                        margin-top: 0;
                    }
                    .progress-bar {
                        width: 100%;
                        height: 6px;
                        background-color: #e9ecef;
                        border-radius: 3px;
                        margin-top: 20px;
                        overflow: hidden;
                    }
                    .progress {
                        height: 100%;
                        width: 100%;
                        background-color: #dc3545;
                        animation: countdown 2s linear forwards;
                    }
                    @keyframes countdown {
                        from { width: 100%; }
                        to { width: 0%; }
                    }
                    .wave-logo {
                        max-width: 80px;
                        margin-bottom: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="payment-container">
                    <div class="error-icon">❌</div>
                    <img src="https://wave.com/assets/logo-wave.png" alt="Wave" class="wave-logo">
                    <h2>Paiement non complété</h2>
                    <p>La transaction a été annulée ou n'a pas pu être complétée.</p>
                    <p>Cette fenêtre se fermera automatiquement dans 2 secondes...</p>
                    <div class="progress-bar">
                        <div class="progress"></div>
                    </div>
                </div>
                
                <script>
                    // Envoi d'un message à la fenêtre parent
                    window.opener && window.opener.postMessage({
                        status: 'cancelled', 
                        provider: 'wave'
                    }, '*');
                    
                    // Fermeture automatique après 2 secondes
                    setTimeout(() => window.close(), 2000);
                </script>
            </body>
            </html>
        `);
        
    } catch (error) {
        return message.reponse(res, message.error, 400, error);
    }
}

// Obtenir des liens de paiement pour une transaction existante
exports.getPaymentLinks = async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await transactionModel.findById(id);
        
        if (!transaction) {
            return message.reponse(res, 'Transaction non trouvée', 404, null);
        }
        
        // Si les liens existent déjà et n'ont pas expiré
        if (transaction.paymentInfo && transaction.paymentInfo.expiresAt && 
            new Date(transaction.paymentInfo.expiresAt) > new Date()) {
            return message.reponse(res, 'Liens de paiement', 200, transaction.paymentInfo);
        }
        
        // Sinon, régénérer les liens
        const paymentLinks = await generatePaymentLink(
            transaction,
            req.query.callbackUrl || `https://${req.get('host')}/payment`
        );
        
        return message.reponse(res, 'Liens de paiement générés', 200, paymentLinks);
        
    } catch (error) {
        console.error("Erreur récupération liens de paiement:", error);
        return message.reponse(res, message.error, 400, error);
    }
};

// Rafraîchir les liens de paiement pour une transaction
exports.refreshPaymentLinks = async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await transactionModel.findById(id);
        
        if (!transaction) {
            return message.reponse(res, 'Transaction non trouvée', 404, null);
        }
        
        if (transaction.status !== 'PENDING') {
            return message.reponse(res, 'Impossible de rafraîchir les liens: transaction non en attente', 400, null);
        }
        
        // Forcer la régénération des liens
        const paymentLinks = await generatePaymentLink(
            transaction,
            req.body.callbackUrl || `https://${req.get('host')}/payment`
        );
        
        return message.reponse(res, 'Liens de paiement rafraîchis', 200, paymentLinks);
        
    } catch (error) {
        console.error("Erreur rafraîchissement liens de paiement:", error);
        return message.reponse(res, message.error, 400, error);
    }
};

// Méthode pour générer des liens de paiement pour plusieurs transactions
exports.batchGeneratePaymentLinks = async (req, res) => {
    try {
        const { ids } = req.body;
        
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return message.reponse(res, 'Liste d\'IDs de transactions requise', 400, null);
        }
        
        const results = [];
        for (const id of ids) {
            try {
                const transaction = await transactionModel.findById(id);
                if (transaction && transaction.status === 'PENDING') {
                    const paymentLinks = await generatePaymentLink(
                        transaction,
                        req.body.callbackUrl || `https://${req.get('host')}/payment`
                    );
                    results.push({
                        id: id,
                        success: true,
                        paymentLinks: paymentLinks
                    });
                } else {
                    results.push({
                        id: id,
                        success: false,
                        error: 'Transaction non trouvée ou non en attente'
                    });
                }
            } catch (err) {
                results.push({
                    id: id,
                    success: false,
                    error: err.message
                });
            }
        }
        
        return message.reponse(res, 'Génération de liens en lot', 200, {
            totalProcessed: ids.length,
            successCount: results.filter(r => r.success).length,
            failureCount: results.filter(r => !r.success).length,
            results: results
        });
        
    } catch (error) {
        console.error("Erreur génération liens en lot:", error);
        return message.reponse(res, message.error, 400, error);
    }
};

// Vérifier le statut d'une transaction par sa référence
exports.checkTransactionStatus = async (req, res) => {
    try {
        const { reference } = req.params;
        
        const transaction = await transactionModel.findOne({ reference })
            .populate(populateObject)
            .exec();
            
        if (!transaction) {
            return message.reponse(res, 'Transaction non trouvée', 404, null);
        }
        
        // Si la transaction est en attente, vérifier avec le provider
        if (transaction.status === 'PENDING' && ['WAVE', 'OM'].includes(transaction.method)) {
            const paymentVerified = await verifyPaymentWithProvider(transaction.reference, transaction.method);
            
            if (paymentVerified.success) {
                transaction.status = 'SUCCESS';
                await transaction.save();
                
                // Activer le GIE si applicable
                if (transaction.gieId) {
                    await activateGIEAfterPayment(transaction.gieId);
                }
            }
        }
        
        return message.reponse(res, 'Statut de la transaction', 200, {
            reference: transaction.reference,
            status: transaction.status,
            method: transaction.method,
            amount: transaction.amount,
            date: transaction.date,
            operationType: transaction.operationType,
            paymentStatus: transaction.paymentStatus
        });
        
    } catch (error) {
        console.error("Erreur vérification statut:", error);
        return message.reponse(res, message.error, 400, error);
    }
};

// Fonctions FEVEO 2050 spécifiques
exports.getByGieCode = async (req, res) => {
    try {
        const { gieCode } = req.params;
        
        const gie = await GIE.findOne({ identifiantGIE: gieCode });
        if (!gie) {
            return message.reponse(res, 'GIE non trouvé', 404, null);
        }

        const transactions = await transactionModel.find({ gieId: gie._id })
            .populate(populateObject)
            .sort({ createdAt: -1 })
            .exec();

        return message.reponse(res, 'Transactions du GIE trouvées', 200, {
            gieCode: gieCode,
            gieNom: gie.nomGIE,
            transactions: transactions
        });

    } catch (error) {
        return message.reponse(res, message.error, 400, error);
    }
}

exports.confirmPayment = async (req, res) => {
    try {
        const { transactionId } = req.body;

        const transaction = await transactionModel.findOne({ reference: transactionId })
            .populate(populateObject)
            .exec();

        if (!transaction) {
            return message.reponse(res, 'Transaction non trouvée', 404, null);
        }

        if (transaction.status === 'SUCCESS') {
            return message.reponse(res, 'Transaction déjà confirmée', 200, transaction);
        }

        // Simuler vérification Wave/OM (en production, appeler les APIs)
        const paymentVerified = await verifyPaymentWithProvider(transactionId, transaction.method);

        if (paymentVerified.success) {
            transaction.status = 'SUCCESS';
            await transaction.save();

            // Activer le GIE si applicable
            if (transaction.gieId) {
                await activateGIEAfterPayment(transaction.gieId);
            }

            return message.reponse(res, 'Paiement confirmé avec succès', 200, transaction);
        } else {
            return message.reponse(res, 'Paiement non confirmé', 400, paymentVerified);
        }

    } catch (error) {
        return message.reponse(res, message.error, 400, error);
    }
}

// Fonction helper pour activer un GIE après paiement
async function activateGIEAfterPayment(gieId) {
    try {
        const gie = await GIE.findById(gieId);

        console.log(`🔄 Activation GIE après paiement: ${gie}`);
        if (gie) {
            gie.statut = 'actif';
            gie.dateActivation = new Date();
            gie.statutAdhesion = 'validee';
            gie.statutEnregistrement = 'valide';
            
            await gie.save();
            console.log(`✅ GIE activé automatiquement après paiement: ${gieId}`);
        }
    } catch (error) {
        console.error('❌ Erreur activation GIE après paiement:', error);
    }
}

/**
 * Valide la signature d'un callback Orange Money
 */
function validateOMCallback(req) {
    try {
        // En développement, accepter tous les callbacks
        if (process.env.NODE_ENV !== 'production') {
            return true;
        }

        const signature = req.headers['om-signature'];
        if (!signature) return false;

        // Récupérer le corps de la requête
        const body = req.body;
        
        // Trier les champs par ordre alphabétique et créer une chaîne à signer
        const sortedFields = Object.keys(body).sort();
        const stringToSign = sortedFields
            .map(key => `${key}=${body[key]}`)
            .join('&');
            
        // Vérifier la signature
        const hmac = crypto.createHmac('sha256', paymentServices.OM.secretKey);
        hmac.update(stringToSign);
        const computedSignature = hmac.digest('hex');
        
        return computedSignature === signature;
    } catch (error) {
        console.error('Erreur validation signature OM:', error);
        return false;
    }
}

/**
 * Valide la signature d'un callback Wave
 */
function validateWaveCallback(req) {
    try {
        // En développement, accepter tous les callbacks
        if (process.env.NODE_ENV !== 'production') {
            return true;
        }

        const signature = req.headers['wave-signature'];
        if (!signature) return false;

        // Récupérer le corps de la requête
        const body = req.body;
        
        // Créer une chaîne à signer selon les spécifications de Wave
        const stringToSign = `${body.wavePaymentId}:${body.amount}:${body.currency}:${body.status}`;
            
        // Vérifier la signature
        const hmac = crypto.createHmac('sha256', paymentServices.WAVE.secretKey);
        hmac.update(stringToSign);
        const computedSignature = hmac.digest('hex');
        
        return computedSignature === signature;
    } catch (error) {
        console.error('Erreur validation signature Wave:', error);
        return false;
    }
}

/**
 * Fonction helper pour vérifier le paiement avec le provider
 */
async function verifyPaymentWithProvider(transactionId, method) {
    try {
        console.log(`🔍 Vérification paiement ${method}: ${transactionId}`);
        
        // En production, appeler les APIs Wave/Orange Money
        if (process.env.NODE_ENV === 'production') {
            switch (method) {
                case 'WAVE':
                    return await verifyWavePayment(transactionId);
                    
                case 'OM':
                    return await verifyOrangeMoneyPayment(transactionId);
                    
                default:
                    return { success: false, error: 'Méthode non supportée' };
            }
        } 
        
        // En développement, simuler la vérification
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simuler un succès dans 90% des cas
        const isSuccessful = Math.random() > 0.1;
        
        return {
            success: isSuccessful,
            transactionId: transactionId,
            method: method,
            verifiedAt: new Date(),
            status: isSuccessful ? 'completed' : 'failed'
        };

    } catch (error) {
        console.error(`Erreur vérification paiement ${method}:`, error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Vérifier un paiement Wave
 */
async function verifyWavePayment(transactionId) {
    try {
        // Implémenter l'appel à l'API Wave en production
        const response = await axios.get(`${paymentServices.WAVE.baseUrl}/v1/checkout/${transactionId}`, {
            headers: {
                'Authorization': `Bearer ${paymentServices.WAVE.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.data && response.data.status === 'successful') {
            return {
                success: true,
                transactionId,
                method: 'WAVE',
                verifiedAt: new Date(),
                status: 'completed',
                providerData: response.data
            };
        } else {
            return {
                success: false,
                transactionId,
                method: 'WAVE',
                verifiedAt: new Date(),
                status: response.data?.status || 'unknown',
                providerData: response.data
            };
        }
    } catch (error) {
        console.error('Erreur vérification Wave:', error);
        return {
            success: false,
            error: error.message,
            method: 'WAVE'
        };
    }
}

/**
 * Vérifier un paiement Orange Money
 */
async function verifyOrangeMoneyPayment(transactionId) {
    try {
        // Implémenter l'appel à l'API Orange Money en production
        const response = await axios.get(`${paymentServices.OM.baseUrl}/v1/transactionstatus/${transactionId}`, {
            headers: {
                'Authorization': `Bearer ${paymentServices.OM.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.data && response.data.status === 'SUCCESS') {
            return {
                success: true,
                transactionId,
                method: 'OM',
                verifiedAt: new Date(),
                status: 'completed',
                providerData: response.data
            };
        } else {
            return {
                success: false,
                transactionId,
                method: 'OM',
                verifiedAt: new Date(),
                status: response.data?.status || 'unknown',
                providerData: response.data
            };
        }
    } catch (error) {
        console.error('Erreur vérification Orange Money:', error);
        return {
            success: false,
            error: error.message,
            method: 'OM'
        };
    }
}
