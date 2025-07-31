#!/bin/bash

# Script de lancement des tests API pour la création de GIE
# Usage: ./run-tests.sh [type]
# Types: full, simple, invalid, all

echo "🚀 FEVEO - Tests API Création de GIE"
echo "===================================="

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier que Node.js est installé
check_nodejs() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js n'est pas installé. Veuillez l'installer avant de continuer."
        exit 1
    fi
    print_success "Node.js trouvé: $(node --version)"
}

# Vérifier que le serveur backend est accessible
check_backend() {
    print_status "Vérification du serveur backend..."
    
    if curl -s http://localhost:5000/api/health &> /dev/null; then
        print_success "Serveur backend accessible"
    else
        print_warning "Le serveur backend ne semble pas accessible sur http://localhost:5000"
        print_warning "Assurez-vous qu'il est démarré avant de lancer les tests"
        read -p "Continuer quand même ? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Installer les dépendances si nécessaire
install_dependencies() {
    if [ ! -d "node_modules" ] || [ ! -f "node_modules/axios/package.json" ]; then
        print_status "Installation des dépendances..."
        npm install axios dotenv
        print_success "Dépendances installées"
    else
        print_success "Dépendances déjà installées"
    fi
}

# Test complet
run_full_test() {
    print_status "Lancement du test complet..."
    node test-gie-creation.js
}

# Test simple
run_simple_test() {
    print_status "Lancement du test simple..."
    node test-gie-simple.js
}

# Test avec données invalides
run_invalid_test() {
    print_status "Lancement du test avec données invalides..."
    node -e "
        const { authenticate, testInvalidGIECreation } = require('./test-gie-creation.js');
        async function runInvalidTest() {
            try {
                const token = await authenticate();
                await testInvalidGIECreation(token);
            } catch (error) {
                console.error('Erreur:', error.message);
            }
        }
        runInvalidTest();
    "
}

# Afficher l'aide
show_help() {
    echo ""
    echo "Usage: $0 [TYPE]"
    echo ""
    echo "Types de tests disponibles:"
    echo "  full    - Test complet avec toutes les fonctionnalités"
    echo "  simple  - Test rapide avec données minimales"
    echo "  invalid - Test avec données invalides pour validation"
    echo "  all     - Exécuter tous les tests"
    echo "  help    - Afficher cette aide"
    echo ""
    echo "Si aucun type n'est spécifié, le test complet sera exécuté."
    echo ""
    echo "Exemples:"
    echo "  $0 full"
    echo "  $0 simple"
    echo "  $0 all"
}

# Fonction principale
main() {
    local test_type=${1:-full}
    
    case $test_type in
        "help"|"-h"|"--help")
            show_help
            exit 0
            ;;
        "full")
            check_nodejs
            check_backend
            install_dependencies
            run_full_test
            ;;
        "simple")
            check_nodejs
            check_backend
            install_dependencies
            run_simple_test
            ;;
        "invalid")
            check_nodejs
            check_backend
            install_dependencies
            run_invalid_test
            ;;
        "all")
            check_nodejs
            check_backend
            install_dependencies
            echo ""
            print_status "=== TEST SIMPLE ==="
            run_simple_test
            echo ""
            print_status "=== TEST COMPLET ==="
            run_full_test
            echo ""
            print_status "=== TEST DONNÉES INVALIDES ==="
            run_invalid_test
            ;;
        *)
            print_error "Type de test inconnu: $test_type"
            show_help
            exit 1
            ;;
    esac
}

# Point d'entrée
main "$@"
