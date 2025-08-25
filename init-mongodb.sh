#!/bin/bash

# Script pour initialiser la base de données MongoDB avec des utilisateurs administrateurs
# Usage: ./init-mongodb.sh

echo "🚀 Initialisation de la base de données MongoDB avec Node.js..."

# Vérifier si MongoDB est installé et en cours d'exécution
if ! pgrep -x "mongod" > /dev/null; then
  echo "⚠️ MongoDB ne semble pas être en cours d'exécution"
  echo "Voulez-vous essayer de démarrer MongoDB? (o/n)"
  read -r response
  if [[ "$response" =~ ^([oO][uU][iI]|[oO])$ ]]; then
    echo "Démarrage de MongoDB..."
    sudo systemctl start mongod || {
      echo "❌ Impossible de démarrer MongoDB"
      exit 1
    }
  else
    echo "❌ MongoDB doit être en cours d'exécution pour initialiser la base de données"
    exit 1
  fi
fi

# Vérifier les dépendances Node.js
echo "📦 Vérification des dépendances..."
npm list mongodb bcrypt > /dev/null 2>&1 || {
  echo "Installation des dépendances requises..."
  npm install mongodb bcrypt --no-save
}

# Exécuter le script Node.js
echo "🔧 Exécution du script d'initialisation..."
node node-mongo-init.js

# Vérifier si l'exécution a réussi
if [ $? -eq 0 ]; then
  echo "✅ Base de données initialisée avec succès!"
else
  echo "❌ Erreur lors de l'initialisation de la base de données"
  exit 1
fi
