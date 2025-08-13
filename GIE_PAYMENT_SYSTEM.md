# 💳 Système de Paiement et Activation GIE - Documentation

## 📋 Vue d'ensemble

Le système de wallet FEVEO 2050 a été amélioré pour gérer automatiquement les GIE en attente de paiement. Quand un GIE a les statuts `statutAdhesion: 'en_attente'` et `statutEnregistrement: 'en_attente_paiement'`, le système génère automatiquement un lien de paiement Wave et active le GIE après confirmation du paiement.

## 🔄 Flux de Fonctionnement

### 1. **Détection GIE en Attente**
```
GIE avec:
├── statutAdhesion: 'en_attente'
└── statutEnregistrement: 'en_attente_paiement'
    ↓
Génération automatique du lien de paiement
```

### 2. **Génération du Lien de Paiement**
- **Montant**: 25,000 FCFA (adhésion FEVEO)
- **Frais Wave**: 1% + 60 FCFA = ~310 FCFA
- **Total**: ~25,310 FCFA
- **Transaction ID**: `FEVEO_ACTIVATION_{gieCode}_{timestamp}_{random}`

### 3. **Paiement et Activation**
```
Paiement confirmé
    ↓
Activation automatique du GIE:
├── statutAdhesion → 'validee'
├── statutEnregistrement → 'valide'
├── validation.statut → 'validee'
└── Création cycle d'investissement
    ↓
Notification WhatsApp de confirmation
```

## 🛠️ API Endpoints

### 1. **Vérifier GIE** - `POST /api/wallet/verify-gie`

**Comportement selon les statuts:**

#### ✅ GIE Activé (Accès Normal)
```json
// Statuts: statutAdhesion='validee' && validation.statut='validee'
{
  "success": true,
  "message": "Code de vérification envoyé",
  "data": {
    "whatsappSent": true/false,
    "backupCode": "123456",
    "whatsappNumber": "+221701234567",
    "expiresIn": 300
  }
}
```

#### 💳 GIE en Attente de Paiement
```json
// Statuts: statutAdhesion='en_attente' && statutEnregistrement='en_attente_paiement'
{
  "success": true,
  "requiresPayment": true,
  "message": "GIE en attente de paiement",
  "data": {
    "gieInfo": {
      "code": "FEVEO-01-01-01-01-001",
      "nom": "GIE Exemple",
      "presidente": "Fatou Diop",
      "statut": "en_attente_paiement"
    },
    "payment": {
      "transactionId": "FEVEO_ACTIVATION_...",
      "paymentUrl": "https://pay.wave.com/checkout/...",
      "amount": 25310,
      "currency": "XOF",
      "description": "Activation GIE FEVEO 2050"
    },
    "message": "Veuillez effectuer le paiement pour activer votre GIE"
  }
}
```

#### ❌ GIE Non Autorisé
```json
// Autres statuts
{
  "success": false,
  "message": "GIE non autorisé pour le wallet. Adhésion non validée.",
  "data": {
    "statutAdhesion": "en_attente",
    "statutEnregistrement": "en_attente",
    "statutValidation": "non_defini"
  }
}
```

### 2. **Confirmer Paiement** - `POST /api/wallet/confirm-payment`

```bash
curl -X POST http://localhost:4320/api/wallet/confirm-payment \
  -H 'Content-Type: application/json' \
  -d '{
    "transactionId": "FEVEO_ACTIVATION_...",
    "gieCode": "FEVEO-01-01-01-01-001"
  }'
```

**Réponse en cas de succès:**
```json
{
  "success": true,
  "message": "Paiement confirmé et GIE activé",
  "data": {
    "gieCode": "FEVEO-01-01-01-01-001",
    "statut": "active",
    "dateActivation": "2025-08-11T...",
    "transactionId": "FEVEO_ACTIVATION_...",
    "walletAccessible": true
  }
}
```

### 3. **Statut d'Activation** - `GET /api/wallet/activation-status/:gieCode`

```bash
curl -X GET http://localhost:4320/api/wallet/activation-status/FEVEO-01-01-01-01-001
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "gieCode": "FEVEO-01-01-01-01-001",
    "nomGIE": "GIE Exemple",
    "statutAdhesion": "en_attente",
    "statutEnregistrement": "en_attente_paiement",
    "statutValidation": "non_defini",
    "walletAccessible": false,
    "requiresPayment": true,
    "paiement": {
      "transactionId": "FEVEO_ACTIVATION_...",
      "montant": 25000,
      "statut": "en_attente",
      "lienPaiement": "https://pay.wave.com/...",
      "dateCreation": "2025-08-11T..."
    }
  }
}
```

### 4. **Renvoyer Code** - `POST /api/wallet/resend-code`

