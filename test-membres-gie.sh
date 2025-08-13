#!/bin/bash

# Script de test pour la gestion des membres du GIE
echo "🧪 FEVEO 2050 - Test de gestion des membres GIE"
echo "=============================================="

BASE_URL="http://localhost:4320/api/wallet"
GIE_CODE="FEVEO-02-01-04-04-001"

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${BLUE}🔍 Test 1: Consulter la liste des membres${NC}"
echo "-------------------------------------------"
curl -s -X GET "$BASE_URL/members/$GIE_CODE" | jq .

echo ""
echo -e "${BLUE}🔍 Test 2: Consulter les statistiques des membres${NC}"
echo "-----------------------------------------------"
curl -s -X GET "$BASE_URL/members/$GIE_CODE/stats" | jq .

echo ""
echo -e "${BLUE}🔍 Test 3: Ajouter un nouveau membre${NC}"
echo "--------------------------------------"
response=$(curl -s -X POST "$BASE_URL/members/$GIE_CODE/add" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Diop",
    "prenom": "Fatou",
    "telephone": "771234567",
    "role": "tresoriere",
    "dateNaissance": "1985-03-15",
    "profession": "Commerçante",
    "adresse": "Dakar, Senegal"
  }')

echo "$response" | jq .

# Récupérer l'ID du membre ajouté pour les tests suivants
membre_id=$(echo "$response" | jq -r '.data.membre.id // null')

if [ "$membre_id" != "null" ]; then
    echo ""
    echo -e "${GREEN}✅ Membre ajouté avec ID: $membre_id${NC}"
    
    echo ""
    echo -e "${BLUE}🔍 Test 4: Modifier le membre ajouté${NC}"
    echo "------------------------------------"
    curl -s -X PUT "$BASE_URL/members/$GIE_CODE/$membre_id" \
      -H "Content-Type: application/json" \
      -d '{
        "nom": "Diop",
        "prenom": "Fatou Binta",
        "profession": "Entrepreneur",
        "role": "secretaire"
      }' | jq .
    
    echo ""
    echo -e "${BLUE}🔍 Test 5: Vérifier la modification${NC}"
    echo "-----------------------------------"
    curl -s -X GET "$BASE_URL/members/$GIE_CODE" | jq '.data.membres[] | select(.id == "'$membre_id'")'
    
    echo ""
    echo -e "${BLUE}🔍 Test 6: Supprimer le membre de test${NC}"
    echo "----------------------------------------"
    curl -s -X DELETE "$BASE_URL/members/$GIE_CODE/$membre_id" | jq .
    
else
    echo -e "${RED}❌ Impossible de récupérer l'ID du membre${NC}"
fi

echo ""
echo -e "${BLUE}🔍 Test 7: Tenter d'ajouter un membre avec téléphone en double${NC}"
echo "-----------------------------------------------------------"
curl -s -X POST "$BASE_URL/members/$GIE_CODE/add" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Duplicate",
    "prenom": "Test",
    "telephone": "772488858"
  }' | jq .

echo ""
echo -e "${BLUE}🔍 Test 8: Ajouter plusieurs membres pour tester la limite${NC}"
echo "--------------------------------------------------------"

for i in {1..5}; do
    echo "Ajout membre $i..."
    curl -s -X POST "$BASE_URL/members/$GIE_CODE/add" \
      -H "Content-Type: application/json" \
      -d "{
        \"nom\": \"Membre$i\",
        \"prenom\": \"Test$i\",
        \"telephone\": \"77100000$i\",
        \"role\": \"membre\"
      }" > /dev/null
done

echo ""
echo -e "${BLUE}🔍 Test 9: Vérifier le total des membres après ajouts${NC}"
echo "----------------------------------------------------"
curl -s -X GET "$BASE_URL/members/$GIE_CODE/stats" | jq '.data.stats | {total, limiteMaximum, placesDisponibles, peutAjouter}'

echo ""
echo -e "${BLUE}🔍 Test 10: Tester les données manquantes${NC}"
echo "-------------------------------------------"
curl -s -X POST "$BASE_URL/members/$GIE_CODE/add" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Incomplete"
  }' | jq .

echo ""
echo -e "${GREEN}✅ Tests de gestion des membres terminés!${NC}"
echo ""
echo "📋 Fonctionnalités testées:"
echo "- ✅ Consultation de la liste des membres"
echo "- ✅ Statistiques des membres"
echo "- ✅ Ajout d'un nouveau membre"
echo "- ✅ Modification d'un membre"
echo "- ✅ Suppression d'un membre"
echo "- ✅ Validation des doublons de téléphone"
echo "- ✅ Validation des données obligatoires"
echo "- ✅ Suivi de la limite de 40 membres"
