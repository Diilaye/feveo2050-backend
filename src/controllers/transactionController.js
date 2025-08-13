const transactionModel = require('../models/Transaction');
const rvModel = require('../models/rendez_vous');
const GIE = require('../models/GIE');
const Adhesion = require('../models/Adhesion');

const orderid = require('order-id')('diikaanedevVerumed');
const message = require('../utils/message');

const populateObject = [{
    path: 'rendez_vous'
}, {
    path: 'gieId',
    select: 'identifiantGIE nomGIE presidenteNom presidentePrenom presidenteTelephone'
}, {
    path: 'adhesionId',
    select: 'statutAdhesion statutEnregistrement validation'
}];

exports.store = async (req, res, next) => {
    try {
        let { amount, rv, method, gieCode, adhesionId } = req.body;

        const id = orderid.generate();
        
        const transaction = new transactionModel();
        
        transaction.reference = orderid.getTime(id);
        transaction.token = id;
        transaction.amount = amount;
        transaction.method = method;
        transaction.rendez_vous = rv;

        // Support pour les GIE FEVEO 2050
        if (gieCode) {
            const gie = await GIE.findOne({ identifiantGIE: gieCode });
            if (gie) {
                transaction.gieId = gie._id;
            }
        }

        if (adhesionId) {
            transaction.adhesionId = adhesionId;
        }

        const saveTransaction = await transaction.save();

        // Si c'est lié à un rendez-vous, mettre à jour le RV
        if (rv) {
            const rvFind = await rvModel.findById(rv).exec();
            if (rvFind) {
                rvFind.transactions = saveTransaction.id;
                await rvFind.save();
            }
        }

        const findTransaction = await transactionModel.findById(saveTransaction.id)
            .populate(populateObject)
            .exec();

        return message.reponse(res, message.createObject('Transaction'), 201, {
            url: req.url,
            transaction: findTransaction
        });
       
    } catch (error) {
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
        if (status === 'SUCCESS' && transaction.gieId && transaction.adhesionId) {
            await activateGIEAfterPayment(transaction.gieId, transaction.adhesionId);
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

// Callbacks Orange Money
exports.successOrange = async (req, res, next) => {
    try {
        // Support pour les transactions GIE directes
        if (req.query.gieCode && req.query.transactionId) {
            const transaction = await transactionModel.findOne({ 
                reference: req.query.transactionId 
            });
            
            if (transaction) {
                transaction.status = 'SUCCESS';
                await transaction.save();
                
                // Activer le GIE si applicable
                if (transaction.gieId && transaction.adhesionId) {
                    await activateGIEAfterPayment(transaction.gieId, transaction.adhesionId);
                }
                
                return res.send("<script>window.close();</script>");
            }
        }

        // Logique originale pour les RV
        if (req.query.rv) {
            const rvFind = await rvModel.findById(req.query.rv).exec();
            const transactionFind = await transactionModel.findById(rvFind.transactions).exec();

            transactionFind.status = 'SUCCESS';
            await transactionFind.save();
        }

        return res.send("<script>window.close();</script>");
        
    } catch (error) {
        return message.reponse(res, message.error, 400, error);
    }
}

exports.successWave = async (req, res) => {
    try {
        // Support pour les transactions GIE directes
        if (req.query.gieCode && req.query.transactionId) {
            const transaction = await transactionModel.findOne({ 
                reference: req.query.transactionId 
            });
            
            if (transaction) {
                transaction.status = 'SUCCESS';
                await transaction.save();
                
                // Activer le GIE si applicable
                if (transaction.gieId && transaction.adhesionId) {
                    await activateGIEAfterPayment(transaction.gieId, transaction.adhesionId);
                }
                
                return res.send("<script>window.close();</script>");
            }
        }

        // Logique originale pour les RV
        if (req.query.rv) {
            const rvFind = await rvModel.findById(req.query.rv).exec();
            const transactionFind = await transactionModel.findById(rvFind.transactions).exec();

            transactionFind.status = 'SUCCESS';
            await transactionFind.save();
        }

        return res.send("<script>window.close();</script>");
        
    } catch (error) {
        return message.reponse(res, message.error, 400, error);
    }
}

// Callbacks d'erreur Orange Money
exports.errorOrange = async (req, res) => {
    try {
        // Support pour les transactions GIE directes
        if (req.query.gieCode && req.query.transactionId) {
            const transaction = await transactionModel.findOne({ 
                reference: req.query.transactionId 
            });
            
            if (transaction) {
                transaction.status = 'CANCELED';
                await transaction.save();
                return res.send("<script>window.close();</script>");
            }
        }

        // Logique originale pour les RV
        if (req.query.rv) {
            const rvFind = await rvModel.findById(req.query.rv).exec();
            const transactionFind = await transactionModel.findById(rvFind.transactions).exec();

            transactionFind.status = 'CANCELED';
            await transactionFind.save();
        }

        return res.send("<script>window.close();</script>");
        
    } catch (error) {
        return message.reponse(res, message.error, 400, error);
    }
}

exports.errorWave = async (req, res) => {
    try {
        // Support pour les transactions GIE directes
        if (req.query.gieCode && req.query.transactionId) {
            const transaction = await transactionModel.findOne({ 
                reference: req.query.transactionId 
            });
            
            if (transaction) {
                transaction.status = 'CANCELED';
                await transaction.save();
                return res.send("<script>window.close();</script>");
            }
        }

        // Logique originale pour les RV
        if (req.query.rv) {
            const rvFind = await rvModel.findById(req.query.rv).exec();
            const transactionFind = await transactionModel.findById(rvFind.transactions).exec();

            transactionFind.status = 'CANCELED';
            await transactionFind.save();
        }

        return res.send("<script>window.close();</script>");
        
    } catch (error) {
        return message.reponse(res, message.error, 400, error);
    }
}

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
        const { transactionId, gieCode } = req.body;

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
            if (transaction.gieId && transaction.adhesionId) {
                await activateGIEAfterPayment(transaction.gieId, transaction.adhesionId);
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
async function activateGIEAfterPayment(gieId, adhesionId) {
    try {
        const adhesion = await Adhesion.findById(adhesionId);
        if (adhesion) {
            adhesion.statutAdhesion = 'validee';
            adhesion.statutEnregistrement = 'valide';
            adhesion.validation = {
                statut: 'validee',
                dateValidation: new Date(),
                validePar: 'SYSTEME_PAIEMENT',
                motif: 'Activation automatique suite au paiement confirmé'
            };
            
            if (adhesion.paiement) {
                adhesion.paiement.statut = 'confirme';
                adhesion.paiement.dateConfirmation = new Date();
            }

            await adhesion.save();
            console.log(`✅ GIE activé automatiquement après paiement: ${gieId}`);
        }
    } catch (error) {
        console.error('❌ Erreur activation GIE après paiement:', error);
    }
}

// Fonction helper pour vérifier le paiement avec le provider
async function verifyPaymentWithProvider(transactionId, method) {
    // Simulation - en production, appeler les APIs Wave/Orange Money
    try {
        console.log(`🔍 Vérification paiement ${method}: ${transactionId}`);
        
        // Simuler un délai de vérification
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
        return {
            success: false,
            error: error.message
        };
    }
}
