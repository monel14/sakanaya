/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import AppShell from './AppShell';
import LoginPage from './views/LoginPage';

type UserRole = 'Directeur' | 'Gérant (Almadies)';
export interface CurrentUser {
    name: string;
    role: UserRole;
}

export default function App() {
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

    const handleLoginSuccess = (user: CurrentUser) => {
        setCurrentUser(user);
    };

    const handleLogout = () => {
        setCurrentUser(null);
    };

    if (!currentUser) {
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }

    return <AppShell currentUser={currentUser} onLogout={handleLogout} />;
}
