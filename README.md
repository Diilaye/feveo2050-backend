# 🚀 FEVEO 2050 - Backend API

Backend Node.js/Express pour la plateforme d'investissement FEVEO 2050 avec intégration Wave Payment et système de validation GIE.

## 📋 Table des matières

- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [API Endpoints](#api-endpoints)
- [Base de données](#base-de-données)
- [Intégrations](#intégrations)
- [Tests](#tests)
- [Déploiement](#déploiement)
- [Contribution](#contribution)

## 🎯 Aperçu

Le backend FEVEO 2050 est une API REST robuste construite avec Node.js et Express, offrant :

- **Système d'authentification JWT sécurisé**
- **Intégration Wave Payment API** pour les paiements mobiles
- **Validation automatique des GIE** (Groupements d'Intérêt Économique)
- **Gestion des investissements** et cycles d'investissement
- **Base de données MongoDB** avec Mongoose ODM
- **Middleware de validation** et gestion d'erreurs
- **Health checks** et monitoring

## ✨ Fonctionnalités

### 🔐 Authentification & Autorisation
- Inscription/Connexion utilisateur
- Tokens JWT avec expiration
- Middleware d'authentification
- Rôles et permissions

### 💰 Système de Paiement
- **Intégration Wave Payment** complète
- Génération de liens de paiement dynamiques
- Proxy CORS pour appels Wave API
- Gestion des callbacks et webhooks
- Support multi-montants (6K, 60K, 90K, 180K FCFA)

### 🏢 Gestion GIE
- Validation automatique des GIE
- Vérification d'éligibilité pour investissements
- CRUD complet des GIE
- Historique des validations

### 📊 Investissements
- Cycles d'investissement configurables
- Suivi des contributions
- Calculs automatiques (frais, montants nets)
- Historique complet

### 🔧 Administration
- Dashboard administrateur
- Statistiques en temps réel
- Gestion des utilisateurs
- Monitoring système

## 🏗️ Architecture

```
back/
├── 📁 src/
│   ├── 📁 config/          # Configuration (DB, environnement)
│   ├── 📁 controllers/     # Logique métier des endpoints
│   ├── 📁 middleware/      # Middlewares (auth, validation)
│   ├── 📁 models/          # Modèles MongoDB/Mongoose
│   ├── 📁 routes/          # Définition des routes API
│   └── 📁 utils/           # Utilitaires et helpers
├── 📁 migrations/          # Scripts de migration DB
├── 📄 server.js           # Point d'entrée principal
├── 📄 package.json        # Dépendances et scripts
└── 📄 docker-compose.yml  # Configuration Docker
```

## 🛠️ Installation

### Prérequis
- **Node.js** (version 16+)
- **MongoDB** (version 4.4+)
- **npm** ou **yarn**

### Étapes d'installation

1. **Cloner le repository**
```bash
git clone https://github.com/Diilaye/feveo2050-backend.git
cd feveo2050-backend
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer l'environnement**
```bash
cp .env.example .env
# Éditer le fichier .env avec vos configurations
```

4. **Démarrer MongoDB**
```bash
# Via Docker (recommandé)
docker-compose up -d mongodb

# Ou MongoDB local
mongod --dbpath ./data
```

5. **Exécuter les migrations**
```bash
npm run migrate
```

6. **Lancer le serveur**
```bash
# Développement
npm run dev

# Production
npm start
```

## ⚙️ Configuration

### Variables d'environnement (.env)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/feveo2050
DB_NAME=feveo2050

# JWT Authentication
JWT_SECRET=votre-secret-jwt-ultra-securise
JWT_EXPIRES_IN=7d

# Wave Payment API
WAVE_API_URL=https://api.wave.com/v1
WAVE_API_KEY=wave_sn_prod_FIdhHNGkeoAFnuGNxuh8WD3L9XjEBqjRCKx2zEZ87H7LWSwHs2v2aA_5q_ZJGwaLfphltYSRawKP-voVugCpwWB2FMH3ZTtC0w

# CORS Origins
CORS_ORIGIN=http://localhost:5173,https://feveo2050.com

# Logging
LOG_LEVEL=info
```

### Configuration Docker

Le projet inclut une configuration Docker complète :

```bash
# Démarrer tous les services
docker-compose up -d

# Logs en temps réel
docker-compose logs -f

# Arrêter les services
docker-compose down
```

## 🚀 Utilisation

### Démarrage rapide

```bash
# Installation complète
npm install

# Base de données (seed avec données de test)
npm run seed

# Serveur de développement avec hot reload
npm run dev
```

Le serveur sera accessible sur `http://localhost:5000`

### Scripts disponibles

```bash
npm start          # Démarrer en production
npm run dev        # Démarrer en développement (nodemon)
npm run test       # Exécuter les tests
npm run seed       # Peupler la DB avec des données de test
npm run migrate    # Exécuter les migrations
npm run lint       # Vérifier le code (ESLint)
npm run health     # Health check rapide
```

## 🛣️ API Endpoints

### Base URL
```
Development: http://localhost:5000/api
Production: https://api.feveo2050.com/api
```

### 🔐 Authentification
```http
POST /api/auth/register    # Inscription utilisateur
POST /api/auth/login       # Connexion utilisateur
GET  /api/auth/profile     # Profil utilisateur (protégé)
POST /api/auth/logout      # Déconnexion
```

### 🏢 GIE (Groupements d'Intérêt Économique)
```http
GET    /api/gie                    # Liste des GIE
POST   /api/gie                    # Créer un GIE
GET    /api/gie/:id                # Détails d'un GIE
PUT    /api/gie/:id                # Modifier un GIE
DELETE /api/gie/:id                # Supprimer un GIE
POST   /api/gie/:id/validate       # Valider un GIE
```

### 💰 Paiements Wave
```http
POST /api/payments/wave/generate   # Générer lien de paiement
POST /api/payments/wave/simple     # Paiement simple (legacy)
POST /api/payments/wave/callback   # Callback Wave (webhook)
GET  /api/payments/status/:id      # Statut d'un paiement
```

### 📊 Investissements
```http
GET  /api/investissements              # Liste des investissements
POST /api/investissements              # Créer un investissement
GET  /api/investissements/:id          # Détails d'un investissement
PUT  /api/investissements/:id          # Modifier un investissement
GET  /api/investissements/user/:userId # Investissements d'un utilisateur
```

### 📋 Adhésions
```http
GET  /api/adhesions           # Liste des adhésions
POST /api/adhesions           # Créer une adhésion
GET  /api/adhesions/:id       # Détails d'une adhésion
PUT  /api/adhesions/:id       # Modifier une adhésion
```

### 🔍 Health & Monitoring
```http
GET /api/health              # Health check simple
GET /api/health/detailed     # Health check détaillé
GET /api/stats               # Statistiques système
```

## 🗄️ Base de données

### Modèles MongoDB

#### Utilisateur
```javascript
{
  nom: String,
  prenom: String,
  email: String (unique),
  telephone: String,
  motDePasse: String (hashé),
  role: String (enum: ['user', 'admin']),
  dateCreation: Date,
  dernièreConnexion: Date
}
```

#### GIE (Groupement d'Intérêt Économique)
```javascript
{
  nom: String,
  description: String,
  secteurActivite: String,
  adresse: String,
  numeroRegistre: String (unique),
  statut: String (enum: ['actif', 'inactif', 'suspendu']),
  dateCreation: Date,
  validePourInvestissement: Boolean,
  documentsPourcentage: Number
}
```

#### Investissement
```javascript
{
  utilisateur: ObjectId (ref: 'Utilisateur'),
  gie: ObjectId (ref: 'GIE'),
  montantInvesti: Number,
  fraisGestion: Number,
  montantNet: Number,
  statutPaiement: String,
  dateInvestissement: Date,
  cycleInvestissement: ObjectId (ref: 'CycleInvestissement')
}
```

#### Cycle d'Investissement
```javascript
{
  nom: String,
  dateDebut: Date,
  dateFin: Date,
  montantObjectif: Number,
  montantCollecte: Number,
  nombreInvestisseurs: Number,
  statut: String (enum: ['ouvert', 'ferme', 'complet'])
}
```

### Migrations

```bash
# Exécuter toutes les migrations
npm run migrate

# Migration spécifique
node migrations/001_create_indexes.js
```

## 🔌 Intégrations

### Wave Payment API

L'intégration Wave permet :

- **Génération de liens de paiement** sécurisés
- **Support multi-montants** avec calculs automatiques
- **Callbacks en temps réel** pour mise à jour des statuts
- **Gestion des erreurs** et fallbacks

**Configuration Wave :**
```javascript
const waveConfig = {
  apiKey: process.env.WAVE_API_KEY,
  baseURL: 'https://api.wave.com/v1',
  currency: 'XOF', // Franc CFA
  successURL: 'https://feveo2050.com/success',
  failureURL: 'https://feveo2050.com/error'
};
```

### MongoDB avec Mongoose

- **Connexion automatique** avec retry logic
- **Schémas typés** avec validation
- **Indexation optimisée** pour les performances
- **Middlewares Mongoose** pour hooks

## 🧪 Tests

### Structure des tests
```
tests/
├── unit/           # Tests unitaires
├── integration/    # Tests d'intégration
├── e2e/           # Tests end-to-end
└── fixtures/      # Données de test
```

### Commandes de test
```bash
# Tous les tests
npm test

# Tests avec coverage
npm run test:coverage

# Tests en mode watch
npm run test:watch

# Tests d'intégration seulement
npm run test:integration
```

### Tests d'API avec exemples

```bash
# Test création GIE
curl -X POST http://localhost:5000/api/gie 
  -H "Content-Type: application/json" 
  -d '{"nom": "GIE Test", "secteurActivite": "Agriculture"}'

# Test génération paiement Wave
curl -X POST http://localhost:5000/api/payments/wave/generate 
  -H "Content-Type: application/json" 
  -d '{"amount": 6000, "description": "Investissement FEVEO"}'
```

## 🚀 Déploiement

### Environnement de production

1. **Serveur recommandé :**
   - VPS Ubuntu 20.04+
   - 2GB RAM minimum
   - Node.js 16+
   - MongoDB 4.4+
   - Nginx (reverse proxy)

2. **Variables d'environnement production :**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://prod-server:27017/feveo2050
JWT_SECRET=your-ultra-secure-production-secret
WAVE_API_KEY=your-production-wave-key
```

3. **Déploiement avec PM2 :**
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

### Docker Deployment

```bash
# Build de l'image
docker build -t feveo2050-backend .

# Run avec Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name api.feveo2050.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 Maintenance

### Monitoring

- **Health checks** automatiques sur `/api/health`
- **Logs structurés** avec Winston
- **Métriques** de performance
- **Alertes** automatiques

### Backup

```bash
# Backup MongoDB
mongodump --uri="mongodb://localhost:27017/feveo2050" --out=./backups/

# Restauration
mongorestore --uri="mongodb://localhost:27017/feveo2050" ./backups/feveo2050/
```

## 🤝 Contribution

### Workflow de développement

1. **Fork** le repository
2. **Créer** une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. **Commit** les changements (`git commit -am 'Ajout nouvelle fonctionnalité'`)
4. **Push** vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. **Créer** une Pull Request

### Standards de code

- **ESLint** pour le linting
- **Prettier** pour le formatage
- **Conventional Commits** pour les messages
- **Tests** obligatoires pour nouvelles fonctionnalités

### Structure des commits
```
feat: ajout intégration Wave Payment
fix: correction validation GIE
docs: mise à jour README
test: ajout tests unitaires paiements
```

## 📝 Changelog

### v1.0.0 (2024-01-15)
- ✅ Intégration Wave Payment complète
- ✅ Système de validation GIE
- ✅ API REST complète
- ✅ Authentification JWT
- ✅ Base de données MongoDB
- ✅ Documentation complète
- ✅ Tests d'intégration
- ✅ Configuration Docker

---

## 📞 Support

Pour toute question ou problème :

- **Email :** support@feveo2050.com
- **Documentation :** [Wiki du projet](https://github.com/Diilaye/feveo2050-backend/wiki)
- **Issues :** [GitHub Issues](https://github.com/Diilaye/feveo2050-backend/issues)

---

**Développé avec ❤️ pour FEVEO 2050**

### 🏢 Gestion des GIE
- Création et gestion des GIE avec validation métier
- Système de numérotation automatique FEVEO
- Validation de la composition des membres (100% femmes OU 25+ femmes + 12 jeunes + ≤3 hommes adultes)
- Génération automatique des documents officiels

### 📋 Processus d'Adhésion
- Workflow d'adhésion en 6 étapes
- Validation des documents
- Système de paiement intégré
- Suivi du statut en temps réel

### 💰 Cycles d'Investissement
- Cycles d'investissement de 1826 jours (5 ans)
- Calcul automatique des échéances
- Portefeuille GIE avec historique des transactions
- Suivi de progression en temps réel

## 🛠️ Technologies

- **Backend**: Node.js + Express.js
- **Base de données**: MongoDB + Mongoose
- **Authentification**: JWT + bcryptjs
- **Sécurité**: Helmet, CORS, Rate Limiting
- **Validation**: express-validator
- **Documentation**: Swagger/OpenAPI

## 📁 Structure du projet

```
src/
├── config/
│   └── database.js          # Configuration MongoDB
├── controllers/
│   ├── authController.js    # Authentification
│   ├── gieController.js     # Gestion des GIE
│   ├── adhesionController.js # Processus d'adhésion
│   └── investissementController.js # Cycles d'investissement
├── middleware/
│   ├── auth.js              # Middleware d'authentification
│   └── validation.js        # Validation des données
├── models/
│   ├── Utilisateur.js       # Modèle utilisateur avec rôles
│   ├── GIE.js              # Modèle GIE avec validation métier
│   ├── Adhesion.js         # Modèle processus d'adhésion
│   └── CycleInvestissement.js # Modèle cycles d'investissement
├── routes/
│   ├── auth.js             # Routes d'authentification
│   ├── gie.js              # Routes GIE
│   ├── adhesions.js        # Routes adhésions
│   └── investissements.js  # Routes investissements
├── utils/
│   └── seedDatabase.js     # Script d'initialisation
└── server.js               # Point d'entrée de l'application
```

## ⚙️ Installation et Configuration

### Prérequis
- Node.js (v16+)
- MongoDB (v5+)
- npm ou yarn

### Installation

1. **Cloner le projet**
   ```bash
   cd src/back
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration des variables d'environnement**
   ```bash
   cp .env.example .env
   ```
   
   Modifier le fichier `.env` avec vos paramètres :
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/feveo2050
   JWT_SECRET=votre_secret_jwt_super_securise
   JWT_EXPIRE=30d
   BCRYPT_ROUNDS=12
   ```

4. **Démarrer MongoDB**
   ```bash
   # Via Homebrew (macOS)
   brew services start mongodb-community
   
   # Via systemctl (Linux)
   sudo systemctl start mongod
   
   # Via Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Initialiser la base de données**
   ```bash
   npm run seed
   ```

6. **Démarrer le serveur**
   ```bash
   # Mode développement
   npm run dev
   
   # Mode production
   npm start
   ```

## 🔧 Scripts disponibles

```bash
npm start        # Démarrer en mode production
npm run dev      # Démarrer en mode développement (nodemon)
npm test         # Lancer les tests
npm run seed     # Initialiser la base de données avec des données de test
```

## 📊 Données de test

Après l'initialisation (`npm run seed`), vous aurez accès à :

### 👤 Comptes utilisateurs
- **Admin**: `admin@feveo2050.sn` / `admin123`
- **Modérateur**: `moderateur@feveo2050.sn` / `modo123`
- **Présidente**: `presidente@feveo2050.sn` / `presidente123`

### 🏢 GIE d'exemple
- **FEVEO-01-01-01-01-001**: GIE validé avec cycle d'investissement actif
- **FEVEO-02-01-01-01-002**: GIE en attente d'adhésion

## 🌐 API Endpoints

### Authentification
```
POST /api/auth/register    # Inscription
POST /api/auth/login       # Connexion
GET  /api/auth/me          # Profil utilisateur
PUT  /api/auth/profile     # Modifier profil
```

### GIE
```
GET    /api/gie            # Liste des GIE
POST   /api/gie            # Créer un GIE
GET    /api/gie/:id        # Détails d'un GIE
PUT    /api/gie/:id        # Modifier un GIE
DELETE /api/gie/:id        # Supprimer un GIE
GET    /api/gie/:id/documents # Télécharger documents
```

### Adhésions
```
GET    /api/adhesions      # Liste des adhésions
POST   /api/adhesions      # Créer une adhésion
GET    /api/adhesions/:id  # Détails d'une adhésion
PUT    /api/adhesions/:id/etape/:etape # Valider une étape
POST   /api/adhesions/:id/paiement     # Traiter un paiement
```

### Investissements
```
GET    /api/investissements            # Liste des cycles
GET    /api/investissements/:gieId     # Cycle d'un GIE
POST   /api/investissements/:id/jour   # Investir pour un jour
GET    /api/investissements/:id/wallet # Portefeuille GIE
```

## 🔒 Sécurité

- ✅ Chiffrement des mots de passe (bcrypt)
- ✅ Protection CORS configurée
- ✅ Rate limiting (100 req/15min par IP)
- ✅ Validation stricte des données
- ✅ Sanitisation des entrées
- ✅ Headers de sécurité (Helmet)
- ✅ Authentification JWT avec expiration

## 📈 Monitoring

L'application expose plusieurs endpoints de monitoring :

- `GET /health` - Santé de l'application
- `GET /api/stats` - Statistiques générales
- `GET /api/gie/stats` - Statistiques des GIE

## 🧪 Tests

```bash
# Lancer tous les tests
npm test

# Lancer les tests en mode watch
npm run test:watch

# Générer un rapport de couverture
npm run test:coverage
```

## 🚀 Déploiement

### Déploiement manuel

1. Construire l'application :
   ```bash
   npm run build
   ```

2. Configurer les variables d'environnement de production

3. Démarrer avec PM2 :
   ```bash
   pm2 start ecosystem.config.js
   ```

### Déploiement Docker

```bash
# Construire l'image
docker build -t feveo2050-backend .

# Lancer le conteneur
docker run -d -p 5000:5000 --name feveo-backend feveo2050-backend
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commiter les changements (`git commit -am 'Ajouter nouvelle fonctionnalité'`)
4. Pousser vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- Email: support@feveo2050.sn
- Documentation: [docs.feveo2050.sn](https://docs.feveo2050.sn)
- Issues: [GitHub Issues](https://github.com/feveo2050/backend/issues)

---

*Développé avec ❤️ pour FEVEO 2050 Sénégal*
