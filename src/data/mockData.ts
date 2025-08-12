/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Product, SalesUnit, User, Employee, Store, SaleClosure, StockLevel, Transfer, Loss, Inventory, Expense, Arrival, BankStatement, ProductionRecipe, ProductionOrder, Supplier, PurchaseOrder, Client, SalesOrder, Invoice, Budget } from '../types';

export const productsData: Product[] = [
  { id: 1, name: 'Thon Rouge', stockUnit: 'kg', priceType: 'Variable', basePrice: 6500, productType: 'Matière Première' },
  { id: 2, name: 'Crevettes Roses', stockUnit: 'kg', priceType: 'Variable', basePrice: 8000, productType: 'Matière Première' },
  { id: 3, name: 'Soles', stockUnit: 'kg', priceType: 'Variable', basePrice: 4500, productType: 'Matière Première' },
  { id: 4, name: 'Bars', stockUnit: 'kg', priceType: 'Fixe', basePrice: 3500, productType: 'Matière Première' },
  { id: 5, name: 'Sardines', stockUnit: 'kg', priceType: 'Fixe', basePrice: 1500, productType: 'Matière Première' },
  { id: 6, name: 'Mérou', stockUnit: 'kg', priceType: 'Variable', basePrice: 5500, productType: 'Matière Première' },
  { id: 7, name: 'Huîtres', stockUnit: 'douzaine', priceType: 'Fixe', basePrice: 4000, productType: 'Matière Première' },
  { id: 8, name: 'Langoustes', stockUnit: 'kg', priceType: 'Variable', basePrice: 12000, productType: 'Matière Première' },
  { id: 101, name: 'Filets de Thon (par 2)', stockUnit: 'unité', priceType: 'Fixe', basePrice: 4200, productType: 'Produit Fini' },
  { id: 102, name: 'Brochettes de Mérou (unité)', stockUnit: 'unité', priceType: 'Fixe', basePrice: 2500, productType: 'Produit Fini' },
];
export const salesUnitsData: SalesUnit[] = [
  { id: 1, name: 'Thon au Kg', baseProduct: 'Thon Rouge', price: 6500, factor: 1 },
  { id: 2, name: 'Pack de Thon 500g', baseProduct: 'Thon Rouge', price: 3500, factor: 0.5 },
  { id: 3, name: 'Crevettes au Kg', baseProduct: 'Crevettes Roses', price: 8000, factor: 1 },
  { id: 4, name: 'Barquette Crevettes 250g', baseProduct: 'Crevettes Roses', price: 2200, factor: 0.25 },
  { id: 5, name: 'Mérou au Kg', baseProduct: 'Mérou', price: 5500, factor: 1 },
  { id: 6, name: 'La douzaine d\'Huîtres', baseProduct: 'Huîtres', price: 4000, factor: 1 },
  { id: 7, name: 'Langouste au Kg', baseProduct: 'Langoustes', price: 12000, factor: 1 },
  { id: 8, name: 'Filets de Thon (la paire)', baseProduct: 'Filets de Thon (par 2)', price: 4200, factor: 1 },
  { id: 9, name: 'Brochette de Mérou', baseProduct: 'Brochettes de Mérou (unité)', price: 2500, factor: 1 },
];
export const usersData: User[] = [
  { id: 1, name: 'Directeur Général', login: 'directeur', role: 'Directeur', store: 'Tous', status: 'Actif' },
  { id: 2, name: 'Amadou Diallo', login: 'almadies', role: 'Magasin', store: 'Pointe des Almadies', status: 'Actif' },
  { id: 3, name: 'Fatou Diop', login: 'sandaga', role: 'Magasin', store: 'Marché Sandaga', status: 'Actif' }
];
export const employeesData: Employee[] = [
  { id: 1, name: 'Amadou Diallo', store: 'Pointe des Almadies', role: 'Responsable', salary: 180000, status: 'Actif' },
  { id: 2, name: 'Aïcha Ndiaye', store: 'Pointe des Almadies', role: 'Vendeur', salary: 125000, status: 'Actif' },
  { id: 3, name: 'Fatou Diop', store: 'Marché Sandaga', role: 'Responsable', salary: 175000, status: 'Actif' },
  { id: 4, name: 'Moussa Faye', store: 'Marché Sandaga', role: 'Vendeur', salary: 120000, status: 'Actif' }
];
export const storesData: Store[] = [
  { id: 1, name: 'Hub de Distribution', type: 'Hub', address: 'Zone Industrielle, Dakar', status: 'Actif' },
  { id: 2, name: 'Pointe des Almadies', type: 'Magasin', address: 'Almadies, Dakar', status: 'Actif' },
  { id: 3, name: 'Marché Sandaga', type: 'Magasin', address: 'Centre-ville, Dakar', status: 'Actif' }
];

