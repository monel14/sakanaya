/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { CurrentUser } from '../App';

interface HeaderProps {
    onMenuToggle: () => void;
    currentUser: CurrentUser;
    onLogout: () => void;
}

const Header = ({ onMenuToggle, currentUser, onLogout }: HeaderProps) => {
    const { notifications, markNotificationsAsRead } = useAppContext();
    const [showNotifications, setShowNotifications] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;

    const handleBellClick = () => {
      setShowNotifications(!showNotifications);
      if (unreadCount > 0) {
        markNotificationsAsRead();
      }
    }

    return (
        <header className="site-header shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button id="menuToggle" onClick={onMenuToggle} className="p-2 rounded-lg lg:hidden btn-ghost" aria-label="Ouvrir le menu">
                <i className="fa fa-bars"></i>
                </button>
                <div className="flex items-center gap-3">
                <div className="rounded-lg p-2 bg-white shadow-sm"><i className="fa-solid fa-fish text-primary"></i></div>
                <div>
                    <div className="text-lg font-semibold">Sakanaya</div>
                    <div className="text-xs muted">Gestion & supervision — V4</div>
                </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center bg-bg-subtle rounded-xl p-2 shadow-sm gap-2 cursor-not-allowed">
                    <input 
                        id="globalSearch" 
                        aria-label="Recherche globale désactivée" 
                        className="px-3 py-2 outline-none text-sm w-64 bg-transparent" 
                        placeholder="Recherche globale désactivée"
                        disabled={true}
                    />
                    <button type="button" className="btn btn-ghost btn-sm" disabled={true}>
                        <i className="fa fa-magnifying-glass text-text-muted"></i>
                    </button>
                </div>

                <div className="relative">
                  <button onClick={handleBellClick} className="btn btn-ghost btn-sm" title="Notifications">
                    <i className="fa fa-bell"></i>
                    {unreadCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-xs font-bold text-white">{unreadCount}</span>}
                  </button>
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border z-10 p-2">
                      <div className="font-semibold text-sm mb-2 px-2">Notifications</div>
                      <ul className="space-y-1">
                        {notifications.length > 0 ? notifications.map(n => (
                          <li key={n.id} className="p-2 text-sm rounded-md hover:bg-bg-subtle">{n.message}</li>
                        )) : <li className="p-2 text-sm text-text-muted">Aucune notification</li>}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                <div id="currentUserLabel" className="text-sm text-right hidden md:block">
                    <div>{currentUser.name}</div>
                    <div className="text-xs muted">{currentUser.role}</div>
                </div>
                <button id="logoutBtn" className="btn btn-ghost btn-sm" title="Déconnexion" onClick={onLogout}><i className="fa fa-sign-out-alt"></i></button>
                </div>
            </div>
            </div>
        </header>
    );
}

export default Header;