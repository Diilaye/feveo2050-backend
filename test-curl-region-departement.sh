#!/bin/bash

# Test de la nouvelle route /gie-senegal-region-departement

echo "=== Test de la route /gie-senegal-region-departement ==="
echo ""

BASE_URL="http://localhost:5001/api/rapport"

# Test 1: Avec les paramètres requis
echo "Test 1: Récupération des arrondissements du département DAKAR de la région DAKAR"
echo "URL: $BASE_URL/gie-senegal-region-departement?codeRegion=DAKAR&codeDepartement=DAKAR"
echo ""

curl -X GET "$BASE_URL/gie-senegal-region-departement?codeRegion=DAKAR&codeDepartement=DAKAR" \
  -H "Content-Type: application/json" \
  -w "\n\nStatut HTTP: %{http_code}\n" \
  2>/dev/null | jq '.' 2>/dev/null || echo "Réponse brute (jq non disponible)"

echo ""
echo "----------------------------------------"
echo ""

# Test 2: Sans paramètres (doit retourner erreur 400)
echo "Test 2: Sans paramètres (test de validation - doit retourner erreur 400)"
echo "URL: $BASE_URL/gie-senegal-region-departement"
echo ""

curl -X GET "$BASE_URL/gie-senegal-region-departement" \
  -H "Content-Type: application/json" \
  -w "\n\nStatut HTTP: %{http_code}\n" \
  2>/dev/null | jq '.' 2>/dev/null || echo "Réponse brute (jq non disponible)"

echo ""
echo "----------------------------------------"
echo ""

# Test 3: Avec un département différent
echo "Test 3: Test avec un autre département si disponible"
echo "URL: $BASE_URL/gie-senegal-region-departement?codeRegion=THIES&codeDepartement=THIES"
echo ""

curl -X GET "$BASE_URL/gie-senegal-region-departement?codeRegion=THIES&codeDepartement=THIES" \
  -H "Content-Type: application/json" \
  -w "\n\nStatut HTTP: %{http_code}\n" \
  2>/dev/null | jq '.' 2>/dev/null || echo "Réponse brute (jq non disponible)"

echo ""
echo "=== Tests terminés ==="