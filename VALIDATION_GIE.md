# Validation des GIEs pour les Investissements - FEVEO 2050

## 🎯 Objectif

Ce système de validation garantit qu'un GIE existe et qu'il est dans un état approprié avant d'autoriser les opérations d'investissement.

## 🛡️ Middlewares de Validation

### `validateGIEMiddleware`
**Utilisation :** Opérations d'investissement (création, modification)
- ✅ Vérifie l'existence du GIE
- ✅ Vérifie que le statut est `validé`
- ✅ Ajoute `req.gie` pour les contrôleurs

### `validateGIEExistenceMiddleware`
**Utilisation :** Consultation des données
- ✅ Vérifie seulement l'existence du GIE
- ✅ Ajoute `req.gie` pour les contrôleurs

## 📍 Implémentation dans les Routes

```javascript
// Routes avec validation complète (GIE validé requis)
router.post('/gie/:gieId/investir', auth, validateGIEMiddleware, enregistrerInvestissement);
router.get('/gie/:gieId/calendrier', auth, validateGIEMiddleware, getCalendrier);
router.get('/gie/:gieId/stats', auth, validateGIEMiddleware, getStatistiques);

// Routes avec validation d'existence seulement
router.get('/gie/:gieId', auth, validateGIEExistenceMiddleware, getCycleByGIE);
```

## 🔄 Flux de Validation

```
1. Client fait une requête → /api/investissements/gie/:gieId/investir
2. Middleware auth → Vérification de l'authentification
3. Middleware validateGIEMiddleware → Validation du GIE
   ├─ GIE existe ? Non → 404 GIE_NOT_FOUND
   ├─ GIE validé ? Non → 403 GIE_NOT_VALIDATED
   └─ Tout OK → req.gie ajouté, passage au contrôleur
4. Contrôleur → Traitement de l'investissement
```

## 📋 Codes d'Erreur

| Code | Status | Description |
|------|--------|-------------|
| `GIE_NOT_FOUND` | 404 | GIE inexistant dans la base |
| `GIE_NOT_VALIDATED` | 403 | GIE existe mais statut ≠ 'validé' |
| `CYCLE_NOT_FOUND` | 404 | Cycle d'investissement inexistant |
| `MISSING_GIE_ID` | 400 | Paramètre gieId manquant |

## 📝 Exemples de Réponses

### ❌ GIE Non Trouvé
```json
{
  "success": false,
  "message": "GIE non trouvé. Veuillez vous assurer que le GIE est enregistré.",
  "code": "GIE_NOT_FOUND"
}
```

### ❌ GIE Non Validé
```json
{
  "success": false,
  "message": "Le GIE \"FEVEO-DK-DK-01-01-001\" n'est pas encore validé. Statut actuel: en_attente. Veuillez attendre la validation de votre adhésion.",
  "code": "GIE_NOT_VALIDATED",
  "data": {
    "gieStatut": "en_attente",
    "nomGIE": "FEVEO-DK-DK-01-01-001",
    "identifiantGIE": "FEVEO-DK-DK-01-01-001",
    "dateCreation": "2025-07-30T12:00:00.000Z"
  }
}
```

### ❌ Cycle Non Trouvé
```json
{
  "success": false,
  "message": "Cycle d'investissement non trouvé pour le GIE \"FEVEO-DK-DK-01-01-001\". Veuillez contacter l'administration.",
  "code": "CYCLE_NOT_FOUND",
  "data": {
    "nomGIE": "FEVEO-DK-DK-01-01-001",
    "identifiantGIE": "FEVEO-DK-DK-01-01-001"
  }
}
```

## 🔧 Utilisation dans les Contrôleurs

Avec les middlewares, les contrôleurs peuvent accéder directement aux informations du GIE :

```javascript
const enregistrerInvestissement = async (req, res) => {
  try {
    // req.gie est automatiquement disponible grâce au middleware
    const gie = req.gie;
    
    console.log(`Investissement pour GIE: ${gie.nomGIE}`);
    
    // Plus besoin de re-valider le GIE
    const cycle = await CycleInvestissement.findOne({ gieId: gie._id });
    
    // ... reste de la logique
  } catch (error) {
    // Gestion d'erreur
  }
};
```

## 🧪 Tests de Validation

### Cas de Test

1. **GIE Inexistant**
   - Input : ID qui n'existe pas
   - Expected : 404 + GIE_NOT_FOUND

2. **GIE Non Validé**
   - Input : GIE avec statut 'en_attente'
   - Expected : 403 + GIE_NOT_VALIDATED

3. **GIE Validé Sans Cycle**
   - Input : GIE validé mais sans cycle d'investissement
   - Expected : 404 + CYCLE_NOT_FOUND

4. **GIE Validé Avec Cycle**
   - Input : GIE validé avec cycle actif
   - Expected : 200 + Succès

### Script de Test
```bash
cd /back
node tests/testValidationGIE.js
```

## 🚀 Avantages

1. **Sécurité** : Empêche les opérations sur des GIEs non autorisés
2. **Cohérence** : Messages d'erreur standardisés
3. **Performance** : Validation une seule fois par requête
4. **Maintenabilité** : Logique centralisée dans les middlewares
5. **UX** : Messages d'erreur informatifs pour les utilisateurs

## 📊 Monitoring

Les erreurs de validation sont automatiquement loggées avec :
- Timestamp
- Type d'erreur
- ID du GIE concerné
- Adresse IP du client
- Route tentée

## 🔄 Mise à Jour

Pour ajouter une nouvelle validation :

1. Modifier le middleware dans `/middleware/gieValidation.js`
2. Mettre à jour la documentation
3. Ajouter des tests appropriés
4. Déployer et monitorer

---

*Système de validation mis en place le 30 juillet 2025 pour sécuriser les opérations d'investissement FEVEO 2050.*
