import { Store } from '../../../shared/types';
import { Employee } from '../../hr/types';
import { User } from '../../auth/types';

interface StoreCreationRequest {
  name: string;
  address: string;
  phone: string;
  type: 'hub' | 'retail';
  managerId?: string;
}

interface StoreUpdateRequest {
  name?: string;
  address?: string;
  phone?: string;
  managerId?: string;
  isActive?: boolean;
}

class StoreManagementService {
  private stores: Store[] = [
    {
      id: 'store-1',
      name: 'Poissonnerie Centre-Ville',
      type: 'retail',
      address: '123 Rue de la Paix, Dakar',
      phone: '+221 33 123 45 67',
      managerId: 'user-2',
      isActive: true,
      employees: ['emp-1', 'emp-2'],
      createdAt: new Date('2024-01-01')
    },
    {
      id: 'store-2',
      name: 'Poissonnerie Plateau',
      type: 'retail',
      address: '456 Avenue Bourguiba, Dakar',
      phone: '+221 33 987 65 43',
      isActive: true,
      employees: [],
      createdAt: new Date('2024-01-10')
    },
    {
      id: 'store-3',
      name: 'Entrepôt Central',
      type: 'hub',
      address: '789 Zone Industrielle, Dakar',
      phone: '+221 33 555 12 34',
      isActive: true,
      employees: ['emp-3'],
      createdAt: new Date('2024-01-05')
    }
  ];

  private employees: Employee[] = [
    {
      id: 'emp-1',
      firstName: 'Jean',
      lastName: 'Dupont',
      role: 'manager',
      salary: 150000,
      workDays: [1, 2, 3, 4, 5, 6],
      storeId: 'store-1',
      isActive: true,
      hireDate: new Date('2024-01-15'),
      status: 'active'
    },
    {
      id: 'emp-2',
      firstName: 'Marie',
      lastName: 'Martin',
      role: 'seller',
      salary: 80000,
      workDays: [1, 2, 3, 4, 5],
      storeId: 'store-1',
      isActive: true,
      hireDate: new Date('2024-02-01'),
      status: 'active'
    },
    {
      id: 'emp-3',
      firstName: 'Ahmed',
      lastName: 'Diallo',
      role: 'preparer',
      salary: 90000,
      workDays: [1, 2, 3, 4, 5, 6],
      storeId: 'store-3',
      isActive: true,
      hireDate: new Date('2024-01-20'),
      status: 'active'
    },
    {
      id: 'emp-4',
      firstName: 'Fatou',
      lastName: 'Sow',
      role: 'seller',
      salary: 75000,
      workDays: [2, 3, 4, 5, 6],
      storeId: '',
      isActive: true,
      hireDate: new Date('2024-02-15'),
      status: 'active'
    }
  ];

  private users: User[] = [
    {
      id: 'user-1',
      role: 'director',
      name: 'Directeur Principal',
      username: 'director',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      lastLogin: new Date()
    },
    {
      id: 'user-2',
      role: 'manager',
      name: 'Manager Magasin 1',
      username: 'manager1',
      store: 'store-1',
      employeeId: 'emp-1',
      isActive: true,
      createdAt: new Date('2024-01-15'),
      lastLogin: new Date()
    }
  ];

  async getAllStores(): Promise<Store[]> {
    return [...this.stores];
  }

  async getStoreById(id: string): Promise<Store | null> {
    return this.stores.find(store => store.id === id) || null;
  }

  async createStore(request: StoreCreationRequest): Promise<Store> {
    // Validate manager if provided
    if (request.managerId) {
      const manager = this.users.find(u => u.id === request.managerId && u.role === 'manager');
      if (!manager) {
        throw new Error('Manager introuvable ou rôle invalide');
      }
      
      // Check if manager is already assigned to another store
      const existingAssignment = this.stores.find(s => s.managerId === request.managerId && s.isActive);
      if (existingAssignment) {
        throw new Error('Ce manager est déjà assigné à un autre magasin');
      }
    }

    const newStore: Store = {
      id: `store-${Date.now()}`,
      name: request.name,
      type: request.type,
      address: request.address,
      phone: request.phone,
      managerId: request.managerId,
      isActive: true,
      employees: [],
      createdAt: new Date()
    };

    this.stores.push(newStore);
    return newStore;
  }

