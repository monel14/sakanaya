import React from 'react';
import { ClipboardList, Plus, CheckCircle, Clock } from 'lucide-react';

interface SimpleManagerInventaireProps {
    user: any;
}

export const SimpleManagerInventaire: React.FC<SimpleManagerInventaireProps> = ({ user }) => {
    const storeName = user.store || 'Pointe des Almadies';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <ClipboardList className="h-8 w-8 text-purple-600" />
                    <h1 className="text-2xl font-bold text-gray-900">
                        Mes Inventaires - {storeName}
                    </h1>
                </div>
                <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvel Inventaire
                </button>
            </div>

            {/* Inventaires en cours */}
            <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <Clock className="h-6 w-6 text-purple-600" />
                        <h2 className="text-lg font-semibold text-gray-900">
                            Inventaires en Cours (1)
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 border border-purple-300 rounded-lg bg-purple-50">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h3 className="font-medium text-purple-900">
                                        Inventaire #INV-2025-001
                                    </h3>
                                    <p className="text-sm text-purple-800">
                                        Démarré le 08/08/2025
                                    </p>
                                </div>
                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                                    <Clock className="h-3 w-3 mr-1" />
                                    En Cours
                                </span>
                            </div>

                            <div className="mb-3">
                                <div className="flex items-center justify-between text-sm text-purple-800 mb-1">
                                    <span>Progression du comptage</span>
                                    <span>29/45 produits</span>
                                </div>
                                <div className="w-full bg-purple-200 rounded-full h-2">
                                    <div
                                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: '65%' }}
                                    />
                                </div>
                            </div>

                            <button className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                                <ClipboardList className="h-4 w-4 mr-2" />
                                Continuer le Comptage
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Mes Inventaires Récents
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#Inventaire</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produits</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Écarts</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">INV-2025-001</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">08/08/2025</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">45</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">-</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                                            En Cours
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">INV-2025-002</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">05/08/2025</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">42</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">3</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                            Validé
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">INV-2025-003</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">01/08/2025</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">38</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">1</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                            Validé
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 border border-gray-200 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">Ce mois</h4>
                            <p className="text-2xl font-bold text-green-600">3</p>
                            <p className="text-sm text-gray-500">Inventaires validés</p>
                        </div>
                        <div className="p-4 border border-gray-200 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">Écarts moyens</h4>
                            <p className="text-2xl font-bold text-orange-600">2.1%</p>
                            <p className="text-sm text-gray-500">Taux d'écart</p>
                        </div>
                        <div className="p-4 border border-gray-200 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">Temps moyen</h4>
                            <p className="text-2xl font-bold text-blue-600">3.5h</p>
                            <p className="text-sm text-gray-500">Par inventaire</p>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-start space-x-3">
                            <ClipboardList className="h-5 w-5 text-purple-600 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-purple-900 mb-1">Interface Intégrée</h4>
                                <p className="text-sm text-purple-800">
                                    Cette interface de gestion des inventaires est maintenant accessible via la sidebar.
                                    Créez de nouveaux inventaires, effectuez le comptage et suivez la progression.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};