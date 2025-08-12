/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import type { Expense } from '../types';

const formatCurrency = (value: number | undefined) => {
    if (value === undefined || isNaN(value)) return '0 CFA';
    return value.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 });
};

const FinanceHub = () => {
    const { expenses, approveExpense, stores, openModal, budgets, salesClosures } = useAppContext();
    const [activeTab, setActiveTab] = useState('budgets');
    
    const getStoreName = (storeId: number) => stores.find(s => s.id === storeId)?.name || 'N/A';
    
    const pendingExpenses = useMemo(() => {
        return expenses.filter(exp => exp.status === 'En attente').sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [expenses]);
    
    // Panels for each tab
    const ExpensesPanel = () => (
         <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Historique des Charges</h3>
                <button className="btn btn-primary btn-sm" onClick={() => openModal('modalAjoutDepense')}>
                    <i className="fa fa-plus mr-2"></i>Ajouter une charge
                </button>
            </div>
            <div className="overflow-x-auto max-h-[500px] border rounded-lg">
                <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-bg-subtle">
                        <tr>
                            <th>Date</th>
                            <th>Magasin</th>
                            <th>Catégorie</th>
                            <th>Description</th>
                            <th className="text-right">Montant</th>
                            <th className="text-center">Statut / Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses.length > 0 ? expenses.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(exp => (
                            <tr key={exp.id} className="hover:bg-primary-light/50">
                                <td>{new Date(exp.date).toLocaleDateString('fr-FR')}</td>
                                <td>{getStoreName(exp.storeId)}</td>
                                <td>{exp.category}</td>
                                <td>{exp.description}</td>
                                <td className="text-right font-medium">{formatCurrency(exp.amount)}</td>
                                <td className="text-center">
                                    {exp.status === 'En attente' ? (
                                        <div className="flex gap-2 justify-center">
                                            <button onClick={() => openModal('modalModifierDepense', { expense: exp })} className="btn btn-ghost btn-sm">
                                                Modifier
                                            </button>
                                            <button onClick={() => approveExpense(exp.id)} className="btn btn-accent btn-sm">
                                                Approuver
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="status-chip status-green">Approuvé</span>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={6} className="text-center py-8 text-text-muted">Aucune charge enregistrée.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const BudgetPanel = () => {
      const [selectedPeriod, setSelectedPeriod] = useState(budgets[0]?.period || '');

      const budgetAnalysis = useMemo(() => {
        const budgetForPeriod = budgets.find(b => b.period === selectedPeriod);
        if (!budgetForPeriod) return [];

        const actualExpenses = expenses.filter(e => e.status === 'Approuvé' && e.date.startsWith(selectedPeriod));
        const actualSales = salesClosures.filter(sc => sc.status === 'validated' && sc.date.startsWith(selectedPeriod));
        
        const analysisByStore: Record<string, any[]> = {};

        budgetForPeriod.lines.forEach(line => {
          let actualAmount = 0;
          if (line.category === 'Chiffre d\'Affaires') {
            actualAmount = actualSales.filter(sc => sc.storeId === line.storeId).reduce((sum, sc) => sum + sc.total, 0);
          } else {
            actualAmount = actualExpenses.filter(e => e.storeId === line.storeId && e.category === line.category).reduce((sum, e) => sum + e.amount, 0);
          }
          
          const variance = actualAmount - line.budgetedAmount;
          let consumption = line.budgetedAmount > 0 ? (actualAmount / line.budgetedAmount) * 100 : 0;
          if (line.category === 'Chiffre d\'Affaires') {
              consumption = line.budgetedAmount > 0 ? (actualAmount / line.budgetedAmount) * 100 : (actualAmount > 0 ? 100 : 0);
          }

          const storeName = getStoreName(line.storeId);
          if (!analysisByStore[storeName]) {
            analysisByStore[storeName] = [];
          }
          analysisByStore[storeName].push({ ...line, actualAmount, variance, consumption });
        });

        return Object.entries(analysisByStore);
      }, [selectedPeriod, budgets, expenses, salesClosures]);

      const getProgressBarColor = (consumption: number, isRevenue: boolean) => {
          if (isRevenue) {
              return consumption >= 100 ? 'bg-success' : 'bg-primary';
          }
          if (consumption > 100) return 'bg-danger';
          if (consumption > 85) return 'bg-warn';
          return 'bg-success';
      };

      return (
          <div>
              <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Suivi Budgétaire</h3>
                  <div className="flex items-center gap-4">
                      <select value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)} className="p-2 border rounded-md">
                          {budgets.map(b => <option key={b.id} value={b.period}>{new Date(b.period + '-02').toLocaleString('fr-FR', {month: 'long', year: 'numeric'})}</option>)}
                      </select>
                      <button className="btn btn-primary btn-sm" onClick={() => openModal('modalBudget', { budget: budgets.find(b => b.period === selectedPeriod) })}>
                          <i className="fa fa-edit mr-2"></i>Gérer le budget
                      </button>
                  </div>
              </div>

              <div className="space-y-6">
                {budgetAnalysis.map(([storeName, lines]) => (
                    <div key={storeName} className="card p-4 border-l-4" style={{borderColor: 'var(--primary)'}}>
                         <h4 className="font-bold text-lg mb-3 text-primary-dark">{storeName}</h4>
                         <div className="space-y-4">
                            {lines.map(line => {
                                const isRevenue = line.category === 'Chiffre d\'Affaires';
                                return (
                                <div key={line.id}>
                                    <div className="flex justify-between items-center text-sm mb-1">
                                        <span className="font-semibold">{line.category}</span>
                                        <span className={`font-mono text-xs ${line.variance > 0 && !isRevenue ? 'text-danger-dark' : 'text-success-dark'}`}>
                                            {line.variance >= 0 ? '+' : ''}{formatCurrency(line.variance)}
                                        </span>
                                    </div>
                                    <div className="w-full bg-bg-subtle rounded-full h-3">
                                        <div 
                                            className={`h-3 rounded-full ${getProgressBarColor(line.consumption, isRevenue)}`}
                                            style={{ width: `${Math.min(line.consumption, 100)}%`}}
                                            title={`${line.consumption.toFixed(0)}%`}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-text-muted mt-1">
                                        <span>Réalisé: {formatCurrency(line.actualAmount)}</span>
                                        <span>Budget: {formatCurrency(line.budgetedAmount)}</span>
                                    </div>
                                </div>
                                )
                            })}
                         </div>
                    </div>
                ))}
              </div>
          </div>
      );
    }
    
    return (
        <section id="finance-hub" className="view space-y-6">
            <div className="card">
                <div className="card-header"><i className="fa fa-calculator mr-2"></i>Pôle Finance</div>
                <div className="flex gap-2 mb-4 border-b pb-2 flex-wrap">
                    <button className={`btn btn-sm ${activeTab === 'budgets' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('budgets')}>Budgets</button>
                    <button className={`btn btn-sm ${activeTab === 'expenses' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('expenses')}>Gestion des Charges {pendingExpenses.length > 0 && <span className="ml-2 bg-danger text-white text-xs rounded-full px-2">{pendingExpenses.length}</span>}</button>
                </div>

                {activeTab === 'budgets' && <BudgetPanel />}
                {activeTab === 'expenses' && <ExpensesPanel />}
            </div>
        </section>
    );
};

export default FinanceHub;