#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Démarrage de Sakanaya - Architecture RBAC');
console.log('================================================');

// Vérifier que nous sommes dans le bon répertoire
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Erreur: package.json non trouvé. Assurez-vous d\'être dans le répertoire racine du projet.');
  process.exit(1);
}

// Lire le package.json pour vérifier le nom du projet
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
if (packageJson.name !== 'sakanaya-react-app') {
  console.warn('⚠️  Attention: Le nom du projet ne correspond pas à "sakanaya-react-app"');
}

console.log('📦 Vérification des dépendances...');

try {
  // Vérifier si node_modules existe
  if (!fs.existsSync(path.join(process.cwd(), 'node_modules'))) {
    console.log('📥 Installation des dépendances...');
    execSync('npm install', { stdio: 'inherit' });
  }

  console.log('✅ Dépendances vérifiées');
  console.log('');
  console.log('👥 Comptes de démonstration disponibles :');
  console.log('┌─────────────┬─────────────┬─────────────┬──────────────────────────────┐');
  console.log('│ Rôle        │ Identifiant │ Mot de passe│ Accès                        │');
  console.log('├─────────────┼─────────────┼─────────────┼──────────────────────────────┤');
  console.log('│ Admin       │ admin       │ admin       │ Gestion système et utilisateurs │');
  console.log('│ Directeur   │ director    │ director    │ Rapports et analytics globaux   │');
  console.log('│ Manager     │ manager     │ manager     │ Gestion magasin et équipe       │');
  console.log('│ Employé     │ employee    │ employee    │ Opérations de base              │');
  console.log('└─────────────┴─────────────┴─────────────┴──────────────────────────────┘');
  console.log('');
  console.log('🌐 Démarrage du serveur de développement...');
  console.log('   L\'application sera disponible sur http://localhost:5173');
  console.log('');

  // Démarrer le serveur de développement
  execSync('npm run dev', { stdio: 'inherit' });

} catch (error) {
  console.error('❌ Erreur lors du démarrage:', error.message);
  process.exit(1);
}