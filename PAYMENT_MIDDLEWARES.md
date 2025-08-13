# Middlewares de Paiement FEVEO 2050

## 📁 Fichiers ajoutés

### 1. `src/middleware/paiement-wave.js`
Middleware principal pour gérer les paiements Wave et Orange Money, intégré avec le système FEVEO 2050.

**Fonctionnalités :**
- Génération de liens de paiement Wave et Orange Money
- Intégration automatique avec le modèle Transaction
- Gestion des métadonnées spécifiques à FEVEO (gieCode, rv)
- URLs de callback personnalisées pour FEVEO 2050

### 2. `src/middleware/paymentConfig.js`
Configuration centralisée pour les paiements avec gestion des tokens et environnements.

**Fonctionnalités :**
- Configuration centralisée pour Wave et Orange Money
- Gestion des tokens et URLs d'API
- Middleware d'injection de configuration
- Obtention automatique du token Orange Money
- Validation de la configuration avant paiement

### 3. `src/middleware/validation.js` (mis à jour)
Validations ajoutées pour les paiements :
- `validatePaiement` : Validation des données de paiement
- `validateConfirmPaiement` : Validation de la confirmation de paiement

### 4. `src/routes/payment.js`
Routes d'exemple montrant l'utilisation des middlewares.

## 🔧 Utilisation dans wallet.js

### Importation des middlewares

```javascript
const { validatePaiement, validateConfirmPaiement } = require('../middleware/validation');
const { injectPaymentConfig, getOrangeMoneyToken, validatePaymentConfig } = require('../middleware/paymentConfig');
const paiementWaveMiddleware = require('../middleware/paiement-wave');
```

### Exemple d'utilisation pour génération de paiement

```javascript
router.post('/generate-gie-payment', 
  validatePaiement,
  injectPaymentConfig,
  validatePaymentConfig,
  getOrangeMoneyToken,
  paiementWaveMiddleware,
  async (req, res) => {
    // Le middleware a injecté l'URL de paiement dans req.paymentUrl
    // et la référence dans req.paymentReference
    
    res.json({
      success: true,
      message: 'Lien de paiement généré',
      data: {
        paymentUrl: req.paymentUrl,
        reference: req.paymentReference,
        method: req.body.method,
        amount: req.body.amount
      }
    });
  }
);
```

## ⚙️ Configuration d'environnement

Ajoutez ces variables dans votre `.env` :

```env
# Wave API
WAVE_API_TOKEN=wave_sn_prod_t0CQb9rv21w50ooAfq8B8BjyyY9Ldx-g-eU6VS8zxYKqlHctymZX_ayTuPYPWnp8CJ4fBxpayxyXo7aa84d9zf7sl3XOBjwDKw

# Orange Money API
OM_CLIENT_ID=your_orange_money_client_id
OM_CLIENT_SECRET=your_orange_money_client_secret

# Callbacks URLs
CALLBACK_SUCCESS_URL=https://api.feveo2050.sn/api/wallet/payment-success
CALLBACK_ERROR_URL=https://api.feveo2050.sn/api/wallet/payment-error
CALLBACK_SUCCESS_URL_OM=https://api.feveo2050.sn/api/wallet/payment-success-om
CALLBACK_ERROR_URL_OM=https://api.feveo2050.sn/api/wallet/payment-error-om
```

## 🌊 Intégration avec Wave

### Données envoyées à Wave
```json
{
  "amount": 25000,
  "currency": "XOF",
  "error_url": "https://api.feveo2050.sn/api/wallet/payment-error?gieCode=FEVEO-XX-XX-XX-XX-XXX",
  "success_url": "https://api.feveo2050.sn/api/wallet/payment-success?gieCode=FEVEO-XX-XX-XX-XX-XXX",
  "metadata": {
    "gieCode": "FEVEO-XX-XX-XX-XX-XXX",
    "system": "FEVEO2050"
  }
}
```

## 🟠 Intégration avec Orange Money

### Données envoyées à Orange Money
```json
{
  "amount": {
    "unit": "XOF",
    "value": 25000
  },
  "callbackCancelUrl": "https://api.feveo2050.sn/api/wallet/payment-error-om?gieCode=FEVEO-XX-XX-XX-XX-XXX",
  "callbackSuccessUrl": "https://api.feveo2050.sn/api/wallet/payment-success-om?gieCode=FEVEO-XX-XX-XX-XX-XXX",
  "code": 159515,
  "metadata": {
    "gieCode": "FEVEO-XX-XX-XX-XX-XXX",
    "system": "FEVEO2050"
  },
  "name": "FEVEO 2050",
  "validity": 15
}
```

## 💾 Intégration avec le modèle Transaction

Le middleware `paiement-wave.js` crée automatiquement une entrée dans la table `transactions` :

```javascript
const transaction = new Transaction({
  reference: response.data.id,
  amount: amount.toString(),
  method: 'WAVE', // ou 'OM'
  status: 'PENDING',
  token: response.data.id,
  gieId: req.gieId || null,
  adhesionId: req.adhesionId || null
});
```

## 🔄 Flux complet

1. **Validation** : `validatePaiement` vérifie les données
2. **Configuration** : `injectPaymentConfig` injecte la config
3. **Token OM** : `getOrangeMoneyToken` obtient le token si nécessaire
4. **Génération** : `paiementWaveMiddleware` génère le lien et sauvegarde en DB
5. **Réponse** : URL de paiement retournée au client
6. **Callback** : Wave/OM redirige vers les URLs de callback
7. **Confirmation** : Mise à jour du statut de transaction

## 🧪 Tests

Exécutez le script de test :
```bash
./test-payment-middlewares.sh
```

## 📋 Statuts de transaction

- `PENDING` : Paiement initié, en attente
- `SUCCESS` : Paiement confirmé
- `CANCELED` : Paiement annulé
- `REFUND` : Paiement remboursé

## 🔗 Liens utiles

- [Documentation Wave API](https://developer.wave.com/)
- [Documentation Orange Money API](https://developer.orange.com/apis/orange-money/)
- [Express Validator](https://express-validator.github.io/docs/)

## 🚀 Prochaines étapes

1. Intégrer ces middlewares dans `wallet.js`
2. Configurer les variables d'environnement
3. Tester en environnement de développement
4. Déployer avec les vraies clés API de production