**Gestion intelligente des échecs WhatsApp:**
```json
{
  "success": true,
  "message": "Erreur WhatsApp - Utilisez le code de secours",
  "data": {
    "whatsappSent": false,
    "backupCode": "654321",
    "whatsappNumber": "+221701234567",
    "expiresIn": 300
  }
}
```

## 🔧 Fonctions Internes

### 1. **verifyPaymentWithWave(transactionId)**
- Vérifie le statut du paiement auprès de Wave
- **Simulation**: 90% de succès pour les tests
- **Production**: Appel réel à l'API Wave

### 2. **activateGIE(gie, adhesion, transactionId)**
- Met à jour tous les statuts d'adhésion
- Crée le cycle d'investissement
- Initialise le wallet avec historique d'activation

## 📱 Notifications WhatsApp

### Code de Vérification
```
🔐 Code FEVEO 2050: 123456
Votre code de vérification pour accéder au wallet.
Valide 5 minutes.
```

### Confirmation d'Activation
```
🎉 Félicitations ! Votre GIE "Nom du GIE" (FEVEO-01-01-01-01-001) a été activé avec succès.

✅ Paiement confirmé
💰 Wallet FEVEO 2050 maintenant accessible

Vous pouvez désormais accéder à votre wallet et commencer vos investissements.
```

## 🎯 Scénarios de Test

### Scénario 1: Activation Complète
```bash
# 1. Tentative d'accès avec GIE en attente
curl -X POST localhost:4320/api/wallet/verify-gie \
  -d '{"gieCode": "FEVEO-01-01-01-01-001"}'
# → Retourne lien de paiement

# 2. Simulation du paiement
curl -X POST localhost:4320/api/wallet/confirm-payment \
  -d '{"transactionId": "FEVEO_ACTIVATION_...", "gieCode": "FEVEO-01-01-01-01-001"}'
# → Active le GIE

# 3. Accès au wallet maintenant possible
curl -X POST localhost:4320/api/wallet/verify-gie \
  -d '{"gieCode": "FEVEO-01-01-01-01-001"}'
# → Envoie code WhatsApp
```

### Scénario 2: Gestion Codes de Secours
```bash
# 1. Demande de code (peut échouer avec WhatsApp)
curl -X POST localhost:4320/api/wallet/verify-gie \
  -d '{"gieCode": "FEVEO-01-01-01-01-001"}'
# → whatsappSent: false, backupCode visible

# 2. Renvoi de code avec gestion d'échec
curl -X POST localhost:4320/api/wallet/resend-code \
  -d '{"gieCode": "FEVEO-01-01-01-01-001"}'
# → Nouveau code de secours si WhatsApp échoue encore
```

## 🏗️ Structure des Données

### Adhésion avec Paiement
```javascript
{
  gieId: ObjectId,
  statutAdhesion: 'en_attente' | 'validee',
  statutEnregistrement: 'en_attente_paiement' | 'valide',
  paiement: {
    transactionId: 'FEVEO_ACTIVATION_...',
    montant: 25000,
    statut: 'en_attente' | 'confirme',
    dateCreation: Date,
    dateConfirmation: Date,
    lienPaiement: 'https://pay.wave.com/...'
  },
  validation: {
    statut: 'validee',
    dateValidation: Date,
    validePar: 'SYSTEME_PAIEMENT',
    motif: 'Activation automatique suite au paiement confirmé'
  }
}
```

### Cycle d'Investissement Initial
```javascript
{
  gieId: ObjectId,
  dateDebut: Date,
  jourActuel: 1,
  walletGIE: {
    soldeActuel: 0,
    historique: [{
      type: 'activation',
      montant: 0,
      description: 'Activation du wallet FEVEO 2050',
      date: Date,
      transactionId: 'FEVEO_ACTIVATION_...'
    }]
  }
}
```

## 🔒 Sécurité et Validation

### Vérifications Effectuées
- ✅ Existence du GIE
- ✅ Correspondance transaction ↔ GIE
- ✅ Validation du paiement auprès de Wave
- ✅ Prévention double activation
- ✅ Expiration des codes temporaires

### Gestion des Erreurs
- **GIE inexistant** → 404 avec message explicite
- **Paiement non trouvé** → 404 avec details
- **Paiement échoué** → 400 avec statut Wave
- **Erreur Wave** → 500 avec retry automatique

## 🚀 Déploiement

### Variables d'Environnement
```bash
# API Wave
WAVE_API_BASE=https://api.wave.com/v1
WAVE_TOKEN=wave_sn_prod_...

# URLs de retour
BASE_URL=https://api.feveo2025.sn
FRONTEND_URL=https://feveo2025.sn

# Montants
GIE_ACTIVATION_AMOUNT=25000
```

### Monitoring
- Logs détaillés de chaque étape
- Tracking des paiements Wave
- Notifications d'activation
- Métriques de conversion

---

**🎉 Ce système garantit une activation fluide et automatique des GIE avec gestion complète des paiements et codes de secours !**
