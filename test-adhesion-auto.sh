#!/bin/bash

echo "🧪 Test de création automatique d'adhésion"
echo "========================================"

# Définir l'URL de base
BASE_URL="http://localhost:4320/api"

echo ""
echo "1️⃣ Test avec un code GIE existant..."

# Test avec un code GIE (remplacez par un code réel de votre base)
curl -X POST "${BASE_URL}/wallet/verify-gie" \
  -H "Content-Type: application/json" \
  -d '{
    "gieCode": "GIE001"
  }' \
  -w "\n\n📊 Status: %{http_code}\n" \
  -s

echo ""
echo "2️⃣ Vérification du statut d'activation..."

curl -X GET "${BASE_URL}/wallet/activation-status/GIE001" \
  -H "Content-Type: application/json" \
  -w "\n\n📊 Status: %{http_code}\n" \
  -s

echo ""
echo "3️⃣ Test avec un autre code GIE..."

curl -X POST "${BASE_URL}/wallet/verify-gie" \
  -H "Content-Type: application/json" \
  -d '{
    "gieCode": "GIE002"
  }' \
  -w "\n\n📊 Status: %{http_code}\n" \
  -s

echo ""
echo "✅ Tests terminés"
echo ""
echo "ℹ️  Si vous obtenez encore 'GIE non trouvé', cela signifie que:"
echo "   - Le code GIE n'existe pas dans la collection GIE"
echo "   - Le serveur backend n'est pas démarré"
echo "   - Il y a un problème de connexion à la base de données"
