import React from 'react';
import { BonReceptionIntegration } from './features/stock/integration/BonReceptionIntegration';

/**
 * Version temporaire d'App.tsx pour tester le nouveau système de Bon de Réception
 * 
 * INSTRUCTIONS POUR TESTER :
 * 
 * 1. Renommez votre App.tsx actuel en App-original.tsx
 * 2. Renommez ce fichier en App.tsx
 * 3. Redémarrez votre serveur de développement
 * 4. Testez le nouveau système de Bon de Réception
 * 5. Une fois testé, restaurez votre App.tsx original
 * 
 * OU
 * 
 * Importez directement BonReceptionIntegration dans votre App.tsx existant
 * à la place d'une autre page pour tester.
 */
export const App: React.FC = () => {
  return <BonReceptionIntegration />;
};

export default App;