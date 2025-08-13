#!/bin/bash

echo "🔧 Activation manuelle d'un GIE pour test WhatsApp"
echo "================================================"

BASE_URL="http://localhost:4320/api/wallet"
GIE_CODE="FEVEO-06-01-02-02-002"

echo ""
echo "1️⃣ Test du flux de paiement complet"
echo "-----------------------------------"

echo "📋 GIE à activer: $GIE_CODE"

# Étape 1: Obtenir les infos de paiement
echo "💰 Génération du lien de paiement..."
PAYMENT_RESPONSE=$(curl -s -X POST "${BASE_URL}/verify-gie" \
  -H "Content-Type: application/json" \
  -d "{\"gieCode\": \"${GIE_CODE}\"}")

echo "$PAYMENT_RESPONSE" | python3 -m json.tool

# Extraire le transaction ID
TRANSACTION_ID=$(echo "$PAYMENT_RESPONSE" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    if 'data' in data and 'payment' in data['data'] and 'transactionId' in data['data']['payment']:
        print(data['data']['payment']['transactionId'])
    else:
        print('NO_TRANSACTION_ID')
except:
    print('PARSE_ERROR')
" 2>/dev/null)

echo ""
echo "🔑 Transaction ID: $TRANSACTION_ID"

if [ "$TRANSACTION_ID" != "NO_TRANSACTION_ID" ] && [ "$TRANSACTION_ID" != "PARSE_ERROR" ] && [ ! -z "$TRANSACTION_ID" ]; then
    echo ""
    echo "2️⃣ Simulation de confirmation de paiement"
    echo "----------------------------------------"
    
    echo "✅ Confirmation du paiement avec transaction ID: $TRANSACTION_ID"
    
    CONFIRM_RESPONSE=$(curl -s -X POST "${BASE_URL}/confirm-payment" \
      -H "Content-Type: application/json" \
      -d "{\"transactionId\": \"${TRANSACTION_ID}\", \"gieCode\": \"${GIE_CODE}\"}")
    
    echo "Réponse de confirmation:"
    echo "$CONFIRM_RESPONSE" | python3 -m json.tool
    
    echo ""
    echo "3️⃣ Test d'accès au wallet après activation"
    echo "------------------------------------------"
    
    WALLET_ACCESS=$(curl -s -X POST "${BASE_URL}/verify-gie" \
      -H "Content-Type: application/json" \
      -d "{\"gieCode\": \"${GIE_CODE}\"}")
    
    echo "Réponse d'accès wallet:"
    echo "$WALLET_ACCESS" | python3 -m json.tool
    
else
    echo "❌ Impossible d'extraire le transaction ID"
fi

echo ""
echo "🎯 Instructions pour test UI:"
echo "============================"
echo "1. Ouvrez http://localhost:3000/wallet"
echo "2. Saisissez le code GIE: $GIE_CODE"
echo "3. Vous devriez voir l'interface de paiement"
echo "4. Cliquez sur 'Vérifier le paiement' pour simuler l'activation"
