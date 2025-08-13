#!/bin/bash

# Script de test cURL pour WhatsApp Business API
# Utilise les variables du fichier .env

echo "🚀 Test cURL WhatsApp - Template hello_world"
echo "============================================="

# Charger les variables du .env
source .env 2>/dev/null || echo "⚠️ Fichier .env non trouvé, utilisation des valeurs par défaut"

# Variables
PHONE_NUMBER_ID="${WHATSAPP_PHONE_NUMBER_ID:-658687160670733}"
ACCESS_TOKEN="${WHATSAPP_ACCESS_TOKEN:-EAAVUh7HZAQUIBPOW2GkEjwzfHEY6NZAm7PbHN1SAqq2ZArRzRNwM2y6kLI8AsqZATrWUnyoYGM0EXVfgp1mBjsE2ZCWeJETSlmnM6qqp3aiPTZB6gsrbWjVZCWpZCyAEj1b1utgEr0OfPyQMeus1zgDiBUFv7oIcXAPWxskZCoZAOMHOvZBF9343qPnVQZBfanqCRdEnHIsiXB35RsdvSc6GZCtsi97AxO2c0SNmJ0YXXmPH2izTPR0sZD}"
TO_NUMBER="221772488807"

echo "📱 Envoi à: $TO_NUMBER"
echo "🔑 Phone Number ID: $PHONE_NUMBER_ID"
echo "🔑 Token (20 premiers caractères): ${ACCESS_TOKEN:0:20}..."
echo "⏳ Envoi en cours..."
echo ""

# Commande cURL avec token du .env
curl -i -X POST \
  "https://graph.facebook.com/v23.0/$PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "'$TO_NUMBER'",
    "type": "template",
    "template": {
      "name": "hello_world",
      "language": {
        "code": "en_US"
      }
    }
  }'

echo ""
echo "🏁 Test cURL terminé"
echo ""
echo "💡 Si le token a expiré, mettez à jour WHATSAPP_ACCESS_TOKEN dans le .env"
