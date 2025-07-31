const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const connectDB = require('../config/database');

const runMigrations = async (direction = 'up') => {
  try {
    // Connexion à la base de données
    await connectDB();
    
    console.log(`🚀 Démarrage des migrations (${direction})...`);
    
    // Lire tous les fichiers de migration
    const migrationsDir = path.join(__dirname, '../migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js') && file !== 'run.js')
      .sort();
    
    console.log(`📁 ${migrationFiles.length} migration(s) trouvée(s):`);
    migrationFiles.forEach(file => console.log(`   - ${file}`));
    
    // Exécuter les migrations
    for (const file of migrationFiles) {
      console.log(`\n🔄 Exécution de ${file}...`);
      
      const migrationPath = path.join(migrationsDir, file);
      const migration = require(migrationPath);
      
      if (direction === 'up' && typeof migration.up === 'function') {
        await migration.up();
        console.log(`✅ Migration ${file} appliquée`);
      } else if (direction === 'down' && typeof migration.down === 'function') {
        await migration.down();
        console.log(`✅ Migration ${file} annulée`);
      } else {
        console.log(`⚠️  Méthode ${direction} non trouvée dans ${file}`);
      }
    }
    
    console.log(`\n🎉 Toutes les migrations ${direction} ont été exécutées avec succès!`);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution des migrations:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connexion à la base de données fermée');
    process.exit(0);
  }
};

// Récupérer la direction depuis les arguments de ligne de commande
const direction = process.argv[2] || 'up';

if (!['up', 'down'].includes(direction)) {
  console.error('❌ Direction invalide. Utilisez "up" ou "down"');
  process.exit(1);
}

// Exécuter les migrations
runMigrations(direction);
