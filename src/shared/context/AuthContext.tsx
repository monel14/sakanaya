import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  role: 'director' | 'manager';  // Seulement les rôles selon requirements
  name?: string;
  email?: string;
  phone?: string;
  store?: string;
  employeeId?: string;  // Association avec un employé
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
  [key: string]: any;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  switchRole: (role: User['role']) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Utilisateurs de démonstration selon requirements
const demoUsers: Record<string, User> = {
  director: { 
    id: '1', 
    role: 'director', 
    name: 'Directeur Général', 
    email: 'director@poissonnerie.com',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date()
  },
  manager: { 
    id: '2', 
    role: 'manager', 
    name: 'Manager Magasin', 
    email: 'manager@poissonnerie.com', 
    store: 'Magasin Principal',
    employeeId: 'emp-1',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date()
  },
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier s'il y a un utilisateur sauvegardé dans le localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur sauvegardé:', error);
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    
    try {
      // Simulation d'un délai d'authentification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Vérification des identifiants de démonstration
      const user = demoUsers[credentials.username];
      if (user && credentials.password === credentials.username) {
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
      } else {
        throw new Error('Identifiants incorrects');
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const switchRole = (role: User['role']) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, role };
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    login,
    logout,
    switchRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
