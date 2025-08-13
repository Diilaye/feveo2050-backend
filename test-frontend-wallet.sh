#!/bin/bash

# Test simple pour valider les fonctionnalités wallet frontend
echo "🎯 Test des fonctionnalités Wallet Frontend"
echo "=========================================="

# Vérifier si le serveur backend est lancé
echo "🔍 Vérification du serveur backend..."
if curl -s -X GET "http://localhost:4320/api/health" > /dev/null 2>&1; then
    echo "✅ Serveur backend accessible"
else
    echo "❌ Serveur backend non accessible - Lancez 'npm start' dans feveo2050-backend/"
    exit 1
fi

# Vérifier si le serveur frontend est lancé
echo "🔍 Vérification du serveur frontend..."
if curl -s -X GET "http://localhost:5173" > /dev/null 2>&1; then
    echo "✅ Serveur frontend accessible"
else
    echo "❌ Serveur frontend non accessible - Lancez 'npm run dev' dans feveo2050-frontend/"
    exit 1
fi

echo ""
echo "🌐 Pour tester l'interface wallet:"
echo "  1. Ouvrez: http://localhost:5173/wallet-login"
echo "  2. Utilisez un des codes de test:"
echo "     - FEVEO-02-01-04-04-001 (avec paiement)"
echo "     - FEVEO-02-01-04-04-002 (sans paiement)"
echo "  3. Code WhatsApp de test: 123456"
echo ""
echo "🚀 Lancement du navigateur..."

# Ouvrir le navigateur (si disponible)
if command -v xdg-open > /dev/null; then
    xdg-open "http://localhost:5173/wallet-login"
elif command -v gnome-open > /dev/null; then
    gnome-open "http://localhost:5173/wallet-login"
else
    echo "💡 Ouvrez manuellement: http://localhost:5173/wallet-login"
fi
