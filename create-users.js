const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// Configuration de connexion à MongoDB
const uri = "mongodb+srv://issak:0uPRDKWsWPVjRbSe@deally.nmtj2pi.mongodb.net/feveo2050-prod2";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function createAdminUsers() {
  try {
    // Se connecter au serveur MongoDB
    await client.connect();
    console.log('✅ Connexion à MongoDB établie avec succès');

    // Référence à la base de données
    const db = client.db('feveo2050-prod2');
    
    // Référence à la collection des utilisateurs admin
    const adminCollection = db.collection('admins');

    // Vérifier si des admins existent déjà
    const adminCount = await adminCollection.countDocuments();
    console.log(`📊 Nombre d'administrateurs existants : ${adminCount}`);

    // Créer des utilisateurs administrateurs si aucun n'existe
    if (adminCount === 0) {
      // Hasher le mot de passe
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@2050', salt);

      // Préparer les données de l'administrateur
      const adminUser = {
        nom: "Admin",
        prenom: "Feveo",
        email: "admin@feveo2050.com",
        password: hashedPassword,
        role: "superadmin",
        dateCreation: new Date(),
        derniereConnexion: null,
        actif: true
      };

      // Insérer l'administrateur
      const result = await adminCollection.insertOne(adminUser);
      console.log(`✅ Administrateur créé avec l'ID: ${result.insertedId}`);
    } else {
      console.log('⚠️ Des administrateurs existent déjà, aucun nouvel administrateur n\'a été créé');
    }

    // Créer des utilisateurs standard
    const usersCollection = db.collection('users');
    
    // Vérifier si des utilisateurs standard existent déjà
    const usersCount = await usersCollection.countDocuments();
    console.log(`📊 Nombre d'utilisateurs standard existants : ${usersCount}`);

    // Créer des utilisateurs de test si nécessaire
    if (usersCount === 0) {
      // Hasher les mots de passe
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('User@2050', salt);

      // Préparer les données des utilisateurs
      const users = [
        {
          nom: "Diop",
          prenom: "Fatou",
          telephone: "771234567",
          email: "fatou.diop@example.com",
          password: hashedPassword,
          adresse: "Dakar, Sénégal",
          dateCreation: new Date(),
          derniereConnexion: null,
          actif: true,
          role: "user"
        },
        {
          nom: "Sow",
          prenom: "Aminata",
          telephone: "772345678",
          email: "aminata.sow@example.com",
          password: hashedPassword,
          adresse: "Thiès, Sénégal",
          dateCreation: new Date(),
          derniereConnexion: null,
          actif: true,
          role: "user"
        }
      ];

      // Insérer les utilisateurs
      const result = await usersCollection.insertMany(users);
      console.log(`✅ ${result.insertedCount} utilisateurs créés avec succès`);
    } else {
      console.log('⚠️ Des utilisateurs existent déjà, aucun nouvel utilisateur n\'a été créé');
    }

  } catch (err) {
    console.error('❌ Erreur lors de la création des utilisateurs:', err);
  } finally {
    // Fermer la connexion
    await client.close();
    console.log('📡 Connexion à MongoDB fermée');
  }
}

// Exécuter la fonction
createAdminUsers().catch(console.error);
