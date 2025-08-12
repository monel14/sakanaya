/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: number;
  name: string;
  stockUnit: string;
  priceType: 'Variable' | 'Fixe';
  basePrice: number;
  productType: 'Matière Première' | 'Produit Fini';
}
export interface SalesUnit {
    id: number;
    name:string;
    baseProduct: string;
    price: number;
    factor: number;
}
export interface User {
    id: number;
    name: string;
    login: string;
    role: 'Directeur' | 'Magasin';
    store: string;
    status: 'Actif' | 'Inactif';
}
export interface Employee {
    id: number;
    name: string;
    store: string;
    role: 'Responsable' | 'Vendeur';
    salary: number;
    status: 'Actif' | 'Inactif';
}
export interface Store {
    id: number;
    name: string;
    type: 'Hub' | 'Magasin';
    address: string;
    status: 'Actif' | 'Inactif';
}

export interface AuditLog {
  id: number;
  user: string;
  action: string;
  details: string;
  date: Date;
}

export interface Notification {
  id: number;
  message: string;
  read: boolean;
  date: Date;
}

export interface SaleLine {
  id: number;
  unitId: number;
  qty: number;
  costOfGoodsSold?: number;
}

export interface SaleClosure {
  id: number;
  storeId: number;
  storeName: string;
  date: string;
  lines: SaleLine[];
  total: number;
  status: 'draft' | 'closed' | 'validated';
  totalCostOfGoodsSold?: number;
  grossMargin?: number;
}

export type ToastMessage = {
  id: number;
  message: string;
};

export type ModalKey = 'modalAjoutProduit' | 'modalAjoutUtilisateur' | 'modalAjoutEmploye' | 'modalNouvelArrivage' | 'modalAjoutMagasin' | 'modalNouveauTransfert' | 'modalReceptionTransfert' | 'modalInventaireDetails' | 'modalSaleClosureDetails' | 'modalAjoutDepense' | 'modalModifierProduit' | 'modalModifierUtilisateur' | 'modalModifierEmploye' | 'modalModifierMagasin' | 'modalModifierDepense' | 'modalAjoutUniteVente' | 'modalModifierUniteVente' | 'modalFicheTechnique' | 'modalOrdreFabrication' | 'modalFinaliserOF' | 'modalAjoutFournisseur' | 'modalModifierFournisseur' | 'modalBonDeCommande' | 'modalAjoutClient' | 'modalModifierClient' | 'modalCommandeDeVente' | 'modalFacture' | 'modalBudget' | 'modalSalesOrderDetails' | 'modalClientDossier' | null;

export interface ArrivalLine {
    productId: number;
    quantity: number;
    unitCost: number;
    subtotal: number;
    batchNumber: string;
    expiryDate: string;
}

export interface Arrival {
    id: string; // BR-timestamp
    supplierName: string; // Changed from 'supplier'
    purchaseOrderId?: string;
    date: string;
    storeId: number;
    lines: ArrivalLine[];
    totalValue: number;
}

export interface Batch {
    batchNumber: string;
    quantity: number;
    cump: number;
    expiryDate: string;
    arrivalId: string;
}

export interface StockLevel {
    [productId: number]: {
        [storeId: number]: Batch[];
    };
}

export interface TransferLine {
    productId: number;
    batchNumber: string;
    sentQuantity: number;
    cump: number;
    expiryDate: string;
    receivedQuantity?: number;
    comment?: string;
}

export interface Transfer {
    id: string; // BT-timestamp
    sourceStoreId: number;
    destinationStoreId: number;
    creationDate: string;
    receptionDate?: string;
    status: 'En Transit' | 'Terminé' | 'Terminé avec Écart';
    lines: TransferLine[];
}

export type LossType = 'Perte en Transit' | 'Invendu' | 'Casse' | 'Périmé' | 'Vol' | 'Offert Client' | 'Écart d\'inventaire';
export interface Loss {
    id: string;
    productId: number;
    quantity: number;
    value: number; // quantity * CUMP at time of loss
    type: LossType;
    date: string;
    storeId?: number; // For store-level losses
    transferId?: string; // For transit losses
    inventoryId?: string; // For inventory adjustments
    batchNumber?: string;
    details: string;
}

