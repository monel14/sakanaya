import { Employee, SalaryAdjustment, PayrollSummary } from '../../features/hr/types';

export class EmployeeService {
  private static instance: EmployeeService;
  private employees: Employee[] = [];

  private constructor() {
    this.initializeMockData();
  }

  public static getInstance(): EmployeeService {
    if (!EmployeeService.instance) {
      EmployeeService.instance = new EmployeeService();
    }
    return EmployeeService.instance;
  }

  private initializeMockData(): void {
    this.employees = [
      {
        id: '1',
        firstName: 'Marie',
        lastName: 'Diop',
        role: 'manager',
        storeId: 'store-1',
        storeName: 'Magasin Principal',
        salary: 250000,
        isActive: true,
        hireDate: new Date('2023-01-15'),
        email: 'marie.diop@sakanaya.com',
        phone: '+221 77 123 45 67'
      },
      {
        id: '2',
        firstName: 'Amadou',
        lastName: 'Ba',
        role: 'seller',
        storeId: 'store-1',
        storeName: 'Magasin Principal',
        salary: 150000,
        isActive: true,
        hireDate: new Date('2023-03-20'),
        email: 'amadou.ba@sakanaya.com',
        phone: '+221 76 987 65 43'
      },
      {
        id: '3',
        firstName: 'Fatou',
        lastName: 'Sall',
        role: 'preparer',
        storeId: 'store-2',
        storeName: 'Magasin Secondaire',
        salary: 120000,
        isActive: true,
        hireDate: new Date('2023-05-10'),
        email: 'fatou.sall@sakanaya.com',
        phone: '+221 78 456 78 90'
      }
    ];
  }

  public async getAll(): Promise<Employee[]> {
    return [...this.employees];
  }

  public async getByStore(storeId: string): Promise<Employee[]> {
    return this.employees.filter(emp => emp.storeId === storeId);
  }

  public async getById(id: string): Promise<Employee | null> {
    return this.employees.find(emp => emp.id === id) || null;
  }

  public async create(employeeData: Omit<Employee, 'id'>): Promise<Employee> {
    const newEmployee: Employee = {
      ...employeeData,
      id: Date.now().toString()
    };
    this.employees.push(newEmployee);
    return newEmployee;
  }

  public async update(id: string, updates: Partial<Employee>): Promise<Employee> {
    const index = this.employees.findIndex(emp => emp.id === id);
    if (index === -1) {
      throw new Error('Employé non trouvé');
    }
    
    this.employees[index] = { ...this.employees[index], ...updates };
    return this.employees[index];
  }

  public async updateSalary(employeeId: string, newSalary: number): Promise<Employee> {
    const employee = this.employees.find(emp => emp.id === employeeId);
    if (!employee) {
      throw new Error('Employé non trouvé');
    }

    employee.salary = newSalary;
    return employee;
  }

  public async deactivate(id: string): Promise<Employee> {
    return this.update(id, { isActive: false });
  }

  public async delete(id: string): Promise<void> {
    const index = this.employees.findIndex(emp => emp.id === id);
    if (index === -1) {
      throw new Error('Employé non trouvé');
    }
    this.employees.splice(index, 1);
  }

  public async addSalaryAdjustment(adjustment: Omit<SalaryAdjustment, 'id' | 'createdAt'>): Promise<SalaryAdjustment> {
    const newAdjustment: SalaryAdjustment = {
      ...adjustment,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    // TODO: Store adjustments
    return newAdjustment;
  }

  public async calculateMonthlyCost(storeId: string, month: number, year: number): Promise<number> {
    const storeEmployees = this.employees.filter(emp => emp.storeId === storeId && emp.isActive);
    return storeEmployees.reduce((total, emp) => total + emp.salary, 0);
  }

  public async calculatePayroll(storeId: string, month: number, year: number): Promise<PayrollSummary> {
    const storeEmployees = this.employees.filter(emp => emp.storeId === storeId && emp.isActive);
    const totalSalary = storeEmployees.reduce((total, emp) => total + emp.salary, 0);
    
    return {
      storeId,
      month,
      year,
      totalEmployees: storeEmployees.length,
      totalSalary,
      averageSalary: storeEmployees.length > 0 ? totalSalary / storeEmployees.length : 0,
      adjustments: []
    };
  }

  public async getSalaryAdjustments(employeeId: string): Promise<SalaryAdjustment[]> {
    // TODO: Return actual adjustments
    return [];
  }
}

export const employeeService = EmployeeService.getInstance();