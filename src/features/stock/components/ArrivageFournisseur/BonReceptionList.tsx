import React, { useState, useMemo } from 'react';
import {
    Search,
    Filter,
    Eye,
    FileText,
    Calendar,
    User,
    CheckCircle,
    Clock,
    Package,
    TrendingUp,
    Download
} from 'lucide-react';
import { BonReception, Supplier } from '../../shared/types';

interface BonReceptionListProps {
    bonsReception: BonReception[];
    suppliers: Supplier[];
    onViewDetails: (bonId: string) => void;
    onExport?: () => void;
    loading?: boolean;
}

interface FilterState {
    search: string;
    supplierId: string;
    status: 'all' | 'draft' | 'validated';
    dateFrom: string;
    dateTo: string;
    storeId: string;
}

export const BonReceptionList: React.FC<BonReceptionListProps> = ({
    bonsReception,
    suppliers,
    onViewDetails,
    onExport,
    loading = false
}) => {
    const [filters, setFilters] = useState<FilterState>({
        search: '',
        supplierId: '',
        status: 'all',
        dateFrom: '',
        dateTo: '',
        storeId: ''
    });

    const [showFilters, setShowFilters] = useState(false);

    // Filter and search logic
    const filteredBons = useMemo(() => {
        return bonsReception.filter(bon => {
            // Search filter
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                const matchesSearch =
                    bon.numero.toLowerCase().includes(searchLower) ||
                    bon.supplier.name.toLowerCase().includes(searchLower) ||
                    bon.store.name.toLowerCase().includes(searchLower);
                if (!matchesSearch) return false;
            }

            // Supplier filter
            if (filters.supplierId && bon.supplierId !== filters.supplierId) {
                return false;
            }

            // Status filter
            if (filters.status !== 'all' && bon.status !== filters.status) {
                return false;
            }

            // Date range filter
            if (filters.dateFrom) {
                const fromDate = new Date(filters.dateFrom);
                if (bon.dateReception < fromDate) return false;
            }
            if (filters.dateTo) {
                const toDate = new Date(filters.dateTo);
                if (bon.dateReception > toDate) return false;
            }

            // Store filter
            if (filters.storeId && bon.storeId !== filters.storeId) {
                return false;
            }

            return true;
        });
    }, [bonsReception, filters]);

    // Statistics
    const stats = useMemo(() => {
        const total = filteredBons.length;
        const validated = filteredBons.filter(b => b.status === 'validated').length;
        const draft = filteredBons.filter(b => b.status === 'draft').length;
        const totalValue = filteredBons.reduce((sum, b) => sum + b.totalValue, 0);

        return { total, validated, draft, totalValue };
    }, [filteredBons]);

    const handleFilterChange = (key: keyof FilterState, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            supplierId: '',
            status: 'all',
            dateFrom: '',
            dateTo: '',
            storeId: ''
        });
    };

    const getStatusBadge = (status: 'draft' | 'validated') => {
        if (status === 'validated') {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Validé
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <Clock className="w-3 h-3 mr-1" />
                Brouillon
            </span>
        );
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(new Date(date));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Statistics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-blue-600" />
                        Bons de Réception
                    </h2>
                    {onExport && (
                        <button
                            onClick={onExport}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Exporter
                        </button>
                    )}
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center">
                            <Package className="w-8 h-8 text-blue-600" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-blue-600">Total</p>
                                <p className="text-2xl font-semibold text-blue-900">{stats.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-green-600">Validés</p>
                                <p className="text-2xl font-semibold text-green-900">{stats.validated}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-yellow-50 rounded-lg p-4">
                        <div className="flex items-center">
                            <Clock className="w-8 h-8 text-yellow-600" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-yellow-600">Brouillons</p>
                                <p className="text-2xl font-semibold text-yellow-900">{stats.draft}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-4">
                        <div className="flex items-center">
                            <TrendingUp className="w-8 h-8 text-purple-600" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-purple-600">Valeur Totale</p>
                                <p className="text-lg font-semibold text-purple-900">{formatCurrency(stats.totalValue)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Rechercher par numéro, fournisseur ou magasin..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Filter Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Filtres
                    </button>
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {/* Supplier Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fournisseur
                                </label>
                                <select
                                    value={filters.supplierId}
                                    onChange={(e) => handleFilterChange('supplierId', e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Tous les fournisseurs</option>
                                    {suppliers.map(supplier => (
                                        <option key={supplier.id} value={supplier.id}>
                                            {supplier.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Statut
                                </label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value as FilterState['status'])}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="all">Tous les statuts</option>
                                    <option value="draft">Brouillons</option>
                                    <option value="validated">Validés</option>
                                </select>
                            </div>

                            {/* Date From */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date début
                                </label>
                                <input
                                    type="date"
                                    value={filters.dateFrom}
                                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Date To */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date fin
                                </label>
                                <input
                                    type="date"
                                    value={filters.dateTo}
                                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Clear Filters */}
                            <div className="flex items-end">
                                <button
                                    onClick={clearFilters}
                                    className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
                                >
                                    Effacer les filtres
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Results */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {filteredBons.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun bon de réception trouvé</h3>
                        <p className="text-gray-500">
                            {filters.search || filters.supplierId || filters.status !== 'all' || filters.dateFrom || filters.dateTo
                                ? 'Essayez de modifier vos critères de recherche.'
                                : 'Aucun bon de réception n\'a été créé pour le moment.'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Numéro
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fournisseur
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Magasin
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Valeur
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Statut
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Créé par
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredBons.map((bon) => (
                                    <tr key={bon.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{bon.numero}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-900">
                                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                {formatDate(bon.dateReception)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{bon.supplier.name}</div>
                                            {bon.supplier.contact && (
                                                <div className="text-sm text-gray-500">{bon.supplier.contact}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{bon.store.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {formatCurrency(bon.totalValue)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {bon.lignes.length} ligne{bon.lignes.length > 1 ? 's' : ''}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(bon.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-900">
                                                <User className="w-4 h-4 mr-2 text-gray-400" />
                                                {bon.createdBy}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {formatDate(bon.createdAt)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => onViewDetails(bon.id)}
                                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                Voir
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BonReceptionList;