export interface InventoryLine {
    productId: number;
    theoreticalQty: number;
    physicalQty: number;
    gap: number;
}
export interface Inventory {
    id: string;
    storeId: number;
    creationDate: string;
    validationDate?: string;
    status: 'En Cours' | 'En attente de validation' | 'Validé';
    lines: InventoryLine[];
}

export type ExpenseCategory = 'Loyer' | 'Salaires' | 'Électricité & Eau' | 'Marketing' | 'Maintenance' | 'Fournitures' | 'Services bancaires' | 'Autre';
export interface Expense {
    id: number;
    storeId: number;
    date: string;
    category: ExpenseCategory;
    amount: number;
    description: string;
    status: 'En attente' | 'Approuvé';
}

export interface BankStatementLine {
    id: string;
    date: string;
    description: string;
    amount: number;
}

export interface BankStatement {
    id: string;
    bankName: string;
    accountNumber: string;
    startDate: string;
    endDate: string;
    startBalance: number;
    endBalance: number;
    lines: BankStatementLine[];
}

export interface RecipeLine {
    productId: number; // component product ID
    quantity: number;
}

export interface ProductionRecipe {
    id: string;
    name: string; // "Fiche Technique: Filets de Thon"
    outputProductId: number;
    lines: RecipeLine[];
}

export interface ProductionOrder {
    id: string; // OF-timestamp
    recipeId: string;
    plannedQuantity: number;
    actualQuantity?: number;
    creationDate: string;
    completionDate?: string;
    status: 'Planifié' | 'En Cours' | 'Terminé';
    cost?: number;
}

export interface Supplier {
  id: number;
  name: string;
  contactPerson: string;
  contactEmail: string;
  phone: string;
  address: string;
  paymentTerms: 'À réception' | '30 jours' | '60 jours';
}

export interface PurchaseOrderLine {
    productId: number;
    quantity: number;
    unitCost: number;
    subtotal: number;
}

export interface PurchaseOrder {
    id: string; // BC-timestamp
    supplierId: number;
    orderDate: string;
    expectedDeliveryDate: string;
    status: 'Brouillon' | 'Envoyée' | 'Terminé';
    lines: PurchaseOrderLine[];
    totalValue: number;
}

export interface Client {
    id: number;
    name: string;
    companyName: string;
    email: string;
    phone: string;
    address: string;
    paymentTerms: 'À la livraison' | '15 jours' | '30 jours';
}

export interface SalesOrderLine {
    salesUnitId: number;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    costOfGoodsSold?: number;
}

export interface SalesOrder {
    id: string; // CV-timestamp
    clientId: number;
    orderDate: string;
    deliveryDate: string;
    status: 'Confirmée' | 'En préparation' | 'Livrée' | 'Facturée';
    lines: SalesOrderLine[];
    totalValue: number;
    totalCostOfGoodsSold?: number;
    grossMargin?: number;
}

export interface InvoiceLine {
    description: string; // e.g., "Thon au Kg"
    quantity: number;
    unitPrice: number;
    subtotal: number;
}

export interface Invoice {
    id: string; // FAC-timestamp
    salesOrderId: string;
    clientId: number;
    invoiceDate: string;
    dueDate: string;
    lines: InvoiceLine[];
    totalValue: number;
    status: 'Brouillon' | 'Envoyée' | 'Payée' | 'En Retard';
}

export type BudgeableCategory = ExpenseCategory | 'Chiffre d\'Affaires';

export interface BudgetLine {
    id: string; // e.g., "2-Loyer"
    storeId: number;
    category: BudgeableCategory;
    budgetedAmount: number;
}

export interface Budget {
    id: string; // e.g., "2025-08"
    period: string; // Format "YYYY-MM"
    lines: BudgetLine[];
}


