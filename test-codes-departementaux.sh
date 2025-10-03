#!/bin/bash

# Test avec les codes départementaux au format numérique

echo "=== Test avec codes départementaux numériques ==="
echo ""

BASE_URL="http://localhost:3051/api/rapports/gie-senegal-region-departement"

# Test 1: DAKAR avec code département 01
echo "Test 1: Région DAKAR, Département code 01"
echo "URL: $BASE_URL?codeRegion=DAKAR&codeDepartement=01"
curl -X GET "$BASE_URL?codeRegion=DAKAR&codeDepartement=01" \
  -H "Content-Type: application/json" \
  -s | jq '.message, .regionDemandee, .departementDemande, (.data[0].arrondissements | length) // .error // .' 2>/dev/null || echo "Pas de jq disponible"
echo ""

# Test 2: Format alternatif avec codes numériques
echo "Test 2: Format alternatif (region + departement avec codes numériques)"
echo "URL: $BASE_URL?region=DAKAR&departement=01"
curl -X GET "$BASE_URL?region=DAKAR&departement=01" \
  -H "Content-Type: application/json" \
  -s | jq '.message // .error // .' 2>/dev/null || echo "Pas de jq disponible"
echo ""

# Test 3: THIES avec code département 
echo "Test 3: Région THIES, Département code 02 (si existe)"
echo "URL: $BASE_URL?codeRegion=THIES&codeDepartement=01"
curl -X GET "$BASE_URL?codeRegion=THIES&codeDepartement=01" \
  -H "Content-Type: application/json" \
  -s | jq '.message // .error // .' 2>/dev/null || echo "Pas de jq disponible"
echo ""

# Test 4: Code département invalide
echo "Test 4: Code département invalide (99)"
echo "URL: $BASE_URL?codeRegion=DAKAR&codeDepartement=99"
curl -X GET "$BASE_URL?codeRegion=DAKAR&codeDepartement=99" \
  -H "Content-Type: application/json" \
  -s | jq '.message, .data // .error // .' 2>/dev/null || echo "Pas de jq disponible"
echo ""

# Test 5: Ancien format (devrait échouer maintenant)
echo "Test 5: Ancien format avec nom département (devrait retourner vide)"
echo "URL: $BASE_URL?codeRegion=DAKAR&codeDepartement=DAKAR"
curl -X GET "$BASE_URL?codeRegion=DAKAR&codeDepartement=DAKAR" \
  -H "Content-Type: application/json" \
  -s | jq '.message, .data // .error // .' 2>/dev/null || echo "Pas de jq disponible"
echo ""

# Test 6: Paramètre manquant (pour voir les nouveaux exemples)
echo "Test 6: Paramètre manquant (voir les nouveaux exemples)"
echo "URL: $BASE_URL?codeRegion=DAKAR"
curl -X GET "$BASE_URL?codeRegion=DAKAR" \
  -H "Content-Type: application/json" \
  -s | jq '.message, .exemples // .error // .' 2>/dev/null || echo "Pas de jq disponible"
echo ""

echo "=== Tests terminés ==="
echo ""
echo "Note: Les codes départementaux doivent maintenant être au format numérique:"
echo "  - 01 pour DAKAR"
echo "  - 02 pour PIKINE" 
echo "  - 03 pour GUEDIAWAYE"
echo "  - etc."