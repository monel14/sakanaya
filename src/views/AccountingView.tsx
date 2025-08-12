/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import type { Expense, Product, BankStatement, BankStatementLine, Invoice } from '../types';

// --- Helper Functions & Types ---
const formatCurrency = (value: number) => {
    if (isNaN(value)) return '0 CFA';
    return value.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 });
};

const exportToCsv = (filename: string, rows: object[]) => {
    if (!rows || !rows.length) return;
    const separator = ';';
    const keys = Object.keys(rows[0]);
    const csvContent =
        keys.join(separator) +
        '\n' +
        rows.map(row => {
            return keys.map(k => {
                let cell = row[k] === null || row[k] === undefined ? '' : row[k];
                cell = cell instanceof Date
                    ? cell.toLocaleString('fr-FR')
                    : cell.toString().replace(/"/g, '""').replace(/(\r\n|\n|\r)/gm, " ");
                if (cell.search(/("|,|\n)/g) >= 0) {
                    cell = `"${cell}"`;
                }
                return cell;
            }).join(separator);
        }).join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

interface Account { code: string; label: string; }
interface JournalEntryLine {
    id: string;
    date: string;
    accountId: string;
    accountLabel: string;
    description: string;
    debit: number;
    credit: number;
}
type BalanceLine = { accountId: string, accountLabel: string, totalDebit: number, totalCredit: number, balance: number };

// --- Simplified Chart of Accounts ---
const chartOfAccounts: { [key: string]: Account } = {
    // Produits (7)
    '701': { code: '701', label: 'Ventes de marchandises' },
    // Charges (6)
    '601': { code: '601', label: 'Achats de marchandises' },
    '6037': { code: '6037', label: 'Variation de stock (Marchandises)' },
    '6061': { code: '6061', label: 'Électricité & Eau' },
    '6064': { code: '6064', label: 'Fournitures' },
    '613': { code: '613', label: 'Loyer' },
    '615': { code: '615', label: 'Maintenance' },
    '622': { code: '622', label: 'Services bancaires'},
    '623': { code: '623', label: 'Marketing' },
    '628': { code: '628', label: 'Autres charges externes' },
    '641': { code: '641', label: 'Salaires et traitements' },
    '658': { code: '658', label: 'Pertes & Démarques' },
    // Trésorerie (5)
    '530': { code: '530', label: 'Caisse' },
    '512': { code: '512', label: 'Banque' },
    // Tiers (4)
    '401': { code: '401', label: 'Fournisseurs' },
    '411': { code: '411', label: 'Clients' },
};

const getExpenseAccount = (category: Expense['category']): Account => {
    const map: Record<Expense['category'], Account> = {
        'Salaires': chartOfAccounts['641'],
        'Loyer': chartOfAccounts['613'],
        'Électricité & Eau': chartOfAccounts['6061'],
        'Fournitures': chartOfAccounts['6064'],
        'Maintenance': chartOfAccounts['615'],
        'Marketing': chartOfAccounts['623'],
        'Services bancaires': chartOfAccounts['622'],
        'Autre': chartOfAccounts['628'],
    };
    return map[category] || chartOfAccounts['628'];
};

// --- Main Component ---
const AccountingView = () => {
    const { 
        salesClosures, arrivals, losses, expenses, employees, products,
        invoices, clients,
        bankStatements, reconciledJournalEntryIds, reconciledBankStatementLineIds,
        reconcileEntries: doReconciliation 
    } = useAppContext();
    const [activeTab, setActiveTab] = useState('reconciliation');
    const [selectedAccount, setSelectedAccount] = useState<string>('');

    // --- Memoized Journal Generation ---
    const allJournalEntries = useMemo((): JournalEntryLine[] => {
        const entries: JournalEntryLine[] = [];

        // Ventes B2C (Point de Vente)
        salesClosures.filter(sc => sc.status === 'validated').forEach(sc => {
            entries.push({ id: `JV-${sc.id}-D`, date: sc.date, accountId: '530', accountLabel: chartOfAccounts['530'].label, description: `Ventes ${sc.storeName} du ${sc.date}`, debit: sc.total, credit: 0 });
            entries.push({ id: `JV-${sc.id}-C`, date: sc.date, accountId: '701', accountLabel: chartOfAccounts['701'].label, description: `Ventes ${sc.storeName}`, debit: 0, credit: sc.total });
            
            if (sc.id === 2) { // Match to bank statement line
                 entries.push({ id: `ODV-${sc.id}-D`, date: '2025-08-05', accountId: '512', accountLabel: chartOfAccounts['512'].label, description: `Versement espèces ${sc.storeName}`, debit: sc.total, credit: 0 });
                 entries.push({ id: `ODV-${sc.id}-C`, date: '2025-08-05', accountId: '530', accountLabel: chartOfAccounts['530'].label, description: `Sortie caisse pour versement ${sc.storeName}`, debit: 0, credit: sc.total });
            }
        });

        // Ventes B2B (Facturation)
        invoices.forEach(inv => {
            const clientName = clients.find(c => c.id === inv.clientId)?.companyName || 'Inconnu';
            // Création de la créance
            entries.push({ id: `JVB2B-${inv.id}-D`, date: inv.invoiceDate, accountId: '411', accountLabel: chartOfAccounts['411'].label, description: `Facture ${inv.id} - ${clientName}`, debit: inv.totalValue, credit: 0 });
            entries.push({ id: `JVB2B-${inv.id}-C`, date: inv.invoiceDate, accountId: '701', accountLabel: chartOfAccounts['701'].label, description: `Ventes sur facture ${inv.id}`, debit: 0, credit: inv.totalValue });

            // Si payée, on solde la créance
            if (inv.status === 'Payée') {
                entries.push({ id: `ODP-INV-${inv.id}-D`, date: inv.invoiceDate, accountId: '512', accountLabel: chartOfAccounts['512'].label, description: `Paiement Facture ${inv.id} - ${clientName}`, debit: inv.totalValue, credit: 0 });
                entries.push({ id: `ODP-INV-${inv.id}-C`, date: inv.invoiceDate, accountId: '411', accountLabel: chartOfAccounts['411'].label, description: `Paiement Facture ${inv.id} - ${clientName}`, debit: 0, credit: inv.totalValue });
            }
        });

        // Achats
        arrivals.forEach(arr => {
            entries.push({ id: `JA-${arr.id}-D`, date: arr.date, accountId: '601', accountLabel: chartOfAccounts['601'].label, description: `Achat Fss ${arr.supplierName}`, debit: arr.totalValue, credit: 0 });
            entries.push({ id: `JA-${arr.id}-C`, date: arr.date, accountId: '401', accountLabel: chartOfAccounts['401'].label, description: `Dette Fss ${arr.supplierName}`, debit: 0, credit: arr.totalValue });
            
            if (arr.id === 'BR-1662301400000') {
                entries.push({ id: `ODP-${arr.id}-D`, date: '2025-08-05', accountId: '401', accountLabel: chartOfAccounts['401'].label, description: `Paiement Fss ${arr.supplierName}`, debit: arr.totalValue, credit: 0 });
                entries.push({ id: `ODP-${arr.id}-C`, date: '2025-08-05', accountId: '512', accountLabel: chartOfAccounts['512'].label, description: `Paiement Fss ${arr.supplierName}`, debit: 0, credit: arr.totalValue });
            }
        });
        
        // Pertes
        losses.forEach(loss => {
            const productName = products.find(p => p.id === loss.productId)?.name || 'Inconnu';
            entries.push({ id: `ODL-${loss.id}-D`, date: loss.date, accountId: '658', accountLabel: chartOfAccounts['658'].label, description: `Perte ${loss.type}: ${productName} - ${loss.details}`, debit: loss.value, credit: 0 });
            entries.push({ id: `ODL-${loss.id}-C`, date: loss.date, accountId: '6037', accountLabel: chartOfAccounts['6037'].label, description: `Ajustement stock pour perte ${productName}`, debit: 0, credit: loss.value });
        });

        // Dépenses & Salaires
        const payrollDate = '2025-08-04';
        const allExpenses: (Expense | { id: number, storeId: number, date: string, category: 'Salaires', amount: number, description: string, status: 'Approuvé' })[] = [
            ...expenses.filter(e => e.status === 'Approuvé'),
            { id: 999, storeId: 1, date: payrollDate, category: 'Salaires', amount: employees.reduce((acc, item) => acc + item.salary, 0), description: 'Masse Salariale Mensuelle', status: 'Approuvé' }
        ];

        allExpenses.forEach(exp => {
            const expenseAccount = getExpenseAccount(exp.category);
            entries.push({ id: `ODE-${exp.id}-D`, date: exp.date, accountId: expenseAccount.code, accountLabel: expenseAccount.label, description: `Charge: ${exp.description}`, debit: exp.amount, credit: 0 });
            entries.push({ id: `ODE-${exp.id}-C`, date: exp.date, accountId: '512', accountLabel: chartOfAccounts['512'].label, description: `Paiement: ${exp.description}`, debit: 0, credit: exp.amount });
        });

        return entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.id.localeCompare(b.id));
    }, [salesClosures, arrivals, losses, expenses, employees, products, invoices, clients]);

    const { results, generalBalance } = useMemo(() => {
        const balanceMap = new Map<string, BalanceLine>();
        allJournalEntries.forEach(entry => {
            if (!balanceMap.has(entry.accountId)) {
                balanceMap.set(entry.accountId, { accountId: entry.accountId, accountLabel: entry.accountLabel, totalDebit: 0, totalCredit: 0, balance: 0 });
            }
            const line = balanceMap.get(entry.accountId)!;
            line.totalDebit += entry.debit;
            line.totalCredit += entry.credit;
        });

        const sortedBalance = Array.from(balanceMap.values()).sort((a, b) => a.accountId.localeCompare(b.accountId));
        
        sortedBalance.forEach(line => {
            line.balance = line.totalDebit - line.totalCredit;
            if (line.accountId.startsWith('7') || line.accountId.startsWith('4')) {
                line.balance = -line.balance;
            }
        });

        const getBalance = (code: string) => balanceMap.get(code)?.balance || 0;
        
        const totalVentes = getBalance('701');
        const totalAchats = getBalance('601');
        const totalPertes = getBalance('658');
        const autresCharges = sortedBalance.filter(b => b.accountId.startsWith('6') && !['601', '658'].includes(b.accountId)).reduce((acc, b) => acc + b.balance, 0);
        
        const resultatNet = totalVentes - totalAchats - totalPertes - autresCharges;
        
        return {
            results: { totalVentes, totalAchats, totalPertes, autresCharges, resultatNet },
            generalBalance: sortedBalance
        };
    }, [allJournalEntries]);

    const grandLivreData = useMemo(() => {
        if (!selectedAccount) return { entries: [], totals: { totalDebit: 0, totalCredit: 0, balance: 0 } };
        const entries = allJournalEntries.filter(e => e.accountId === selectedAccount);
        const totals = generalBalance.find(b => b.accountId === selectedAccount) || { totalDebit: 0, totalCredit: 0, balance: 0 };
        return { entries, totals };
    }, [selectedAccount, allJournalEntries, generalBalance]);

    const renderJournal = (title: string, data: JournalEntryLine[], exportFilename: string) => (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">{title}</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => exportToCsv(exportFilename, data.map(d=>({Date: d.date, Compte: d.accountId, Libelle: d.description, Debit: d.debit, Credit: d.credit})))} disabled={!data.length}>
                    <i className="fa fa-download mr-2"></i>Exporter CSV
                </button>
            </div>
            <div className="overflow-x-auto max-h-96 border rounded-lg">
                <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10"><tr><th>Date</th><th>Compte</th><th>Libellé</th><th className="text-right">Débit</th><th className="text-right">Crédit</th></tr></thead>
                    <tbody>
                        {data.length > 0 ? data.map(item => (
                            <tr key={item.id}>
                                <td>{item.date}</td>
                                <td>{item.accountId}</td>
                                <td className="text-xs">{item.description}</td>
                                <td className="text-right font-mono">{item.debit > 0 ? item.debit.toLocaleString('fr-FR') : ''}</td>
                                <td className="text-right font-mono">{item.credit > 0 ? item.credit.toLocaleString('fr-FR') : ''}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan={5} className="text-center py-8 text-text-muted">Aucune écriture dans ce journal.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
    
    const BankReconciliationPanel = () => {
        const [selectedJournalIds, setSelectedJournalIds] = useState<string[]>([]);
        const [selectedBankLineIds, setSelectedBankLineIds] = useState<string[]>([]);

        const statement = bankStatements[0];

        const unreconciledJournalEntries = useMemo(() => {
            return allJournalEntries.filter(e => e.accountId === '512' && !reconciledJournalEntryIds.includes(e.id));
        }, [reconciledJournalEntryIds]);

        const unreconciledBankLines = useMemo(() => {
            return statement.lines.filter(l => !reconciledBankStatementLineIds.includes(l.id));
        }, [reconciledBankStatementLineIds]);

        const { journalTotal, bankTotal, isBalanced } = useMemo(() => {
            const journalTotal = selectedJournalIds.reduce((sum, id) => {
                const entry = allJournalEntries.find(e => e.id === id);
                if (!entry) return sum;
                return sum + entry.debit - entry.credit;
            }, 0);

            const bankTotal = selectedBankLineIds.reduce((sum, id) => {
                const line = statement.lines.find(l => l.id === id);
                return sum + (line?.amount || 0);
            }, 0);
            
            const isBalanced = selectedJournalIds.length > 0 && selectedBankLineIds.length > 0 && Math.abs(journalTotal + bankTotal) < 0.01 && journalTotal !== 0;

            return { journalTotal, bankTotal, isBalanced };
        }, [selectedJournalIds, selectedBankLineIds, allJournalEntries, statement.lines]);
        
        const handleToggleSelection = (id: string, type: 'journal' | 'bank') => {
            if (type === 'journal') {
                setSelectedJournalIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
            } else {
                setSelectedBankLineIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
            }
        };

        const handleReconcile = () => {
            if (!isBalanced) return;
            doReconciliation(selectedJournalIds, selectedBankLineIds);
            setSelectedJournalIds([]);
            setSelectedBankLineIds([]);
        };

        return (
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="card text-center"><div className="kpi-label">Solde Initial Relevé</div><div className="kpi-number">{formatCurrency(statement.startBalance)}</div></div>
                    <div className="card text-center"><div className="kpi-label">Total Journal Sélectionné</div><div className={`kpi-number ${journalTotal >= 0 ? 'text-success' : 'text-danger'}`}>{formatCurrency(journalTotal)}</div></div>
                    <div className="card text-center"><div className="kpi-label">Total Relevé Sélectionné</div><div className={`kpi-number ${bankTotal >= 0 ? 'text-success' : 'text-danger'}`}>{formatCurrency(bankTotal)}</div></div>
                    <div className="card text-center"><div className="kpi-label">Différence</div><div className={`kpi-number ${Math.abs(journalTotal + bankTotal) < 0.01 ? 'text-success' : 'text-danger'}`}>{formatCurrency(journalTotal + bankTotal)}</div></div>
                    <div className="card text-center"><div className="kpi-label">Solde Final Relevé</div><div className="kpi-number">{formatCurrency(statement.endBalance)}</div></div>
                </div>

                <div className="text-center">
                    <button className="btn btn-accent" disabled={!isBalanced} onClick={handleReconcile}>
                        <i className="fa fa-link mr-2"></i>Rapprocher la sélection
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-semibold mb-2">Écritures Comptables (Compte 512 - Banque)</h4>
                        <div className="overflow-y-auto max-h-[400px] border rounded-lg p-2 space-y-2">
                            {unreconciledJournalEntries.length > 0 ? unreconciledJournalEntries.map(entry => (
                                <div key={entry.id} className={`p-2 rounded-md flex items-center gap-3 border cursor-pointer ${selectedJournalIds.includes(entry.id) ? 'bg-primary-light border-primary' : 'bg-white'}`} onClick={() => handleToggleSelection(entry.id, 'journal')}>
                                    <input type="checkbox" checked={selectedJournalIds.includes(entry.id)} readOnly className="form-checkbox" />
                                    <div className="flex-grow"><div className="text-sm font-medium">{entry.description}</div><div className="text-xs text-text-muted">{entry.date}</div></div>
                                    <div className={`font-mono text-sm font-semibold ${entry.debit > 0 ? 'text-success' : 'text-danger'}`}>{formatCurrency(entry.debit - entry.credit)}</div>
                                </div>
                            )) : <div className="text-center p-8 text-text-muted">Toutes les écritures sont rapprochées.</div>}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">Lignes du Relevé Bancaire</h4>
                         <div className="overflow-y-auto max-h-[400px] border rounded-lg p-2 space-y-2">
                            {unreconciledBankLines.length > 0 ? unreconciledBankLines.map(line => (
                                <div key={line.id} className={`p-2 rounded-md flex items-center gap-3 border cursor-pointer ${selectedBankLineIds.includes(line.id) ? 'bg-accent-light border-accent' : 'bg-white'}`} onClick={() => handleToggleSelection(line.id, 'bank')}>
                                    <input type="checkbox" checked={selectedBankLineIds.includes(line.id)} readOnly className="form-checkbox" />
                                    <div className="flex-grow"><div className="text-sm font-medium">{line.description}</div><div className="text-xs text-text-muted">{line.date}</div></div>
                                    <div className={`font-mono text-sm font-semibold ${line.amount > 0 ? 'text-success' : 'text-danger'}`}>{formatCurrency(line.amount)}</div>
                                </div>
                            )) : <div className="text-center p-8 text-text-muted">Toutes les lignes de relevé sont rapprochées.</div>}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const ResultsPanel = () => (
         <div>
            <h3 className="font-semibold mb-4">Compte de Résultat (Simplifié)</h3>
            <div className="card bg-bg-subtle p-6 space-y-4">
                 <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-text-secondary">Chiffre d'Affaires (Ventes)</span>
                    <span className="font-bold text-success">{formatCurrency(results.totalVentes)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Coût des marchandises vendues (Achats + Pertes)</span>
                    <span className="font-semibold text-danger">({formatCurrency(results.totalAchats + results.totalPertes)})</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Autres Charges (Salaires, Loyer, etc.)</span>
                    <span className="font-semibold text-danger">({formatCurrency(results.autresCharges)})</span>
                </div>

                <div className={`flex justify-between items-center border-t-2 mt-4 pt-4 ${results.resultatNet >= 0 ? 'border-success' : 'border-danger'}`}>
                    <span className="font-bold text-xl">Résultat Net</span>
                    <span className={`font-bold text-xl ${results.resultatNet >= 0 ? 'text-success' : 'text-danger'}`}>{formatCurrency(results.resultatNet)}</span>
                </div>
            </div>
        </div>
    );
    
    const BalancePanel = () => (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Balance Générale</h3>
                 <button className="btn btn-ghost btn-sm" onClick={() => exportToCsv('balance_generale.csv', generalBalance.map(b => ({Compte: b.accountId, Libelle: b.accountLabel, Debit: b.totalDebit, Credit: b.totalCredit, Solde: b.balance})))} disabled={!generalBalance.length}>
                    <i className="fa fa-download mr-2"></i>Exporter CSV
                </button>
            </div>
            <div className="overflow-x-auto max-h-[500px] border rounded-lg">
                <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10"><tr><th>Compte</th><th>Libellé</th><th className="text-right">Total Débit</th><th className="text-right">Total Crédit</th><th className="text-right">Solde</th></tr></thead>
                    <tbody>
                        {generalBalance.map(b => (
                            <tr key={b.accountId} className="hover:bg-primary-light">
                                <td className="font-mono">{b.accountId}</td>
                                <td>{b.accountLabel}</td>
                                <td className="text-right font-mono">{formatCurrency(b.totalDebit)}</td>
                                <td className="text-right font-mono">{formatCurrency(b.totalCredit)}</td>
                                <td className={`text-right font-bold font-mono ${b.balance >= 0 ? 'text-success' : 'text-danger'}`}>{formatCurrency(b.balance)}</td>
                            </tr>
                        ))}
                    </tbody>
                     <tfoot className="font-bold bg-bg-subtle">
                        <tr className="font-bold">
                            <td colSpan={2}>Totaux</td>
                            <td className="text-right font-mono">{formatCurrency(generalBalance.reduce((a,b) => a+b.totalDebit, 0))}</td>
                            <td className="text-right font-mono">{formatCurrency(generalBalance.reduce((a,b) => a+b.totalCredit, 0))}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
    
    const GrandLivrePanel = () => (
         <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Grand Livre</h3>
                <div className="flex items-center gap-4">
                     <select value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)} className="p-2 border rounded-md">
                        <option value="">Sélectionner un compte...</option>
                        {generalBalance.map(b => <option key={b.accountId} value={b.accountId}>{b.accountId} - {b.accountLabel}</option>)}
                    </select>
                    <button className="btn btn-ghost btn-sm" onClick={() => exportToCsv(`grand_livre_${selectedAccount}.csv`, grandLivreData.entries)} disabled={!selectedAccount || !grandLivreData.entries.length}>
                        <i className="fa fa-download mr-2"></i>Exporter
                    </button>
                </div>
            </div>
             {selectedAccount ? (
                <div className="overflow-x-auto max-h-[500px] border rounded-lg">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 z-10"><tr><th>Date</th><th>Libellé</th><th className="text-right">Débit</th><th className="text-right">Crédit</th></tr></thead>
                        <tbody>
                            {grandLivreData.entries.map(e => (
                                <tr key={e.id}><td>{e.date}</td><td className="text-xs">{e.description}</td><td className="text-right font-mono">{e.debit ? formatCurrency(e.debit) : ''}</td><td className="text-right font-mono">{e.credit ? formatCurrency(e.credit) : ''}</td></tr>
                            ))}
                        </tbody>
                        <tfoot className="font-bold bg-bg-subtle">
                             <tr><td>Totaux</td><td></td><td className="text-right font-mono">{formatCurrency(grandLivreData.totals.totalDebit)}</td><td className="text-right font-mono">{formatCurrency(grandLivreData.totals.totalCredit)}</td></tr>
                             <tr><td colSpan={3}>Solde</td><td className={`text-right font-mono ${grandLivreData.totals.balance >= 0 ? 'text-success' : 'text-danger'}`}>{formatCurrency(grandLivreData.totals.balance)}</td></tr>
                        </tfoot>
                    </table>
                </div>
             ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-lg text-text-muted">
                    <i className="fa fa-search text-3xl mb-2"></i>
                    <p>Veuillez sélectionner un compte pour voir ses détails.</p>
                </div>
             )}
        </div>
    );
    
    const JournauxPanel = () => (
        <div className="space-y-6">
            {renderJournal('Journal des Ventes', allJournalEntries.filter(e => e.id.startsWith('JV')), 'journal_ventes.csv')}
            {renderJournal('Journal des Achats', allJournalEntries.filter(e => e.id.startsWith('JA')), 'journal_achats.csv')}
            {renderJournal('Journal des Opérations Diverses', allJournalEntries.filter(e => e.id.startsWith('OD')), 'journal_operations_diverses.csv')}
        </div>
    );

    return (
        <section id="accounting-view" className="view space-y-6">
            <div className="card">
                <div className="card-header">
                    <i className="fa fa-book mr-2"></i>Module Comptabilité
                </div>
                <div className="flex gap-2 mb-4 border-b pb-2 flex-wrap">
                    <button className={`btn btn-sm ${activeTab === 'reconciliation' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('reconciliation')}>Rapprochement Bancaire</button>
                    <button className={`btn btn-sm ${activeTab === 'results' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('results')}>Compte de Résultat</button>
                    <button className={`btn btn-sm ${activeTab === 'balance' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('balance')}>Balance Générale</button>
                    <button className={`btn btn-sm ${activeTab === 'ledger' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('ledger')}>Grand Livre</button>
                    <button className={`btn btn-sm ${activeTab === 'journals' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('journals')}>Journaux</button>
                </div>
                
                {activeTab === 'reconciliation' && <BankReconciliationPanel />}
                {activeTab === 'results' && <ResultsPanel />}
                {activeTab === 'balance' && <BalancePanel />}
                {activeTab === 'ledger' && <GrandLivrePanel />}
                {activeTab === 'journals' && <JournauxPanel />}

            </div>
        </section>
    );
};

export default AccountingView;