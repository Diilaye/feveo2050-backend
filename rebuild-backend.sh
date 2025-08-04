#!/bin/bash

echo "🔄 Reconstruction du backend avec Express 4..."

# Arrêter les conteneurs actuels
echo "⏹️  Arrêt des conteneurs..."
docker compose down

# Supprimer l'image du backend pour forcer la reconstruction
echo "🗑️  Suppression de l'ancienne image backend..."
docker rmi feveo2050-backend 2>/dev/null || true

# Reconstruire l'image
echo "🔨 Reconstruction de l'image backend..."
docker compose build --no-cache backend

# Redémarrer tous les services
echo "🚀 Redémarrage des services..."
docker compose up -d

# Afficher les logs du backend
echo "📝 Logs du backend:"
docker compose logs -f backend
