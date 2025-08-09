import React from 'react';
import { Loader2, RefreshCw, Package, TrendingUp, AlertTriangle } from 'lucide-react';

// Basic loading spinner
export function LoadingSpinner({ size = 'md', className = '' }: { 
  size?: 'sm' | 'md' | 'lg'; 
  className?: string; 
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
}

// Loading skeleton for cards
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center space-x-3 mb-3">
        <div className="h-5 w-5 bg-gray-300 rounded"></div>
        <div className="h-4 bg-gray-300 rounded w-1/3"></div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-300 rounded w-full"></div>
        <div className="h-3 bg-gray-300 rounded w-2/3"></div>
        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
      </div>
    </div>
  );
}

// Loading skeleton for table rows
export function TableRowSkeleton({ columns = 4, className = '' }: { 
  columns?: number; 
  className?: string; 
}) {
  return (
    <tr className={`animate-pulse ${className}`}>
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-6 py-4">
          <div className="h-4 bg-gray-300 rounded w-full"></div>
        </td>
      ))}
    </tr>
  );
}

// Loading skeleton for stock level display
export function StockLevelSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-5 w-5 bg-gray-300 rounded"></div>
              <div>
                <div className="h-4 bg-gray-300 rounded w-32 mb-1"></div>
                <div className="h-3 bg-gray-300 rounded w-20"></div>
              </div>
            </div>
            <div className="text-right">
              <div className="h-4 bg-gray-300 rounded w-16 mb-1"></div>
              <div className="h-3 bg-gray-300 rounded w-12"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Progressive loading indicator
interface ProgressiveLoadingProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function ProgressiveLoading({ steps, currentStep, className = '' }: ProgressiveLoadingProps) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-center mb-4">
        <LoadingSpinner size="lg" className="text-blue-600" />
      </div>
      
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
              index < currentStep 
                ? 'bg-green-100 text-green-800'
                : index === currentStep
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {index < currentStep ? '✓' : index + 1}
            </div>
            <span className={`text-sm ${
              index <= currentStep ? 'text-gray-900' : 'text-gray-500'
            }`}>
              {step}
            </span>
            {index === currentStep && (
              <LoadingSpinner size="sm" className="text-blue-600" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Inline loading indicator for buttons
export function ButtonLoading({ children, loading = false, className = '' }: {
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {loading && <LoadingSpinner size="sm" />}
      <span>{children}</span>
    </div>
  );
}

// Loading overlay for containers
export function LoadingOverlay({ 
  loading = false, 
  message = 'Chargement...', 
  children,
  className = ''
}: {
  loading?: boolean;
  message?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      {children}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="text-center">
            <LoadingSpinner size="lg" className="text-blue-600 mb-2" />
            <p className="text-sm text-gray-600">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Smart loading indicator that adapts based on data type
interface SmartLoadingProps {
  type: 'stock-levels' | 'movements' | 'transfers' | 'inventory' | 'reports';
  loading: boolean;
  error?: string | null;
  retry?: () => void;
  className?: string;
}

export function SmartLoading({ type, loading, error, retry, className = '' }: SmartLoadingProps) {
  const getIcon = () => {
    switch (type) {
      case 'stock-levels':
        return <Package className="h-8 w-8 text-blue-600" />;
      case 'movements':
        return <TrendingUp className="h-8 w-8 text-green-600" />;
      case 'transfers':
        return <RefreshCw className="h-8 w-8 text-purple-600" />;
      case 'inventory':
        return <Package className="h-8 w-8 text-orange-600" />;
      case 'reports':
        return <TrendingUp className="h-8 w-8 text-indigo-600" />;
      default:
        return <LoadingSpinner size="lg" />;
    }
  };

  const getMessage = () => {
    switch (type) {
      case 'stock-levels':
        return 'Chargement des niveaux de stock...';
      case 'movements':
        return 'Chargement des mouvements...';
      case 'transfers':
        return 'Chargement des transferts...';
      case 'inventory':
        return 'Chargement des inventaires...';
      case 'reports':
        return 'Génération des rapports...';
      default:
        return 'Chargement...';
    }
  };

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
        <p className="text-sm text-red-600 mb-3">{error}</p>
        {retry && (
          <button
            onClick={retry}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
          >
            Réessayer
          </button>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="flex items-center justify-center mb-3">
          {loading ? <LoadingSpinner size="lg" className="text-blue-600" /> : getIcon()}
        </div>
        <p className="text-sm text-gray-600">{getMessage()}</p>
      </div>
    );
  }

  return null;
}

// Lazy loading placeholder
export function LazyLoadingPlaceholder({ 
  height = 200, 
  message = 'Chargement du contenu...',
  className = ''
}: {
  height?: number;
  message?: string;
  className?: string;
}) {
  return (
    <div 
      className={`flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 ${className}`}
      style={{ height }}
    >
      <div className="text-center">
        <LoadingSpinner size="lg" className="text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">{message}</p>
      </div>
    </div>
  );
}

// Loading states for different screen sizes
export function ResponsiveLoading({ 
  desktop, 
  mobile, 
  loading = false 
}: {
  desktop: React.ReactNode;
  mobile: React.ReactNode;
  loading?: boolean;
}) {
  if (!loading) return null;

  return (
    <>
      <div className="hidden md:block">
        {desktop}
      </div>
      <div className="md:hidden">
        {mobile}
      </div>
    </>
  );
}

// Performance-aware loading component
export function PerformanceAwareLoading({
  loading,
  children,
  fallback,
  timeout = 5000,
  onTimeout
}: {
  loading: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  timeout?: number;
  onTimeout?: () => void;
}) {
  const [showTimeout, setShowTimeout] = React.useState(false);

  React.useEffect(() => {
    if (!loading) {
      setShowTimeout(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowTimeout(true);
      onTimeout?.();
    }, timeout);

    return () => clearTimeout(timer);
  }, [loading, timeout, onTimeout]);

  if (!loading) {
    return <>{children}</>;
  }

  if (showTimeout) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
        <p className="text-sm text-yellow-600 mb-3">
          Le chargement prend plus de temps que prévu...
        </p>
        <LoadingSpinner size="md" className="text-yellow-600" />
      </div>
    );
  }

  return fallback || <LoadingSpinner size="lg" className="mx-auto" />;
}