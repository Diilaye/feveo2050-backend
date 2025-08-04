// Script d'initialisation MongoDB pour Node.js
// À utiliser pour tester la connexion et initialiser la base de données

const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/feveo2050?authSource=admin';

async function initializeDatabase() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('🚀 Connexion à MongoDB...');
    await client.connect();
    
    const db = client.db('feveo2050');
    
    // Vérifier si les collections existent déjà
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    console.log('📋 Collections existantes:', collectionNames);
    
    // Créer les collections si elles n'existent pas
    const requiredCollections = ['utilisateurs', 'gies', 'adhesions', 'cycleinvestissements'];
    
    for (const collectionName of requiredCollections) {
      if (!collectionNames.includes(collectionName)) {
        await db.createCollection(collectionName);
        console.log(`✅ Collection "${collectionName}" créée`);
      } else {
        console.log(`ℹ️  Collection "${collectionName}" existe déjà`);
      }
    }
    
    // Créer des index pour optimiser les performances
    console.log('🔧 Création des index...');
    
    // Index pour les utilisateurs
    await db.collection('utilisateurs').createIndex({ email: 1 }, { unique: true });
    await db.collection('utilisateurs').createIndex({ telephone: 1 }, { unique: true, sparse: true });
    
    // Index pour les GIE
    await db.collection('gies').createIndex({ nom: 1 });
    await db.collection('gies').createIndex({ statut: 1 });
    
    // Index pour les adhésions
    await db.collection('adhesions').createIndex({ utilisateurId: 1 });
    await db.collection('adhesions').createIndex({ gieId: 1 });
    
    // Index pour les cycles d'investissement
    await db.collection('cycleinvestissements').createIndex({ gieId: 1 });
    await db.collection('cycleinvestissements').createIndex({ statut: 1 });
    
    console.log('✅ Index créés avec succès');
    
    // Insérer des données de test en mode développement
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔧 Insertion des données de test...');
      
      // Vérifier si l'utilisateur admin existe déjà
      const existingAdmin = await db.collection('utilisateurs').findOne({ email: 'admin@test.com' });
      
      if (!existingAdmin) {
        await db.collection('utilisateurs').insertOne({
          nom: 'Admin',
          prenom: 'Test',
          email: 'admin@test.com',
          motDePasse: '$2b$12$example.hash.here',
          role: 'admin',
          permissions: ['all'],
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log('✅ Utilisateur admin de test créé');
      } else {
        console.log('ℹ️  Utilisateur admin de test existe déjà');
      }
    }
    
    console.log('🎉 Initialisation de la base de données terminée!');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Fonction pour tester la connexion
async function testConnection() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔍 Test de connexion à MongoDB...');
    await client.connect();
    
    // Ping pour vérifier la connexion
    await client.db('admin').admin().ping();
    console.log('✅ Connexion MongoDB réussie!');
    
    // Afficher les informations de la base
    const db = client.db('feveo2050');
    try {
      const collections = await db.listCollections().toArray();
      console.log('📊 Informations de la base:', {
        database: 'feveo2050',
        collections: collections.length,
        collectionNames: collections.map(c => c.name)
      });
    } catch (err) {
      console.log('ℹ️  Connexion réussie mais impossible d\'obtenir les statistiques détaillées');
    }
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Exécuter selon l'argument passé
const command = process.argv[2];

if (command === 'test') {
  testConnection();
} else {
  initializeDatabase();
}
