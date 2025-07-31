const mongoose = require('mongoose');

/**
 * Migration initiale - Création des index de base de données
 * Date: 2025-01-01
 * Description: Création des index pour optimiser les performances
 */

const up = async () => {
  console.log('🔧 Application de la migration: Création des index...');
  
  try {
    const db = mongoose.connection.db;
    
    // Index pour la collection Utilisateur
    await db.collection('utilisateurs').createIndex(
      { email: 1 }, 
      { unique: true, name: 'email_unique' }
    );
    
    await db.collection('utilisateurs').createIndex(
      { role: 1 }, 
      { name: 'role_index' }
    );
    
    await db.collection('utilisateurs').createIndex(
      { gieAssocie: 1 }, 
      { name: 'gie_associe_index', sparse: true }
    );
    
    console.log('✅ Index utilisateurs créés');
    
    // Index pour la collection GIE
    await db.collection('gies').createIndex(
      { identifiantGIE: 1 }, 
      { unique: true, name: 'identifiant_gie_unique' }
    );
    
    await db.collection('gies').createIndex(
      { 'presidenteEmail': 1 }, 
      { name: 'presidente_email_index' }
    );
    
    await db.collection('gies').createIndex(
      { region: 1, departement: 1, arrondissement: 1, commune: 1 }, 
      { name: 'localisation_index' }
    );
    
    await db.collection('gies').createIndex(
      { secteurPrincipal: 1 }, 
      { name: 'secteur_index' }
    );
    
    await db.collection('gies').createIndex(
      { createdAt: -1 }, 
      { name: 'creation_date_index' }
    );
    
    console.log('✅ Index GIE créés');
    
    // Index pour la collection Adhesion
    await db.collection('adhesions').createIndex(
      { gieId: 1 }, 
      { name: 'gie_id_index' }
    );
    
    await db.collection('adhesions').createIndex(
      { 'validation.statut': 1 }, 
      { name: 'validation_statut_index' }
    );
    
    await db.collection('adhesions').createIndex(
      { 'paiement.statut': 1 }, 
      { name: 'paiement_statut_index' }
    );
    
    await db.collection('adhesions').createIndex(
      { createdAt: -1 }, 
      { name: 'adhesion_creation_date_index' }
    );
    
    console.log('✅ Index Adhesions créés');
    
    // Index pour la collection CycleInvestissement
    await db.collection('cycleinvestissements').createIndex(
      { gieId: 1 }, 
      { unique: true, name: 'cycle_gie_unique' }
    );
    
    await db.collection('cycleinvestissements').createIndex(
      { statut: 1 }, 
      { name: 'cycle_statut_index' }
    );
    
    await db.collection('cycleinvestissements').createIndex(
      { dateDebut: 1, dateFin: 1 }, 
      { name: 'cycle_dates_index' }
    );
    
    await db.collection('cycleinvestissements').createIndex(
      { 'investissementsJournaliers.date': 1 }, 
      { name: 'investissements_date_index' }
    );
    
    console.log('✅ Index Cycles d\'investissement créés');
    
    console.log('🎉 Migration terminée avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  }
};

const down = async () => {
  console.log('🔧 Rollback de la migration: Suppression des index...');
  
  try {
    const db = mongoose.connection.db;
    
    // Supprimer les index Utilisateur
    await db.collection('utilisateurs').dropIndex('email_unique');
    await db.collection('utilisateurs').dropIndex('role_index');
    await db.collection('utilisateurs').dropIndex('gie_associe_index');
    
    // Supprimer les index GIE
    await db.collection('gies').dropIndex('identifiant_gie_unique');
    await db.collection('gies').dropIndex('presidente_email_index');
    await db.collection('gies').dropIndex('localisation_index');
    await db.collection('gies').dropIndex('secteur_index');
    await db.collection('gies').dropIndex('creation_date_index');
    
    // Supprimer les index Adhesion
    await db.collection('adhesions').dropIndex('gie_id_index');
    await db.collection('adhesions').dropIndex('validation_statut_index');
    await db.collection('adhesions').dropIndex('paiement_statut_index');
    await db.collection('adhesions').dropIndex('adhesion_creation_date_index');
    
    // Supprimer les index CycleInvestissement
    await db.collection('cycleinvestissements').dropIndex('cycle_gie_unique');
    await db.collection('cycleinvestissements').dropIndex('cycle_statut_index');
    await db.collection('cycleinvestissements').dropIndex('cycle_dates_index');
    await db.collection('cycleinvestissements').dropIndex('investissements_date_index');
    
    console.log('✅ Rollback terminé avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors du rollback:', error);
    throw error;
  }
};

module.exports = { up, down };