export interface AppContextType {
    showToast: (message: string) => void;
    openModal: (key: ModalKey, props?: any) => void;
    closeModal: () => void;

    // State
    products: Product[];
    users: User[];
    employees: Employee[];
    stores: Store[];
    suppliers: Supplier[];
    clients: Client[];
    purchaseOrders: PurchaseOrder[];
    salesOrders: SalesOrder[];
    invoices: Invoice[];
    salesUnits: SalesUnit[];
    salesClosures: SaleClosure[];
    auditLogs: AuditLog[];
    notifications: Notification[];
    stockLevels: StockLevel;
    arrivals: Arrival[];
    transfers: Transfer[];
    losses: Loss[];
    inventories: Inventory[];
    expenses: Expense[];
    bankStatements: BankStatement[];
    reconciledJournalEntryIds: string[];
    reconciledBankStatementLineIds: string[];
    productionRecipes: ProductionRecipe[];
    productionOrders: ProductionOrder[];
    budgets: Budget[];
    isGenerating: boolean;
    aiResponse: string;
    
    // Actions
    addProduct: (product: Omit<Product, 'id'>) => void;
    updateProduct: (product: Product) => void;
    addSalesUnit: (salesUnit: Omit<SalesUnit, 'id'>) => void;
    updateSalesUnit: (salesUnit: SalesUnit) => void;
    updateProductPrice: (productId: number, newPrice: number) => void;
    addUser: (user: Omit<User, 'id'>) => void;
    updateUser: (user: User) => void;
    addEmployee: (employee: Omit<Employee, 'id'>) => void;
    updateEmployee: (employee: Employee) => void;
    addStore: (store: Omit<Store, 'id'>) => void;
    updateStore: (store: Store) => void;
    addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
    updateSupplier: (supplier: Supplier) => void;
    addClient: (client: Omit<Client, 'id'>) => void;
    updateClient: (client: Client) => void;
    addPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'status'>) => void;
    addSalesOrder: (so: Omit<SalesOrder, 'id' | 'status'>) => void;
    updateSalesOrderStatus: (orderId: string, status: SalesOrder['status']) => void;
    markInvoiceAsPaid: (invoiceId: string) => void;
    addArrival: (arrival: Omit<Arrival, 'id'>) => void;
    createTransfer: (data: Omit<Transfer, 'id' | 'status' | 'creationDate' | 'lines'> & { lines: { productId: number; sentQuantity: number }[] }) => boolean;
    receiveTransfer: (transferId: string, receivedLines: { productId: number; batchNumber: string; receivedQuantity: number; comment?: string }[]) => void;
    declareLoss: (data: { productId: number; quantity: number; type: Exclude<LossType, 'Perte en Transit' | 'Écart d\'inventaire'>; storeId: number; comment: string }) => void;
    addSaleClosure: (closure: Omit<SaleClosure, 'id'>) => void;
    validateSaleClosure: (closureId: number) => void;
    markNotificationsAsRead: () => void;
    createInventory: (storeId: number) => void;
    submitInventory: (inventoryId: string, lines: { productId: number; physicalQty: number }[]) => void;
    validateInventory: (inventoryId: string) => void;
    correctAndValidateInventory: (inventoryId: string, lines: { productId: number; physicalQty: number }[]) => void;
    addExpense: (expense: Omit<Expense, 'id' | 'status'>) => void;
    approveExpense: (expenseId: number) => void;
    updateExpense: (expense: Expense) => void;
    reconcileEntries: (journalEntryIds: string[], bankStatementLineIds: string[]) => void;
    addProductionRecipe: (recipe: Omit<ProductionRecipe, 'id'>) => void;
    createProductionOrder: (order: Omit<ProductionOrder, 'id' | 'status' | 'creationDate'>) => void;
    startProductionOrder: (orderId: string) => void;
    completeProductionOrder: (orderId: string, actualQuantity: number) => boolean;
    addBudget: (budget: Omit<Budget, 'id'>) => void;
    updateBudget: (budget: Budget) => void;
    getAiAnalysis: (prompt: string) => Promise<void>;
}