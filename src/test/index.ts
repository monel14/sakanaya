// Test utilities and helpers
export * from './setup';
export * from './features';
export * from './shared';

// Global test configuration
export const TEST_CONFIG = {
  timeout: 5000,
  retries: 2,
  verbose: process.env.NODE_ENV === 'test'
};

// Common test patterns
export const TEST_IDS = {
  // UI elements
  LOADING_SPINNER: 'loading-spinner',
  ERROR_MESSAGE: 'error-message',
  SUCCESS_MESSAGE: 'success-message',
  
  // Forms
  SUBMIT_BUTTON: 'submit-button',
  CANCEL_BUTTON: 'cancel-button',
  FORM_INPUT: 'form-input',
  
  // Navigation
  SIDEBAR: 'sidebar',
  HEADER: 'header',
  NAVIGATION_ITEM: 'nav-item',
  
  // Stock specific
  STOCK_TABLE: 'stock-table',
  STOCK_ITEM: 'stock-item',
  TRANSFERT_FORM: 'transfert-form',
  BON_RECEPTION_LIST: 'bon-reception-list'
} as const;