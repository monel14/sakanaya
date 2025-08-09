import React from 'react';
import { Button } from './Button';

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={() => onOpenChange(false)}
      />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        {children}
      </div>
    </div>
  );
};

interface AlertDialogContentProps {
  children: React.ReactNode;
  className?: string;
}

export const AlertDialogContent: React.FC<AlertDialogContentProps> = ({ children, className = '' }) => {
  return <div className={`p-6 ${className}`}>{children}</div>;
};

interface AlertDialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const AlertDialogHeader: React.FC<AlertDialogHeaderProps> = ({ children, className = '' }) => {
  return <div className={`mb-4 ${className}`}>{children}</div>;
};

interface AlertDialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const AlertDialogTitle: React.FC<AlertDialogTitleProps> = ({ children, className = '' }) => {
  return <h2 className={`text-lg font-semibold text-slate-900 ${className}`}>{children}</h2>;
};

interface AlertDialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const AlertDialogDescription: React.FC<AlertDialogDescriptionProps> = ({ children, className = '' }) => {
  return <p className={`text-sm text-slate-600 mt-2 ${className}`}>{children}</p>;
};

interface AlertDialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const AlertDialogFooter: React.FC<AlertDialogFooterProps> = ({ children, className = '' }) => {
  return <div className={`flex justify-end space-x-2 mt-6 ${className}`}>{children}</div>;
};

interface AlertDialogActionProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const AlertDialogAction: React.FC<AlertDialogActionProps> = ({ children, onClick, className = '' }) => {
  return (
    <Button onClick={onClick} className={className}>
      {children}
    </Button>
  );
};

interface AlertDialogCancelProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const AlertDialogCancel: React.FC<AlertDialogCancelProps> = ({ children, onClick, className = '' }) => {
  return (
    <Button variant="outline" onClick={onClick} className={className}>
      {children}
    </Button>
  );
};