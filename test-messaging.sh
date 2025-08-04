#!/bin/bash

echo "🚀 Tests des services de messagerie FEVEO 2050"
echo "=============================================="

BASE_URL="http://localhost:4320/api"
PHONE_NUMBER="771234567"  # Numéro de test sénégalais

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les résultats
print_result() {
    if echo "$1" | grep -q '"success":true'; then
        echo -e "${GREEN}✅ SUCCESS${NC}"
    else
        echo -e "${RED}❌ FAILED${NC}"
    fi
    echo "$1" | jq '.' 2>/dev/null || echo "$1"
    echo ""
}

echo -e "${YELLOW}📱 Test 1: Connexion Twilio${NC}"
curl -s -X GET "$BASE_URL/twilio/test-connexion" | print_result

echo -e "${YELLOW}📱 Test 2: SMS simple Twilio${NC}"
curl -s -X POST "$BASE_URL/twilio/test-sms" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\":\"$PHONE_NUMBER\",\"message\":\"Test FEVEO SMS\"}" | print_result

echo -e "${YELLOW}📱 Test 3: Code connexion GIE Twilio${NC}"
curl -s -X POST "$BASE_URL/twilio/test-code-gie" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\":\"$PHONE_NUMBER\",\"nomGIE\":\"GIE Test Agricole\"}" | print_result

echo -e "${YELLOW}📞 Test 4: Connexion WhatsApp${NC}"
curl -s -X GET "$BASE_URL/whatsapp/test-connexion" | print_result

echo -e "${YELLOW}📞 Test 5: Message WhatsApp${NC}"
curl -s -X POST "$BASE_URL/whatsapp/test-whatsapp" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\":\"$PHONE_NUMBER\",\"message\":\"Test FEVEO WhatsApp\"}" | print_result

echo -e "${YELLOW}🔄 Test 6: Message avec fallback (WhatsApp → Twilio)${NC}"
curl -s -X POST "$BASE_URL/whatsapp/test-message-fallback" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\":\"$PHONE_NUMBER\",\"type\":\"code\",\"gieCode\":\"GIE-001\"}" | print_result

echo -e "${YELLOW}💰 Test 7: Notification investissement Twilio${NC}"
curl -s -X POST "$BASE_URL/twilio/test-notification-investissement" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\":\"$PHONE_NUMBER\",\"nomGIE\":\"GIE Agricole\",\"montant\":5000,\"jourCycle\":3,\"soldeTotal\":25000}" | print_result

echo -e "${YELLOW}🎉 Test 8: Notification création GIE Twilio${NC}"
curl -s -X POST "$BASE_URL/twilio/test-notification-creation" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\":\"$PHONE_NUMBER\",\"nomGIE\":\"Nouveau GIE Agricole\"}" | print_result

echo "=============================================="
echo "🏁 Tests terminés!"
echo ""
echo "📋 Configuration requise pour Twilio:"
echo "  TWILIO_ACCOUNT_SID=your-account-sid"
echo "  TWILIO_AUTH_TOKEN=your-auth-token"
echo "  TWILIO_PHONE_NUMBER=+1234567890"
echo ""
echo "📋 Configuration requise pour WhatsApp:"
echo "  WHATSAPP_PHONE_NUMBER_ID=your-phone-id"
echo "  WHATSAPP_ACCESS_TOKEN=your-access-token"
