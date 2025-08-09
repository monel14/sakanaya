import React from 'react';
import { User } from '../../auth/types';
import { ManagerDashboard } from './ManagerDashboard';
import { SalesEntry } from '../../sales';
import { ManagerStock } from '../../stock';
import { AttendanceManagement } from '../../hr';
import { ViewType } from './DirectorContent';

interface ManagerContentProps {
  activeView: ViewType;
  currentUser: User | null;
}

export const ManagerContent: React.FC<ManagerContentProps> = ({ activeView, currentUser }) => {
  switch (activeView) {
    case 'dashboard':
      return <ManagerDashboard currentUser={currentUser} />;
    case 'sales':
      return <SalesEntry currentUser={currentUser} />;
    case 'stock':
      return <ManagerStock />;
    case 'attendance':
      return <AttendanceManagement />;
    default:
      return <ManagerDashboard currentUser={currentUser} />;
  }
};