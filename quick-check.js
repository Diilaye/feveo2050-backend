const mongoose = require('mongoose');
require('dotenv').config();

// Test rapide de vérification
const quickCheck = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connecté\n');
    
    const GIE = require('./src/models/GIE');
    const CycleInvestissement = require('./src/models/CycleInvestissement');
    
    // Vérification directe des GIE
    const allGIEs = await GIE.find({}).select('nomGIE identifiantGIE statut dateValidation _id');
    
    console.log('📊 État actuel des GIE en base:');
    console.log('================================');
    
    allGIEs.forEach((gie, index) => {
      console.log(`${index + 1}. Nom: ${gie.nomGIE}`);
      console.log(`   ID: ${gie._id}`);
      console.log(`   Identifiant: ${gie.identifiantGIE}`);
      console.log(`   Statut: ${gie.statut || 'undefined'}`);
      console.log(`   Date validation: ${gie.dateValidation || 'Non définie'}`);
      console.log('   ---');
    });
    
    // Vérification des cycles
    const allCycles = await CycleInvestissement.find({}).select('gieId statutCycle dateDebut dateFin');
    
    console.log(`\n🔄 Cycles d'investissement (${allCycles.length}):`);
    console.log('=======================================');
    
    allCycles.forEach((cycle, index) => {
      console.log(`${index + 1}. GIE ID: ${cycle.gieId}`);
      console.log(`   Statut: ${cycle.statutCycle}`);
      console.log(`   Début: ${cycle.dateDebut?.toLocaleDateString('fr-FR')}`);
      console.log(`   Fin: ${cycle.dateFin?.toLocaleDateString('fr-FR')}`);
      console.log('   ---');
    });
    
    // Force la mise à jour du statut si nécessaire
    if (allGIEs.some(gie => !gie.statut || gie.statut === undefined)) {
      console.log('\n🔧 Correction forcée des statuts...');
      
      await GIE.updateMany(
        { $or: [{ statut: { $exists: false } }, { statut: undefined }, { statut: null }] },
        { 
          $set: { 
            statut: 'validé',
            dateValidation: new Date()
          }
        }
      );
      
      console.log('✅ Statuts mis à jour');
      
      // Re-vérification
      const updatedGIEs = await GIE.find({}).select('nomGIE identifiantGIE statut');
      console.log('\n📋 Statuts après mise à jour:');
      updatedGIEs.forEach(gie => {
        console.log(`   - ${gie.nomGIE}: ${gie.statut}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
};

quickCheck();
