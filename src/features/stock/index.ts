// Pages principales
export { StockManagementPage } from './pages/StockManagementPage';

// Composants de gestion des fournisseurs
export { SupplierManagement } from './components/ArrivageFournisseur/SupplierManagement';
export { SupplierForm } from './components/ArrivageFournisseur/SupplierForm';
export { SupplierList } from './components/ArrivageFournisseur/SupplierList';

// Composants de bons de réception
export { BonReceptionForm } from './components/ArrivageFournisseur/BonReceptionForm';
export { BonReceptionList } from './components/ArrivageFournisseur/BonReceptionList';
export { BonReceptionDetail } from './components/ArrivageFournisseur/BonReceptionDetail';

// Composants existants
export { StockLevelDisplay } from './components/StockLevelDisplay';
export { LossEntry } from './components/LossEntry';
export { ArrivalEntry } from './components/ArrivalEntry';

// Démonstrations
export { IntegratedStockDemo } from './demo/IntegratedStockDemo';
export { BonReceptionDemo } from './demo/BonReceptionDemo';
export { SupplierDemo } from './demo/SupplierDemo';
export { TransfertDemo } from './demo/TransfertDemo';

// Types
export * from './types';

// Services
export { supplierService } from './services/supplierService';
export { transfertService } from './services/transfertService';

// Hooks
export { useBonsReception } from './hooks/useBonsReception';
export { useTransferts } from './hooks/useTransferts';