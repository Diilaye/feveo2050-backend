#!/bin/bash

# Script pour exécuter mongo-init.js avec Docker et MongoDB
# Usage: ./run-mongo-init.sh

echo "🚀 Exécution du script d'initialisation MongoDB avec Docker..."

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
  echo "❌ Erreur: Docker n'est pas installé"
  echo "Veuillez installer Docker pour exécuter ce script"
  exit 1
fi

# Vérifier si le conteneur MongoDB est en cours d'exécution
CONTAINER_NAME=$(docker ps --filter "name=mongo" --format "{{.Names}}" | grep -m1 "")

if [ -z "$CONTAINER_NAME" ]; then
  echo "Recherche d'un conteneur MongoDB par image..."
  CONTAINER_NAME=$(docker ps --filter "ancestor=mongo" --format "{{.Names}}" | grep -m1 "")
fi

if [ -z "$CONTAINER_NAME" ]; then
  echo "❌ Erreur: Aucun conteneur MongoDB trouvé en cours d'exécution"
  echo "Voulez-vous démarrer un conteneur MongoDB? (o/n)"
  read -r response
  if [[ "$response" =~ ^([oO][uU][iI]|[oO])$ ]]; then
    echo "Démarrage d'un conteneur MongoDB..."
    docker run --name mongodb -d -p 27017:27017 mongo:latest
    CONTAINER_NAME="mongodb"
    # Attendre que MongoDB démarre
    echo "Attente du démarrage de MongoDB..."
    sleep 5
  else
    echo "Veuillez démarrer un conteneur MongoDB et réessayer"
    exit 1
  fi
fi

echo "Utilisation du conteneur MongoDB: $CONTAINER_NAME"

# Copier le script mongo-init.js dans le conteneur
echo "Copie du script dans le conteneur..."
docker cp mongo-init.js $CONTAINER_NAME:/tmp/

# Exécuter le script dans le conteneur avec mongosh (MongoDB 5.0+) ou mongo
echo "Exécution du script dans le conteneur..."
if docker exec $CONTAINER_NAME which mongosh &> /dev/null; then
  docker exec $CONTAINER_NAME mongosh --quiet "mongodb://admin:password123@localhost:27017/feveo2050?authSource=admin" /tmp/mongo-init.js
else
  docker exec $CONTAINER_NAME mongo "mongodb://admin:password123@localhost:27017/feveo2050?authSource=admin" /tmp/mongo-init.js
fi

# Vérifier si l'exécution a réussi
EXIT_CODE=$?
if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ Script d'initialisation MongoDB exécuté avec succès!"
  # Nettoyer après exécution
  echo "Nettoyage des fichiers temporaires..."
  docker exec $CONTAINER_NAME rm -f /tmp/mongo-init.js
else
  echo "❌ Erreur lors de l'exécution du script d'initialisation MongoDB (code: $EXIT_CODE)"
  echo "Vous pouvez consulter les logs du conteneur avec: docker logs $CONTAINER_NAME"
  exit 1
fi
