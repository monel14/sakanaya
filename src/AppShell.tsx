/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useMemo, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Modal from './components/Modal';
import { ToastContainer } from './components/Toast';

import { AppProvider } from './contexts/AppContext';
import useToast from './hooks/useToast';
import useModal from './hooks/useModal';

// Views
import DirectorDashboard from './views/DirectorDashboard';
import StoreDashboard from './views/StoreDashboard';
import HRView from './views/HrManagement';
import AdminHubView from './views/AdminView';
import PricesView from './views/PricesView';

// Hubs
import FinanceHub from './views/FinanceHub';
import ProductHub from './views/ProductHub';
import ProductionHub from './views/ProductionHub';
import AchatsHub from './views/AchatsHub';
import VentesHub from './views/VentesHub';
import ReportsHub from './views/ReportsHub';
import StoreFinanceHub from './views/StoreFinanceHub';
import StockHub from './views/StockHub';
import StoreStockHub from './views/StoreStockHub';
import CashFlowHub from './views/CashFlowHub';
import DecisionSupportHub from './views/DecisionSupportHub';
import AccountingView from './views/AccountingView';


import { productsData, usersData, employeesData, storesData, salesUnitsData, salesClosuresData, stockLevelsData, transfersData, lossesData, inventoriesData, expensesData, arrivalsData, bankStatementsData, productionRecipesData, productionOrdersData, suppliersData, purchaseOrdersData, clientsData, salesOrdersData, invoicesData, budgetsData } from './data/mockData';
import type { Product, User, Employee, Store, SalesUnit, SaleClosure, AuditLog, Notification, StockLevel, Arrival, Transfer, Loss, TransferLine, Inventory, InventoryLine, LossType, Expense, Batch, SaleLine, BankStatement, ProductionRecipe, ProductionOrder, Supplier, PurchaseOrder, Client, SalesOrder, Invoice, Budget } from './types';
import type { CurrentUser } from './App';

interface AppShellProps {
    currentUser: CurrentUser;
    onLogout: () => void;
}

