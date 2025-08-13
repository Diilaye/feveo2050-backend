#!/bin/bash

echo "🔍 Vérification des GIE dans la base de données"
echo "=============================================="

# Script pour afficher les GIE disponibles
# Ce script nécessite que MongoDB soit accessible et le serveur backend démarré

echo ""
echo "📋 Liste des GIE disponibles dans la base :"
echo ""

# Vous pouvez aussi utiliser directement MongoDB si disponible
# mongo --eval "db.gies.find({}, {identifiantGIE: 1, nomGIE: 1, _id: 0}).limit(10)"

# Ou créer un endpoint de debug dans l'API
curl -X GET "http://localhost:4320/api/gie" \
  -H "Content-Type: application/json" \
  -s 2>/dev/null | python3 -m json.tool 2>/dev/null || echo "❌ Serveur non accessible ou pas de GIE"

echo ""
echo "ℹ️  Pour voir tous les GIE, vous pouvez :"
echo "   1. Démarrer le serveur backend"
echo "   2. Utiliser un client MongoDB"
echo "   3. Créer des GIE de test"
