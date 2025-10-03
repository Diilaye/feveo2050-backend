# Codes Départementaux Numériques - FEVEO 2050

## Format des codes départementaux

L'API FEVEO 2050 utilise maintenant des codes départementaux **numériques** au format "XX" (deux chiffres avec zéro initial si nécessaire).

### Endpoint concerné

```
GET /api/rapports/gie-senegal-region-departement
```

### Paramètres requis

- `codeRegion` ou `region` : Code/nom de la région (ex: "DAKAR", "THIES")
- `codeDepartement` ou `departement` : Code numérique du département (ex: "01", "02", "03")

### Exemples d'utilisation

#### ✅ Format correct avec codes numériques

```bash
# Région DAKAR, département code 01
GET /api/rapports/gie-senegal-region-departement?codeRegion=DAKAR&codeDepartement=01

# Format alternatif
GET /api/rapports/gie-senegal-region-departement?region=DAKAR&departement=01
```

#### ❌ Ancien format (ne fonctionne plus)

```bash
# NE MARCHE PLUS - Utilisation du nom de département
GET /api/rapports/gie-senegal-region-departement?codeRegion=DAKAR&codeDepartement=DAKAR
```

### Codes départementaux testés

| Région | Code Département | Description |
|--------|------------------|-------------|
| DAKAR  | 01              | Département DAKAR |
| DAKAR  | 02              | Département PIKINE (si existe) |
| DAKAR  | 03              | Département GUEDIAWAYE (si existe) |
| THIES  | 01              | Premier département de THIES |

### Réponse exemple

```json
{
  "message": "Rapport GIE par arrondissements du département (code: 01) de la région DAKAR",
  "regionDemandee": "DAKAR",
  "departementDemande": "01",
  "data": [
    {
      "arrondissements": [
        {
          "arrondissement": "05",
          "nombreGIE": 3,
          "totalAdherents": 9,
          "nomArrondissement": "PARCELLES ASSAINIES",
          "gies": [...]
        },
        ...
      ]
    }
  ],
  "nombreTotalGIE": 7,
  "totalTotalAdherents": 21,
  "totalTotalInvestissements": 0
}
```

### Tests de validation

Pour tester l'endpoint avec les nouveaux codes :

```bash
./test-codes-departementaux.sh
```

### Date de mise à jour

Changement effectué le : **Janvier 2025**  
Raison : Standardisation des codes départementaux au format numérique pour une meilleure cohérence avec le système de codification administrative.