# 🔑 Guide de Configuration WhatsApp Business API

## 📋 Informations de votre App
- **App ID**: `1500316664676674`
- **Business ID**: `1129220308584592`
- **Dashboard URL**: https://developers.facebook.com/apps/1500316664676674/dashboard/?business_id=1129220308584592

## 🔧 Étapes pour Récupérer les Tokens

### 1. Accéder à la Console Facebook
1. Allez sur : https://developers.facebook.com/apps/1500316664676674/dashboard/
2. Connectez-vous avec votre compte Facebook Business

### 2. Récupérer l'App Secret
1. Dans le tableau de bord, allez à **Configuration** > **Paramètres de base**
2. Trouvez la section **Clé secrète de l'app**
3. Cliquez sur **Afficher** et copiez la clé secrète
4. Ajoutez-la dans `.env` :
   ```bash
   WHATSAPP_APP_SECRET=votre_app_secret_ici
   ```

### 3. Récupérer un Nouveau Token d'Accès
1. Allez à **WhatsApp** > **Configuration API**
2. Dans la section **Token d'accès**, cliquez sur **Générer le token**
3. Choisissez la durée (recommandé : 60 jours pour la production)
4. Copiez le nouveau token généré
5. Mettez à jour dans `.env` :
   ```bash
   WHATSAPP_ACCESS_TOKEN=nouveau_token_ici
   ```

### 4. Configuration des Permissions
Assurez-vous que votre app a les permissions suivantes :
- `whatsapp_business_messaging` 
- `whatsapp_business_management`
- `business_management`

## 🤖 Système de Renouvellement Automatique

Le système a été mis à jour pour :
- ✅ **Vérifier automatiquement** la validité du token avant chaque envoi
- ✅ **Récupérer un nouveau token** si l'actuel est expiré
- ✅ **Mettre en cache** les tokens pour éviter les appels répétés
- ✅ **Mode fallback** si la récupération automatique échoue

## 🧪 Tester la Configuration

### Test complet :
```bash
node test-whatsapp.js
```

### Test d'envoi de message :
```bash
curl -X POST "http://localhost:3000/api/wallet/test-whatsapp" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "221772488807",
    "message": "Test avec nouveau token 🚀"
  }'
```

### Vérifier le statut :
```bash
curl -X GET "http://localhost:3000/api/wallet/whatsapp-status"
```

## 📱 Format des Variables d'Environnement

Votre fichier `.env` doit contenir :
```bash
# Configuration WhatsApp Business API
WHATSAPP_PHONE_NUMBER_ID=658687160670733
WHATSAPP_ACCESS_TOKEN=EAAVUh7HZAQUIBPPAmu14piyW9NfkJpsB2BxM6D5ZB6NwQ0KGgadevay8jXGshodX73IlIIjjZBwM0dGWnZAxQies9ZCr8M2fhuOFUZB1drmvgopHuh7FYmSxlJ6HYI54ehHnmXvjsLyRU3QnkZB4TYPR71sMBSmMiLEoLnz2VXFs1DIigTSTEYcBclv81v3nRVRGUxrj9YPA6lKLpXXGYlDwmDwDCQF52MKgJwA0I5C467ZBkAZDZD

# Configuration pour le renouvellement automatique des tokens
WHATSAPP_APP_ID=1500316664676674
WHATSAPP_APP_SECRET=votre_app_secret_ici
WHATSAPP_BUSINESS_ID=1129220308584592
```

## 🚨 Points Importants

### Sécurité :
- ⚠️ **Ne jamais commiter** l'App Secret dans le code
- ✅ Utiliser des tokens avec durée de vie limitée
- ✅ Renouveler régulièrement les tokens

### Production :
- 🔒 Utiliser HTTPS obligatoirement
- 📊 Monitorer l'expiration des tokens
- 🔄 Configurer des webhooks pour les notifications

### Développement :
- 🧪 Le mode fallback reste actif si les tokens échouent
- 📝 Les codes de vérification s'affichent dans les logs
- 🔧 Possibilité de tester sans WhatsApp

## 🆘 En Cas de Problème

1. **Token invalide** : Vérifiez l'expiration dans la console
2. **App Secret manquant** : Le système utilisera le token manuel
3. **Permissions insuffisantes** : Contactez l'administrateur Facebook Business
4. **Limite de débit atteinte** : Attendez ou augmentez les limites

## 📞 Support
- Documentation Meta : https://developers.facebook.com/docs/whatsapp
- Support Business : https://business.facebook.com/help
