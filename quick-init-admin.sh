#!/bin/bash

# Script pour initialiser MongoDB avec un seul utilisateur administrateur via Docker
# Usage: ./quick-init-admin.sh

echo "🚀 Initialisation rapide d'un utilisateur administrateur..."

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
  echo "❌ Erreur: Docker n'est pas installé"
  exit 1
fi

# Trouver le conteneur MongoDB
CONTAINER_NAME=$(docker ps --filter "name=mongo" --format "{{.Names}}" | grep -m1 "")

if [ -z "$CONTAINER_NAME" ]; then
  echo "Recherche d'un conteneur MongoDB par image..."
  CONTAINER_NAME=$(docker ps --filter "ancestor=mongo" --format "{{.Names}}" | grep -m1 "")
fi

if [ -z "$CONTAINER_NAME" ]; then
  echo "❌ Erreur: Aucun conteneur MongoDB trouvé en cours d'exécution"
  exit 1
fi

echo "📊 Utilisation du conteneur MongoDB: $CONTAINER_NAME"

# Créer un script JavaScript temporaire pour MongoDB
TMP_SCRIPT=$(mktemp)
cat << EOF > $TMP_SCRIPT
// Script d'initialisation rapide pour un administrateur
try {
  // Se connecter à la base de données feveo2050
  db = db.getSiblingDB('feveo2050');
  
  // Vérifier si la collection utilisateurs existe, sinon la créer
  db.createCollection('utilisateurs');
  
  // Créer un administrateur avec un hash bcrypt pré-généré
  const adminUser = {
    nom: 'Admin',
    prenom: 'Principal',
    email: 'admin@feveo2050.sn',
    telephone: '770000000',
    motDePasse: '\$2b\$10\$BREVN/H55DSnXVzijJlOAOfCoC.Ue3H.i/YzFV6IgGLUkGQ5h4lne', // hash de 'password123'
    role: 'admin',
    permissions: ['all'],
    actif: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // Vérifier si l'utilisateur existe déjà
  const existingUser = db.utilisateurs.findOne({ email: adminUser.email });
  if (existingUser) {
    print("👤 L'administrateur existe déjà");
  } else {
    db.utilisateurs.insertOne(adminUser);
    print("✅ Administrateur créé avec succès!");
    print("   Email: admin@feveo2050.sn");
    print("   Mot de passe: password123");
  }
} catch (error) {
  print("❌ Erreur: " + error);
}
EOF

# Copier le script dans le conteneur
docker cp $TMP_SCRIPT $CONTAINER_NAME:/tmp/quick-init-admin.js

# Exécuter le script dans le conteneur
echo "Exécution du script..."
if docker exec $CONTAINER_NAME which mongosh &> /dev/null; then
  docker exec $CONTAINER_NAME mongosh --quiet "mongodb://admin:password123@localhost:27017/feveo2050?authSource=admin" /tmp/quick-init-admin.js
else
  docker exec $CONTAINER_NAME mongo "mongodb://admin:password123@localhost:27017/feveo2050?authSource=admin" /tmp/quick-init-admin.js
fi

# Nettoyer
rm -f $TMP_SCRIPT
docker exec $CONTAINER_NAME rm -f /tmp/quick-init-admin.js

echo "✅ Script terminé!"
