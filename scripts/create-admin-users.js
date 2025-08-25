/**
 * Script pour créer des utilisateurs administrateurs dans la base de données FEVEO 2050
 * 
 * Usage: node create-admin-users.js
 * 
 * Ce script peut être exécuté à tout moment pour ajouter ou mettre à jour
 * les utilisateurs administrateurs dans le système.
 */

const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Configuration de la base de données
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/feveo2050';
const SALT_ROUNDS = 10;

// Liste des administrateurs à créer
const adminUsers = [
  {
    nom: 'Diagne',
    prenom: 'Amadou',
    email: 'admin@feveo2050.com',
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
    email: 'super@feveo2050.com',
    telephone: '779999999',
    role: 'superadmin',
    permissions: ['all', 'system'],
    password: 'superadmin2050', // Sera hashé avant l'insertion
    actif: true
  }
];

async function createAdminUsers() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🚀 Connexion à MongoDB...');
    await client.connect();
    
    const db = client.db('feveo2050');
    const usersCollection = db.collection('utilisateurs');
    
    console.log('🔑 Création des utilisateurs administrateurs...');
    
    for (const user of adminUsers) {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await usersCollection.findOne({ email: user.email });
      
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
      
      if (existingUser) {
        // Mettre à jour l'utilisateur existant
        const result = await usersCollection.updateOne(
          { email: user.email },
          { $set: { ...userToInsert, updatedAt: new Date() } }
        );
        console.log(`👤 Utilisateur ${user.prenom} ${user.nom} (${user.email}) mis à jour.`);
      } else {
        // Créer un nouvel utilisateur
        await usersCollection.insertOne(userToInsert);
        console.log(`✅ Utilisateur ${user.prenom} ${user.nom} (${user.email}) créé.`);
      }
    }
    
    console.log('✅ Création des utilisateurs administrateurs terminée!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des utilisateurs:', error);
  } finally {
    await client.close();
    console.log('📡 Connexion à MongoDB fermée.');
  }
}

// Exécuter le script
createAdminUsers()
  .then(() => {
    console.log('🏁 Script terminé avec succès!');
  })
  .catch(error => {
    console.error('❌ Erreur d\'exécution du script:', error);
    process.exit(1);
  });
