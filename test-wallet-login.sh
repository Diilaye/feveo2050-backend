#!/bin/bash

# Script de test pour le système de login wallet GIE
# Usage: ./test-wallet-login.sh

echo "🧪 FEVEO 2050 - Test du système de login wallet GIE"
echo "=================================================="

# Variables de configuration
BASE_URL="http://localhost:4320/api/wallet"
GIE_CODE="FEVEO-02-01-04-04-001"
WHATSAPP_CODE="123456"

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "🔍 Test 1: Vérification du serveur"
echo "--------------------------------"
curl -s -X GET "${BASE_URL%/wallet}/health" | jq .

echo ""
echo "🔍 Test 2: Vérification code GIE"
echo "-------------------------------"
response=$(curl -s -X POST "$BASE_URL/verify-gie" \
  -H "Content-Type: application/json" \
  -d "{\"gieCode\": \"$GIE_CODE\"}")

echo "$response" | jq .

# Vérifier si un paiement est requis
requires_payment=$(echo "$response" | jq -r '.requiresPayment // false')
payment_url=$(echo "$response" | jq -r '.data.payment.paymentUrl // null')

if [ "$requires_payment" = "true" ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Paiement requis pour ce GIE${NC}"
    echo "URL de paiement: $payment_url"
    
    echo ""
    echo "🔍 Test 3: Validation directe du GIE (bypass paiement)"
    echo "----------------------------------------------------"
    curl -s -X POST "$BASE_URL/validate-and-activate-gie" \
      -H "Content-Type: application/json" \
      -d "{\"gieCode\": \"$GIE_CODE\", \"forceActivation\": true}" | jq .
    
    # Réessayer la vérification après activation
    echo ""
    echo "🔍 Test 4: Re-vérification après activation"
    echo "------------------------------------------"
    response=$(curl -s -X POST "$BASE_URL/verify-gie" \
      -H "Content-Type: application/json" \
      -d "{\"gieCode\": \"$GIE_CODE\"}")
    echo "$response" | jq .
fi

echo ""
echo "🔍 Test 5: Vérification code WhatsApp"
echo "-----------------------------------"
curl -s -X POST "$BASE_URL/verify-whatsapp" \
  -H "Content-Type: application/json" \
  -d "{\"gieCode\": \"$GIE_CODE\", \"whatsappCode\": \"$WHATSAPP_CODE\"}" | jq .

echo ""
echo "🔍 Test 6: Consultation des GIE en attente"
echo "-----------------------------------------"
curl -s -X GET "$BASE_URL/pending-validation" | jq .

echo ""
echo "🔍 Test 7: Consultation des codes de debug"
echo "----------------------------------------"
curl -s -X GET "$BASE_URL/debug-codes" | jq .

echo ""
echo "🔍 Test 8: Liste des GIE disponibles"
echo "----------------------------------"
curl -s -X GET "$BASE_URL/debug-gie-list" | jq .

echo ""
echo "✅ Tests terminés!"
echo ""
echo "💡 Pour tester avec d'autres codes GIE:"
echo "   export GIE_CODE='FEVEO-02-01-04-04-002'"
echo "   ./test-wallet-login.sh"