export default function AppShell({ currentUser, onLogout }: AppShellProps) {
  const [view, setView] = useState(currentUser.role === 'Directeur' ? 'director-dashboard' : 'store-dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // --- Global State Management ---
  const { toasts, showToast } = useToast();
  const { modalKey, modalContent, openModal, closeModal } = useModal(showToast);
  
  const [products, setProducts] = useState<Product[]>(productsData);
  const [users, setUsers] = useState<User[]>(usersData);
  const [employees, setEmployees] = useState<Employee[]>(employeesData);
  const [stores, setStores] = useState<Store[]>(storesData);
  const [suppliers, setSuppliers] = useState<Supplier[]>(suppliersData);
  const [clients, setClients] = useState<Client[]>(clientsData);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(purchaseOrdersData);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(salesOrdersData);
  const [invoices, setInvoices] = useState<Invoice[]>(invoicesData);
  const [salesClosures, setSalesClosures] = useState<SaleClosure[]>(salesClosuresData);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stockLevels, setStockLevels] = useState<StockLevel>(stockLevelsData);
  const [arrivals, setArrivals] = useState<Arrival[]>(arrivalsData);
  const [transfers, setTransfers] = useState<Transfer[]>(transfersData);
  const [losses, setLosses] = useState<Loss[]>(lossesData);
  const [inventories, setInventories] = useState<Inventory[]>(inventoriesData);
  const [salesUnits, setSalesUnits] = useState<SalesUnit[]>(salesUnitsData);
  const [expenses, setExpenses] = useState<Expense[]>(expensesData);
  const [bankStatements, setBankStatements] = useState<BankStatement[]>(bankStatementsData);
  const [reconciledJournalEntryIds, setReconciledJournalEntryIds] = useState<string[]>([]);
  const [reconciledBankStatementLineIds, setReconciledBankStatementLineIds] = useState<string[]>([]);
  const [productionRecipes, setProductionRecipes] = useState<ProductionRecipe[]>(productionRecipesData);
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>(productionOrdersData);
  const [budgets, setBudgets] = useState<Budget[]>(budgetsData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResponse, setAiResponse] = useState('');

  const navigateTo = useCallback((viewId: string) => {
    setView(viewId);
    window.scrollTo({top: 0, behavior: 'smooth'});
  }, []);

  // --- Business Logic & Actions ---
  const addLog = useCallback((action: string, details: string) => {
    const newLog: AuditLog = { id: Date.now(), user: currentUser.name, action, details, date: new Date() };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 99)]);
  }, [currentUser.name]);

  const addNotification = useCallback((message: string) => {
      const newNotif: Notification = { id: Date.now(), message, read: false, date: new Date() };
      setNotifications(prev => [newNotif, ...prev.slice(0, 99)]);
  }, []);

  const getAiAnalysis = async (userPrompt: string) => {
      if (isGenerating) return;
      setIsGenerating(true);
      setAiResponse('');
      addLog('AI_ANALYSIS_START', `User prompt: "${userPrompt}"`);

      try {
        if (!process.env.API_KEY) {
            throw new Error("La clé API n'est pas configurée.");
        }
        const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

        const dataContext = `
            Contexte de données (en JSON):
            - Clôtures de ventes: ${JSON.stringify(salesClosures)}
            - Niveaux de stock: ${JSON.stringify(stockLevels)}
            - Catalogue produits: ${JSON.stringify(products)}
            - Pertes récentes: ${JSON.stringify(losses)}
            - Dépenses récentes: ${JSON.stringify(expenses)}
        `;

        const fullPrompt = `${userPrompt}\n\n${dataContext}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                systemInstruction: "Tu es un analyste commercial expert pour Sakanaya, une chaîne de poissonneries. Fournis des analyses claires, concises et exploitables en français. Formatte ta réponse en utilisant des titres (avec ##), des listes (avec *) et du texte en gras (avec **) pour une meilleure lisibilité.",
            },
        });
        
        setAiResponse(response.text);
        addLog('AI_ANALYSIS_SUCCESS', `AI analysis generated.`);

      } catch (error) {
          console.error("Erreur lors de la génération de l'analyse IA:", error);
          const errorMessage = `Désolé, une erreur est survenue. ${error.message || ''}`;
          setAiResponse(errorMessage);
          showToast(errorMessage);
          addLog('AI_ANALYSIS_ERROR', `Error: ${error.message}`);
      } finally {
          setIsGenerating(false);
      }
  };

  const markNotificationsAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = { ...product, id: Date.now() };
    setProducts(prev => [...prev, newProduct]);
    addLog('CREATE_PRODUCT', `Produit "${product.name}" ajouté.`);
    showToast('Produit ajouté avec succès');
  };

  const updateProduct = (product: Product) => {
    setProducts(prev => prev.map(p => p.id === product.id ? product : p));
    addLog('UPDATE_PRODUCT', `Produit "${product.name}" mis à jour.`);
    showToast('Produit mis à jour.');
  };

  const addSalesUnit = (salesUnit: Omit<SalesUnit, 'id'>) => {
    const newSalesUnit = { ...salesUnit, id: Date.now() };
    setSalesUnits(prev => [...prev, newSalesUnit]);
    addLog('CREATE_SALES_UNIT', `Unité de vente "${salesUnit.name}" créée.`);
    showToast('Unité de vente ajoutée avec succès');
  };

  const updateSalesUnit = (salesUnit: SalesUnit) => {
    setSalesUnits(prev => prev.map(su => su.id === salesUnit.id ? salesUnit : su));
    addLog('UPDATE_SALES_UNIT', `Unité de vente "${salesUnit.name}" mise à jour.`);
    showToast('Unité de vente mise à jour.');
  };

  const updateProductPrice = (productId: number, newPrice: number) => {
    let oldPrice = 0;
    let productName = '';
    setProducts(products.map(p => {
      if (p.id === productId) {
        oldPrice = p.basePrice;
        productName = p.name;
        return { ...p, basePrice: newPrice };
      }
      return p;
    }));
    addLog('UPDATE_PRICE', `Prix de "${productName}" changé de ${oldPrice} à ${newPrice} CFA.`);
  };
  
  const addUser = (user: Omit<User, 'id'>) => {
    const newUser = { ...user, id: Date.now() };
    setUsers(prev => [...prev, newUser]);
    addLog('CREATE_USER', `Utilisateur "${user.name}" créé.`);
    showToast('Utilisateur ajouté avec succès');
  };
  
  const updateUser = (user: User) => {
    setUsers(prev => prev.map(u => u.id === user.id ? user : u));
    addLog('UPDATE_USER', `Utilisateur "${user.name}" mis à jour.`);
    showToast('Utilisateur mis à jour.');
  };

  const addEmployee = (employee: Omit<Employee, 'id'>) => {
    const newEmployee = { ...employee, id: Date.now() };
    setEmployees(prev => [...prev, newEmployee]);
    addLog('CREATE_EMPLOYEE', `Employé "${employee.name}" ajouté.`);
    showToast('Employé ajouté avec succès');
  };

  const updateEmployee = (employee: Employee) => {
    setEmployees(prev => prev.map(e => e.id === employee.id ? employee : e));
    addLog('UPDATE_EMPLOYEE', `Employé "${employee.name}" mis à jour.`);
    showToast('Employé mis à jour.');
  };
  
  const addStore = (store: Omit<Store, 'id'>) => {
    const newStore = { ...store, id: Date.now() };
    setStores(prev => [...prev, newStore]);
    addLog('CREATE_STORE', `Magasin "${store.name}" ajouté.`);
    showToast('Magasin ajouté avec succès');
  };
  
  const updateStore = (store: Store) => {
    setStores(prev => prev.map(s => s.id === store.id ? store : s));
    addLog('UPDATE_STORE', `Magasin "${store.name}" mis à jour.`);
    showToast('Magasin mis à jour.');
  };
  
    const addSupplier = (supplier: Omit<Supplier, 'id'>) => {
        const newSupplier = { ...supplier, id: Date.now() };
        setSuppliers(prev => [...prev, newSupplier]);
        addLog('CREATE_SUPPLIER', `Fournisseur "${supplier.name}" créé.`);
        showToast('Fournisseur ajouté.');
    };

    const updateSupplier = (supplier: Supplier) => {
        setSuppliers(prev => prev.map(s => s.id === supplier.id ? supplier : s));
        addLog('UPDATE_SUPPLIER', `Fournisseur "${supplier.name}" mis à jour.`);
        showToast('Fournisseur mis à jour.');
    };

    const addClient = (client: Omit<Client, 'id'>) => {
        const newClient = { ...client, id: Date.now() };
        setClients(prev => [...prev, newClient]);
        addLog('CREATE_CLIENT', `Client "${client.companyName}" créé.`);
        showToast('Client ajouté.');
    };

    const updateClient = (client: Client) => {
        setClients(prev => prev.map(c => c.id === client.id ? client : c));
        addLog('UPDATE_CLIENT', `Client "${client.companyName}" mis à jour.`);
        showToast('Client mis à jour.');
    };

    const addPurchaseOrder = (po: Omit<PurchaseOrder, 'id' | 'status'>) => {
        const newPo = { ...po, id: `BC-${Date.now()}`, status: 'Envoyée' as const };
        setPurchaseOrders(prev => [newPo, ...prev]);
        const supplierName = suppliers.find(s => s.id === po.supplierId)?.name || '';
        addLog('CREATE_PO', `Bon de commande ${newPo.id} créé pour ${supplierName}.`);
        showToast('Bon de commande créé.');
    };
    
    const addSalesOrder = (so: Omit<SalesOrder, 'id' | 'status'>) => {
        const newSo = { ...so, id: `CV-${Date.now()}`, status: 'Confirmée' as const };
        setSalesOrders(prev => [newSo, ...prev]);
        const clientName = clients.find(c => c.id === so.clientId)?.companyName || '';
        addLog('CREATE_SO', `Commande de vente ${newSo.id} créée pour ${clientName}.`);
        showToast('Commande de vente créée.');
    };

    const generateInvoice = useCallback((order: SalesOrder) => {
        const client = clients.find(c => c.id === order.clientId);
        if (!client) return;

        const invoiceDate = new Date();
        const dueDate = new Date();
        const paymentTermsDays = parseInt(client.paymentTerms.split(' ')[0]) || 0;
        dueDate.setDate(invoiceDate.getDate() + paymentTermsDays);

        const newInvoice: Invoice = {
            id: `FAC-${invoiceDate.getFullYear()}-${(invoices.length + 1).toString().padStart(4, '0')}`,
            salesOrderId: order.id,
            clientId: order.clientId,
            invoiceDate: invoiceDate.toISOString().slice(0, 10),
            dueDate: dueDate.toISOString().slice(0, 10),
            lines: order.lines.map(line => {
                const salesUnit = salesUnits.find(su => su.id === line.salesUnitId);
                return {
                    description: salesUnit?.name || 'Produit inconnu',
                    quantity: line.quantity,
                    unitPrice: line.unitPrice,
                    subtotal: line.subtotal
                }
            }),
            totalValue: order.totalValue,
            status: 'Envoyée'
        };

        setInvoices(prev => [newInvoice, ...prev]);
        addLog('INVOICE_GENERATED', `Facture ${newInvoice.id} générée pour la commande ${order.id}.`);
        showToast(`Facture ${newInvoice.id} créée.`);
    }, [clients, invoices, salesUnits, addLog, showToast]);

    const updateSalesOrderStatus = useCallback((orderId: string, status: SalesOrder['status']) => {
        let order = salesOrders.find(o => o.id === orderId);
        if (!order) return;

        if (status === 'Livrée') {
            const deliveryHubId = 1; // Assume deliveries ship from Hub
            let stockErrors: string[] = [];
            let orderTotalCost = 0;
            const updatedLines: SalesOrder['lines'] = [];

            const newStock = JSON.parse(JSON.stringify(stockLevels));

            for (const line of order.lines) {
                const salesUnit = salesUnits.find(su => su.id === line.salesUnitId);
                if (!salesUnit) { stockErrors.push(`Unité de vente ${line.salesUnitId} non trouvée.`); continue; }

                const product = products.find(p => p.name === salesUnit.baseProduct);
                if (!product) { stockErrors.push(`Produit de base ${salesUnit.baseProduct} non trouvé.`); continue; }

                const batches = newStock[product.id]?.[deliveryHubId];
                if (!batches || batches.length === 0) {
                    stockErrors.push(`Stock vide pour ${product.name} au Hub.`); continue;
                }

                let quantityToConsume = line.quantity * salesUnit.factor;
                let lineCost = 0;
                
                batches.sort((a: Batch, b: Batch) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

                for (const batch of batches) {
                    if (quantityToConsume <= 0) break;
                    const amountFromBatch = Math.min(batch.quantity, quantityToConsume);
                    lineCost += amountFromBatch * batch.cump;
                    batch.quantity -= amountFromBatch;
                    quantityToConsume -= amountFromBatch;
                }

                if (quantityToConsume > 0.001) {
                    stockErrors.push(`Stock insuffisant pour ${product.name}. Manque ${quantityToConsume.toFixed(2)} ${product.stockUnit}`);
                }
                
                orderTotalCost += lineCost;
                updatedLines.push({ ...line, costOfGoodsSold: lineCost });
            }

            if (stockErrors.length > 0) {
                showToast(`Erreurs: ${stockErrors.join('; ')}`);
                addLog('DELIVER_SO_ERROR', `Erreurs pour ${orderId}: ${stockErrors.join(', ')}`);
                return; 
            }
            
            setStockLevels(newStock);

            order = {
                ...order,
                status: 'Livrée',
                lines: updatedLines,
                totalCostOfGoodsSold: orderTotalCost,
                grossMargin: order.totalValue - orderTotalCost
            };
            addLog('DELIVER_SO', `Commande ${orderId} livrée. Coût: ${orderTotalCost.toFixed(0)}`);
            showToast('Commande livrée, stock mis à jour.');
        
        } else if (status === 'Facturée') {
            generateInvoice(order);
            order = { ...order, status };
        } else {
             order = { ...order, status };
             addLog('UPDATE_SO_STATUS', `Statut de la commande ${orderId} changé à ${status}.`);
             showToast(`Commande ${orderId} mise à jour.`);
        }

        setSalesOrders(prev => prev.map(o => o.id === orderId ? order! : o));
    }, [salesOrders, stockLevels, salesUnits, products, generateInvoice, addLog, showToast]);
    
    const markInvoiceAsPaid = useCallback((invoiceId: string) => {
        setInvoices(prev => prev.map(inv => {
            if (inv.id === invoiceId) {
                addLog('INVOICE_PAID', `Facture ${invoiceId} marquée comme payée.`);
                showToast(`Facture ${invoiceId} payée.`);
                return { ...inv, status: 'Payée' };
            }
            return inv;
        }));
    }, [addLog, showToast]);

  const addArrival = (arrivalData: Omit<Arrival, 'id'>) => {
      const newArrival: Arrival = { ...arrivalData, id: `BR-${Date.now()}`};
      setArrivals(prev => [newArrival, ...prev]);
      
      // Update Purchase Order status if linked
      if (newArrival.purchaseOrderId) {
        setPurchaseOrders(prev => prev.map(po => 
            po.id === newArrival.purchaseOrderId ? { ...po, status: 'Terminé' } : po
        ));
      }

      setStockLevels(prevStock => {
        const newStock = JSON.parse(JSON.stringify(prevStock));
        const storeId = newArrival.storeId;

        newArrival.lines.forEach(line => {
            const { productId, quantity, unitCost, batchNumber, expiryDate } = line;
            if (!newStock[productId]) newStock[productId] = {};
            if (!newStock[productId][storeId]) newStock[productId][storeId] = [];

            const newBatch: Batch = {
                batchNumber,
                quantity,
                cump: unitCost,
                expiryDate,
                arrivalId: newArrival.id,
            };
            newStock[productId][storeId].push(newBatch);
        });
        return newStock;
      });

      const storeName = stores.find(s => s.id === arrivalData.storeId)?.name || 'Inconnu';
      addLog('STOCK_ARRIVAL', `Arrivage vers ${storeName} pour ${arrivalData.totalValue.toLocaleString('fr-FR')} CFA.`);
      addNotification(`Arrivage de ${arrivalData.supplierName} validé.`);
      showToast('Arrivage enregistré et stock mis à jour.');
  };

  const createTransfer = useCallback((data: Omit<Transfer, 'id' | 'status' | 'creationDate' | 'lines'> & { lines: { productId: number; sentQuantity: number }[] }): boolean => {
      const { sourceStoreId, destinationStoreId, lines: requestedLines } = data;
      const newStockLevels = JSON.parse(JSON.stringify(stockLevels));
      const transferLines: TransferLine[] = [];

      for (const reqLine of requestedLines) {
          const batches = newStockLevels[reqLine.productId]?.[sourceStoreId] || [];
          const totalStock = batches.reduce((acc: number, b: Batch) => acc + b.quantity, 0);

          if (totalStock < reqLine.sentQuantity) {
              const productName = products.find(p => p.id === reqLine.productId)?.name || 'Produit inconnu';
              showToast(`Stock insuffisant pour ${productName}. Dispo: ${totalStock}`);
              return false;
          }
          
          batches.sort((a: Batch, b: Batch) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
          
          let quantityToTransfer = reqLine.sentQuantity;
          for (const batch of batches) {
              if (quantityToTransfer <= 0) break;
              const amountFromBatch = Math.min(batch.quantity, quantityToTransfer);
              
              transferLines.push({
                  productId: reqLine.productId,
                  batchNumber: batch.batchNumber,
                  sentQuantity: amountFromBatch,
                  cump: batch.cump,
                  expiryDate: batch.expiryDate,
              });

              batch.quantity -= amountFromBatch;
              quantityToTransfer -= amountFromBatch;
          }
          newStockLevels[reqLine.productId][sourceStoreId] = batches.filter((b: Batch) => b.quantity > 0);
      }
      
      const newTransfer: Transfer = { 
        id: `BT-${Date.now()}`, 
        status: 'En Transit', 
        creationDate: new Date().toISOString().slice(0, 10),
        sourceStoreId,
        destinationStoreId,
        lines: transferLines,
      };
      
      setStockLevels(newStockLevels);
      setTransfers(prev => [newTransfer, ...prev]);
      const sourceStoreName = stores.find(s => s.id === sourceStoreId)?.name;
      const destStoreName = stores.find(s => s.id === data.destinationStoreId)?.name;
      addLog('CREATE_TRANSFER', `Transfert ${newTransfer.id} de ${sourceStoreName} vers ${destStoreName}.`);
      addNotification(`Nouveau transfert vers ${destStoreName}.`);
      showToast('Transfert créé et stock mis à jour.');
      return true;
  }, [stockLevels, products, stores, addLog, addNotification, showToast]);

  const receiveTransfer = useCallback((transferId: string, receivedLinesData: { productId: number; batchNumber: string; receivedQuantity: number; comment?: string }[]) => {
      const transfer = transfers.find(t => t.id === transferId);
      if (!transfer) return;

      setStockLevels(prevStock => {
          const newStock = JSON.parse(JSON.stringify(prevStock));
          const newLosses: Loss[] = [...losses];
          
          const updatedTransferLines = transfer.lines.map(sentLine => {
              const receivedLine = receivedLinesData.find(rl => rl.productId === sentLine.productId && rl.batchNumber === sentLine.batchNumber);
              const receivedQuantity = receivedLine?.receivedQuantity ?? 0;
              const destStoreId = transfer.destinationStoreId;
              
              if (!newStock[sentLine.productId]) newStock[sentLine.productId] = {};
              if (!newStock[sentLine.productId][destStoreId]) newStock[sentLine.productId][destStoreId] = [];

              if (receivedQuantity > 0) {
                 newStock[sentLine.productId][destStoreId].push({
                    batchNumber: `${sentLine.batchNumber}-TR`,
                    quantity: receivedQuantity,
                    cump: sentLine.cump,
                    expiryDate: sentLine.expiryDate,
                    arrivalId: `TR-${transfer.id}`
                 });
              }

              if (sentLine.sentQuantity !== receivedQuantity) {
                  const lossQty = sentLine.sentQuantity - receivedQuantity;
                  if (lossQty > 0) {
                      const newLoss: Loss = { id: `L-${Date.now()}-${sentLine.productId}`, productId: sentLine.productId, quantity: lossQty, value: lossQty * sentLine.cump, type: 'Perte en Transit', date: new Date().toISOString().slice(0, 10), transferId: transfer.id, batchNumber: sentLine.batchNumber, details: `Écart sur transfert ${transfer.id}. Attendu: ${sentLine.sentQuantity}, Reçu: ${receivedQuantity}.` };
                      newLosses.push(newLoss);
                  }
              }
              return { ...sentLine, receivedQuantity, comment: receivedLine?.comment };
          });

          setLosses(newLosses);
          
          const hasDiscrepancy = updatedTransferLines.some(l => l.sentQuantity !== l.receivedQuantity);
          const updatedTransfer: Transfer = { ...transfer, lines: updatedTransferLines, status: hasDiscrepancy ? 'Terminé avec Écart' : 'Terminé', receptionDate: new Date().toISOString().slice(0, 10) };
          setTransfers(prev => prev.map(t => t.id === transferId ? updatedTransfer : t));

          return newStock;
      });

      addLog('RECEIVE_TRANSFER', `Réception du transfert ${transfer.id}.`);
      showToast('Réception validée et stock mis à jour.');
  }, [transfers, losses, showToast, addLog]);

  const declareLoss = useCallback((data: { productId: number; quantity: number; type: Exclude<LossType, 'Perte en Transit' | 'Écart d\'inventaire'>; storeId: number; comment: string }) => {
    const { productId, quantity, type, storeId, comment } = data;
    
    let lossValue = 0;
    
    setStockLevels(prevStock => {
        const newStock = JSON.parse(JSON.stringify(prevStock));
        const batches = newStock[productId]?.[storeId];
        if (!batches) {
            showToast('Erreur: Produit non trouvé en stock.');
            return prevStock;
        }

        batches.sort((a: Batch, b: Batch) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
        
        let quantityToDeduct = quantity;
        let totalLossValue = 0;

        for (const batch of batches) {
            if (quantityToDeduct <= 0) break;
            const amountFromBatch = Math.min(batch.quantity, quantityToDeduct);
            totalLossValue += amountFromBatch * batch.cump;
            batch.quantity -= amountFromBatch;
            quantityToDeduct -= amountFromBatch;
        }

        lossValue = totalLossValue;
        newStock[productId][storeId] = batches.filter((b: Batch) => b.quantity > 0);
        return newStock;
    });

    const newLoss: Loss = {
        id: `L-${Date.now()}`, productId, quantity, value: lossValue, type,
        date: new Date().toISOString().slice(0, 10), storeId, details: comment || 'Aucun commentaire'
    };
    
    setLosses(prev => [newLoss, ...prev]);
    addLog('DECLARE_LOSS', `Déclaration de perte de ${quantity} x ${products.find(p=>p.id===productId)?.name} pour ${type}.`);
  }, [products, addLog, showToast]);


  const createInventory = useCallback((storeId: number) => {
    if (inventories.some(inv => inv.storeId === storeId && inv.status === 'En Cours')) {
        showToast('Un inventaire est déjà en cours pour ce magasin.');
        return;
    }

    const inventoryLines: InventoryLine[] = products.map(product => {
        const batches = stockLevels[product.id]?.[storeId] || [];
        const theoreticalQty = batches.reduce((sum, batch) => sum + batch.quantity, 0);
        return {
            productId: product.id,
            theoreticalQty,
            physicalQty: 0,
            gap: -theoreticalQty,
        };
    }).filter(line => line.theoreticalQty > 0);

    const newInventory: Inventory = {
        id: `INV-${Date.now()}`, storeId, creationDate: new Date().toISOString().slice(0, 10), status: 'En Cours', lines: inventoryLines,
    };

    setInventories(prev => [newInventory, ...prev]);
    const storeName = stores.find(s => s.id === storeId)?.name;
    addLog('CREATE_INVENTORY', `Démarrage de l'inventaire ${newInventory.id} pour ${storeName}.`);
    showToast(`Inventaire pour ${storeName} démarré.`);
  }, [inventories, stockLevels, products, stores, addLog, showToast]);

  const submitInventory = useCallback((inventoryId: string, lines: { productId: number; physicalQty: number }[]) => {
    setInventories(prev => prev.map(inv => {
        if (inv.id === inventoryId) {
            const updatedLines = inv.lines.map(line => {
                const submittedLine = lines.find(l => l.productId === line.productId);
                const physicalQty = submittedLine?.physicalQty ?? line.physicalQty;
                return { ...line, physicalQty, gap: physicalQty - line.theoreticalQty };
            });
            const storeName = stores.find(s => s.id === inv.storeId)?.name;
            addLog('SUBMIT_INVENTORY', `Soumission de l'inventaire ${inventoryId} pour ${storeName}.`);
            addNotification(`L'inventaire pour ${storeName} est en attente de validation.`);
            showToast('Inventaire soumis pour validation.');
            return { ...inv, lines: updatedLines, status: 'En attente de validation' };
        }
        return inv;
    }));
  }, [stores, addLog, addNotification, showToast]);
  
  const validateInventory = useCallback((inventoryId: string) => {
    const inventory = inventories.find(inv => inv.id === inventoryId);
    if (!inventory) return;

    setStockLevels(prevStock => {
        const newStock = JSON.parse(JSON.stringify(prevStock));
        const newLosses: Loss[] = [...losses];

        inventory.lines.forEach(line => {
            const { productId, theoreticalQty, physicalQty } = line;
            const gap = physicalQty - theoreticalQty;
            const batches = newStock[productId]?.[inventory.storeId];
            
            if (!batches || gap === 0) return;

            if (gap < 0) { // Loss
                let lossQty = Math.abs(gap);
                let lossValue = 0;
                batches.sort((a: Batch, b: Batch) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
                for (const batch of batches) {
                    if (lossQty <= 0) break;
                    const amountFromBatch = Math.min(batch.quantity, lossQty);
                    lossValue += amountFromBatch * batch.cump;
                    batch.quantity -= amountFromBatch;
                    lossQty -= amountFromBatch;
                }
                newLosses.push({ id: `L-${Date.now()}-${productId}`, productId, quantity: Math.abs(gap), value: lossValue, type: 'Écart d\'inventaire', date: new Date().toISOString().slice(0, 10), storeId: inventory.storeId, inventoryId: inventory.id, details: `Écart de ${gap}` });
                newStock[productId][inventory.storeId] = batches.filter((b: Batch) => b.quantity > 0);
            } else { // Gain
                const avgCump = batches.reduce((acc: number, b: Batch) => acc + b.cump * b.quantity, 0) / theoreticalQty;
                batches.push({ batchNumber: `INV-GAIN-${Date.now()}`, quantity: gap, cump: avgCump || products.find(p=>p.id===productId)!.basePrice, expiryDate: '2999-12-31', arrivalId: `INV-${inventory.id}`});
            }
        });
        
        setLosses(newLosses);
        return newStock;
    });

    setInventories(prev => prev.map(inv => inv.id === inventoryId ? { ...inv, status: 'Validé', validationDate: new Date().toISOString().slice(0, 10) } : inv));
    const storeName = stores.find(s => s.id === inventory.storeId)?.name;
    addLog('VALIDATE_INVENTORY', `Validation de l'inventaire ${inventory.id} pour ${storeName}. Stock ajusté.`);
    showToast(`Inventaire pour ${storeName} validé et stock mis à jour.`);

  }, [inventories, losses, products, stores, addLog, showToast]);

    const correctAndValidateInventory = useCallback((inventoryId: string, correctedLinesData: { productId: number; physicalQty: number }[]) => {
        const inventory = inventories.find(inv => inv.id === inventoryId);
        if (!inventory) return;

        const correctedInventory = { ...inventory, lines: inventory.lines.map(line => {
            const correctedLine = correctedLinesData.find(l => l.productId === line.productId);
            const physicalQty = correctedLine?.physicalQty ?? line.physicalQty;
            return { ...line, physicalQty, gap: physicalQty - line.theoreticalQty };
        })};

        validateInventory(correctedInventory.id); // Re-use validation logic on corrected data
        // Overwrite inventory with corrected lines
        setInventories(prev => prev.map(inv => inv.id === inventoryId ? {...correctedInventory, status: 'Validé', validationDate: new Date().toISOString().slice(0, 10) } : inv));

        const storeName = stores.find(s => s.id === inventory.storeId)?.name;
        addLog('CORRECT_AND_VALIDATE_INVENTORY', `Inventaire ${inventory.id} (${storeName}) corrigé et validé.`);
        showToast(`Inventaire pour ${storeName} corrigé et validé. Stock mis à jour.`);

    }, [inventories, stores, addLog, showToast, validateInventory]);

  const addSaleClosure = (closureData: Omit<SaleClosure, 'id'>) => {
    const newClosure = { ...closureData, id: Date.now() };
    setSalesClosures(prev => [newClosure, ...prev]);
    addLog('SALE_CLOSURE', `Clôture du magasin ${newClosure.storeName} pour un total de ${newClosure.total} CFA.`);
    addNotification(`Clôture journalière soumise pour ${newClosure.storeName}.`);
    showToast('Journée clôturée et soumise pour validation.');
  };

  const validateSaleClosure = useCallback((closureId: number) => {
    const closure = salesClosures.find(c => c.id === closureId);
    if (!closure || closure.status === 'validated') {
        showToast("Cette clôture est déjà validée ou n'existe pas.");
        return;
    }

    setStockLevels(prevStock => {
        const newStock = JSON.parse(JSON.stringify(prevStock));
        let stockErrors: string[] = [];
        let closureTotalCost = 0;
        const updatedLines: SaleLine[] = [];

        for (const line of closure.lines) {
            const salesUnit = salesUnits.find(su => su.id === line.unitId);
            if (!salesUnit) { stockErrors.push(`Unité ${line.unitId} non trouvée.`); continue; }
            
            const product = products.find(p => p.name === salesUnit.baseProduct);
            if (!product) { stockErrors.push(`Produit ${salesUnit.baseProduct} non trouvé.`); continue; }
            
            const batches = newStock[product.id]?.[closure.storeId];
            if (!batches || batches.length === 0) {
                stockErrors.push(`Stock vide pour ${product.name}.`); continue;
            }

            let quantityToConsume = line.qty * salesUnit.factor;
            let lineCost = 0;
            
            batches.sort((a: Batch, b: Batch) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

            for (const batch of batches) {
                if (quantityToConsume <= 0) break;
                const amountFromBatch = Math.min(batch.quantity, quantityToConsume);
                
                lineCost += amountFromBatch * batch.cump;
                batch.quantity -= amountFromBatch;
                quantityToConsume -= amountFromBatch;
            }
            
            if (quantityToConsume > 0.001) { // Use a small tolerance for float errors
                stockErrors.push(`Stock insuffisant pour ${product.name}. Manque ${quantityToConsume.toFixed(2)} ${product.stockUnit}`);
            }

            closureTotalCost += lineCost;
            updatedLines.push({ ...line, costOfGoodsSold: lineCost });
        }

        if (stockErrors.length > 0) {
            showToast(`Erreurs: ${stockErrors.join(' ')}`);
            addLog('VALIDATE_CLOSURE_ERROR', `Erreurs pour ${closureId}: ${stockErrors.join(', ')}`);
            return prevStock; // Abort stock update
        }

        const validatedClosure: SaleClosure = {
            ...closure,
            lines: updatedLines,
            status: 'validated',
            totalCostOfGoodsSold: closureTotalCost,
            grossMargin: closure.total - closureTotalCost
        };
        
        setSalesClosures(prev => prev.map(c => c.id === closureId ? validatedClosure : c));
        
        addLog('VALIDATE_CLOSURE', `Clôture #${closureId} validée pour ${closure.storeName}. Coût: ${closureTotalCost.toLocaleString('fr-FR')} CFA, Marge: ${validatedClosure.grossMargin?.toLocaleString('fr-FR')} CFA.`);
        showToast(`Clôture #${closureId} validée. Le stock et la marge ont été mis à jour.`);
        
        newStock[products[0].id][closure.storeId] = newStock[products[0].id][closure.storeId].filter((b: Batch) => b.quantity > 0.001);
        
        return newStock;
    });
  }, [salesClosures, salesUnits, products, addLog, showToast]);

  const addExpense = useCallback((expenseData: Omit<Expense, 'id' | 'status'>) => {
      const newExpense: Expense = { ...expenseData, id: Date.now(), status: 'En attente' };
      setExpenses(prev => [newExpense, ...prev]);
      const storeName = stores.find(s => s.id === expenseData.storeId)?.name || 'Inconnu';
      addLog('ADD_EXPENSE', `Dépense de ${expenseData.amount} CFA ajoutée pour ${storeName}.`);
      addNotification(`Nouvelle dépense soumise par ${storeName}.`);
      showToast('Dépense soumise pour validation.');
  }, [stores, addLog, showToast, addNotification]);

  const approveExpense = useCallback((expenseId: number) => {
      setExpenses(prev => prev.map(exp => {
          if (exp.id === expenseId) {
              const storeName = stores.find(s => s.id === exp.storeId)?.name || 'Inconnu';
              addLog('APPROVE_EXPENSE', `Dépense #${expenseId} de ${exp.amount} CFA approuvée pour ${storeName}.`);
              showToast(`Dépense #${expenseId} approuvée.`);
              return { ...exp, status: 'Approuvé' };
          }
          return exp;
      }));
  }, [stores, addLog, showToast]);

  const updateExpense = (expense: Expense) => {
    setExpenses(prev => prev.map(e => e.id === expense.id ? expense : e));
    addLog('UPDATE_EXPENSE', `Dépense #${expense.id} mise à jour.`);
    showToast('Dépense mise à jour.');
  };
  
  const reconcileEntries = useCallback((journalEntryIds: string[], bankStatementLineIds: string[]) => {
      setReconciledJournalEntryIds(prev => [...new Set([...prev, ...journalEntryIds])]);
      setReconciledBankStatementLineIds(prev => [...new Set([...prev, ...bankStatementLineIds])]);
      addLog('BANK_RECONCILIATION', `Rapprochement de ${journalEntryIds.length} écritures comptables et ${bankStatementLineIds.length} lignes de relevé.`);
      showToast('Les écritures ont été rapprochées avec succès.');
  }, [addLog, showToast]);
  
  const addProductionRecipe = useCallback((recipe: Omit<ProductionRecipe, 'id'>) => {
      const newRecipe = { ...recipe, id: `REC-${Date.now()}` };
      setProductionRecipes(prev => [...prev, newRecipe]);
      addLog('CREATE_RECIPE', `Fiche technique "${recipe.name}" créée.`);
      showToast('Fiche technique ajoutée.');
  }, [addLog, showToast]);

  const createProductionOrder = useCallback((order: Omit<ProductionOrder, 'id' | 'status' | 'creationDate'>) => {
      const newOrder = { ...order, id: `OF-${Date.now()}`, status: 'Planifié' as const, creationDate: new Date().toISOString().slice(0, 10) };
      setProductionOrders(prev => [newOrder, ...prev]);
      addLog('CREATE_PROD_ORDER', `OF ${newOrder.id} créé.`);
      showToast('Ordre de fabrication créé.');
  }, [addLog, showToast]);
  
  const startProductionOrder = useCallback((orderId: string) => {
      setProductionOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'En Cours' } : o));
      addLog('START_PROD_ORDER', `OF ${orderId} lancé.`);
      showToast(`Lancement de l'ordre de fabrication ${orderId}.`);
  }, [addLog, showToast]);

  const completeProductionOrder = useCallback((orderId: string, actualQuantity: number): boolean => {
    const order = productionOrders.find(o => o.id === orderId);
    const recipe = order ? productionRecipes.find(r => r.id === order.recipeId) : null;
    if (!order || !recipe) {
        showToast("Erreur: Ordre ou fiche technique introuvable.");
        return false;
    }
    const hubId = 1; // Production happens at the Hub
    
    const newStockLevels = JSON.parse(JSON.stringify(stockLevels));
    let totalCost = 0;
    
    // Check stock availability and consume components
    for (const line of recipe.lines) {
        const requiredQty = line.quantity * actualQuantity;
        const batches = newStockLevels[line.productId]?.[hubId] || [];
        const totalStock = batches.reduce((sum: number, b: Batch) => sum + b.quantity, 0);

        if (totalStock < requiredQty) {
            const productName = products.find(p => p.id === line.productId)?.name || 'Inconnu';
            showToast(`Stock insuffisant pour ${productName} au Hub. Requis: ${requiredQty}, Dispo: ${totalStock}`);
            return false;
        }

        batches.sort((a: Batch, b: Batch) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
        
        let qtyToConsume = requiredQty;
        for (const batch of batches) {
            if (qtyToConsume <= 0) break;
            const amountFromBatch = Math.min(batch.quantity, qtyToConsume);
            totalCost += amountFromBatch * batch.cump;
            batch.quantity -= amountFromBatch;
            qtyToConsume -= amountFromBatch;
        }
        newStockLevels[line.productId][hubId] = batches.filter((b: Batch) => b.quantity > 0.001);
    }

    // Add finished product to stock
    const outputProductId = recipe.outputProductId;
    const unitCost = totalCost / actualQuantity;
    if (!newStockLevels[outputProductId]) newStockLevels[outputProductId] = {};
    if (!newStockLevels[outputProductId][hubId]) newStockLevels[outputProductId][hubId] = [];

    const newBatch: Batch = {
        batchNumber: `PROD-${order.id}`,
        quantity: actualQuantity,
        cump: unitCost,
        expiryDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().slice(0, 10), // Example: 5 days shelf life
        arrivalId: order.id,
    };
    newStockLevels[outputProductId][hubId].push(newBatch);
    
    // Update state
    setStockLevels(newStockLevels);
    setProductionOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Terminé', actualQuantity, cost: totalCost, completionDate: new Date().toISOString().slice(0, 10) } : o));
    
    addLog('COMPLETE_PROD_ORDER', `OF ${orderId} terminé. ${actualQuantity} unités produites.`);
    showToast(`Ordre de fabrication ${orderId} finalisé.`);
    return true;

  }, [productionOrders, productionRecipes, stockLevels, products, addLog, showToast]);

  const addBudget = (budgetData: Omit<Budget, 'id'>) => {
    const newBudget = { ...budgetData, id: budgetData.period };
    setBudgets(prev => [...prev.filter(b => b.id !== newBudget.id), newBudget]);
    addLog('CREATE_BUDGET', `Budget pour la période ${newBudget.period} créé.`);
    showToast(`Budget pour ${newBudget.period} créé.`);
  };

  const updateBudget = (budget: Budget) => {
    setBudgets(prev => prev.map(b => b.id === budget.id ? budget : b));
    addLog('UPDATE_BUDGET', `Budget pour la période ${budget.period} mis à jour.`);
    showToast(`Budget pour ${budget.period} mis à jour.`);
  };


  const VIEWS = useMemo(() => {
    if (currentUser.role === 'Directeur') {
        return {
            'director-dashboard': <DirectorDashboard onNavigate={navigateTo} />,
            'finance-hub': <FinanceHub />,
            'accounting-view': <AccountingView />,
            'cash-flow-hub': <CashFlowHub />,
            'achats-hub': <AchatsHub />,
            'stock-hub': <StockHub />,
            'production-hub': <ProductionHub />,
            'ventes-hub': <VentesHub />,
            'product-hub': <ProductHub />,
            'hr-view': <HRView />,
            'admin-hub': <AdminHubView />,
            'reports-hub': <ReportsHub />,
            'decision-support-hub': <DecisionSupportHub />,
        };
    }
    // Gérant
    return {
        'store-dashboard': <StoreDashboard onNavigate={navigateTo} currentUser={currentUser} />,
        'store-finance-hub': <StoreFinanceHub currentUser={currentUser} />,
        'store-stock-hub': <StoreStockHub currentUser={currentUser} />,
        'prices-view': <PricesView />,
    };
  }, [navigateTo, currentUser]);

  const contextValue = {
      showToast, openModal, closeModal, products, users, employees, stores, salesUnits, suppliers, purchaseOrders,
      clients, salesOrders, invoices,
      salesClosures, auditLogs, notifications, stockLevels, arrivals, transfers, losses, inventories, expenses,
      bankStatements, reconciledJournalEntryIds, reconciledBankStatementLineIds,
      productionRecipes, productionOrders,
      budgets,
      isGenerating, aiResponse,
      addProduct, updateProduct, addSalesUnit, updateSalesUnit, updateProductPrice, addUser, updateUser, addEmployee, updateEmployee, addStore, updateStore, addSupplier, updateSupplier, addClient, updateClient, addPurchaseOrder, addSalesOrder, updateSalesOrderStatus, markInvoiceAsPaid, addArrival,
      createTransfer, receiveTransfer, declareLoss, addSaleClosure, validateSaleClosure, markNotificationsAsRead,
      createInventory, submitInventory, validateInventory, correctAndValidateInventory, addExpense, approveExpense, updateExpense,
      reconcileEntries,
      addProductionRecipe, createProductionOrder, startProductionOrder, completeProductionOrder,
      addBudget, updateBudget,
      getAiAnalysis
  };
  
  return (
    <AppProvider value={contextValue}>
      <div className="app-shell">
        <Header onMenuToggle={() => setSidebarOpen(!isSidebarOpen)} currentUser={currentUser} onLogout={onLogout} />
        <div className="flex flex-1">
          <Sidebar activeView={view} onNavigate={navigateTo} isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} role={currentUser.role} />
          <main id="main" className="flex-1 main-content p-6" style={{minHeight:'calc(100vh - 70px)'}}>
            {VIEWS[view] ?? <div className="text-center p-8">Vue non disponible ou non trouvée.</div>}
          </main>
        </div>
        
        <Modal isOpen={!!modalKey} onClose={closeModal}>
          {modalContent}
        </Modal>

        <ToastContainer toasts={toasts} />
      </div>
    </AppProvider>
  );
}