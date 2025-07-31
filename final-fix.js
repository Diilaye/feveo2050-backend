const mongoose = require('mongoose');
require('dotenv').config();

// Correction finale des statuts
const finalFix = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connecté\n');
    
    const GIE = require('./src/models/GIE');
    
    // Mettre à jour les statuts vers le bon champ et la bonne valeur
    const result = await GIE.updateMany(
      {},
      { 
        $set: { 
          statutAdhesion: 'validee'
        }
      }
    );
    
    console.log(`🔧 ${result.modifiedCount} GIE(s) mis à jour avec le bon statut`);
    
    // Vérification
    const updatedGIEs = await GIE.find({}).select('nomGIE identifiantGIE statutAdhesion _id');
    
    console.log('\n📋 GIE mis à jour:');
    console.log('==================');
    
    updatedGIEs.forEach((gie, index) => {
      console.log(`${index + 1}. ${gie.nomGIE}`);
      console.log(`   ID: ${gie._id}`);
      console.log(`   Identifiant: ${gie.identifiantGIE}`);
      console.log(`   Statut: ${gie.statutAdhesion}`);
      console.log('   ---');
    });
    
    console.log('\n✅ Tous les GIE sont maintenant validés !');
    console.log('\n🎯 Le système d\'investissement est prêt à être utilisé');
    console.log('\n💡 Pour tester, vous pouvez maintenant:');
    console.log('   1. Créer un compte utilisateur');
    console.log('   2. Utiliser ces ID de GIE pour les endpoints d\'investissement:');
    
    updatedGIEs.forEach((gie, index) => {
      console.log(`      ${index + 1}. ${gie._id} (${gie.nomGIE})`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
};

finalFix();
