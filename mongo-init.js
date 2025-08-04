// Script d'initialisation MongoDB pour Docker
// Ce script s'exécute automatiquement lors du premier démarrage du conteneur MongoDB

const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/feveo2050?authSource=admin';

 console.log('🚀 Connexion à MongoDB...');
    await client.connect();
    
    const db = client.db('feveo2050');

console.log('🚀 Initialisation de la base de données FEVEO 2050...');

// Créer la base de données feveo2050
db = db.getSiblingDB('feveo2050');

const client = new MongoClient(MONGODB_URI);



// Créer un utilisateur pour l'application
db.createUser({
  user: 'feveo_user',
  pwd: 'feveo_password',
  roles: [
    {
      role: 'readWrite',
      db: 'feveo2050'
    }
  ]
});

// Créer les collections de base
db.createCollection('utilisateurs');
db.createCollection('gies');
db.createCollection('adhesions');
db.createCollection('cycleinvestissements');

console.log('✅ Base de données FEVEO 2050 initialisée avec succès!');

// Insérer quelques données de test si on est en développement
if (process.env.NODE_ENV !== 'production') {
  console.log('🔧 Insertion des données de test...');

  // Insérer un utilisateur admin de test
  db.utilisateurs.insertOne({
    nom: 'Admin',
    prenom: 'Test',
    email: 'admin@test.com',
    motDePasse: '$2b$12$example.hash.here',
    role: 'admin',
    permissions: ['all'],
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  console.log('✅ Données de test insérées!');
}
