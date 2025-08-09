import { User } from '../../auth/types';
import { Employee } from '../../hr/types';
import { Store } from '../../../shared/types';
import { 
  UserCreationRequest, 
  PasswordResetRequest, 
  UserWithEmployee, 
  TemporaryAccess 
} from '../types';

class UserManagementService {
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
    }
  ];

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
    }
  ];

  private temporaryAccesses: TemporaryAccess[] = [];

  async getAllUsers(): Promise<UserWithEmployee[]> {
    return this.users.map(user => {
      const employee = user.employeeId ? this.employees.find(emp => emp.id === user.employeeId) : undefined;
      const store = user.store ? this.stores.find(s => s.id === user.store) : undefined;
      
      return {
        ...user,
        employee,
        storeName: store?.name
      };
    });
  }

  async getUserById(id: string): Promise<UserWithEmployee | null> {
    const user = this.users.find(u => u.id === id);
    if (!user) return null;

    const employee = user.employeeId ? this.employees.find(emp => emp.id === user.employeeId) : undefined;
    const store = user.store ? this.stores.find(s => s.id === user.store) : undefined;

    return {
      ...user,
      employee,
      storeName: store?.name
    };
  }

  async createUser(request: UserCreationRequest): Promise<User> {
    // Check if username already exists
    const existingUser = this.users.find(u => u.username === request.username);
    if (existingUser) {
      throw new Error('Ce nom d\'utilisateur existe déjà');
    }

    // Validate employee association if provided
    if (request.employeeId) {
      const employee = this.employees.find(emp => emp.id === request.employeeId);
      if (!employee) {
        throw new Error('Employé introuvable');
      }
      
      // Check if employee is already associated with another user
      const existingAssociation = this.users.find(u => u.employeeId === request.employeeId);
      if (existingAssociation) {
        throw new Error('Cet employé est déjà associé à un autre compte');
      }
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      role: request.role,
      name: request.name,
      username: request.username,
      store: request.storeId,
      employeeId: request.employeeId,
      isActive: true,
      createdAt: new Date()
    };

    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('Utilisateur introuvable');
    }

    // Validate employee association if being updated
    if (updates.employeeId) {
      const employee = this.employees.find(emp => emp.id === updates.employeeId);
      if (!employee) {
        throw new Error('Employé introuvable');
      }
      
      // Check if employee is already associated with another user
      const existingAssociation = this.users.find(u => u.employeeId === updates.employeeId && u.id !== id);
      if (existingAssociation) {
        throw new Error('Cet employé est déjà associé à un autre compte');
      }
    }

    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    return this.users[userIndex];
  }

  async deactivateUser(id: string): Promise<void> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('Utilisateur introuvable');
    }

    this.users[userIndex].isActive = false;
  }

  async activateUser(id: string): Promise<void> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('Utilisateur introuvable');
    }

    this.users[userIndex].isActive = true;
  }

  async resetPassword(request: PasswordResetRequest): Promise<void> {
    const user = this.users.find(u => u.id === request.userId);
    if (!user) {
      throw new Error('Utilisateur introuvable');
    }

    // In a real implementation, this would hash the password and store it
    console.log(`Password reset for user ${user.username} by ${request.resetBy}`);
    
    // Log the password reset action
    console.log('Password reset logged:', {
      userId: request.userId,
      resetBy: request.resetBy,
      timestamp: new Date(),
      reason: request.reason
    });
  }

  async getUnassociatedEmployees(): Promise<Employee[]> {
    const associatedEmployeeIds = this.users
      .filter(u => u.employeeId)
      .map(u => u.employeeId!);

    return this.employees.filter(emp => 
      !associatedEmployeeIds.includes(emp.id) && emp.isActive
    );
  }

  async getStores(): Promise<Store[]> {
    return this.stores.filter(store => store.isActive);
  }

  // Temporary Access Management
  async grantTemporaryAccess(access: Omit<TemporaryAccess, 'id' | 'createdAt'>): Promise<TemporaryAccess> {
    const newAccess: TemporaryAccess = {
      ...access,
      id: `temp-${Date.now()}`,
      createdAt: new Date()
    };

    this.temporaryAccesses.push(newAccess);
    return newAccess;
  }

  async revokeTemporaryAccess(accessId: string): Promise<void> {
    const accessIndex = this.temporaryAccesses.findIndex(a => a.id === accessId);
    if (accessIndex === -1) {
      throw new Error('Accès temporaire introuvable');
    }

    this.temporaryAccesses[accessIndex].isActive = false;
  }

  async getTemporaryAccesses(userId?: string): Promise<TemporaryAccess[]> {
    let accesses = this.temporaryAccesses.filter(a => a.isActive);
    
    if (userId) {
      accesses = accesses.filter(a => a.userId === userId);
    }

    return accesses;
  }

  async cleanupExpiredAccesses(): Promise<void> {
    const now = new Date();
    this.temporaryAccesses.forEach(access => {
      if (access.expiresAt < now) {
        access.isActive = false;
      }
    });
  }
}

export const userManagementService = new UserManagementService();