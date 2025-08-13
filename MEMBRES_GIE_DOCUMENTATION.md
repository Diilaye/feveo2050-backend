# 👥 Gestion des Membres GIE - Dashboard Wallet

## 🎯 Vue d'ensemble

Le système de gestion des membres permet aux GIE d'administrer leur liste de membres directement depuis le dashboard wallet. Chaque GIE peut avoir **maximum 40 membres**.

## 🚀 Fonctionnalités

### ✅ **Consultation des Membres**
- Liste complète des membres avec leurs informations
- Statistiques détaillées (total, répartition par rôle, etc.)
- Suivi des places disponibles (limite 40)

### ✅ **Ajout de Nouveaux Membres**
- Formulaire complet avec validation
- Vérification des doublons (téléphone unique)
- Respect de la limite maximale de 40 membres

### ✅ **Modification des Membres**
- Mise à jour de toutes les informations
- Préservation de l'historique (date de modification)
- Validation des contraintes

### ✅ **Suppression des Membres**
- Suppression sécurisée avec confirmation
- Mise à jour automatique des compteurs

## 📡 API Endpoints

### 1. **Consulter les Membres**
```http
GET /api/wallet/members/{gieCode}
```

**Réponse:**
```json
{
  "success": true,
  "message": "5 membre(s) trouvé(s)",
  "data": {
    "gieInfo": {
      "code": "FEVEO-XX-XX-XX-XX-XXX",
      "nom": "Nom du GIE",
      "presidente": "Prénom Nom"
    },
    "membres": [
      {
        "id": "membre_1234567890_abc123",
        "nom": "Kane",
        "prenom": "Aminata",
        "telephone": "771112233",
        "role": "presidente",
        "dateAjout": "2025-01-15T10:30:00Z",
        "dateNaissance": "1980-05-20T00:00:00Z",
        "profession": "Enseignante",
        "adresse": "Dakar, Parcelles Assainies",
        "statut": "actif"
      }
    ],
    "totalMembres": 5,
    "limiteMaximum": 40,
    "peutAjouter": true
  }
}
```

### 2. **Ajouter un Membre**
```http
POST /api/wallet/members/{gieCode}/add
```

**Payload:**
```json
{
  "nom": "Diop",
  "prenom": "Fatou",
  "telephone": "771234567",
  "role": "tresoriere",
  "dateNaissance": "1985-03-15",
  "profession": "Commerçante",
  "adresse": "Dakar, Senegal"
}
```

**Champs:**
- **✅ Obligatoires:** `nom`, `prenom`, `telephone`
- **🔵 Optionnels:** `role`, `dateNaissance`, `profession`, `adresse`

**Validations:**
- ❌ Limite 40 membres
- ❌ Téléphone unique dans le GIE
- ❌ Nom/prénom non vides

### 3. **Modifier un Membre**
```http
PUT /api/wallet/members/{gieCode}/{membreId}
```

**Payload (tous les champs optionnels):**
```json
{
  "nom": "Diop",
  "prenom": "Fatou Binta",
  "profession": "Entrepreneur",
  "role": "secretaire"
}
```

### 4. **Supprimer un Membre**
```http
DELETE /api/wallet/members/{gieCode}/{membreId}
```

### 5. **Statistiques des Membres**
```http
GET /api/wallet/members/{gieCode}/stats
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total": 5,
      "actifs": 5,
      "inactifs": 0,
      "limiteMaximum": 40,
      "placesDisponibles": 35,
      "peutAjouter": true,
      "repartitionParRole": {
        "presidente": 1,
        "tresorier": 1,
        "secretaire": 1,
        "membre": 2
      },
      "repartitionParProfession": {
        "Enseignante": 1,
        "Mécanicien": 1,
        "Couturière": 1
      },
      "dernierAjout": {
        "nom": "Khadija Ndiaye",
        "date": "2025-01-15T11:00:00Z"
      }
    }
  }
}
```

## 🎭 Rôles Possibles

- **presidente** / **president**
- **vice-presidente** / **vice-president**
- **secretaire**
- **tresorier** / **tresoriere**
- **membre** (par défaut)
- **conseiller** / **conseillere**

## 🔒 Sécurité et Contrôles

### **Contrôles d'Accès**
- ✅ Vérification de l'existence du GIE
- ✅ Vérification de l'adhésion du GIE
- ✅ Validation des paramètres

### **Contraintes de Données**
- ✅ **40 membres maximum** par GIE
- ✅ **Téléphone unique** dans le GIE
- ✅ **Champs obligatoires** validés
- ✅ **Nettoyage automatique** des espaces

### **Audit et Historique**
- ✅ Date d'ajout enregistrée
- ✅ Date de modification trackée
- ✅ Logs des opérations importantes

## 🧪 Tests et Validation

### **Scripts de Test Disponibles**

1. **Test Complet:**
   ```bash
   ./test-membres-gie.sh
   ```

2. **Initialisation de Données:**
   ```bash
   ./init-membres-test.sh [GIE_CODE]
   ```

### **Scénarios de Test**
- ✅ Ajout de membres valides
- ✅ Validation des limites (40 membres)
- ✅ Gestion des doublons de téléphone
- ✅ Modification et suppression
- ✅ Calcul des statistiques
- ✅ Gestion des erreurs

## 💡 Utilisation Frontend

### **Structure de Données pour l'Interface**
```javascript
// État local pour la gestion des membres
const [membres, setMembres] = useState([]);
const [stats, setStats] = useState({});
const [peutAjouter, setPeutAjouter] = useState(true);

// Charger les membres
const loadMembres = async () => {
  const response = await fetch(`/api/wallet/members/${gieCode}`);
  const data = await response.json();
  setMembres(data.data.membres);
  setPeutAjouter(data.data.peutAjouter);
};

// Ajouter un membre
const ajouterMembre = async (membreData) => {
  const response = await fetch(`/api/wallet/members/${gieCode}/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(membreData)
  });
  
  if (response.ok) {
    loadMembres(); // Recharger la liste
  }
};
```

### **Composants UI Recommandés**
- **📋 TableauMembres** : Liste avec actions (modifier/supprimer)
- **➕ FormulaireAjout** : Modal ou sidebar pour ajouter
- **✏️ FormulaireModification** : Edition inline ou modal
- **📊 StatistiqueMembres** : Cartes avec métriques
- **⚠️ LimiteAlert** : Alerte quand proche de 40 membres

## 🔧 Configuration et Déploiement

### **Variables d'Environment**
Aucune configuration spéciale requise - utilise la base MongoDB existante.

### **Structure de Données GIE**
```javascript
// Le champ 'membres' sera ajouté automatiquement au modèle GIE
{
  _id: ObjectId,
  identifiantGIE: String,
  nomGIE: String,
  // ... autres champs existants
  membres: [
    {
      id: String,
      nom: String,
      prenom: String,
      telephone: String,
      role: String,
      dateAjout: Date,
      dateNaissance: Date,
      profession: String,
      adresse: String,
      statut: String,
      dateModification: Date
    }
  ]
}
```

## 🎉 Avantages

1. **🎯 Simplicité** : Interface intuitive pour gérer les membres
2. **🔒 Sécurité** : Validation complète et contrôles d'accès
3. **📊 Suivi** : Statistiques en temps réel et limites claires
4. **🚀 Performance** : Opérations rapides avec feedback immédiat
5. **📱 Responsive** : API adaptée pour mobile et desktop

Cette fonctionnalité enrichit considérablement le dashboard wallet en permettant une gestion complète et professionnelle des membres du GIE.