export const suppliersData: Supplier[] = [
    { id: 1, name: 'Pêcheries Atlantiques', contactPerson: 'Moussa Fall', contactEmail: 'contact@pecheries-atlantiques.sn', phone: '33 824 00 01', address: 'Port de Pêche, Dakar', paymentTerms: '30 jours' },
    { id: 2, name: 'Maree du Jour', contactPerson: 'Awa Gueye', contactEmail: 'awa.gueye@maree-jour.sn', phone: '33 824 00 02', address: 'Môle 10, Dakar', paymentTerms: 'À réception' },
];

export const clientsData: Client[] = [
    { id: 1, name: 'Chef Antoine', companyName: 'Le Lagon 1', email: 'chef.antoine@lagon1.sn', phone: '77 123 45 67', address: 'Corniche Est, Dakar', paymentTerms: '30 jours' },
    { id: 2, name: 'Mme. Sy', companyName: 'Hôtel Terrou-Bi', email: 'achats@terroubi.com', phone: '33 839 90 39', address: 'Corniche Ouest, Dakar', paymentTerms: 'À la livraison' },
    { id: 3, name: 'M. Dubois', companyName: 'La Fourchette', email: 'contact@lafourchette.sn', phone: '78 987 65 43', address: 'Almadies, Dakar', paymentTerms: '15 jours' },
];

export const purchaseOrdersData: PurchaseOrder[] = [
    { 
        id: 'BC-1662301300000',
        supplierId: 1,
        orderDate: '2025-08-01',
        expectedDeliveryDate: '2025-08-03',
        status: 'Terminé',
        lines: [
            { productId: 1, quantity: 100, unitCost: 5500, subtotal: 550000 },
            { productId: 2, quantity: 80, unitCost: 7000, subtotal: 560000 },
        ],
        totalValue: 1110000
    },
    { 
        id: 'BC-1662301350000',
        supplierId: 2,
        orderDate: '2025-08-02',
        expectedDeliveryDate: '2025-08-04',
        status: 'Terminé',
        lines: [
            { productId: 6, quantity: 50, unitCost: 5000, subtotal: 250000 },
            { productId: 8, quantity: 20, unitCost: 11000, subtotal: 220000 },
        ],
        totalValue: 470000
    },
    { 
        id: 'BC-1662301480000',
        supplierId: 1,
        orderDate: '2025-08-04',
        expectedDeliveryDate: '2025-08-05',
        status: 'Terminé',
        lines: [
             { productId: 1, quantity: 50, unitCost: 5800, subtotal: 290000 },
        ],
        totalValue: 290000
    },
     { 
        id: 'BC-1662302500000',
        supplierId: 2,
        orderDate: '2025-08-06',
        expectedDeliveryDate: '2025-08-07',
        status: 'Envoyée',
        lines: [
             { productId: 3, quantity: 40, unitCost: 4500, subtotal: 180000 },
             { productId: 4, quantity: 60, unitCost: 3500, subtotal: 210000 },
        ],
        totalValue: 390000
    },
];

