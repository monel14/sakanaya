import React from 'react';
import { MobileStockManagement } from '../components/mobile/MobileStockManagement';

export const MobileStockDemo: React.FC = () => {
  return (
    <div className="h-screen bg-slate-50">
      <MobileStockManagement 
        storeId="store-1" 
        userRole="manager"
      />
    </div>
  );
};

export default MobileStockDemo;