import React, { useState, useEffect } from 'react';
import {
    Package,
    AlertTriangle,
    CheckCircle,
    Save,
    X,
    Building2,
    Calendar,
    User,
    Minus,
    Plus
} from 'lucide-react';
import { TransfertStock, LigneTransfert } from '../../shared/types';
import { useTransferts } from '../../shared/hooks/useTransferts';

interface ReceptionFormProps {
    transfert: TransfertStock;
    onSuccess?: (transfert: TransfertStock) => void;
    onCancel?: () => void;
    currentUserId: string;
}

interface ReceptionData {
    quantitesRecues: Record<string, number>;
    commentaires: string;
}

interface LigneReceptionData {
    ligneId: string;
    productName: string;
    quantiteEnvoyee: number;
    quantiteRecue: number;
    ecart: number;
    hasVariance: boolean;
}

export const ReceptionForm: React.FC<ReceptionFormProps> = ({
    transfert,
    onSuccess,
    onCancel,
    currentUserId
}) => {
    const [receptionData, setReceptionData] = useState<ReceptionData>({
        quantitesRecues: {},
        commentaires: ''
    });

    const [lignesData, setLignesData] = useState<LigneReceptionData[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { receiveTransfert, loading } = useTransferts(currentUserId, 'manager');

    // Initialize reception data
    useEffect(() => {
        const initialQuantites: Record<string, number> = {};
        const initialLignes: LigneReceptionData[] = [];

        transfert.lignes.forEach(ligne => {
            // Default to the sent quantity
            initialQuantites[ligne.id] = ligne.quantiteEnvoyee;

            initialLignes.push({
                ligneId: ligne.id,
                productName: ligne.product.name,
                quantiteEnvoyee: ligne.quantiteEnvoyee,
                quantiteRecue: ligne.quantiteEnvoyee,
                ecart: 0,
                hasVariance: false
            });
        });

        setReceptionData(prev => ({
            ...prev,
            quantitesRecues: initialQuantites
        }));

        setLignesData(initialLignes);
    }, [transfert]);

    // Update quantity for a line
    const updateQuantiteRecue = (ligneId: string, quantite: number) => {
        const ligne = transfert.lignes.find(l => l.id === ligneId);
        if (!ligne) return;

        const newQuantite = Math.max(0, quantite);
        const ecart = newQuantite - ligne.quantiteEnvoyee;

        setReceptionData(prev => ({
            ...prev,
            quantitesRecues: {
                ...prev.quantitesRecues,
                [ligneId]: newQuantite
            }
        }));

        setLignesData(prev => prev.map(l =>
            l.ligneId === ligneId
                ? {
                    ...l,
                    quantiteRecue: newQuantite,
                    ecart,
                    hasVariance: ecart !== 0
                }
                : l
        ));

        // Clear any existing error for this line
        if (errors[`ligne-${ligneId}`]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`ligne-${ligneId}`];
                return newErrors;
            });
        }
    };

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Validate each line
        lignesData.forEach(ligne => {
            if (ligne.quantiteRecue < 0) {
                newErrors[`ligne-${ligne.ligneId}`] = 'La quantité reçue ne peut pas être négative';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            const result = await receiveTransfert(transfert.id, receptionData);

            if (result) {
                onSuccess?.(result);
            }
        } catch (error) {
            console.error('Erreur lors de la réception du transfert:', error);
            setErrors({ submit: 'Erreur lors de la réception du transfert' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Calculate summary statistics
    const stats = {
        totalLignes: lignesData.length,
        lignesAvecEcarts: lignesData.filter(l => l.hasVariance).length,
        totalEnvoye: lignesData.reduce((sum, l) => sum + l.quantiteEnvoyee, 0),
        totalRecu: lignesData.reduce((sum, l) => sum + l.quantiteRecue, 0),
        ecartTotal: lignesData.reduce((sum, l) => sum + Math.abs(l.ecart), 0)
    };

    const hasVariances = stats.lignesAvecEcarts > 0;

    return (
        <div className="bg-white rounded-lg shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Package className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Réception de Transfert</h2>
                            <p className="text-sm text-gray-600">
                                Transfert {transfert.numero}
                            </p>
                        </div>
                    </div>
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Transfer Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Informations du Transfert</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-gray-500" />
                            <div>
                                <p className="text-sm font-medium text-gray-700">De</p>
                                <p className="text-sm text-gray-900">{transfert.storeSource.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <div>
                                <p className="text-sm font-medium text-gray-700">Date de création</p>
                                <p className="text-sm text-gray-900">
                                    {transfert.dateCreation.toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <div>
                                <p className="text-sm font-medium text-gray-700">Créé par</p>
                                <p className="text-sm text-gray-900">{transfert.createdBy}</p>
                            </div>
                        </div>
                    </div>
                    {transfert.commentaires && (
                        <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700">Commentaires</p>
                            <p className="text-sm text-gray-900 mt-1">{transfert.commentaires}</p>
                        </div>
                    )}
                </div>

                {/* Summary Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{stats.totalLignes}</div>
                        <div className="text-sm text-blue-700">Produits</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-gray-600">{stats.totalEnvoye}</div>
                        <div className="text-sm text-gray-700">Envoyé</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{stats.totalRecu}</div>
                        <div className="text-sm text-green-700">Reçu</div>
                    </div>
                    <div className={`p-4 rounded-lg ${hasVariances ? 'bg-orange-50' : 'bg-green-50'}`}>
                        <div className={`text-2xl font-bold ${hasVariances ? 'text-orange-600' : 'text-green-600'}`}>
                            {stats.lignesAvecEcarts}
                        </div>
                        <div className={`text-sm ${hasVariances ? 'text-orange-700' : 'text-green-700'}`}>
                            Écarts
                        </div>
                    </div>
                </div>

                {/* Reception Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Products Reception */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Quantités Reçues</h3>
                        <div className="space-y-4">
                            {lignesData.map((ligne) => (
                                <div
                                    key={ligne.ligneId}
                                    className={`p-4 rounded-lg border-2 ${ligne.hasVariance
                                        ? 'border-orange-200 bg-orange-50'
                                        : 'border-gray-200 bg-white'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">{ligne.productName}</h4>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                                <span>Envoyé: {ligne.quantiteEnvoyee}</span>
                                                {ligne.hasVariance && (
                                                    <span className={`font-medium ${ligne.ecart > 0 ? 'text-green-600' : 'text-red-600'
                                                        }`}>
                                                        Écart: {ligne.ecart > 0 ? '+' : ''}{ligne.ecart}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <label className="text-sm font-medium text-gray-700">Reçu:</label>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuantiteRecue(ligne.ligneId, ligne.quantiteRecue - 1)}
                                                    className="p-1 text-gray-500 hover:text-gray-700 rounded"
                                                    disabled={ligne.quantiteRecue <= 0}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </button>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={ligne.quantiteRecue}
                                                    onChange={(e) => updateQuantiteRecue(ligne.ligneId, parseInt(e.target.value) || 0)}
                                                    className={`w-20 px-2 py-1 text-center border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[`ligne-${ligne.ligneId}`] ? 'border-red-300' : 'border-gray-300'
                                                        }`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuantiteRecue(ligne.ligneId, ligne.quantiteRecue + 1)}
                                                    className="p-1 text-gray-500 hover:text-gray-700 rounded"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {errors[`ligne-${ligne.ligneId}`] && (
                                        <p className="mt-2 text-sm text-red-600">{errors[`ligne-${ligne.ligneId}`]}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Variance Alert */}
                    {hasVariances && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-medium text-orange-800">Écarts Détectés</h4>
                                    <p className="text-sm text-orange-700 mt-1">
                                        {stats.lignesAvecEcarts} produit{stats.lignesAvecEcarts > 1 ? 's présentent' : ' présente'} des écarts.
                                        Veuillez vérifier les quantités et ajouter des commentaires si nécessaire.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Comments */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Commentaires de réception {hasVariances && <span className="text-red-500">*</span>}
                        </label>
                        <textarea
                            value={receptionData.commentaires}
                            onChange={(e) => setReceptionData(prev => ({ ...prev, commentaires: e.target.value }))}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={hasVariances
                                ? "Expliquez les écarts constatés (obligatoire en cas d'écarts)..."
                                : "Commentaires sur la réception (optionnel)..."
                            }
                            required={hasVariances}
                        />
                        {hasVariances && !receptionData.commentaires && (
                            <p className="mt-1 text-sm text-red-600">
                                Les commentaires sont obligatoires en cas d'écarts
                            </p>
                        )}
                    </div>

                    {/* Submit Error */}
                    {errors.submit && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                <span className="text-red-800">{errors.submit}</span>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                        {onCancel && (
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Annuler
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={isSubmitting || loading || (hasVariances && !receptionData.commentaires)}
                            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                        >
                            {isSubmitting || loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Réception...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4" />
                                    Confirmer la réception
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};