export const salesOrdersData: SalesOrder[] = [
    {
        id: 'CV-1662301900000',
        clientId: 1,
        orderDate: '2025-08-05',
        deliveryDate: '2025-08-06',
        status: 'En préparation',
        lines: [
            { salesUnitId: 1, quantity: 10, unitPrice: 7000, subtotal: 70000 }, // Thon au Kg
            { salesUnitId: 7, quantity: 5, unitPrice: 13000, subtotal: 65000 }, // Langouste au Kg
        ],
        totalValue: 135000
    },
    {
        id: 'CV-1662301850000',
        clientId: 2,
        orderDate: '2025-08-04',
        deliveryDate: '2025-08-04',
        status: 'Facturée',
        lines: [
            { salesUnitId: 3, quantity: 20, unitPrice: 8000, subtotal: 160000, costOfGoodsSold: 140000 }, // Crevettes au Kg
        ],
        totalValue: 160000,
        totalCostOfGoodsSold: 140000,
        grossMargin: 20000,
    },
    {
        id: 'CV-1662302000000',
        clientId: 3,
        orderDate: '2025-08-06',
        deliveryDate: '2025-08-06',
        status: 'Confirmée',
        lines: [
            { salesUnitId: 8, quantity: 30, unitPrice: 4200, subtotal: 126000 }, // Filets de Thon
        ],
        totalValue: 126000
    },
];

export const invoicesData: Invoice[] = [
    {
        id: 'FAC-2025-0001',
        salesOrderId: 'CV-1662301850000',
        clientId: 2,
        invoiceDate: '2025-08-05',
        dueDate: '2025-08-05',
        status: 'Envoyée',
        lines: [
            { description: 'Crevettes au Kg', quantity: 20, unitPrice: 8000, subtotal: 160000 },
        ],
        totalValue: 160000,
    }
];


export const arrivalsData: Arrival[] = [
    { 
        id: 'BR-1662301400000', 
        supplierName: 'Pêcheries Atlantiques',
        purchaseOrderId: 'BC-1662301300000',
        date: '2025-08-03', 
        storeId: 1, 
        lines: [ 
            { productId: 1, quantity: 100, unitCost: 5500, subtotal: 550000, batchNumber: 'PA-T-0803', expiryDate: '2025-08-08' }, 
            { productId: 2, quantity: 80, unitCost: 7000, subtotal: 560000, batchNumber: 'PA-C-0803', expiryDate: '2025-08-07' } 
        ], 
        totalValue: 1110000 
    },
    { 
        id: 'BR-1662301450000', 
        supplierName: 'Maree du Jour',
        purchaseOrderId: 'BC-1662301350000',
        date: '2025-08-04', 
        storeId: 1, 
        lines: [ 
            { productId: 6, quantity: 50, unitCost: 5000, subtotal: 250000, batchNumber: 'MDJ-M-0804', expiryDate: '2025-08-09' }, 
            { productId: 8, quantity: 20, unitCost: 11000, subtotal: 220000, batchNumber: 'MDJ-L-0804', expiryDate: '2025-08-08' }
        ], 
        totalValue: 470000 
    },
     { 
        id: 'BR-1662301500000', 
        supplierName: 'Pêcheries Atlantiques',
        purchaseOrderId: 'BC-1662301480000',
        date: '2025-08-05', 
        storeId: 1, 
        lines: [ 
            { productId: 1, quantity: 50, unitCost: 5800, subtotal: 290000, batchNumber: 'PA-T-0805', expiryDate: '2025-08-10' }
        ], 
        totalValue: 290000
    },
];

