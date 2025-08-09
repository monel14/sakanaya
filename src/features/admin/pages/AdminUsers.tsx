import React from 'react';

interface AdminUsersProps {
  user: any;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Gestion des utilisateurs
      </h1>
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <p className="text-gray-600">Page de gestion des utilisateurs en cours de développement...</p>
      </div>
    </div>
  );
};