# Tests API pour la Création de GIE - FEVEO

Ce dossier contient les scripts de test pour l'API de création des GIE (Groupements d'Intérêt Économique) dans l'application FEVEO.

## 📋 Fichiers de Test

### 1. `test-gie-creation.js` - Test Complet
Script de test complet qui couvre tous les aspects de la création de GIE :
- ✅ Authentification
- ✅ Création de GIE avec données complètes
- ✅ Vérification du GIE créé
- ✅ Test de la liste des GIE
- ✅ Test des statistiques
- ✅ Test avec données invalides
- ✅ Nettoyage optionnel

### 2. `test-gie-simple.js` - Test Rapide
Version simplifiée pour des tests rapides :
- ✅ Authentification basique
- ✅ Création de GIE avec données minimales
- ✅ Vérification simple

### 3. `package-test.json` - Configuration des Tests
Configuration npm pour les scripts de test.

## 🚀 Installation et Exécution

### Prérequis
1. Le serveur backend doit être en cours d'exécution sur `http://localhost:3001`
2. Axios doit être installé : `npm install axios`

### Installation des Dépendances
```bash
cd /Users/diikaanedev/Documents/feveo-projet/back
npm install axios dotenv
```

### Exécution des Tests

#### Test Complet
```bash
node test-gie-creation.js
```

#### Test Rapide
```bash
node test-gie-simple.js
```

#### Test avec npm scripts (si package-test.json est renommé en package.json)
```bash
npm test          # Test complet
npm run test:simple  # Test rapide
```

## 📊 Structure des Données de Test

### Données Complètes (test-gie-creation.js)
```javascript
{
  nomGIE: "GIE Test Agriculture Bio",
  identifiantGIE: "TEST-AGR-001",
  numeroProtocole: "PROT-2025-001",
  region: "Dakar",
  secteurPrincipal: "Agriculture",
  presidenteNom: "Diallo",
  presidentePrenom: "Fatou",
  membres: [
    // 5 membres complets avec toutes les informations
  ],
  capitalInitial: 500000,
  cotisationMensuelle: 25000,
  // ... autres champs
}
```

### Données Simplifiées (test-gie-simple.js)
```javascript
{
  nomGIE: "GIE Test Simple",
  identifiantGIE: "SIMPLE-001",
  presidenteNom: "Ndiaye",
  presidentePrenom: "Awa",
  membres: [
    // 1 membre (la présidente)
  ],
  capitalInitial: 100000,
  // ... champs essentiels uniquement
}
```

## 🔧 Configuration

### Variables d'Environnement
Modifiez les constantes en haut des fichiers selon votre configuration :

```javascript
const API_BASE_URL = 'http://localhost:3001/api';
const TEST_USER_EMAIL = 'admin@feveo.sn';
const TEST_USER_PASSWORD = 'password123';
```

### Authentification
Les tests utilisent un utilisateur admin avec les permissions de gestion des GIE. Assurez-vous que cet utilisateur existe dans votre base de données.

## 📈 Résultats Attendus

### Test Réussi
```
🚀 Démarrage des tests API pour la création de GIE
============================================================
🔐 Authentification en cours...
✅ Authentification réussie

📝 Test de création de GIE...
✅ GIE créé avec succès !

🔍 Vérification du GIE créé...
✅ GIE trouvé et vérifié !

📋 Test de récupération de la liste des GIE...
✅ Liste des GIE récupérée !

📈 Test de récupération des statistiques...
✅ Statistiques récupérées !

🎉 Tous les tests ont été exécutés avec succès !
```

### Test avec Erreur
```
❌ Erreur lors de la création du GIE:
Status: 400
Message: GIE avec cet identifiant existe déjà
```

## 🧹 Nettoyage

Par défaut, le script de test complet commente la ligne de suppression du GIE de test. Pour activer le nettoyage automatique, décommentez la ligne dans `test-gie-creation.js` :

```javascript
// await cleanupTestGIE(token, createdGIE._id); // ← Décommentez cette ligne
```

## 🛠️ Développement

### Ajouter de Nouveaux Tests
1. Créez une nouvelle fonction de test dans `test-gie-creation.js`
2. Ajoutez l'appel à cette fonction dans `runAllTests()`
3. Exportez la fonction si nécessaire

### Modifier les Données de Test
Modifiez les objets `testGIEData` ou `simpleGIEData` selon vos besoins de test.

## 📝 Notes Importantes

1. **Unicité des Données** : Assurez-vous que les identifiants, protocoles et CIN sont uniques pour éviter les conflits
2. **Permissions** : L'utilisateur de test doit avoir les permissions `gestion_gie`
3. **Base de Données** : Les tests créent de vraies données dans la base de données
4. **Nettoyage** : Pensez à nettoyer les données de test après utilisation

## 🐛 Dépannage

### Erreur d'Authentification
- Vérifiez que l'utilisateur admin existe
- Vérifiez le mot de passe
- Vérifiez que le serveur backend est démarré

### Erreur de Validation
- Vérifiez la structure des données
- Consultez les erreurs de validation dans la réponse
- Vérifiez que tous les champs requis sont présents

### Erreur de Réseau
- Vérifiez que le serveur backend est accessible
- Vérifiez l'URL de l'API
- Vérifiez que le port 3001 est ouvert

## 📞 Support

Pour toute question ou problème avec les tests, consultez :
1. Les logs de la console pour les détails d'erreur
2. Les réponses du serveur pour les erreurs de validation
3. La documentation de l'API backend