export const salesClosuresData: SaleClosure[] = [
  { id: 1, storeId: 2, storeName: 'Pointe des Almadies', date: '2025-08-05', total: 105000, status: 'closed', lines: [{id: 1, unitId: 1, qty: 10}, {id: 2, unitId: 3, qty: 5}] },
  { id: 2, storeId: 2, storeName: 'Pointe des Almadies', date: '2025-08-04', total: 74000, status: 'validated', lines: [{id: 3, unitId: 1, qty: 8, costOfGoodsSold: 44000}, {id: 4, unitId: 4, qty: 10, costOfGoodsSold: 17500}], totalCostOfGoodsSold: 61500, grossMargin: 12500 },
  { id: 7, storeId: 3, storeName: 'Marché Sandaga', date: '2025-08-05', total: 67500, status: 'closed', lines: [{id: 13, unitId: 1, qty: 7}, {id: 14, unitId: 5, qty: 4}] },
  { id: 8, storeId: 3, storeName: 'Marché Sandaga', date: '2025-08-04', total: 51000, status: 'validated', lines: [{id: 15, unitId: 1, qty: 6, costOfGoodsSold: 33000}, {id: 16, unitId: 6, qty: 3, costOfGoodsSold: 12000}], totalCostOfGoodsSold: 45000, grossMargin: 6000 },
  { id: 3, storeId: 2, storeName: 'Pointe des Almadies', date: '2025-08-03', total: 98000, status: 'validated', lines: [{id: 5, unitId: 2, qty: 12, costOfGoodsSold: 33000}, {id: 6, unitId: 3, qty: 7, costOfGoodsSold: 49000}], totalCostOfGoodsSold: 82000, grossMargin: 16000 },
  { id: 4, storeId: 2, storeName: 'Pointe des Almadies', date: '2025-08-02', total: 79000, status: 'validated', lines: [{id: 7, unitId: 2, qty: 10, costOfGoodsSold: 27500}, {id: 8, unitId: 4, qty: 20, costOfGoodsSold: 35000}], totalCostOfGoodsSold: 62500, grossMargin: 16500 },
  { id: 5, storeId: 2, storeName: 'Pointe des Almadies', date: '2025-08-01', total: 100000, status: 'validated', lines: [{id: 9, unitId: 1, qty: 8, costOfGoodsSold: 44000}, {id: 10, unitId: 3, qty: 6, costOfGoodsSold: 42000}], totalCostOfGoodsSold: 86000, grossMargin: 14000 },
  { id: 6, storeId: 2, storeName: 'Pointe des Almadies', date: '2025-07-31', total: 74500, status: 'validated', lines: [{id: 11, unitId: 2, qty: 15, costOfGoodsSold: 41250}, {id: 12, unitId: 4, qty: 10, costOfGoodsSold: 17500}], totalCostOfGoodsSold: 58750, grossMargin: 15750 },
];

export const stockLevelsData: StockLevel = {
    1: { // Thon Rouge
        1: [
            { batchNumber: 'PA-T-0803', quantity: 100, cump: 5500, expiryDate: '2025-08-08', arrivalId: 'BR-1662301400000' },
            { batchNumber: 'PA-T-0805', quantity: 30, cump: 5800, expiryDate: '2025-08-10', arrivalId: 'BR-1662301500000' },
        ],
        2: [
            { batchNumber: 'PA-T-0805-TR1', quantity: 15.5, cump: 5800, expiryDate: '2025-08-10', arrivalId: 'BR-1662301500000' },
        ],
        3: [
            { batchNumber: 'PA-T-0805-TR2', quantity: 22, cump: 5800, expiryDate: '2025-08-10', arrivalId: 'BR-1662301500000' },
        ]
    },
    2: { // Crevettes
        1: [
            { batchNumber: 'PA-C-0803', quantity: 65, cump: 7000, expiryDate: '2025-08-07', arrivalId: 'BR-1662301400000' }
        ],
        2: [
             { batchNumber: 'PA-C-0803-TR1', quantity: 8, cump: 7000, expiryDate: '2025-08-07', arrivalId: 'BR-1662301400000' }
        ],
        3: [
            { batchNumber: 'PA-C-0803-TR2', quantity: 12, cump: 7000, expiryDate: '2025-08-07', arrivalId: 'BR-1662301400000' }
        ]
    },
    // ... Simplified data for other products
    3: { 1: [], 3: [{ batchNumber: 'SOL-0802', quantity: 30, cump: 4300, expiryDate: '2025-08-06', arrivalId: '' }] },
    4: { 1: [], 2: [{ batchNumber: 'BAR-0801', quantity: 25, cump: 3500, expiryDate: '2025-08-07', arrivalId: '' }] },
    5: { 1: [], 2: [{ batchNumber: 'SAR-0801', quantity: 40, cump: 1500, expiryDate: '2025-08-05', arrivalId: '' }], 3: [{ batchNumber: 'SAR-0801-TR', quantity: 55, cump: 1500, expiryDate: '2025-08-05', arrivalId: '' }] },
    6: { 1: [{ batchNumber: 'MDJ-M-0804', quantity: 70, cump: 5000, expiryDate: '2025-08-09', arrivalId: 'BR-1662301450000' }], 2: [], 3: [] },
    7: { 1: [], 3: [{ batchNumber: 'HUI-0802', quantity: 15, cump: 4000, expiryDate: '2025-08-12', arrivalId: '' }] },
    8: { 1: [{ batchNumber: 'MDJ-L-0804', quantity: 25, cump: 11000, expiryDate: '2025-08-08', arrivalId: 'BR-1662301450000' }], 2: [] },
};

