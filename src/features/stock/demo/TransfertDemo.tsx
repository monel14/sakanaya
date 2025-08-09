import React, { useState } from 'react';
import { StockManagementPage } from '../pages/StockManagementPage';
import {
    User,
    Building2,
    CheckCircle,
    Clock,
    ArrowRight,
    Lightbulb
} from 'lucide-react';

/**
 * Démonstration du système de transfert inter-magasins
 * 
 * Cette démonstration montre l'implémentation de la tâche 4.1 :
 * "Implémenter la création de transferts (Directeur)"
 * 
 * FONCTIONNALITÉS DÉMONTRÉES :
 * ✅ Formulaire de création de transfert (TransfertForm)
 * ✅ Sélection des magasins source et destination
 * ✅ Gestion des lignes de transfert avec validation de stock
 * ✅ Validation métier (stock suffisant, magasins différents)
 * ✅ Intégration dans StockManagementPage
 * ✅ Hook useTransferts pour la gestion d'état
 * ✅ Service transfertService pour la logique métier
 * 
 * COMPOSANTS CRÉÉS :
 * - TransfertForm : Formulaire de création de transferts
 * - useTransferts : Hook de gestion d'état des transferts
 * - Validations étendues dans stockValidations.ts
 * - StockManagementPage : Interface unifiée avec navigation
 */
export const TransfertDemo: React.FC = () => {
    const [selectedRole, setSelectedRole] = useState<'directeur' | 'gerant'>('directeur');
    const [showDemo, setShowDemo] = useState(false);

    const completedFeatures = [
        {
            id: '4.1.1',
            title: 'Composant TransfertForm',
            status: 'completed',
            description: 'Formulaire complet avec validation en temps réel'
        },
        {
            id: '4.1.2',
            title: 'Sélection des magasins',
            status: 'completed',
            description: 'Source et destination avec validation de différence'
        },
        {
            id: '4.1.3',
            title: 'Gestion des lignes de transfert',
            status: 'completed',
            description: 'Ajout/suppression de lignes avec validation de stock'
        },
        {
            id: '4.1.4',
            title: 'Validation de stock',
            status: 'completed',
            description: 'Vérification du stock disponible en temps réel'
        },
        {
            id: '4.1.5',
            title: 'Hook useTransferts',
            status: 'completed',
            description: 'Gestion d\'état et intégration avec le service'
        },
        {
            id: '4.1.6',
            title: 'Intégration dans StockManagementPage',
            status: 'completed',
            description: 'Navigation et interface unifiée'
        }
    ];

    const nextSteps = [
        {
            id: '4.2',
            title: 'Réception de transferts (Gérant)',
            description: 'Formulaire de réception avec gestion des écarts'
        },
        {
            id: '4.3',
            title: 'Interface de suivi des transferts',
            description: 'Liste complète avec filtrage et vue détaillée'
        }
    ];

    if (!showDemo) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="flex justify-center mb-4">
                            <div className="bg-green-100 rounded-full p-3">
                                <ArrowRight className="h-8 w-8 text-green-600" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Démonstration - Système de Transfert Inter-Magasins
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Implémentation de la tâche 4.1 : Création de transferts pour le Directeur
                        </p>
                    </div>

                    {/* Status Overview */}
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">État d'avancement - Tâche 4.1</h2>

                        <div className="grid gap-4">
                            {completedFeatures.map((feature) => (
                                <div key={feature.id} className="flex items-start space-x-3">
                                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-medium text-gray-900">{feature.title}</h3>
                                        <p className="text-sm text-gray-600">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 p-4 bg-green-50 rounded-lg">
                            <div className="flex items-center">
                                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                                <span className="font-medium text-green-800">
                                    Tâche 4.1 terminée - Toutes les fonctionnalités implémentées
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Next Steps */}
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Prochaines étapes</h2>

                        <div className="grid gap-4">
                            {nextSteps.map((step) => (
                                <div key={step.id} className="flex items-start space-x-3">
                                    <Clock className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-medium text-gray-900">{step.title}</h3>
                                        <p className="text-sm text-gray-600">{step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Sélection du rôle</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => setSelectedRole('directeur')}
                                className={`p-4 rounded-lg border-2 transition-colors ${selectedRole === 'directeur'
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <User className="h-6 w-6 text-blue-600" />
                                    <div className="text-left">
                                        <h3 className="font-medium text-gray-900">Directeur</h3>
                                        <p className="text-sm text-gray-600">Peut créer des transferts</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => setSelectedRole('gerant')}
                                className={`p-4 rounded-lg border-2 transition-colors ${selectedRole === 'gerant'
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <Building2 className="h-6 w-6 text-green-600" />
                                    <div className="text-left">
                                        <h3 className="font-medium text-gray-900">Gérant</h3>
                                        <p className="text-sm text-gray-600">Peut voir les transferts</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Demo Instructions */}
                    <div className="bg-blue-50 rounded-lg p-6 mb-8">
                        <div className="flex items-start space-x-3">
                            <Lightbulb className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-medium text-blue-900 mb-2">Instructions pour la démonstration</h3>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• Sélectionnez le rôle "Directeur" pour accéder à la création de transferts</li>
                                    <li>• Naviguez vers l'onglet "Transferts" dans l'interface</li>
                                    <li>• Cliquez sur "Nouveau transfert" pour ouvrir le formulaire</li>
                                    <li>• Testez la validation en temps réel (stock insuffisant, magasins identiques)</li>
                                    <li>• Créez un transfert complet pour voir le workflow</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Launch Demo Button */}
                    <div className="text-center">
                        <button
                            onClick={() => setShowDemo(true)}
                            className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-8 rounded-lg transition-colors inline-flex items-center space-x-2"
                        >
                            <ArrowRight className="h-5 w-5" />
                            <span>Lancer la démonstration</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Demo Controls */}
            <div className="bg-white border-b border-gray-200 px-4 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-700">Mode démonstration :</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Tâche 4.1 - Création de transferts
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Rôle : {selectedRole === 'directeur' ? 'Directeur' : 'Gérant'}
                        </span>
                    </div>
                    <button
                        onClick={() => setShowDemo(false)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        Retour à l'aperçu
                    </button>
                </div>
            </div>

            {/* Main Demo Interface */}
            <StockManagementPage
                userRole={selectedRole}
                currentStoreId="store-1"
            />
        </div>
    );
};

export default TransfertDemo;