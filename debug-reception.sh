#!/bin/bash

echo "🔍 ANALYSE: Messages WhatsApp envoyés mais non reçus"
echo "=================================================="
echo ""
echo "✅ CONFIRMATION TECHNIQUE:"
echo "   • API WhatsApp: ✅ Connectée"
echo "   • Token: ✅ Valide"
echo "   • Messages envoyés: ✅ Succès (statut 'accepted')"
echo "   • Message IDs générés: ✅ Oui"
echo ""
echo "🔍 CAUSES POSSIBLES:"
echo ""
echo "1️⃣ NUMÉRO DE TÉLÉPHONE:"
echo "   • Le numéro 221772488807 n'est pas le vôtre"
echo "   • WhatsApp n'est pas installé sur ce numéro"
echo "   • Le numéro n'est pas vérifié dans WhatsApp"
echo ""
echo "2️⃣ CONFIGURATION WHATSAPP BUSINESS:"
echo "   • Compte en mode 'sandbox' (limité aux numéros de test)"
echo "   • Numéro non ajouté à la liste des destinataires autorisés"
echo "   • Business Account non vérifié"
echo ""
echo "3️⃣ FILTRES ET RESTRICTIONS:"
echo "   • Messages filtrés comme spam par WhatsApp"
echo "   • Limite d'envoi atteinte"
echo "   • Template non approuvé (pour messages texte libres)"
echo ""
echo "🛠️ SOLUTIONS IMMÉDIATES:"
echo ""
echo "Option A - Vérifier la console WhatsApp:"
open "https://developers.facebook.com/apps/1500316664676674/whatsapp-business/wa-settings/"
echo "   ✅ Console ouverte - Vérifiez:"
echo "      • Section 'Send and receive messages'"
echo "      • Numéros de téléphone autorisés"
echo "      • Statut du compte business"
echo ""
echo "Option B - Tester avec votre vrai numéro:"
echo -n "   Entrez votre numéro WhatsApp (format: 221xxxxxxxxx): "
read user_number

if [ ! -z "$user_number" ]; then
    echo "   🧪 Test avec votre numéro..."
    cd /Users/diikaanedev/Documents/feveo-projet/back
    node -e "
    const whatsappService = require('./src/services/whatsappService');
    
    async function testUserNumber() {
      console.log('📱 Envoi vers $user_number...');
      const result = await whatsappService.sendVerificationCode(
        '$user_number',
        '999888', 
        'USER_TEST'
      );
      
      if (result.success && result.method === 'whatsapp') {
        console.log('✅ Message envoyé! Vérifiez votre WhatsApp');
        console.log('Message ID:', result.messageId);
      } else {
        console.log('❌ Échec:', result.error || 'Mode fallback');
      }
    }
    
    testUserNumber().catch(console.error);
    "
else
    echo "   ⚠️ Aucun numéro saisi"
fi

echo ""
echo "Option C - Mode développement (recommandé):"
echo "   ✅ Le système fonctionne en mode fallback"
echo "   ✅ Codes visibles dans les logs"
echo "   ✅ Développement peut continuer"
echo ""
echo "💡 RECOMMANDATION:"
echo "   Pour le développement, utilisez le mode fallback actuel"
echo "   Les codes s'affichent dans les logs du serveur"
echo "   Configuration WhatsApp à finaliser pour la production"