export const transfersData: Transfer[] = [
    {
        id: 'BT-1662301500000',
        sourceStoreId: 1,
        destinationStoreId: 2,
        creationDate: '2025-08-04',
        status: 'En Transit',
        lines: [
            { productId: 1, batchNumber: 'PA-T-0803', sentQuantity: 20, cump: 5500, expiryDate: '2025-08-08' },
            { productId: 2, batchNumber: 'PA-C-0803', sentQuantity: 15, cump: 7000, expiryDate: '2025-08-07' },
        ],
    },
    {
        id: 'BT-1662200100000',
        sourceStoreId: 1,
        destinationStoreId: 3,
        creationDate: '2025-08-02',
        receptionDate: '2025-08-02',
        status: 'Terminé',
        lines: [
            { productId: 3, batchNumber: 'SOL-0802', sentQuantity: 30, receivedQuantity: 30, cump: 4300, expiryDate: '2025-08-06' },
            { productId: 7, batchNumber: 'HUI-0802', sentQuantity: 15, receivedQuantity: 15, cump: 4000, expiryDate: '2025-08-12' },
        ],
    },
    {
        id: 'BT-1662100100000',
        sourceStoreId: 1,
        destinationStoreId: 2,
        creationDate: '2025-08-01',
        receptionDate: '2025-08-01',
        status: 'Terminé avec Écart',
        lines: [
            { productId: 5, batchNumber: 'SAR-0801-BASE', sentQuantity: 50, receivedQuantity: 48, comment: "Carton abîmé, 2kg manquants", cump: 1500, expiryDate: '2025-08-05' }
        ],
    }
];

export const lossesData: Loss[] = [
    { id: 'L-1662301600000', productId: 2, quantity: 1.5, value: 10500, type: 'Invendu', date: '2025-08-04', storeId: 2, batchNumber: 'PA-C-0803-TR1', details: 'Fin de journée' },
    { id: 'L-1662301650000', productId: 5, quantity: 2, value: 3000, type: 'Perte en Transit', date: '2025-08-01', storeId: 2, transferId: 'BT-1662100100000', batchNumber: 'SAR-0801-BASE', details: 'Carton abîmé, 2kg manquants' }
];
export const inventoriesData: Inventory[] = [
    {
        id: 'INV-1662000100000',
        storeId: 2,
        creationDate: '2025-07-28',
        validationDate: '2025-07-28',
        status: 'Validé',
        lines: [
            { productId: 1, theoreticalQty: 25, physicalQty: 24.5, gap: -0.5 },
            { productId: 4, theoreticalQty: 30, physicalQty: 30, gap: 0 },
        ],
    },
    {
        id: 'INV-1662301700000',
        storeId: 3,
        creationDate: '2025-08-05',
        status: 'En attente de validation',
        lines: [
            { productId: 3, theoreticalQty: 30, physicalQty: 28, gap: -2 },
            { productId: 5, theoreticalQty: 55, physicalQty: 55, gap: 0 },
            { productId: 7, theoreticalQty: 15, physicalQty: 16, gap: 1 },
        ],
    }
];

export const expensesData: Expense[] = [
    { id: 1, storeId: 2, date: '2025-08-04', category: 'Électricité & Eau', amount: 45000, description: 'Facture Senelec', status: 'Approuvé' },
    { id: 2, storeId: 2, date: '2025-08-05', category: 'Fournitures', amount: 12500, description: 'Achat de sacs et emballages', status: 'En attente' },
    { id: 3, storeId: 3, date: '2025-08-03', category: 'Loyer', amount: 250000, description: 'Loyer mensuel Sandaga', status: 'Approuvé' },
    { id: 4, storeId: 3, date: '2025-08-05', category: 'Maintenance', amount: 25000, description: 'Réparation vitrine', status: 'En attente' },
    { id: 5, storeId: 2, date: '2025-08-01', category: 'Marketing', amount: 50000, description: 'Flyers promotionnels', status: 'Approuvé' },
    { id: 6, storeId: 1, date: '2025-08-05', category: 'Services bancaires', amount: 4500, description: 'Frais tenue de compte Aout', status: 'Approuvé' },
];

