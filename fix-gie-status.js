const mongoose = require('mongoose');
require('dotenv').config();

// Correction : Valider les GIE existants
const validateExistingGIE = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connecté\n');
    
    const GIE = require('./src/models/GIE');
    
    // Trouver tous les GIE sans statut ou avec statut undefined
    const giesWithoutStatus = await GIE.find({
      $or: [
        { statut: { $exists: false } },
        { statut: undefined },
        { statut: null }
      ]
    });
    
    console.log(`🔍 ${giesWithoutStatus.length} GIE trouvé(s) sans statut valide\n`);
    
    if (giesWithoutStatus.length === 0) {
      console.log('✅ Tous les GIE ont un statut valide');
      return;
    }
    
    // Valider automatiquement ces GIE pour les tests
    for (const gie of giesWithoutStatus) {
      console.log(`🔄 Validation du GIE: ${gie.nomGIE} (${gie.identifiantGIE})`);
      
      gie.statut = 'validé';
      gie.dateValidation = new Date();
      
      await gie.save();
      console.log(`✅ GIE validé: ${gie.nomGIE}`);
    }
    
    console.log(`\n🎉 ${giesWithoutStatus.length} GIE(s) validé(s) avec succès!`);
    
    // Vérification finale
    const validatedGIEs = await GIE.find({ statut: 'validé' })
      .select('nomGIE identifiantGIE statut dateValidation');
    
    console.log(`\n📋 GIE validés disponibles pour investissement:`);
    validatedGIEs.forEach((gie, index) => {
      console.log(`   ${index + 1}. ${gie.nomGIE}`);
      console.log(`      ID: ${gie._id}`);
      console.log(`      Identifiant: ${gie.identifiantGIE}`);
      console.log(`      Statut: ${gie.statut}`);
      console.log(`      Validé le: ${gie.dateValidation?.toLocaleDateString('fr-FR') || 'Aujourd\'hui'}`);
      console.log('');
    });
    
    // Créer des cycles d'investissement pour les GIE validés
    console.log('🔄 Création des cycles d\'investissement...\n');
    
    const CycleInvestissement = require('./src/models/CycleInvestissement');
    
    for (const gie of validatedGIEs) {
      // Vérifier si un cycle existe déjà
      const existingCycle = await CycleInvestissement.findOne({ gieId: gie._id });
      
      if (existingCycle) {
        console.log(`✅ Cycle déjà existant pour ${gie.nomGIE}`);
        continue;
      }
      
      // Créer un nouveau cycle
      const cycle = new CycleInvestissement({
        gieId: gie._id,
        dateDebut: new Date(),
        dateFin: new Date(Date.now() + (1826 * 24 * 60 * 60 * 1000)), // 1826 jours (5 ans)
        dureeJours: 1826,
        montantJournalier: 6000,
        statutCycle: 'actif'
      });
      
      await cycle.save();
      console.log(`✅ Cycle d'investissement créé pour ${gie.nomGIE}`);
      console.log(`   - ${cycle.investissementsJournaliers.length} investissements journaliers programmés`);
      console.log(`   - Montant total prévu: ${cycle.montantTotalPrevu.toLocaleString('fr-FR')} FCFA`);
    }
    
    console.log('\n🎯 Configuration terminée!');
    console.log('\n💡 Prochaines étapes pour tester l\'investissement:');
    console.log('   1. Créer un compte utilisateur avec POST /api/auth/register');
    console.log('   2. Se connecter avec POST /api/auth/login');
    console.log('   3. Utiliser un des GIE ID ci-dessus pour tester les endpoints');
    console.log('   4. Exemple: GET /api/investissements/gie/{GIE_ID}');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
};

// Exécution
validateExistingGIE();
