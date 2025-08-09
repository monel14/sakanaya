// Export all stock services
export { supplierService } from './supplierService';
export { bonReceptionService } from './bonReceptionService';
export { transfertService } from './transfertService';
export { inventaireService } from './inventaireService';
export { traceabilityService } from './traceabilityService';

// Export service types
export type { CreateSupplierData, UpdateSupplierData } from './supplierService';
export type { CreateBonReceptionData, UpdateBonReceptionData } from './bonReceptionService';
export type { CreateTransfertData, ReceptionTransfertData } from './transfertService';
export type { CreateInventaireData, UpdateInventaireData } from './inventaireService';
export type { 
  TraceabilityFilters, 
  TraceabilityReport, 
  TraceabilityAnomaly, 
  LogisticsFlowReport 
} from './traceabilityService';