export const bankStatementsData: BankStatement[] = [
    {
        id: 'BS-2025-08',
        bankName: 'Banque Atlantique',
        accountNumber: 'SN012 01011 012345678901 24',
        startDate: '2025-08-01',
        endDate: '2025-08-05',
        startBalance: 2000000,
        endBalance: 64500,
        lines: [
            { id: 'BSL-1', date: '2025-08-03', description: 'VIREMENT LOYER SANDAGA', amount: -250000 },
            { id: 'BSL-2', date: '2025-08-04', description: 'PAIEMENT VIREMENT SENELEC', amount: -45000 },
            { id: 'BSL-3', date: '2025-08-04', description: 'VIREMENT SALAIRES AOUT 2025', amount: -600000 },
            { id: 'BSL-4', date: '2025-08-05', description: 'VIREMENT FSS PECHERIES ATLANTIQUES', amount: -1110000 },
            { id: 'BSL-5', date: '2025-08-05', description: 'VERSEMENT ESPECES VENTES ALMADIES', amount: 74000 },
            { id: 'BSL-6', date: '2025-08-05', description: 'FRAIS TENUE DE COMPTE', amount: -4500 },
        ]
    }
];

export const productionRecipesData: ProductionRecipe[] = [
    { 
        id: 'REC-1', 
        name: 'Fiche Technique: Filets de Thon (par 2)',
        outputProductId: 101, 
        lines: [
            { productId: 1, quantity: 0.6 } // 0.6 kg de Thon Rouge
        ]
    },
    { 
        id: 'REC-2', 
        name: 'Fiche Technique: Brochettes de Mérou',
        outputProductId: 102, 
        lines: [
            { productId: 6, quantity: 0.2 } // 0.2 kg de Mérou
        ]
    },
];

export const productionOrdersData: ProductionOrder[] = [
    {
        id: 'OF-1662301800000',
        recipeId: 'REC-1',
        plannedQuantity: 50,
        creationDate: '2025-08-06',
        status: 'Planifié',
    },
    {
        id: 'OF-1662301700000',
        recipeId: 'REC-2',
        plannedQuantity: 100,
        creationDate: '2025-08-05',
        status: 'En Cours',
    },
    {
        id: 'OF-1662301600000',
        recipeId: 'REC-1',
        plannedQuantity: 30,
        actualQuantity: 29,
        creationDate: '2025-08-04',
        completionDate: '2025-08-04',
        status: 'Terminé',
        cost: 50460, // (30 * 0.6kg * 5500) + (10 * 0.6kg * 5800) -> cost was manually calculated for mock
    }
];

export const budgetsData: Budget[] = [
  {
    id: '2025-08',
    period: '2025-08',
    lines: [
      // Store 2: Pointe des Almadies
      { id: '2-Chiffre d\'Affaires', storeId: 2, category: 'Chiffre d\'Affaires', budgetedAmount: 450000 },
      { id: '2-Salaires', storeId: 2, category: 'Salaires', budgetedAmount: 305000 },
      { id: '2-Fournitures', storeId: 2, category: 'Fournitures', budgetedAmount: 15000 },
      { id: '2-Électricité & Eau', storeId: 2, category: 'Électricité & Eau', budgetedAmount: 50000 },
      { id: '2-Marketing', storeId: 2, category: 'Marketing', budgetedAmount: 50000 },
      { id: '2-Autre', storeId: 2, category: 'Autre', budgetedAmount: 10000 },

      // Store 3: Marché Sandaga
      { id: '3-Chiffre d\'Affaires', storeId: 3, category: 'Chiffre d\'Affaires', budgetedAmount: 300000 },
      { id: '3-Loyer', storeId: 3, category: 'Loyer', budgetedAmount: 250000 },
      { id: '3-Salaires', storeId: 3, category: 'Salaires', budgetedAmount: 295000 },
      { id: '3-Maintenance', storeId: 3, category: 'Maintenance', budgetedAmount: 20000 },
    ]
  }
];
