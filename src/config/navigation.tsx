import React from 'react';
// Exemple de mapping page/role
export function getPageByRole(role: string, pageKey: string): React.FC<any> {
  // TODO: Retourner le composant de page selon le rôle et la clé de page
  // Ex: if (role === 'admin' && pageKey === 'dashboard') return AdminDashboardPage;
  return () => (
    <div>{`Page ${pageKey} pour le rôle ${role}`}</div>
  );
}
