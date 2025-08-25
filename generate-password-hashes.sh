#!/bin/bash

# Script pour générer des hashes bcrypt pour les mots de passe
# Usage: ./generate-password-hashes.sh

echo "🔑 Génération des hashes bcrypt pour les mots de passe..."

# Vérifier si bcrypt est installé
if ! npm list bcrypt | grep -q bcrypt; then
  echo "Installation de bcrypt..."
  npm install bcrypt --no-save
fi

# Exécuter le script Node.js
node scripts/generate-password-hashes.js

# Vérifier si l'exécution a réussi
if [ $? -eq 0 ]; then
  echo "✅ Hashes générés avec succès!"
  echo "Vous pouvez maintenant copier ces hashes dans le fichier mongo-init.js"
else
  echo "❌ Erreur lors de la génération des hashes"
  exit 1
fi
