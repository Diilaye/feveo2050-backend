# 🔑 Renouvellement du Token WhatsApp Business API

## ❌ Problème Actuel
Le token d'accès WhatsApp a expiré le **26 juillet 2025 à 20h00 PDT**.

## 🔧 Solution : Renouveler le Token

### 1. Accéder à la Console Meta/Facebook
1. Allez sur : https://developers.facebook.com/
2. Connectez-vous avec votre compte Facebook Business
3. Sélectionnez votre app WhatsApp Business

### 2. Générer un Nouveau Token
1. Dans le panneau de gauche, allez à **WhatsApp** > **Configuration**
2. Trouvez la section **Token d'accès**
3. Cliquez sur **Générer un token** ou **Renouveler**
4. Copiez le nouveau token généré

### 3. Mettre à Jour le Fichier .env
```bash
# Remplacer l'ancien token par le nouveau
WHATSAPP_ACCESS_TOKEN=NOUVEAU_TOKEN_ICI
```

### 4. Redémarrer le Serveur
```bash
cd /Users/diikaanedev/Documents/feveo-projet/back
npm start
```

## 🧪 Tester la Nouvelle Configuration

### Test rapide via curl :
```bash
curl -X POST "http://localhost:3000/api/wallet/test-whatsapp" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "221772488807",
    "message": "Test nouveau token WhatsApp ✅"
  }'
```

## 📱 Tokens d'Accès WhatsApp

### Types de Tokens :
1. **Token Temporaire** (24h) - Pour les tests
2. **Token d'Accès Système** (60 jours) - Pour la production
3. **Token Permanent** - Nécessite validation business

### Recommandations :
- **Développement** : Utiliser des tokens temporaires
- **Production** : Obtenir un token système ou permanent
- **Monitoring** : Vérifier l'expiration régulièrement

## 🔄 Mode Fallback Actuel

En cas d'échec WhatsApp, le système utilise un **mode fallback** :
- Les codes de vérification sont affichés dans les logs du serveur
- Permet de continuer les tests même sans WhatsApp
- **Mode dev uniquement** - ne pas utiliser en production

## 🚨 Sécurité

⚠️ **Important** :
- Ne jamais commiter les tokens dans le code
- Utiliser toujours des variables d'environnement
- Renouveler les tokens avant expiration
- Utiliser HTTPS en production

## 📞 Support Meta

En cas de problème persistant :
- Documentation : https://developers.facebook.com/docs/whatsapp
- Support : https://developers.facebook.com/support/
