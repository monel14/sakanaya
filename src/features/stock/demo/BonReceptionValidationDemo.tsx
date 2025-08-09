import React, { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button,
  Badge
} from '../../../shared/components/ui';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Play,
  RotateCcw
} from 'lucide-react';
import { BonReceptionForm } from '../components/ArrivageFournisseur/BonReceptionForm';
import { 
  validateBonReception,
  StockValidationErrorType,
  getErrorMessage
} from '../utils/stockValidations';
import { BonReception, LigneReception } from '../types';

interface ValidationTestCase {
  name: string;
  description: string;
  data: Partial<BonReception>;
  expectedErrors: StockValidationErrorType[];
}

const testCases: ValidationTestCase[] = [
  {
    name: 'Bon valide',
    description: 'Toutes les données sont correctes',
    data: {
      supplierId: 'supplier-1',
      storeId: 'store-1',
      dateReception: new Date(),
      lignes: [
        {
          id: 'ligne-1',
          productId: '1',
          quantiteRecue: 10.5,
          coutUnitaire: 5000,
          sousTotal: 52500
        } as LigneReception
      ],
      totalValue: 52500
    },
    expectedErrors: []
  },
  {
    name: 'Quantité négative',
    description: 'Une ligne avec quantité négative',
    data: {
      supplierId: 'supplier-1',
      storeId: 'store-1',
      dateReception: new Date(),
      lignes: [
        {
          id: 'ligne-1',
          productId: '1',
          quantiteRecue: -5,
          coutUnitaire: 5000,
          sousTotal: -25000
        } as LigneReception
      ],
      totalValue: -25000
    },
    expectedErrors: [StockValidationErrorType.NEGATIVE_QUANTITY]
  },
  {
    name: 'Quantité nulle',
    description: 'Une ligne avec quantité zéro',
    data: {
      supplierId: 'supplier-1',
      storeId: 'store-1',
      dateReception: new Date(),
      lignes: [
        {
          id: 'ligne-1',
          productId: '1',
          quantiteRecue: 0,
          coutUnitaire: 5000,
          sousTotal: 0
        } as LigneReception
      ],
      totalValue: 0
    },
    expectedErrors: [StockValidationErrorType.ZERO_QUANTITY]
  },
  {
    name: 'Coût unitaire négatif',
    description: 'Une ligne avec coût unitaire négatif',
    data: {
      supplierId: 'supplier-1',
      storeId: 'store-1',
      dateReception: new Date(),
      lignes: [
        {
          id: 'ligne-1',
          productId: '1',
          quantiteRecue: 10,
          coutUnitaire: -1000,
          sousTotal: -10000
        } as LigneReception
      ],
      totalValue: -10000
    },
    expectedErrors: [StockValidationErrorType.NEGATIVE_COST]
  },
  {
    name: 'Coût unitaire nul',
    description: 'Une ligne avec coût unitaire zéro',
    data: {
      supplierId: 'supplier-1',
      storeId: 'store-1',
      dateReception: new Date(),
      lignes: [
        {
          id: 'ligne-1',
          productId: '1',
          quantiteRecue: 10,
          coutUnitaire: 0,
          sousTotal: 0
        } as LigneReception
      ],
      totalValue: 0
    },
    expectedErrors: [StockValidationErrorType.ZERO_COST]
  },
  {
    name: 'Erreur de calcul sous-total',
    description: 'Sous-total incorrect par rapport à quantité × coût',
    data: {
      supplierId: 'supplier-1',
      storeId: 'store-1',
      dateReception: new Date(),
      lignes: [
        {
          id: 'ligne-1',
          productId: '1',
          quantiteRecue: 10,
          coutUnitaire: 5000,
          sousTotal: 40000 // Devrait être 50000
        } as LigneReception
      ],
      totalValue: 40000
    },
    expectedErrors: [StockValidationErrorType.CALCULATION_ERROR]
  },
  {
    name: 'Total incorrect',
    description: 'Total du bon ne correspond pas à la somme des lignes',
    data: {
      supplierId: 'supplier-1',
      storeId: 'store-1',
      dateReception: new Date(),
      lignes: [
        {
          id: 'ligne-1',
          productId: '1',
          quantiteRecue: 10,
          coutUnitaire: 5000,
          sousTotal: 50000
        } as LigneReception,
        {
          id: 'ligne-2',
          productId: '2',
          quantiteRecue: 5,
          coutUnitaire: 3000,
          sousTotal: 15000
        } as LigneReception
      ],
      totalValue: 60000 // Devrait être 65000
    },
    expectedErrors: [StockValidationErrorType.TOTAL_MISMATCH]
  },
  {
    name: 'Produits en double',
    description: 'Même produit sur plusieurs lignes',
    data: {
      supplierId: 'supplier-1',
      storeId: 'store-1',
      dateReception: new Date(),
      lignes: [
        {
          id: 'ligne-1',
          productId: '1',
          quantiteRecue: 10,
          coutUnitaire: 5000,
          sousTotal: 50000
        } as LigneReception,
        {
          id: 'ligne-2',
          productId: '1', // Même produit
          quantiteRecue: 5,
          coutUnitaire: 4500,
          sousTotal: 22500
        } as LigneReception
      ],
      totalValue: 72500
    },
    expectedErrors: [StockValidationErrorType.DUPLICATE_PRODUCT]
  },
  {
    name: 'Données manquantes',
    description: 'Fournisseur et magasin manquants',
    data: {
      supplierId: '',
      storeId: '',
      dateReception: new Date(),
      lignes: [],
      totalValue: 0
    },
    expectedErrors: [
      StockValidationErrorType.MISSING_SUPPLIER,
      StockValidationErrorType.MISSING_STORE,
      StockValidationErrorType.EMPTY_LINES
    ]
  }
];

