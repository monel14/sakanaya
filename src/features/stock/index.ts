// Pages principales
export { StockManagementPage } from './pages/StockManagementPage';

// Composants de gestion des fournisseurs
export { SupplierManagement } from './shared/components/ArrivageFournisseur/SupplierManagement';
export { SupplierForm } from './shared/components/ArrivageFournisseur/SupplierForm';
export { SupplierList } from './shared/components/ArrivageFournisseur/SupplierList';

// Composants de bons de réception
export { BonReceptionForm } from './shared/components/ArrivageFournisseur/BonReceptionForm';
export { BonReceptionList } from './shared/components/ArrivageFournisseur/BonReceptionList';
export { BonReceptionDetail } from './shared/components/ArrivageFournisseur/BonReceptionDetail';

// Composants existants
export { StockLevelDisplay } from './shared/components/StockLevelDisplay';
export { LossEntry } from './shared/components/LossEntry';
export { ArrivalEntry } from './shared/components/ArrivalEntry';

// Démonstrations
export { IntegratedStockDemo } from './demo/IntegratedStockDemo';
export { BonReceptionDemo } from './demo/BonReceptionDemo';
export { SupplierDemo } from './demo/SupplierDemo';
export { TransfertDemo } from './demo/TransfertDemo';

// Types
export * from './shared/types';

// Services
export { supplierService } from './shared/services/supplierService';
export { transfertService } from './shared/services/transfertService';

// Hooks
export { useBonsReception } from './shared/hooks/useBonsReception';
export { useTransferts } from './shared/hooks/useTransferts';