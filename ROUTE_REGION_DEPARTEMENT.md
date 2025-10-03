# Routes API Rapports GIE - FEVEO 2050

## Vue d'ensemble

Le système FEVEO 2050 propose trois niveaux de rapports hiérarchiques pour les GIE au Sénégal :

1. **National → Régions** : `/gie-senegal-regions`
2. **Région → Départements** : `/gie-senegal-region-departement`  
3. **Département → Arrondissements** : `/gie-senegal-departement-arrondissement` ✨ **NOUVEAU**

## 1. Route Nationale (Régions)

### Endpoint
```
GET /api/rapports/gie-senegal-regions
```

### Description
Retourne tous les GIE du Sénégal groupés par régions, puis par départements.

### Réponse
- Groupement par `région` 
- Sous-groupement par `département`
- Statistiques : nombreGIE, totalAdherents, totalInvestissements

---

## 2. Route Régionale (Départements → Arrondissements)

### Endpoint
```
GET /api/rapports/gie-senegal-region-departement
```

### Paramètres requis
- `codeRegion` ou `region` : Code/nom de la région (ex: "DAKAR")
- `codeDepartement` ou `departement` : Code numérique du département (ex: "01")

### Exemples d'utilisation
```bash
# Format principal
GET /api/rapports/gie-senegal-region-departement?codeRegion=DAKAR&codeDepartement=01

# Format alternatif
GET /api/rapports/gie-senegal-region-departement?region=DAKAR&departement=01
```

### Réponse
- Groupement par `arrondissement` du département spécifié
- Enrichissement avec `nomArrondissement` et `nomCommune`
- Statistiques par arrondissement

---

## 3. Route Départementale (Arrondissements → Communes) ✨ **NOUVEAU**

### Endpoint
```
GET /api/rapports/gie-senegal-departement-arrondissement
```

### Paramètres requis
- `codeRegion` ou `region` : Code/nom de la région (ex: "DAKAR")
- `codeDepartement` ou `departement` : Code numérique du département (ex: "01")
- `codeArrondissement` ou `arrondissement` : Code numérique de l'arrondissement (ex: "05")

### Exemples d'utilisation
```bash
# Format principal
GET /api/rapports/gie-senegal-departement-arrondissement?codeRegion=DAKAR&codeDepartement=01&codeArrondissement=05

# Format alternatif
GET /api/rapports/gie-senegal-departement-arrondissement?region=DAKAR&departement=01&arrondissement=05
```

### Réponse
- Groupement par `commune` de l'arrondissement spécifié
- Enrichissement avec `nomArrondissement` et `nomCommune`
- Statistiques par commune
- Liste complète des GIE avec tous leurs détails

### Exemple de réponse
```json
{
  "message": "Rapport GIE par communes de l'arrondissement (code: 05) du département (code: 01) de la région DAKAR",
  "regionDemandee": "DAKAR",
  "departementDemande": "01", 
  "arrondissementDemande": "05",
  "data": [
    {
      "region": "DAKAR",
      "departement": "DAKAR",
      "arrondissement": "05",
      "nombreTotalGIE": 3,
      "totalTotalAdherents": 9,
      "totalTotalInvestissements": 0,
      "communes": [
        {
          "commune": "01",
          "nombreGIE": 1,
          "totalAdherents": 3,
          "totalInvestissements": 0,
          "gies": [
            {
              "_id": "...",
              "nomGIE": "FEVEO-01-01-05-01-001",
              "nomArrondissement": "PARCELLES ASSAINIES",
              "nomCommune": "GRAND YOFF",
              "membres": [...],
              "secteurPrincipal": "Commerce & Distribution",
              ...
            }
          ]
        },
        {
          "commune": "03", 
          "nombreGIE": 2,
          "totalAdherents": 6,
          "gies": [...]
        }
      ]
    }
  ]
}
              "nombreMembres": 12,
              "statutEnregistrement": "valide",
              "createdAt": "2024-01-15T10:00:00.000Z"
            }
          ]
        }
      ]
    }
  ]
}
```

## 🎯 Structure hiérarchique

