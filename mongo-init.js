// Script d'initialisation MongoDB pour Docker
// Ce script s'exécute automatiquement lors du premier démarrage du conteneur MongoDB
// Pour exécuter manuellement:
// - Avec Docker: ./docker-init-mongodb.sh
// - Avec mongosh: mongosh --quiet localhost:27017/feveo2050 mongo-init.js

// Garde: si on exécute ce fichier avec Node.js, afficher un message clair et arrêter
if (typeof print === 'undefined') {
  // Environnement Node.js (mongosh définit 'print')
  // eslint-disable-next-line no-console
  console.error('Ce script doit être exécuté avec mongosh, pas avec node.\n' +
    'Exemples:\n' +
    '  ./docker-init-mongodb.sh\n' +
    '  mongosh "mongodb://admin:password123@localhost:27017/feveo2050?authSource=admin" mongo-init.js');
  if (typeof process !== 'undefined' && process.exit) {
    process.exit(1);
  }
}

try {
  print('🚀 Initialisation de la base de données FEVEO 2050...');

  // Créer la base de données feveo2050
  db = db.getSiblingDB('feveo2050');
} catch (error) {
  print('❌ Erreur lors de l\'initialisation: ' + error);
}



// Créer un utilisateur pour l'application
db.createUser({
  user: 'feveo_user',
  pwd: 'feveo_password',
  roles: [
    {
      role: 'readWrite',
      db: 'feveo2050'
    }
  ]
});

// Créer les collections de base
db.createCollection('utilisateurs');
db.createCollection('gies');
db.createCollection('adhesions');
db.createCollection('cycleinvestissements');

print('✅ Base de données FEVEO 2050 initialisée avec succès!');

// Insérer des données d'initialisation
print('🔧 Insertion des données d\'initialisation...');

// Insérer des utilisateurs administrateurs
print('🔑 Création des utilisateurs administrateurs...');

// Fonction pour obtenir un hash bcrypt pour un mot de passe
// Les hashes ont été pré-générés avec le script generate-password-hashes.js
function generatePasswordHash(password) {
  // Retourner les hashes pré-générés en fonction du mot de passe
  if (password === 'password123') {
    return '$2b$10$BREVN/H55DSnXVzijJlOAOfCoC.Ue3H.i/YzFV6IgGLUkGQ5h4lne';
  } 
  else if (password === 'superadmin@2050!') {
    return '$2b$10$ythB4GP/KVT.apLUbV98KOsjmEaQCc86V6MteFwHyMRKeJ8Mz3O1q';
  }
  // Fallback hash pour d'autres mots de passe
  return '$2b$10$BREVN/H55DSnXVzijJlOAOfCoC.Ue3H.i/YzFV6IgGLUkGQ5h4lne'; // hash de 'password123'
}

// Liste des administrateurs à créer
const adminUsers = [
  {
    nom: 'Diagne',
    prenom: 'Amadou',
    email: 'admin@feveo2050.sn',
    telephone: '771234567',
    motDePasse: generatePasswordHash('password123'),
    role: 'admin',
    permissions: ['all'],
    actif: true
  },
  {
    nom: 'Diallo',
    prenom: 'Mariama',
    email: 'mariama.diallo@feveo2050.com',
    telephone: '772345678',
    motDePasse: generatePasswordHash('password123'),
    role: 'admin',
    permissions: ['users', 'gies', 'finance'],
    actif: true
  },
  {
    nom: 'Sow',
    prenom: 'Moussa',
    email: 'moussa.sow@feveo2050.com',
    telephone: '773456789',
    motDePasse: generatePasswordHash('password123'),
    role: 'admin',
    permissions: ['gies', 'support'],
    actif: true
  },
  {
    nom: 'Admin',
    prenom: 'Test',
    email: 'admin@test.com',
    telephone: '770000000',
    motDePasse: generatePasswordHash('password123'),
    role: 'admin',
    permissions: ['all'],
    actif: true
  }
];

// Ajouter les utilisateurs administrateurs
adminUsers.forEach(user => {
  // Vérifier si l'utilisateur existe déjà
  const existingUser = db.utilisateurs.findOne({ email: user.email });
  if (existingUser) {
    print(`👤 L'utilisateur ${user.prenom} ${user.nom} (${user.email}) existe déjà.`);
  } else {
    user.createdAt = new Date();
    user.updatedAt = new Date();
    db.utilisateurs.insertOne(user);
    print(`✅ Utilisateur administrateur créé: ${user.prenom} ${user.nom} (${user.email})`);
  }
});

// Créer un super admin si nécessaire
const superAdminEmail = "super@feveo2050.sn";
const existingSuperAdmin = db.utilisateurs.findOne({ email: superAdminEmail });
if (!existingSuperAdmin) {
  const superAdmin = {
    nom: 'Super',
    prenom: 'Admin',
    email: superAdminEmail,
    telephone: '779999999',
    motDePasse: generatePasswordHash('superadmin@2050!'),
    role: 'superadmin',
    permissions: ['all', 'system'],
    actif: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  db.utilisateurs.insertOne(superAdmin);
  print(`🔐 Super Admin créé: ${superAdmin.email}`);
}

print('✅ Données d\'initialisation insérées!');
