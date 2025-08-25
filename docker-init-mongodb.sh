#!/bin/bash

# Script pour initialiser la base de données MongoDB avec Docker Compose
# Usage: ./docker-init-mongodb.sh

echo "🐳 Initialisation de MongoDB avec Docker Compose..."

# Vérifier si Docker Compose est installé
if ! command -v docker-compose &> /dev/null; then
  if ! command -v docker &> /dev/null || ! docker compose version &> /dev/null; then
    echo "❌ Erreur: Docker Compose n'est pas installé"
    echo "Veuillez installer Docker Compose pour exécuter ce script"
    exit 1
  else
    DOCKER_COMPOSE="docker compose"
  fi
else
  DOCKER_COMPOSE="docker-compose"
fi

# Vérifier si le docker-compose.yml existe
if [ ! -f "docker-compose.yml" ]; then
  echo "❌ Erreur: docker-compose.yml non trouvé"
  echo "Veuillez exécuter ce script depuis le répertoire contenant docker-compose.yml"
  exit 1
fi

# Vérifier si MongoDB est en cours d'exécution via Docker Compose
if ! $DOCKER_COMPOSE ps | grep -q "mongo"; then
  echo "🚀 Démarrage des services avec Docker Compose..."
  $DOCKER_COMPOSE up -d
  
  # Attendre que MongoDB démarre
  echo "⏳ Attente du démarrage de MongoDB..."
  sleep 10
else
  echo "✅ Services Docker Compose déjà en cours d'exécution"
fi

# Trouver le nom du conteneur MongoDB
CONTAINER_NAME=$($DOCKER_COMPOSE ps -q mongodb 2>/dev/null || $DOCKER_COMPOSE ps -q mongo 2>/dev/null || docker ps --filter "name=mongo" --format "{{.Names}}" | grep -m1 "")

if [ -z "$CONTAINER_NAME" ]; then
  echo "❌ Erreur: Impossible de trouver le conteneur MongoDB"
  echo "Vérifiez que le service est nommé 'mongo' ou 'mongodb' dans votre docker-compose.yml"
  exit 1
fi

echo "📊 Utilisation du conteneur MongoDB: $CONTAINER_NAME"

# Copier le script mongo-init.js dans le conteneur
echo "📂 Copie du script dans le conteneur..."
docker cp mongo-init.js $CONTAINER_NAME:/tmp/

# Exécuter le script dans le conteneur
echo "🔧 Exécution du script dans le conteneur..."
if docker exec $CONTAINER_NAME which mongosh &> /dev/null; then
  docker exec $CONTAINER_NAME mongosh --quiet "mongodb://admin:password123@localhost:27017/feveo2050?authSource=admin" /tmp/mongo-init.js
else
  docker exec $CONTAINER_NAME mongo "mongodb://admin:password123@localhost:27017/feveo2050?authSource=admin" /tmp/mongo-init.js
fi

# Vérifier si l'exécution a réussi
EXIT_CODE=$?
if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ Base de données MongoDB initialisée avec succès!"
  # Nettoyer après exécution
  echo "🧹 Nettoyage des fichiers temporaires..."
  docker exec $CONTAINER_NAME rm -f /tmp/mongo-init.js
else
  echo "❌ Erreur lors de l'initialisation de la base de données MongoDB (code: $EXIT_CODE)"
  echo "Consultez les logs avec: docker logs $CONTAINER_NAME"
  exit 1
fi
