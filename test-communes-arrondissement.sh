#!/bin/bash

# Test de la nouvelle route pour communes d'un arrondissement

echo "=== Test des communes d'un arrondissement ==="
echo ""

BASE_URL="http://localhost:3051/api/rapports/gie-senegal-departement-arrondissement"

# Test 1: DAKAR, département 01, arrondissement 05 (PARCELLES ASSAINIES)
echo "Test 1: Région DAKAR, Département 01, Arrondissement 05 (PARCELLES ASSAINIES)"
echo "URL: $BASE_URL?codeRegion=DAKAR&codeDepartement=01&codeArrondissement=05"
curl -X GET "$BASE_URL?codeRegion=DAKAR&codeDepartement=01&codeArrondissement=05" \
  -H "Content-Type: application/json" \
  -s | jq '.message, .regionDemandee, .departementDemande, .arrondissementDemande, (.data[0].communes | length) // .error // .' 2>/dev/null || echo "Pas de jq disponible"
echo ""

# Test 2: Format alternatif avec noms de paramètres
echo "Test 2: Format alternatif (region + departement + arrondissement)"
echo "URL: $BASE_URL?region=DAKAR&departement=01&arrondissement=05"
curl -X GET "$BASE_URL?region=DAKAR&departement=01&arrondissement=05" \
  -H "Content-Type: application/json" \
  -s | jq '.message // .error // .' 2>/dev/null || echo "Pas de jq disponible"
echo ""

# Test 3: Autre arrondissement - DAKAR département 01, arrondissement 02 (DAKAR-PLATEAU)
echo "Test 3: Région DAKAR, Département 01, Arrondissement 02 (DAKAR-PLATEAU)"
echo "URL: $BASE_URL?codeRegion=DAKAR&codeDepartement=01&codeArrondissement=02"
curl -X GET "$BASE_URL?codeRegion=DAKAR&codeDepartement=01&codeArrondissement=02" \
  -H "Content-Type: application/json" \
  -s | jq '.message, (.data[0].communes | length) // .error // .' 2>/dev/null || echo "Pas de jq disponible"
echo ""

# Test 4: Arrondissement inexistant
echo "Test 4: Arrondissement inexistant (99)"
echo "URL: $BASE_URL?codeRegion=DAKAR&codeDepartement=01&codeArrondissement=99"
curl -X GET "$BASE_URL?codeRegion=DAKAR&codeDepartement=01&codeArrondissement=99" \
  -H "Content-Type: application/json" \
  -s | jq '.message, .data // .error // .' 2>/dev/null || echo "Pas de jq disponible"
echo ""

# Test 5: Paramètre manquant (pour voir les nouveaux exemples)
echo "Test 5: Paramètre manquant (voir les nouveaux exemples)"
echo "URL: $BASE_URL?codeRegion=DAKAR&codeDepartement=01"
curl -X GET "$BASE_URL?codeRegion=DAKAR&codeDepartement=01" \
  -H "Content-Type: application/json" \
  -s | jq '.message, .exemples // .error // .' 2>/dev/null || echo "Pas de jq disponible"
echo ""

# Test 6: Tous paramètres manquants
echo "Test 6: Tous paramètres manquants (voir aide complète)"
echo "URL: $BASE_URL"
curl -X GET "$BASE_URL" \
  -H "Content-Type: application/json" \
  -s | jq '.message, .recu // .error // .' 2>/dev/null || echo "Pas de jq disponible"
echo ""

echo "=== Tests terminés ==="
echo ""
echo "Note: Cette route nécessite 3 paramètres :"
echo "  - codeRegion : Code/nom de la région (ex: 'DAKAR')"
echo "  - codeDepartement : Code numérique du département (ex: '01')"
echo "  - codeArrondissement : Code numérique de l'arrondissement (ex: '05')"
echo ""
echo "Elle retourne les GIE groupés par COMMUNES dans l'arrondissement spécifié."