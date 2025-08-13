#!/usr/bin/env node

// Test rapide pour vérifier le format des identifiants GIE
const axios = require('axios');

const testGIEData = {
  nomGIE: "FEVEO-14-01-01-01-001",
  identifiantGIE: "FEVEO-14-01-01-01-001",
  numeroProtocole: "002",
  presidenteNom: "Fall",
  presidentePrenom: "Aminata",
  presidenteCIN: "9876543210123",
  presidenteTelephone: "+221701234567",
  presidenteEmail: "aminata.fall@example.com",
  presidenteAdresse: "Rue 10, Dakar",
  region: "DAKAR",
  departement: "DAKAR",
  arrondissement: "PLATEAU",
  commune: "PLATEAU",
  secteurPrincipal: "Agriculture",
  objectifs: "Développement agricole durable",
  activites: ["Production agricole bio", "Commerce de produits locaux"],
  dateConstitution: "2025-08-04",
  nombreMembres: 40,
  secteurActivite: "agriculture",
  description: "GIE test pour validation format",
  besoinsFinancement: 500000,
  membres: Array.from({length: 39}, (_, i) => ({
    nom: `Membre${i+1}`,
    prenom: `Prenom${i+1}`,
    fonction: "Membre",
    cin: `123456789012${i}`,
    telephone: `+22177000${i.toString().padStart(4, '0')}`,
    genre: i < 25 ? "femme" : (i < 37 ? "jeune" : "homme"),
    age: i < 25 ? undefined : (i < 37 ? 25 : 45)
  }))
};

async function testIdentifiantFormat() {
  try {
    console.log('🧪 Test du format d\'identifiant GIE...');
    console.log('📊 Données test:', testGIEData);
    
    const response = await axios.post('http://localhost:4320/api/gie/enregistrer', testGIEData);
    
    if (response.data.success) {
      console.log('✅ Format d\'identifiant valide !');
      console.log('📄 Réponse:', response.data);
    } else {
      console.log('❌ Échec test format');
      console.log('📄 Erreur:', response.data);
    }
  } catch (error) {
    console.error('💥 Erreur test:', error.response?.data || error.message);
  }
}

testIdentifiantFormat();
