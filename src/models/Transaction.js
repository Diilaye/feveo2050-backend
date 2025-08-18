const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const transactionModel = new Schema({
    
    reference: {
        type: String ,
        unique :true
    },

    amount : {
        type : String
    },

    token : {
        type : String
    },

    // Type d'opération
    operationType: {
        type: String,
        enum: ['ADHESION','INVESTISSEMENT'],
        required: true
    },
    
    // Durée d'investissement en jours (uniquement pour les opérations d'investissement)
    // Valeur totale fixée à 1826 jours (5 ans) pour tous les investissements
    investmentDuration: {
        type: Number,
        default: 1826,
        // Requis uniquement si le type d'opération est INVESTISSEMENT
        validate: {
            validator: function(v) {
                return this.operationType !== 'INVESTISSEMENT' || v === 1826;
            },
            message: 'La durée d\'investissement doit être de 1826 jours (5 ans)'
        }
    },
    
    // Nombre de jours déjà investis (compteur incrémental)
    daysInvested: {
        type: Number,
        default: 0
    },
    
    // Date de début officielle de l'investissement (1er avril)
    startDate: {
        type: Date
    },

    // Champs spécifiques pour les GIE
    gieId: {
        type: Schema.Types.ObjectId,
        ref: "GIE"
    },
    
    // Référence au membre qui effectue la transaction
    membreId: {
        type: Schema.Types.ObjectId,
        ref: "Membre"
    },
    
    // Référence à l'adhésion
    adhesionId: {
        type: Schema.Types.ObjectId,
        ref: "Adhesion"
    },
    
    // Référence au cycle d'investissement
    cycleInvestissement: {
        type: Schema.Types.Number,
    },
    
    status: {
        type: String,
        enum: ['PENDING', 'SUCCESS','CANCELED','REFUND'],
        default: 'PENDING'
    },

    method: {
        type: String,
        enum: ['WAVE', 'OM', 'VIREMENT', 'ESPECES'],
        default: 'WAVE'
    },

    date: {
        type: Date,
        default: Date.now()
    },
    
    // Date d'échéance pour les investissements
    dueDate: {
        type: Date,
        // Calculé automatiquement en fonction de la durée d'investissement
        validate: {
            validator: function(v) {
                return this.operationType !== 'INVESTISSEMENT' || v != null;
            },
            message: 'La date d\'échéance est requise pour les opérations d\'investissement'
        }
    },
    
    
    // État de paiement pour les investissements
    paymentStatus: {
        type: String,
        enum: ['PENDING', 'PAID', 'LATE', 'DEFAULT'],
        default: 'PENDING'
    },
    
    // Informations de paiement supplémentaires
    paymentInfo: {
        type: Object
    },
    
    // Notes ou commentaires sur la transaction
    notes: {
        type: String
    },
},{
    toJSON: {
        transform: function (doc, ret) {
          ret.id = ret._id;
          delete ret.__v;
        },
      },
},{
    timestamps: true
});

