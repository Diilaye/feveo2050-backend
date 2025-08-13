#!/bin/bash

echo "💳 Test du système de paiement GIE"
echo "=================================="

# Configuration
BACKEND_URL="http://localhost:4320"
GIE_CODE="FEVEO-01-01-01-01-001"

echo "📋 Tests disponibles:"
echo "1. Test vérification GIE en attente de paiement"
echo "2. Test génération lien de paiement"
echo "3. Test confirmation paiement et activation"
echo "4. Test statut d'activation"
echo "5. Test codes de secours"
echo ""

# Test 1: Vérification GIE en attente de paiement
echo "🔍 Test 1: Vérification GIE en attente de paiement"
echo "curl -X POST $BACKEND_URL/api/wallet/verify-gie \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"gieCode\": \"$GIE_CODE\"}'"
echo ""

# Test 2: Statut d'activation d'un GIE
echo "📊 Test 2: Vérification statut d'activation"
echo "curl -X GET $BACKEND_URL/api/wallet/activation-status/$GIE_CODE"
echo ""

# Test 3: Confirmation de paiement
echo "✅ Test 3: Confirmation de paiement"
echo "curl -X POST $BACKEND_URL/api/wallet/confirm-payment \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"transactionId\": \"FEVEO_ACTIVATION_${GIE_CODE}_123456789\", \"gieCode\": \"$GIE_CODE\"}'"
echo ""

# Test 4: Code de secours WhatsApp
echo "🔐 Test 4: Renvoi de code avec secours"
echo "curl -X POST $BACKEND_URL/api/wallet/resend-code \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"gieCode\": \"$GIE_CODE\"}'"
echo ""

echo "🎯 Scénarios de test:"
echo ""
echo "📈 Flux normal:"
echo "1. GIE avec statutAdhesion='en_attente' et statutEnregistrement='en_attente_paiement'"
echo "2. → Génération automatique du lien de paiement Wave"
echo "3. → Simulation du paiement réussi"
echo "4. → Activation automatique du GIE"
echo "5. → Accès au wallet activé"
echo ""

echo "🔄 Flux de secours:"
echo "1. Échec envoi WhatsApp"
echo "2. → Code affiché directement sur l'écran"
echo "3. → Utilisateur peut continuer sans interruption"
echo ""

echo "🛡️  Sécurité:"
echo "- Vérification de l'existence du GIE"
echo "- Validation des statuts d'adhésion"
echo "- Vérification des transactions de paiement"
echo "- Codes temporaires avec expiration"
echo "- Notifications WhatsApp automatiques"
echo ""

echo "💰 Montants et frais:"
echo "- Adhésion GIE: 25,000 FCFA"
echo "- Frais Wave: 1% + 60 FCFA"
echo "- Total estimé: ~25,310 FCFA"
echo ""

echo "📱 Notifications WhatsApp:"
echo "- Code de vérification (6 chiffres)"
echo "- Confirmation d'activation du GIE"
echo "- Instructions d'accès au wallet"
echo ""

echo "🎉 Résultat attendu:"
echo "✅ GIE activé automatiquement après paiement"
echo "✅ Wallet accessible immédiatement"
echo "✅ Cycle d'investissement initialisé"
echo "✅ Notifications envoyées"
echo "✅ Codes de secours fonctionnels"

echo ""
echo "🚀 Pour tester, démarrez le serveur backend et exécutez les commandes curl ci-dessus"
