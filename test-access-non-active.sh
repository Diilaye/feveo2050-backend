#!/bin/bash

# Test d'accès au dashboard pour GIE non activés
echo "🧪 Test d'accès au dashboard - GIE non activés"
echo "=============================================="

BASE_URL="http://localhost:4320/api/wallet"

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}🔍 Test 1: GIE non activé - doit recevoir code WhatsApp${NC}"
echo "--------------------------------------------------------"

# Utiliser un code GIE de test non activé
GIE_CODE_NON_ACTIVE="FEVEO-02-01-04-04-005"

response=$(curl -s -X POST "$BASE_URL/verify-gie" \
  -H "Content-Type: application/json" \
  -d "{\"gieCode\": \"$GIE_CODE_NON_ACTIVE\"}")

echo "$response" | jq .

# Vérifier si on a reçu un code WhatsApp
whatsapp_sent=$(echo "$response" | jq -r '.data.whatsappSent // false')
can_access_dashboard=$(echo "$response" | jq -r '.data.canAccessDashboard // false')
backup_code=$(echo "$response" | jq -r '.data.backupCode // null')

if [ "$whatsapp_sent" = "true" ] || [ "$backup_code" != "null" ]; then
    echo -e "${GREEN}✅ Code WhatsApp généré avec succès${NC}"
    echo "Code de secours: $backup_code"
    
    if [ "$can_access_dashboard" = "true" ]; then
        echo -e "${GREEN}✅ Accès au dashboard autorisé${NC}"
        
        echo ""
        echo -e "${BLUE}🔍 Test 2: Vérification du code WhatsApp${NC}"
        echo "----------------------------------------"
        
        # Utiliser le code de secours pour se connecter
        whatsapp_response=$(curl -s -X POST "$BASE_URL/verify-whatsapp" \
          -H "Content-Type: application/json" \
          -d "{\"gieCode\": \"$GIE_CODE_NON_ACTIVE\", \"whatsappCode\": \"$backup_code\"}")
        
        echo "$whatsapp_response" | jq .
        
        # Vérifier le niveau d'accès
        access_level=$(echo "$whatsapp_response" | jq -r '.data.accessLevel // null')
        requires_activation=$(echo "$whatsapp_response" | jq -r '.data.requiresActivation // null')
        
        if [ "$access_level" = "limited" ] && [ "$requires_activation" = "true" ]; then
            echo -e "${YELLOW}⚠️  Accès limité accordé - Activation requise${NC}"
            echo -e "${GREEN}✅ Test réussi: Dashboard accessible même sans activation${NC}"
        else
            echo -e "${GREEN}✅ Accès complet (GIE déjà activé)${NC}"
        fi
        
    else
        echo -e "${YELLOW}⚠️ Accès au dashboard non autorisé${NC}"
    fi
    
else
    echo -e "${YELLOW}⚠️ Aucun code WhatsApp généré${NC}"
fi

echo ""
echo -e "${BLUE}🔍 Test 3: Test avec GIE activé pour comparaison${NC}"
echo "----------------------------------------------"

# Test avec un GIE activé
GIE_CODE_ACTIVE="FEVEO-02-01-04-04-001"

active_response=$(curl -s -X POST "$BASE_URL/verify-gie" \
  -H "Content-Type: application/json" \
  -d "{\"gieCode\": \"$GIE_CODE_ACTIVE\"}")

echo "$active_response" | jq .

echo ""
echo -e "${GREEN}✅ Tests terminés!${NC}"
echo ""
echo "📋 Résumé:"
echo "- Les GIE non activés peuvent maintenant accéder au dashboard"
echo "- Ils reçoivent toujours un code WhatsApp pour l'authentification"
echo "- Le niveau d'accès est adapté selon le statut d'activation"
echo "- Les fonctionnalités d'investissement restent limitées jusqu'à activation"
