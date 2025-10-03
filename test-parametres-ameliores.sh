#!/bin/bash

# Test des différentes façons de recevoir les paramètres codeDepartement

echo "=== Test d'amélioration de la réception des paramètres ==="
echo ""

BASE_URL="http://localhost:5001/api/rapport/gie-senegal-region-departement"

# Test 1: Format original
echo "Test 1: Format original (codeRegion + codeDepartement)"
echo "URL: $BASE_URL?codeRegion=DAKAR&codeDepartement=DAKAR"
curl -X GET "$BASE_URL?codeRegion=DAKAR&codeDepartement=DAKAR" \
  -H "Content-Type: application/json" \
  -s | jq '.message // .error // .' 2>/dev/null || echo "Pas de jq disponible"
echo ""

# Test 2: Format alternatif 1
echo "Test 2: Format alternatif (region + departement)"
echo "URL: $BASE_URL?region=DAKAR&departement=DAKAR"
curl -X GET "$BASE_URL?region=DAKAR&departement=DAKAR" \
  -H "Content-Type: application/json" \
  -s | jq '.message // .error // .' 2>/dev/null || echo "Pas de jq disponible"
echo ""

# Test 3: Format alternatif 2
echo "Test 3: Format alternatif (codeRegion + departement)"
echo "URL: $BASE_URL?codeRegion=DAKAR&departement=DAKAR"
curl -X GET "$BASE_URL?codeRegion=DAKAR&departement=DAKAR" \
  -H "Content-Type: application/json" \
  -s | jq '.message // .error // .' 2>/dev/null || echo "Pas de jq disponible"
echo ""

# Test 4: Format alternatif 3
echo "Test 4: Format alternatif (region + codeDept)"
echo "URL: $BASE_URL?region=DAKAR&codeDept=DAKAR"
curl -X GET "$BASE_URL?region=DAKAR&codeDept=DAKAR" \
  -H "Content-Type: application/json" \
  -s | jq '.message // .error // .' 2>/dev/null || echo "Pas de jq disponible"
echo ""

# Test 5: Paramètre manquant (pour tester la validation améliorée)
echo "Test 5: Paramètre manquant (test de validation)"
echo "URL: $BASE_URL?codeRegion=DAKAR"
curl -X GET "$BASE_URL?codeRegion=DAKAR" \
  -H "Content-Type: application/json" \
  -s | jq '.message, .exemples // .error // .' 2>/dev/null || echo "Pas de jq disponible"
echo ""

# Test 6: Via POST avec body
echo "Test 6: Via POST avec body JSON"
echo "POST: $BASE_URL"
curl -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"region": "DAKAR", "departement": "DAKAR"}' \
  -s | jq '.message // .error // .' 2>/dev/null || echo "Pas de jq disponible"
echo ""

echo "=== Tests terminés ==="