export const BonReceptionValidationDemo: React.FC = () => {

  const [testResults, setTestResults] = useState<Array<{
    testCase: ValidationTestCase;
    result: any;
    passed: boolean;
  }>>([]);
  const [showForm, setShowForm] = useState(false);

  const runSingleTest = (testCase: ValidationTestCase) => {
    const result = validateBonReception(testCase.data);
    const actualErrorTypes = result.errors.map(error => error.type);
    
    // Check if all expected errors are present
    const passed = testCase.expectedErrors.every(expectedType => 
      actualErrorTypes.includes(expectedType)
    ) && (testCase.expectedErrors.length === 0 ? result.isValid : !result.isValid);

    return { testCase, result, passed };
  };

  const runAllTests = () => {
    const results = testCases.map(runSingleTest);
    setTestResults(results);
  };

  const runSpecificTest = (testCase: ValidationTestCase) => {
    const result = runSingleTest(testCase);
    setTestResults([result]);
  };

  const resetTests = () => {
    setTestResults([]);
  };

  const getErrorTypeColor = (errorType: StockValidationErrorType): string => {
    switch (errorType) {
      case StockValidationErrorType.NEGATIVE_QUANTITY:
      case StockValidationErrorType.ZERO_QUANTITY:
        return 'bg-red-100 text-red-800';
      case StockValidationErrorType.NEGATIVE_COST:
      case StockValidationErrorType.ZERO_COST:
      case StockValidationErrorType.MISSING_COST:
        return 'bg-orange-100 text-orange-800';
      case StockValidationErrorType.CALCULATION_ERROR:
      case StockValidationErrorType.TOTAL_MISMATCH:
        return 'bg-purple-100 text-purple-800';
      case StockValidationErrorType.DUPLICATE_PRODUCT:
        return 'bg-yellow-100 text-yellow-800';
      case StockValidationErrorType.MISSING_SUPPLIER:
      case StockValidationErrorType.MISSING_STORE:
      case StockValidationErrorType.EMPTY_LINES:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Démonstration des Validations - Bon de Réception
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Button onClick={runAllTests}>
              <Play className="h-4 w-4 mr-2" />
              Exécuter tous les tests
            </Button>
            <Button variant="outline" onClick={resetTests}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
            <Button variant="outline" onClick={() => setShowForm(!showForm)}>
              <FileText className="h-4 w-4 mr-2" />
              {showForm ? 'Masquer' : 'Afficher'} le formulaire
            </Button>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-blue-700">
                Cette démonstration teste les validations métier pour les bons de réception fournisseur.
                Chaque test vérifie un aspect spécifique des règles de validation.
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Cases */}
      <Card>
        <CardHeader>
          <CardTitle>Cas de Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testCases.map((testCase, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{testCase.name}</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => runSpecificTest(testCase)}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">{testCase.description}</p>
                    
                    <div className="space-y-1">
                      <p className="text-xs font-medium">Erreurs attendues:</p>
                      {testCase.expectedErrors.length === 0 ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          Aucune erreur
                        </Badge>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {testCase.expectedErrors.map((errorType, i) => (
                            <Badge 
                              key={i} 
                              variant="outline" 
                              className={getErrorTypeColor(errorType)}
                            >
                              {errorType}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Résultats des Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{result.testCase.name}</h4>
                    <div className="flex items-center gap-2">
                      {result.passed ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Réussi
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Échoué
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium mb-2">Résultat de validation:</h5>
                      <div className="space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">Valide:</span> {result.result.isValid ? 'Oui' : 'Non'}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Erreurs:</span> {result.result.errors.length}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Avertissements:</span> {result.result.warnings.length}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium mb-2">Messages d'erreur:</h5>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {result.result.errors.length === 0 ? (
                          <p className="text-sm text-green-600">Aucune erreur détectée</p>
                        ) : (
                          result.result.errors.map((error: any, i: number) => (
                            <p key={i} className="text-sm text-red-600">
                              • {getErrorMessage(error)}
                            </p>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {result.result.warnings.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <h5 className="text-sm font-medium mb-2">Avertissements:</h5>
                      <div className="space-y-1">
                        {result.result.warnings.map((warning: any, i: number) => (
                          <p key={i} className="text-sm text-yellow-600">
                            • {getErrorMessage(warning)}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t my-4"></div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Tests réussis: {testResults.filter(r => r.passed).length} / {testResults.length}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Demo */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Formulaire de Démonstration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-yellow-700">
                  Utilisez ce formulaire pour tester les validations en temps réel. 
                  Essayez de saisir des valeurs incorrectes pour voir les messages d'erreur.
                </span>
              </div>
            </div>
            
            <BonReceptionForm
              initialSupplierId="supplier-1"
              initialStoreId="store-1"
              onSuccess={(bonId) => {
                console.log('Bon créé avec succès:', bonId);
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};