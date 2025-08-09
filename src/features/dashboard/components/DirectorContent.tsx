import React from 'react';
import { DirectorDashboard } from './DirectorDashboard';
import { ReportsView } from '../../reports';
import { StockManagement } from '../../stock';
import { ProductManagement, AdminView } from '../../admin';
import { HRManagement } from '../../hr';

export type ViewType = 
  | 'dashboard' 
  | 'reports' 
  | 'stock' 
  | 'products' 
  | 'hr' 
  | 'admin'
  | 'sales'
  | 'attendance';

interface DirectorContentProps {
  activeView: ViewType;
}

export const DirectorContent: React.FC<DirectorContentProps> = ({ activeView }) => {
  switch (activeView) {
    case 'dashboard':
      return <DirectorDashboard />;
    case 'reports':
      return <ReportsView />;
    case 'stock':
      return <StockManagement />;
    case 'products':
      return <ProductManagement />;
    case 'hr':
      return <HRManagement />;
    case 'admin':
      return <AdminView />;
    default:
      return <DirectorDashboard />;
  }
};