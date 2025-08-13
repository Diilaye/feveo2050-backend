/**
 * Utilitaire pour les messages de réponse API
 */

const messages = {
    error: 'Une erreur s\'est produite',
    createObject: (object) => `${object} créé(e) avec succès`,
    findObject: (object) => `${object} trouvé(e) avec succès`,
    updateObject: (object) => `${object} mis(e) à jour avec succès`,
    deleteObject: (object) => `${object} supprimé(e) avec succès`,
    notFound: (object) => `${object} non trouvé(e)`,
    unauthorized: 'Accès non autorisé',
    forbidden: 'Accès interdit',
    validationError: 'Erreur de validation des données'
};

/**
 * Fonction pour formater les réponses API
 * @param {Response} res - Objet de réponse Express
 * @param {string} message - Message à retourner
 * @param {number} statusCode - Code de statut HTTP
 * @param {any} data - Données à retourner
 * @returns {Response} Réponse formatée
 */
const reponse = (res, message, statusCode = 200, data = null) => {
    const response = {
        message: message,
        statusCode: statusCode,
        status: statusCode < 400 ? 'OK' : 'NOT OK',
        timestamp: new Date().toISOString()
    };

    if (data !== null) {
        response.data = data;
    }

    return res.status(statusCode).json(response);
};

/**
 * Fonction pour formater les erreurs de validation
 * @param {Response} res - Objet de réponse Express
 * @param {Array} errors - Tableau des erreurs de validation
 * @returns {Response} Réponse d'erreur formatée
 */
const validationErrorResponse = (res, errors) => {
    return reponse(res, messages.validationError, 422, {
        errors: errors
    });
};

/**
 * Fonction pour les réponses de succès avec pagination
 * @param {Response} res - Objet de réponse Express
 * @param {string} message - Message de succès
 * @param {any} data - Données à retourner
 * @param {Object} pagination - Informations de pagination
 * @returns {Response} Réponse avec pagination
 */
const paginatedResponse = (res, message, data, pagination) => {
    return res.status(200).json({
        message: message,
        statusCode: 200,
        status: 'OK',
        timestamp: new Date().toISOString(),
        data: data,
        pagination: pagination
    });
};

module.exports = {
    ...messages,
    reponse,
    validationErrorResponse,
    paginatedResponse
};