  async updateStore(id: string, updates: StoreUpdateRequest): Promise<Store> {
    const storeIndex = this.stores.findIndex(s => s.id === id);
    if (storeIndex === -1) {
      throw new Error('Magasin introuvable');
    }

    // Validate manager if being updated
    if (updates.managerId) {
      const manager = this.users.find(u => u.id === updates.managerId && u.role === 'manager');
      if (!manager) {
        throw new Error('Manager introuvable ou rôle invalide');
      }
      
      // Check if manager is already assigned to another store
      const existingAssignment = this.stores.find(s => 
        s.managerId === updates.managerId && s.isActive && s.id !== id
      );
      if (existingAssignment) {
        throw new Error('Ce manager est déjà assigné à un autre magasin');
      }
    }

    this.stores[storeIndex] = { ...this.stores[storeIndex], ...updates };
    return this.stores[storeIndex];
  }

  async deactivateStore(id: string): Promise<void> {
    const storeIndex = this.stores.findIndex(s => s.id === id);
    if (storeIndex === -1) {
      throw new Error('Magasin introuvable');
    }

    this.stores[storeIndex].isActive = false;
    
    // Also deactivate employees assigned to this store
    this.employees.forEach(emp => {
      if (emp.storeId === id) {
        emp.status = 'inactive';
      }
    });
  }

  async activateStore(id: string): Promise<void> {
    const storeIndex = this.stores.findIndex(s => s.id === id);
    if (storeIndex === -1) {
      throw new Error('Magasin introuvable');
    }

    this.stores[storeIndex].isActive = true;
  }

  async getStoreEmployees(storeId: string): Promise<Employee[]> {
    return this.employees.filter(emp => emp.storeId === storeId);
  }

  async assignEmployeeToStore(employeeId: string, storeId: string): Promise<void> {
    const employee = this.employees.find(emp => emp.id === employeeId);
    if (!employee) {
      throw new Error('Employé introuvable');
    }

    const store = this.stores.find(s => s.id === storeId);
    if (!store) {
      throw new Error('Magasin introuvable');
    }

    if (!store.isActive) {
      throw new Error('Impossible d\'assigner un employé à un magasin inactif');
    }

    // Update employee's store assignment
    employee.storeId = storeId;
    
    // Add employee to store's employee list if not already there
    if (!store.employees.includes(employeeId)) {
      store.employees.push(employeeId);
    }
  }

  async removeEmployeeFromStore(employeeId: string, storeId: string): Promise<void> {
    const employee = this.employees.find(emp => emp.id === employeeId);
    if (!employee) {
      throw new Error('Employé introuvable');
    }

    const store = this.stores.find(s => s.id === storeId);
    if (!store) {
      throw new Error('Magasin introuvable');
    }

    // Remove employee from store assignment
    employee.storeId = '';
    
    // Remove employee from store's employee list
    store.employees = store.employees.filter(empId => empId !== employeeId);
  }

  async getAvailableEmployees(): Promise<Employee[]> {
    return this.employees.filter(emp => !emp.storeId && emp.isActive);
  }

  async getAvailableManagers(): Promise<User[]> {
    const assignedManagerIds = this.stores
      .filter(s => s.isActive && s.managerId)
      .map(s => s.managerId!);

    return this.users.filter(user => 
      user.role === 'manager' && 
      user.isActive && 
      !assignedManagerIds.includes(user.id)
    );
  }

  async getStoreUsers(storeId: string): Promise<User[]> {
    return this.users.filter(user => user.store === storeId);
  }

  async assignUserToStore(userId: string, storeId: string): Promise<void> {
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new Error('Utilisateur introuvable');
    }

    const store = this.stores.find(s => s.id === storeId);
    if (!store) {
      throw new Error('Magasin introuvable');
    }

    if (!store.isActive) {
      throw new Error('Impossible d\'assigner un utilisateur à un magasin inactif');
    }

    // For manager role, check if they're not already assigned elsewhere
    if (user.role === 'manager' && user.store && user.store !== storeId) {
      throw new Error('Ce manager est déjà assigné à un autre magasin');
    }

    user.store = storeId;
  }

  async removeUserFromStore(userId: string): Promise<void> {
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new Error('Utilisateur introuvable');
    }

    user.store = undefined;
  }

  async getStoreStatistics(): Promise<{
    totalStores: number;
    activeStores: number;
    inactiveStores: number;
    storesByType: { hub: number; retail: number };
  }> {
    const activeStores = this.stores.filter(s => s.isActive);
    const inactiveStores = this.stores.filter(s => !s.isActive);
    
    return {
      totalStores: this.stores.length,
      activeStores: activeStores.length,
      inactiveStores: inactiveStores.length,
      storesByType: {
        hub: this.stores.filter(s => s.type === 'hub').length,
        retail: this.stores.filter(s => s.type === 'retail').length
      }
    };
  }
}

export const storeManagementService = new StoreManagementService();