```
Région
└── Département
    └── Arrondissements[]
        ├── Statistiques (nombreGIE, totalAdherents, totalInvestissements)
        └── GIEs[]
            ├── Informations de base
            ├── nomArrondissement (résolu automatiquement)
            └── nomCommune (résolu automatiquement)
```

---

## ✨ NOUVELLE ROUTE : Communes d'un arrondissement

### Endpoint
```
GET /api/rapports/gie-senegal-departement-arrondissement
```

### Paramètres requis
- `codeRegion` ou `region` : Code/nom de la région (ex: "DAKAR")
- `codeDepartement` ou `departement` : Code numérique du département (ex: "01")
- `codeArrondissement` ou `arrondissement` : Code numérique de l'arrondissement (ex: "05")

### Exemple d'utilisation
```bash
# Récupérer les communes de l'arrondissement PARCELLES ASSAINIES (05) du département DAKAR (01)
curl "http://localhost:3051/api/rapports/gie-senegal-departement-arrondissement?codeRegion=DAKAR&codeDepartement=01&codeArrondissement=05"
```

### Structure de la réponse
- Groupement par `commune` de l'arrondissement spécifié
- Enrichissement avec `nomArrondissement` et `nomCommune`
- Statistiques par commune : nombreGIE, totalAdherents, totalInvestissements
- Liste complète des GIE avec tous leurs détails

### Test
```bash
./test-communes-arrondissement.sh
```

---

**📅 Date de création** : Août 2024  
**🔄 Dernière mise à jour** : Septembre 2025  
**👥 Auteur** : Équipe Backend FEVEO 2050

## 🔧 Fonctionnalités

### ✅ Filtrage précis
- Filtre uniquement les GIEs du département spécifié dans la région donnée
- Validation des paramètres obligatoires

### ✅ Agrégation par arrondissement
- Regroupe les GIEs par arrondissement
- Calcule les statistiques pour chaque arrondissement
- Totalise les statistiques au niveau département

### ✅ Enrichissement géographique
- Résout automatiquement les codes en noms lisibles
- Ajoute `nomArrondissement` et `nomCommune` à chaque GIE

### ✅ Gestion des membres
- Intègre automatiquement la présidente dans la liste des membres
- Évite les doublons si la présidente est déjà dans les membres

## 🚀 Exemples d'utilisation

### Via curl
```bash
# Récupérer les arrondissements du département DAKAR
curl -X GET "http://localhost:5001/api/rapport/gie-senegal-region-departement?codeRegion=DAKAR&codeDepartement=DAKAR"

# Récupérer les arrondissements d'un autre département
curl -X GET "http://localhost:5001/api/rapport/gie-senegal-region-departement?codeRegion=THIES&codeDepartement=THIES"
```

### Via JavaScript/Axios
```javascript
const response = await axios.get('/api/rapport/gie-senegal-region-departement', {
  params: {
    codeRegion: 'DAKAR',
    codeDepartement: 'DAKAR'
  }
});
```

## ❌ Gestion d'erreurs

### 400 - Paramètres manquants
```json
{
  "message": "Les paramètres 'codeRegion' et 'codeDepartement' sont requis",
  "error": "Paramètres manquants"
}
```

### 500 - Erreur serveur
```json
{
  "message": "Erreur lors de la génération du rapport par arrondissements",
  "error": "Description de l'erreur"
}
```

## 🔄 Comparaison avec les autres routes

| Route | Niveau de détail | Paramètres | Groupement |
|-------|------------------|------------|------------|
| `/gie-senegal` | National | Aucun | Par région |
| `/gie-senegal-regions` | Régional | `codeRegions[]` | Par département |
| `/gie-senegal-region-departement` | Départemental | `codeRegion`, `codeDepartement` | Par arrondissement |

## 🎨 Intégration frontend

Cette route peut être utilisée pour créer des vues détaillées au niveau arrondissement, permettant une navigation hiérarchique :

1. **Vue nationale** → Régions
2. **Vue régionale** → Départements  
3. **Vue départementale** → Arrondissements ✨ (nouvelle route)
4. **Vue arrondissement** → GIEs individuels