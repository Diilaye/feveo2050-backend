const mongoose = require('mongoose');
require('dotenv').config();

// Modèle GIE simplifié
const gieSchema = new mongoose.Schema({
  nomGIE: String,
  identifiantGIE: String,
  statutAdhesion: String
}, { collection: 'gies' });

const GIE = mongoose.model('GIE', gieSchema);

async function checkGIE() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/feveo2050');
    console.log('✅ Connexion MongoDB réussie');

    // Récupérer tous les GIE
    const gies = await GIE.find({}, 'nomGIE identifiantGIE statutAdhesion');
    
    console.log('\n📋 GIE disponibles dans la base de données :');
    console.log('====================================================');
    
    if (gies.length === 0) {
      console.log('❌ Aucun GIE trouvé dans la base de données');
    } else {
      gies.forEach((gie, index) => {
        console.log(`${index + 1}. Code: ${gie.identifiantGIE} | Nom: ${gie.nomGIE} | Statut: ${gie.statutAdhesion}`);
      });
      
      console.log('\n🔍 GIE validés (statut = "validee") :');
      const giesValides = gies.filter(gie => gie.statutAdhesion === 'validee');
      if (giesValides.length === 0) {
        console.log('❌ Aucun GIE validé trouvé');
      } else {
        giesValides.forEach((gie, index) => {
          console.log(`${index + 1}. Code: ${gie.identifiantGIE} | Nom: ${gie.nomGIE}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Connexion fermée');
  }
}

checkGIE();
