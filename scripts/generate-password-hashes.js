/**
 * Script pour générer des hashes bcrypt pour les mots de passe
 * 
 * Usage: node generate-password-hashes.js
 */

const bcrypt = require('bcrypt');

// Configuration
const SALT_ROUNDS = 10;

// Liste des mots de passe à hasher
const passwords = [
  'password123',
  'superadmin@2050!',
  // Ajoutez d'autres mots de passe si nécessaire
];

async function generateHashes() {
  console.log('Génération des hashes bcrypt pour les mots de passe:');
  console.log('-------------------------------------------------');
  
  for (const password of passwords) {
    try {
      // Générer un hash bcrypt
      const hash = await bcrypt.hash(password, SALT_ROUNDS);
      
      console.log(`Mot de passe: "${password}"`);
      console.log(`Hash bcrypt: "${hash}"`);
      console.log('-------------------------------------------------');
      
    } catch (error) {
      console.error(`Erreur lors du hashage de "${password}":`, error);
    }
  }
}

// Exécuter la fonction
generateHashes()
  .then(() => {
    console.log('Terminé!');
  })
  .catch(error => {
    console.error('Erreur:', error);
  });
