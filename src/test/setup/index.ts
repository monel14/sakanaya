// Test setup utilities
export * from './jest.setup';

// Common test utilities
export const mockUser = {
  id: 'test-user-1',
  role: 'manager' as const,
  name: 'Test User',
  username: 'testuser',
  isActive: true,
  createdAt: new Date()
};

export const mockStore = {
  id: 'test-store-1',
  name: 'Test Store',
  type: 'retail' as const,
  address: '123 Test Street',
  phone: '0123456789',
  isActive: true,
  employees: [],
  createdAt: new Date()
};

// Mock API responses
export const createMockApiResponse = <T>(data: T, success = true) => ({
  success,
  data: success ? data : undefined,
  error: success ? undefined : 'Mock error'
});

// Test data generators
export const generateTestId = () => `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));