import { useState, useCallback } from 'react';
import { User, UserRole } from '../types';

interface UseAuthReturn {
  currentUser: User | null;
  isLoggedIn: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  switchRole: () => void;
}

// Mock users for demo
const mockUsers: Record<string, User> = {
  'directeur': {
    id: '1',
    role: 'director',
    name: 'Directeur Général',
    username: 'directeur',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date()
  },
  'almadies': {
    id: '2',
    role: 'manager',
    name: 'Manager Almadies',
    username: 'almadies',
    store: 'Pointe des Almadies',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date()
  }
};

export const useAuth = (): UseAuthReturn => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const login = useCallback((username: string, password: string): boolean => {
    if (password === 'password' && mockUsers[username]) {
      setCurrentUser(mockUsers[username]);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const switchRole = useCallback(() => {
    if (!currentUser) return;
    
    const newRole: UserRole = currentUser.role === 'director' ? 'manager' : 'director';
    const newUser = newRole === 'director' ? mockUsers['directeur'] : mockUsers['almadies'];
    setCurrentUser(newUser);
  }, [currentUser]);

  return {
    currentUser,
    isLoggedIn: !!currentUser,
    login,
    logout,
    switchRole
  };
};