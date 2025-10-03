# Amélioration de la réception des paramètres - Route /gie-senegal-region-departement

## 🔧 Améliorations apportées

### ✅ **Flexibilité des noms de paramètres**

L'endpoint accepte maintenant plusieurs variantes pour les noms de paramètres :

#### Pour la région :
- `codeRegion` (format original)
- `region` (format simplifié)

#### Pour le département :
- `codeDepartement` (format original)  
- `departement` (format simplifié)
- `codeDept` (format raccourci)

### ✅ **Support des méthodes GET et POST**

```javascript
// Via query parameters (GET)
req.query.codeRegion || req.query.region

// Via body (POST)  
req.body.codeRegion || req.body.region
```

### ✅ **Validation améliorée**

En cas de paramètres manquants, la réponse d'erreur inclut :
- Les paramètres reçus
- Des exemples d'utilisation
- Plus de détails pour le debugging

```json
{
  "message": "Les paramètres 'codeRegion' et 'codeDepartement' sont requis",
  "error": "Paramètres manquants",
  "recu": {
    "codeRegion": "DAKAR",
    "codeDepartement": "manquant"
  },
  "exemples": {
    "url1": "/gie-senegal-region-departement?codeRegion=DAKAR&codeDepartement=DAKAR",
    "url2": "/gie-senegal-region-departement?region=DAKAR&departement=DAKAR"
  }
}
```

### ✅ **Logging amélioré**

```javascript
console.log('Paramètres reçus:', { 
    codeRegion, 
    codeDepartement, 
    query: req.query, 
    body: req.body 
});
```

## 🚀 Exemples d'utilisation

### Via GET avec différents formats

```bash
# Format original
curl "http://localhost:5001/api/rapport/gie-senegal-region-departement?codeRegion=DAKAR&codeDepartement=DAKAR"

# Format simplifié
curl "http://localhost:5001/api/rapport/gie-senegal-region-departement?region=DAKAR&departement=DAKAR"

# Format mixte 1
curl "http://localhost:5001/api/rapport/gie-senegal-region-departement?codeRegion=DAKAR&departement=DAKAR"

# Format mixte 2
curl "http://localhost:5001/api/rapport/gie-senegal-region-departement?region=DAKAR&codeDept=DAKAR"
```

### Via POST avec body JSON

```bash
curl -X POST "http://localhost:5001/api/rapport/gie-senegal-region-departement" \
  -H "Content-Type: application/json" \
  -d '{"region": "DAKAR", "departement": "DAKAR"}'
```

### Via JavaScript/Axios

```javascript
// GET avec query parameters
const response1 = await axios.get('/api/rapport/gie-senegal-region-departement', {
  params: {
    region: 'DAKAR',
    departement: 'DAKAR'
  }
});

// POST avec body
const response2 = await axios.post('/api/rapport/gie-senegal-region-departement', {
  codeRegion: 'DAKAR',
  codeDepartement: 'DAKAR'
});
```

## 📊 Compatibilité

| Format | Ancien support | Nouveau support |
|--------|----------------|-----------------|
| `codeRegion` + `codeDepartement` | ✅ | ✅ |
| `region` + `departement` | ❌ | ✅ |
| `codeRegion` + `departement` | ❌ | ✅ |
| `region` + `codeDept` | ❌ | ✅ |
| POST avec body | ❌ | ✅ |

## 🐛 Debugging

En cas de problème, l'endpoint affiche maintenant dans les logs :
- Les paramètres reçus dans `req.query`
- Les paramètres reçus dans `req.body`  
- Les valeurs finales extraites

Exemple de log :
```
Paramètres reçus: {
  codeRegion: 'DAKAR',
  codeDepartement: 'DAKAR',
  query: { region: 'DAKAR', departement: 'DAKAR' },
  body: {}
}
```

## ✨ Avantages

1. **Rétrocompatibilité** : Les anciens appels fonctionnent toujours
2. **Flexibilité** : Accepte plusieurs formats de noms
3. **Meilleur debugging** : Logs détaillés et messages d'erreur informatifs
4. **Support POST** : Permet l'envoi via body JSON
5. **Documentation intégrée** : Les erreurs incluent des exemples d'utilisation