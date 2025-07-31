# FEVEO 2050 Backend - Instructions de développement

Ce document contient les instructions et bonnes pratiques pour le développement du backend FEVEO 2050.

## Architecture du projet

### Modèles de données

#### Utilisateur
- Gestion des rôles : admin, moderateur, gie_president, member
- Système de permissions granulaire
- Authentification JWT sécurisée

#### GIE (Groupement d'Intérêt Économique)
- Validation métier stricte pour la composition des membres
- Génération automatique des identifiants FEVEO
- Gestion des documents officiels

#### Adhésion
- Processus en 6 étapes avec validation
- Intégration paiement Wave/Orange Money
- Suivi en temps réel du statut

#### Cycle d'Investissement
- Cycles de 1826 jours (5 ans)
- Calcul automatique des échéances
- Portefeuille GIE avec historique complet

## Règles métier FEVEO 2050

### Composition des GIE
Un GIE doit respecter l'une de ces compositions :
1. **100% femmes** : Tous les membres sont des femmes
2. **Composition mixte** :
   - Au moins 25 femmes
   - Au moins 12 jeunes (hommes ou femmes de 18-35 ans)
   - Maximum 3 hommes adultes (36+ ans)

### Système de numérotation
Format : `FEVEO-[REGION]-[DEPT]-[ARR]-[COMMUNE]-[NUMERO]`
- Région : Code sur 2 chiffres
- Département : Code sur 2 chiffres
- Arrondissement : Code sur 2 chiffres
- Commune : Code sur 2 chiffres
- Numéro : Séquentiel sur 3 chiffres

### Processus d'adhésion
1. **Soumission** : Dépôt du dossier initial
2. **Verification** : Vérification des documents
3. **Validation** : Validation par un modérateur
4. **Paiement** : Paiement des frais d'adhésion
5. **Confirmation** : Confirmation finale
6. **Activation** : Activation du compte GIE

### Cycles d'investissement
- Durée : 1826 jours (exactement 5 ans)
- Investissement quotidien : 6000 FCFA
- Total cycle : 10,956,000 FCFA
- Remboursement : 120% du capital investi

## API Guidelines

### Authentification
- Toutes les routes protégées nécessitent un token JWT
- Format : `Authorization: Bearer <token>`
- Expiration : 30 jours par défaut

### Codes de réponse HTTP
- `200` : Succès
- `201` : Création réussie
- `400` : Erreur de validation
- `401` : Non authentifié
- `403` : Non autorisé
- `404` : Ressource non trouvée
- `409` : Conflit (ressource existante)
- `500` : Erreur serveur

### Format des réponses
```json
{
  "success": true,
  "data": {...},
  "message": "Message descriptif",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### Gestion des erreurs
```json
{
  "success": false,
  "error": {
    "message": "Description de l'erreur",
    "code": "ERROR_CODE",
    "details": {...}
  }
}
```

## Sécurité

### Validation des données
- Utilisation d'express-validator pour toutes les entrées
- Sanitisation automatique des données
- Validation des types et formats

### Protection CSRF
- Headers CORS configurés strictement
- Limitation des origines autorisées

### Rate Limiting
- 100 requêtes par IP toutes les 15 minutes
- Monitoring automatique des tentatives d'abus

### Mots de passe
- Hachage bcrypt avec salt de 12 rounds
- Politique de complexité minimale
- Pas de stockage en clair

## Base de données

### Conventions de nommage
- Collections : PascalCase (ex: `Utilisateur`)
- Champs : camelCase (ex: `nomComplet`)
- Index : snake_case (ex: `email_unique`)

### Index recommandés
```javascript
// Utilisateur
db.utilisateurs.createIndex({ email: 1 }, { unique: true })
db.utilisateurs.createIndex({ role: 1 })

// GIE
db.gies.createIndex({ identifiantGIE: 1 }, { unique: true })
db.gies.createIndex({ region: 1, departement: 1 })

// Adhesion
db.adhesions.createIndex({ gieId: 1 })
db.adhesions.createIndex({ "validation.statut": 1 })

// CycleInvestissement
db.cycleinvestissements.createIndex({ gieId: 1 }, { unique: true })
db.cycleinvestissements.createIndex({ statut: 1 })
```

## Tests

### Structure des tests
```
tests/
├── unit/           # Tests unitaires
├── integration/    # Tests d'intégration
├── e2e/           # Tests end-to-end
└── fixtures/      # Données de test
```

### Conventions
- Un fichier de test par contrôleur
- Utilisation de données de test isolées
- Nettoyage automatique après chaque test

## Monitoring et Logs

### Niveaux de logs
- `error` : Erreurs critiques
- `warn` : Avertissements
- `info` : Informations générales
- `debug` : Détails de débogage

### Métriques à surveiller
- Temps de réponse des API
- Taux d'erreur par endpoint
- Utilisation mémoire/CPU
- Connexions base de données

## Déploiement

### Variables d'environnement requises
- `NODE_ENV` : Environment (production/development)
- `MONGODB_URI` : URI de connexion MongoDB
- `JWT_SECRET` : Secret pour JWT (minimum 32 caractères)
- `PORT` : Port d'écoute du serveur

### Checklist avant déploiement
- [ ] Tests passent tous
- [ ] Variables d'environnement configurées
- [ ] Base de données migrée
- [ ] Logs configurés
- [ ] Monitoring en place
- [ ] Sauvegarde automatique configurée

## Performance

### Optimisations recommandées
- Index sur les champs de recherche fréquents
- Pagination pour les listes importantes
- Cache Redis pour les données fréquemment accédées
- Compression gzip activée

### Limites par défaut
- Taille maximale requête : 10MB
- Timeout requête : 30 secondes
- Connexions simultanées : 100

## Intégrations

### Paiements
- Wave API pour les paiements mobiles
- Orange Money pour l'alternative
- Webhooks pour les confirmations

### Notifications
- Email SMTP pour les notifications importantes
- SMS via API partenaire (à configurer)

## Contribution

### Workflow Git
1. Créer une branche feature depuis `develop`
2. Implémenter la fonctionnalité
3. Écrire les tests
4. Créer une Pull Request
5. Review et merge après validation

### Standards de code
- ESLint avec configuration standard
- Prettier pour le formatage
- Commentaires JSDoc pour les fonctions publiques
- Variables en anglais, commentaires en français

## FAQ Développement

**Q: Comment ajouter un nouveau rôle utilisateur ?**
R: Modifier l'enum dans le modèle Utilisateur et mettre à jour les middlewares d'autorisation.

**Q: Comment modifier la durée d'un cycle d'investissement ?**
R: Modifier la constante `DUREE_CYCLE_JOURS` dans le modèle CycleInvestissement.

**Q: Comment ajouter une nouvelle étape au processus d'adhésion ?**
R: Mettre à jour l'enum `etapesProcessus` dans le modèle Adhesion et les contrôleurs associés.

**Q: Comment gérer les migrations de base de données ?**
R: Créer des scripts dans le dossier `migrations/` et les exécuter via npm scripts.
