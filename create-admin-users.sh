#!/bin/bash

# Script pour créer des utilisateurs administrateurs dans la base de données FEVEO 2050
# Usage: ./create-admin-users.sh

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
  echo "❌ Node.js n'est pas installé. Veuillez installer Node.js pour exécuter ce script."
  exit 1
fi

echo "🚀 Création des utilisateurs administrateurs..."
node scripts/create-admin-users.js

exit_code=$?

if [ $exit_code -eq 0 ]; then
  echo "✅ Script terminé avec succès!"
else
  echo "❌ Le script a échoué avec le code de sortie: $exit_code"
  exit $exit_code
fi
