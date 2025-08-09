// Re-export all types from features
export * from './features/auth/types';
export * from './features/sales/types';
export * from './features/hr/types';
export * from './features/stock/types';
export * from './features/dashboard/types';
export * from './shared/types';

// Re-export services (excluding conflicting types)
export { productService } from './shared/services/productService';
export { notificationService } from './shared/services/notificationService';
export { salesValidationService } from './shared/services/salesValidationService';
export { closingHistoryService } from './shared/services/closingHistoryService';
export { stockService } from './shared/services/stockService';
export { stockAlertsService } from './shared/services/stockAlertsService';
export { costAnalysisService } from './shared/services/costAnalysisService';

// Re-export new stock services
export { 
  supplierService, 
  bonReceptionService, 
  transfertService, 
  inventaireService 
} from './features/stock/services';