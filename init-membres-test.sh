#!/bin/bash

# Script pour initialiser des membres de test dans un GIE
echo "🎬 Initialisation des membres de test pour le GIE"
echo "=============================================="

BASE_URL="http://localhost:4320/api/wallet"
GIE_CODE="${1:-FEVEO-02-01-04-04-001}"

if [ -z "$1" ]; then
    echo "Usage: $0 [GIE_CODE]"
    echo "Utilisation du GIE par défaut: $GIE_CODE"
fi

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}📋 Ajout des membres de test au GIE: $GIE_CODE${NC}"
echo ""

# Président (déjà dans les données du GIE normalement)
echo "1. Ajout Aminata Kane (Présidente)..."
curl -s -X POST "$BASE_URL/members/$GIE_CODE/add" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Kane",
    "prenom": "Aminata",
    "telephone": "771112233",
    "role": "presidente",
    "dateNaissance": "1980-05-20",
    "profession": "Enseignante",
    "adresse": "Dakar, Parcelles Assainies"
  }' > /dev/null

echo "2. Ajout Moussa Sarr (Trésorier)..."
curl -s -X POST "$BASE_URL/members/$GIE_CODE/add" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Sarr", 
    "prenom": "Moussa",
    "telephone": "772223344",
    "role": "tresorier",
    "dateNaissance": "1975-11-10",
    "profession": "Mécanicien",
    "adresse": "Thiès, Senegal"
  }' > /dev/null

echo "3. Ajout Aïssatou Fall (Secrétaire)..."
curl -s -X POST "$BASE_URL/members/$GIE_CODE/add" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Fall",
    "prenom": "Aïssatou", 
    "telephone": "773334455",
    "role": "secretaire",
    "dateNaissance": "1988-02-14",
    "profession": "Couturière",
    "adresse": "Kaolack, Senegal"
  }' > /dev/null

echo "4. Ajout Mamadou Diallo (Membre)..."
curl -s -X POST "$BASE_URL/members/$GIE_CODE/add" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Diallo",
    "prenom": "Mamadou",
    "telephone": "774445566", 
    "role": "membre",
    "dateNaissance": "1992-07-03",
    "profession": "Chauffeur",
    "adresse": "Saint-Louis, Senegal"
  }' > /dev/null

echo "5. Ajout Khadija Ndiaye (Membre)..."
curl -s -X POST "$BASE_URL/members/$GIE_CODE/add" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Ndiaye",
    "prenom": "Khadija",
    "telephone": "775556677",
    "role": "membre", 
    "dateNaissance": "1985-09-25",
    "profession": "Vendeuse",
    "adresse": "Ziguinchor, Senegal"
  }' > /dev/null

echo "6. Ajout Omar Ba (Conseiller)..."
curl -s -X POST "$BASE_URL/members/$GIE_CODE/add" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Ba",
    "prenom": "Omar",
    "telephone": "776667788",
    "role": "conseiller",
    "dateNaissance": "1970-12-05",
    "profession": "Agriculteur", 
    "adresse": "Tambacounda, Senegal"
  }' > /dev/null

echo ""
echo -e "${GREEN}✅ Membres de test ajoutés avec succès!${NC}"
echo ""
echo "📊 Vérification des résultats:"
curl -s -X GET "$BASE_URL/members/$GIE_CODE/stats" | jq '.data.stats | {total, repartitionParRole, dernierAjout}'

echo ""
echo "👥 Liste des membres:"
curl -s -X GET "$BASE_URL/members/$GIE_CODE" | jq '.data.membres[] | {nom: .nom, prenom: .prenom, role: .role, telephone: .telephone}'