// Middleware pre-save pour initialiser les dates d'investissement et le calendrier
/*transactionModel.pre('save', function(next) {
    // Si c'est une opération d'investissement
    if (this.operationType === 'INVESTISSEMENT') {
        // Déterminer la date de début (1er avril)
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        
        // Si on est avant le 1er avril, on prend le 1er avril de cette année
        // Sinon, on prend le 1er avril de l'année suivante
        let startYear = currentDate.getMonth() < 3 ? currentYear : currentYear + 1;
        this.startDate = new Date(startYear, 3, 1); // Mois 3 = avril (les mois commencent à 0)
        
        // Calculer la date d'échéance (startDate + 1826 jours)
        const dueDate = new Date(this.startDate);
        dueDate.setDate(dueDate.getDate() + this.investmentDuration);
        this.dueDate = dueDate;
        
        // Initialiser le calendrier d'investissement si c'est un nouveau document
        if (this.isNew && (!this.investmentCalendar || this.investmentCalendar.length === 0)) {
            this.investmentCalendar = [
                {
                    date: this.startDate,
                    event: 'Début de l\'investissement',
                    completed: false,
                    notes: 'Début officiel du cycle d\'investissement'
                },
                {
                    date: new Date(this.startDate.getFullYear() + 1, 3, 1),
                    event: 'Bilan annuel - Année 1',
                    completed: false
                },
                {
                    date: new Date(this.startDate.getFullYear() + 2, 3, 1),
                    event: 'Bilan annuel - Année 2',
                    completed: false
                },
                {
                    date: new Date(this.startDate.getFullYear() + 3, 3, 1),
                    event: 'Bilan annuel - Année 3',
                    completed: false
                },
                {
                    date: new Date(this.startDate.getFullYear() + 4, 3, 1),
                    event: 'Bilan annuel - Année 4',
                    completed: false
                },
                {
                    date: this.dueDate,
                    event: 'Fin de l\'investissement',
                    completed: false,
                    notes: 'Clôture du cycle d\'investissement de 5 ans'
                }
            ];
        }
    }
    next();
});

// Méthode d'instance pour mettre à jour le calendrier d'investissement
transactionModel.methods.updateCalendar = async function(event) {
    if (!this.investmentCalendar) {
        this.investmentCalendar = [];
    }
    
    // Si l'événement existe déjà, on le met à jour
    const existingEvent = this.investmentCalendar.find(e => e.event === event.event);
    if (existingEvent) {
        Object.assign(existingEvent, event);
    } else {
        // Sinon, on ajoute le nouvel événement
        this.investmentCalendar.push(event);
    }
    
    return this.save();
};

// Méthode statique pour vérifier les événements à venir du calendrier d'investissement
transactionModel.statics.checkUpcomingEvents = async function(daysAhead = 7) {
    try {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + daysAhead);
        
        // Trouver toutes les transactions avec des événements à venir dans les prochains jours
        const upcomingEvents = await this.aggregate([
            { $match: { operationType: 'INVESTISSEMENT', status: 'SUCCESS' } },
            { $unwind: '$investmentCalendar' },
            { $match: {
                'investmentCalendar.completed': false,
                'investmentCalendar.date': { 
                    $gte: today,
                    $lte: futureDate
                }
            }},
            { $project: {
                _id: 1,
                membreId: 1,
                gieId: 1,
                amount: 1,
                event: '$investmentCalendar.event',
                date: '$investmentCalendar.date',
                notes: '$investmentCalendar.notes'
            }}
        ]);
        
        return {
            success: true,
            events: upcomingEvents,
            count: upcomingEvents.length
        };
    } catch (error) {
        return {
            success: false,
            message: `Erreur lors de la vérification des événements à venir: ${error.message}`
        };
    }
};

// Méthode statique pour mettre à jour le nombre de jours investis pour toutes les transactions actives
transactionModel.statics.updateInvestmentDays = async function() {
    try {
        // Rechercher toutes les transactions d'investissement actives (status = SUCCESS)
        const activeInvestments = await this.find({
            operationType: 'INVESTISSEMENT',
            status: 'SUCCESS',
            dueDate: { $gt: new Date() } // Date d'échéance future (investissement non terminé)
        });

        // Mettre à jour le nombre de jours investis pour chaque transaction
        for (const investment of activeInvestments) {
            // Calculer le nombre de jours écoulés depuis la date de début
            const startDate = investment.startDate || investment.date;
            const today = new Date();
            const diffTime = Math.abs(today - startDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            // Mettre à jour le nombre de jours investis
            if (diffDays > investment.daysInvested) {
                investment.daysInvested = Math.min(diffDays, investment.investmentDuration);
                await investment.save();
            }
        }
        
        return { 
            success: true, 
            count: activeInvestments.length, 
            message: `Mise à jour effectuée pour ${activeInvestments.length} investissements actifs` 
        };
    } catch (error) {
        return { 
            success: false, 
            message: `Erreur lors de la mise à jour des jours d'investissement: ${error.message}` 
        };
    }
};
*/
module.exports = mongoose.model('transactions', transactionModel) ;
