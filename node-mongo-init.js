/**
 * Script pour initialiser la base de données MongoDB avec des utilisateurs administrateurs
 * 
 * Ce script est une version Node.js du script mongo-init.js
 * Il peut être exécuté avec Node.js si MongoDB est installé et en cours d'exécution
 */

const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

// Configuration
const MONGODB_URI = 'mongodb://admin:password123@localhost:27017/feveo2050?authSource=admin';
const DB_NAME = 'feveo2050';
const SALT_ROUNDS = 10;

// Fonction principale
async function initializeDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🚀 Connexion à MongoDB...');
    await client.connect();
    
    const db = client.db(DB_NAME);
    
    console.log('🔧 Création des collections...');
    
    // Créer les collections de base
    await db.createCollection('utilisateurs').catch(err => {
      if (err.codeName !== 'NamespaceExists') {
        throw err;
      }
      console.log('Collection utilisateurs existe déjà');
    });
    
    await db.createCollection('gies').catch(err => {
      if (err.codeName !== 'NamespaceExists') {
        throw err;
      }
      console.log('Collection gies existe déjà');
    });
    
    await db.createCollection('adhesions').catch(err => {
      if (err.codeName !== 'NamespaceExists') {
        throw err;
      }
      console.log('Collection adhesions existe déjà');
    });
    
    await db.createCollection('cycleinvestissements').catch(err => {
      if (err.codeName !== 'NamespaceExists') {
        throw err;
      }
      console.log('Collection cycleinvestissements existe déjà');
    });
    
    console.log('🔑 Création des utilisateurs administrateurs...');
    
    // Liste des administrateurs à créer
    const adminUsers = [
      {
        nom: 'Diagne',
        prenom: 'Amadou',
        email: 'admin@feveo2050.sn',
        telephone: '771234567',
        role: 'admin',
        permissions: ['all'],
        password: 'password123', // Sera hashé avant l'insertion
        actif: true
      },
      {
        nom: 'Diallo',
        prenom: 'Mariama',
        email: 'mariama.diallo@feveo2050.com',
        telephone: '772345678',
        role: 'admin',
        permissions: ['users', 'gies', 'finance'],
        password: 'password123', // Sera hashé avant l'insertion
        actif: true
      },
      {
        nom: 'Sow',
        prenom: 'Moussa',
        email: 'moussa.sow@feveo2050.com',
        telephone: '773456789',
        role: 'admin',
        permissions: ['gies', 'support'],
        password: 'password123', // Sera hashé avant l'insertion
        actif: true
      },
      {
        nom: 'Admin',
        prenom: 'Test',
        email: 'admin@test.com',
        telephone: '770000000',
        role: 'admin',
        permissions: ['all'],
        password: 'password123', // Sera hashé avant l'insertion
        actif: true
      },
      {
        nom: 'Super',
        prenom: 'Admin',
        email: 'super@feveo2050.sn',
        telephone: '779999999',
        role: 'superadmin',
        permissions: ['all', 'system'],
        password: 'superadmin@2050!', // Sera hashé avant l'insertion
        actif: true
      }
    ];

    // Ajouter les utilisateurs administrateurs
    for (const user of adminUsers) {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await db.collection('utilisateurs').findOne({ email: user.email });
      
      if (existingUser) {
        console.log(`👤 L'utilisateur ${user.prenom} ${user.nom} (${user.email}) existe déjà.`);
      } else {
        // Hacher le mot de passe
        const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);
        
        // Créer l'objet utilisateur
        const userToInsert = {
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          telephone: user.telephone,
          motDePasse: hashedPassword,
          role: user.role,
          permissions: user.permissions,
          actif: user.actif,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Insérer l'utilisateur
        await db.collection('utilisateurs').insertOne(userToInsert);
        console.log(`✅ Utilisateur administrateur créé: ${user.prenom} ${user.nom} (${user.email})`);
      }
    }
    
    console.log('✅ Base de données FEVEO 2050 initialisée avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
  } finally {
    await client.close();
  }
}

// Exécuter le script
initializeDatabase()
  .then(() => {
    console.log('🏁 Script terminé');
  })
  .catch(err => {
    console.error('❌ Erreur fatale:', err);
    process.exit(1);
  });
