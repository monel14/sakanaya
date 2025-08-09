export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  storeId: string;
  storeName: string;
  salary: number;
  isActive: boolean;
  hireDate: Date;
  email?: string;
  phone?: string;
}

export interface SalaryAdjustment {
  id: string;
  employeeId: string;
  oldSalary: number;
  newSalary: number;
  reason: string;
  effectiveDate: Date;
  createdAt: Date;
  createdBy: string;
}

export interface PayrollSummary {
  storeId: string;
  month: number;
  year: number;
  totalEmployees: number;
  totalSalary: number;
  averageSalary: number;
  adjustments: SalaryAdjustment[];
}