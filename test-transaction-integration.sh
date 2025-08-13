#!/bin/bash

echo "🧪 Test intégration complète avec modèle Transaction"
echo "=================================================="

BASE_URL="http://localhost:4320/api/wallet"
GIE_CODE="FEVEO-01-01-02-16-001"

echo ""
echo "1️⃣ Génération de transaction et lien de paiement"
echo "-----------------------------------------------"

echo "📱 Demande de paiement pour GIE: $GIE_CODE"
PAYMENT_RESPONSE=$(curl -s -X POST "${BASE_URL}/verify-gie" \
  -H "Content-Type: application/json" \
  -d "{\"gieCode\": \"${GIE_CODE}\"}")

echo "Réponse génération paiement:"
echo "$PAYMENT_RESPONSE" | python3 -m json.tool

# Extraire les informations de transaction
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

DB_TRANSACTION_ID=$(echo "$PAYMENT_RESPONSE" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    if 'data' in data and 'payment' in data['data'] and 'dbTransactionId' in data['data']['payment']:
        print(data['data']['payment']['dbTransactionId'])
    else:
        print('NO_DB_TRANSACTION_ID')
except:
    print('PARSE_ERROR')
" 2>/dev/null)

echo ""
echo "🔑 Transaction ID: $TRANSACTION_ID"
echo "🗄️ DB Transaction ID: $DB_TRANSACTION_ID"

echo ""
echo "2️⃣ Consultation de l'historique des transactions"
echo "------------------------------------------------"

if [ "$GIE_CODE" != "" ]; then
    echo "📊 Historique des transactions pour: $GIE_CODE"
    
    HISTORY_RESPONSE=$(curl -s -X GET "${BASE_URL}/transactions/${GIE_CODE}")
    
    echo "Historique des transactions:"
    echo "$HISTORY_RESPONSE" | python3 -m json.tool
fi

echo ""
echo "3️⃣ Test de confirmation de paiement"
echo "-----------------------------------"

if [ "$TRANSACTION_ID" != "NO_TRANSACTION_ID" ] && [ "$TRANSACTION_ID" != "PARSE_ERROR" ] && [ ! -z "$TRANSACTION_ID" ]; then
    echo "✅ Simulation de confirmation pour: $TRANSACTION_ID"
    
    CONFIRM_RESPONSE=$(curl -s -X POST "${BASE_URL}/confirm-payment" \
      -H "Content-Type: application/json" \
      -d "{\"transactionId\": \"${TRANSACTION_ID}\", \"gieCode\": \"${GIE_CODE}\"}")
    
    echo "Réponse confirmation:"
    echo "$CONFIRM_RESPONSE" | python3 -m json.tool
    
    echo ""
    echo "4️⃣ Vérification post-confirmation"
    echo "--------------------------------"
    
    POST_CONFIRM_HISTORY=$(curl -s -X GET "${BASE_URL}/transactions/${GIE_CODE}")
    
    echo "Historique après confirmation:"
    echo "$POST_CONFIRM_HISTORY" | python3 -m json.tool
    
else
    echo "❌ Pas de transaction ID valide pour tester la confirmation"
fi

echo ""
echo "🎯 Test des statistiques de statut"
echo "================================="

echo "📈 Résumé des transactions:"
curl -s -X GET "${BASE_URL}/transactions/${GIE_CODE}" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    if 'data' in data and 'transactions' in data['data']:
        transactions = data['data']['transactions']
        statuses = {}
        for transaction in transactions:
            status = transaction['status']
            statuses[status] = statuses.get(status, 0) + 1
        
        print('Statuts des transactions:')
        for status, count in statuses.items():
            print(f'  {status}: {count}')
        
        print(f'Total: {len(transactions)} transactions')
        print(f'Montant total: {data[\"data\"][\"totalAmount\"]} FCFA')
    else:
        print('Aucune transaction trouvée')
except:
    print('Erreur de parsing')
"

echo ""
echo "🚀 Instructions pour test frontend:"
echo "==================================="
echo "1. Ouvrez http://localhost:3000/wallet"
echo "2. Saisissez le code GIE: $GIE_CODE"
echo "3. Testez le flux de paiement complet"
echo "4. Vérifiez que les transactions sont enregistrées en DB"
