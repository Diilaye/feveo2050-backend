#!/bin/bash

# Script pour initialiser la base de données MongoDB avec Docker Compose
# Usage: ./docker-init-mongodb.sh

echo "🐳 Initialisation de MongoDB avec Docker Compose..."

# Vérification préalable: démon Docker disponible
if ! command -v docker &> /dev/null; then
  echo "❌ Erreur: Docker n'est pas installé ou non disponible dans le PATH"
  echo "Installez Docker Desktop pour macOS: https://www.docker.com/products/docker-desktop/"
  exit 1
fi

# Si DOCKER_HOST est défini, avertir (ça peut pointer vers un hôte inactif)
if [ -n "${DOCKER_HOST:-}" ]; then
  echo "⚠️  Attention: DOCKER_HOST est défini à '$DOCKER_HOST'"
  echo "    Si vous utilisez Docker Desktop local, essayez: 'unset DOCKER_HOST'"
fi

# Tester l'accès au daemon Docker
if ! docker info &>/dev/null; then
  echo "❌ Impossible de se connecter au démon Docker. Est-il démarré ?"
  echo "- Sur macOS, lancez Docker Desktop: open -a 'Docker' puis attendez l'état 'Running'"
  echo "- Ou sélectionnez le bon contexte: 'docker context use desktop-linux' (ou 'default'/'colima')"
  exit 1
fi

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
if ! $DOCKER_COMPOSE ps | grep -qE "\b(mongo|mongodb)\b"; then
  echo "🚀 Démarrage des services avec Docker Compose..."
  if ! $DOCKER_COMPOSE up -d; then
    echo "❌ Échec du démarrage des services via Docker Compose"
    echo "Vérifiez que Docker est en cours d'exécution et que vous avez le bon contexte"
    exit 1
  fi
  
  # Attendre que MongoDB démarre
  echo "⏳ Attente du démarrage de MongoDB..."
  sleep 10
else
  echo "✅ Services Docker Compose déjà en cours d'exécution"
fi

# Trouver le nom du conteneur MongoDB
CONTAINER_NAME=$($DOCKER_COMPOSE ps -q mongodb 2>/dev/null)
if [ -z "$CONTAINER_NAME" ]; then
  CONTAINER_NAME=$($DOCKER_COMPOSE ps -q mongo 2>/dev/null)
fi
if [ -z "$CONTAINER_NAME" ]; then
  CONTAINER_NAME=$(docker ps --filter "name=feveo2050-mongodb" --format "{{.ID}}" | head -n1)
fi
if [ -z "$CONTAINER_NAME" ]; then
  CONTAINER_NAME=$(docker ps --filter "name=mongo" --format "{{.ID}}" | head -n1)
fi

if [ -z "$CONTAINER_NAME" ]; then
  echo "❌ Erreur: Impossible de trouver le conteneur MongoDB"
  echo "Vérifiez que le service est nommé 'mongo' ou 'mongodb' dans votre docker-compose.yml"
  exit 1
fi

echo "📊 Utilisation du conteneur MongoDB: $CONTAINER_NAME"

# Copier le script mongo-init.js dans le conteneur
echo "📂 Copie du script dans le conteneur..."
if ! docker cp mongo-init.js $CONTAINER_NAME:/tmp/; then
  echo "❌ Échec de la copie de mongo-init.js dans le conteneur"
  echo "Vérifiez la présence de 'mongo-init.js' à la racine du projet"
  exit 1
fi

# Exécuter le script dans le conteneur
echo "🔧 Exécution du script dans le conteneur..."
OUTPUT=""
if docker exec "$CONTAINER_NAME" which mongosh &> /dev/null; then
  OUTPUT=$(docker exec "$CONTAINER_NAME" mongosh --quiet "mongodb://admin:password123@localhost:27017/feveo2050?authSource=admin" /tmp/mongo-init.js 2>&1)
  EXIT_CODE=$?
else
  OUTPUT=$(docker exec "$CONTAINER_NAME" mongo "mongodb://admin:password123@localhost:27017/feveo2050?authSource=admin" /tmp/mongo-init.js 2>&1)
  EXIT_CODE=$?
fi

echo "$OUTPUT"

# Traiter comme succès si l'erreur indique des éléments déjà existants
if [ $EXIT_CODE -eq 0 ] || echo "$OUTPUT" | grep -qi "already exists"; then
  echo "✅ Base de données MongoDB initialisée (ou déjà initialisée)."
  echo "🧹 Nettoyage des fichiers temporaires..."
  docker exec "$CONTAINER_NAME" rm -f /tmp/mongo-init.js >/dev/null 2>&1 || true
  exit 0
else
  echo "❌ Erreur lors de l'initialisation de la base de données MongoDB (code: $EXIT_CODE)"
  echo "Consultez les logs avec: docker logs $CONTAINER_NAME"
  exit 1
fi
