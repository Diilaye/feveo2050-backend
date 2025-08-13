#!/bin/bash

echo "🧪 Test complet du processus de connexion wallet"
echo "=============================================="

BASE_URL="http://localhost:4320/api/wallet"
GIE_CODE="FEVEO-14-01-04-02-001"

echo ""
echo "1️⃣ Étape 1: Vérification du code GIE et génération du code WhatsApp"
echo "-------------------------------------------------------------------"

# Étape 1: Demander le code WhatsApp
echo "📱 Demande du code WhatsApp pour GIE: $GIE_CODE"
RESPONSE1=$(curl -s -X POST "${BASE_URL}/verify-gie" \
  -H "Content-Type: application/json" \
  -d "{\"gieCode\": \"${GIE_CODE}\"}")

echo "Réponse:"
echo "$RESPONSE1" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE1"

# Extraire le code de secours de la réponse
BACKUP_CODE=$(echo "$RESPONSE1" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    if 'data' in data and 'backupCode' in data['data']:
        print(data['data']['backupCode'])
    else:
        print('NO_BACKUP_CODE')
except:
    print('PARSE_ERROR')
" 2>/dev/null)

echo ""
echo "🔍 Code de secours extrait: $BACKUP_CODE"

echo ""
echo "2️⃣ Étape 2: Vérification des codes actifs"
echo "----------------------------------------"

curl -s -X GET "${BASE_URL}/debug-codes" | python3 -m json.tool

echo ""
echo "3️⃣ Étape 3: Test de vérification avec le code de secours"
echo "-------------------------------------------------------"

if [ "$BACKUP_CODE" != "NO_BACKUP_CODE" ] && [ "$BACKUP_CODE" != "PARSE_ERROR" ] && [ ! -z "$BACKUP_CODE" ]; then
    echo "✅ Utilisation du code de secours: $BACKUP_CODE"
    
    RESPONSE2=$(curl -s -X POST "${BASE_URL}/verify-whatsapp" \
      -H "Content-Type: application/json" \
      -d "{\"gieCode\": \"${GIE_CODE}\", \"whatsappCode\": \"${BACKUP_CODE}\"}")
    
    echo "Réponse de vérification:"
    echo "$RESPONSE2" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE2"
else
    echo "❌ Aucun code de secours disponible. Test avec un code factice..."
    
    RESPONSE2=$(curl -s -X POST "${BASE_URL}/verify-whatsapp" \
      -H "Content-Type: application/json" \
      -d "{\"gieCode\": \"${GIE_CODE}\", \"whatsappCode\": \"123456\"}")
    
    echo "Réponse avec code factice:"
    echo "$RESPONSE2" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE2"
fi

echo ""
echo "4️⃣ Étape 4: Test de renvoi de code"
echo "---------------------------------"

RESPONSE3=$(curl -s -X POST "${BASE_URL}/resend-code" \
  -H "Content-Type: application/json" \
  -d "{\"gieCode\": \"${GIE_CODE}\"}")

echo "Réponse renvoi de code:"
echo "$RESPONSE3" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE3"

echo ""
echo "🎯 Résumé du test:"
echo "=================="
echo "- Code GIE testé: $GIE_CODE"
echo "- Code de secours: $BACKUP_CODE"
echo "- Tests effectués: vérification GIE, vérification WhatsApp, renvoi code"
echo ""
echo "💡 Pour un test complet en UI:"
echo "   1. Ouvrez http://localhost:3000/wallet"
echo "   2. Saisissez: $GIE_CODE"
echo "   3. Utilisez le code de secours: $BACKUP_CODE"
