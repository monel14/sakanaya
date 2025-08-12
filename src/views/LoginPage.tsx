/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import type { CurrentUser } from '../App';

interface LoginPageProps {
    onLoginSuccess: (user: CurrentUser) => void;
}

const LoginPage = ({ onLoginSuccess }: LoginPageProps) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('password');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = (user: 'directeur' | 'almadies') => {
        if (user === 'directeur') {
            onLoginSuccess({ name: 'Directeur Général', role: 'Directeur' });
        } else {
            onLoginSuccess({ name: 'Amadou Diallo', role: 'Gérant (Almadies)' });
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (username === 'directeur' && password === 'password') {
            handleLogin('directeur');
        } else if (username === 'almadies' && password === 'password') {
            handleLogin('almadies');
        } else {
            setError('Identifiant ou mot de passe incorrect.');
        }
    };

    return (
        <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2">
            {/* Branding Panel */}
            <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-primary to-accent text-white p-12 relative overflow-hidden">
                <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/10 rounded-full"></div>
                <div className="absolute -bottom-24 -right-10 w-72 h-72 bg-white/10 rounded-full"></div>
                <div className="z-10 text-center">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="rounded-2xl p-4 bg-white/20 shadow-lg backdrop-blur-sm"><i className="fa-solid fa-fish text-5xl"></i></div>
                    </div>
                    <h1 className="text-4xl font-bold">Sakanaya</h1>
                    <p className="text-lg mt-2 opacity-80">Votre solution de gestion pour poissonnerie</p>
                </div>
            </div>

            {/* Form Panel */}
            <div className="flex flex-col items-center justify-center bg-bg-main p-6 sm:p-12">
                <div className="w-full max-w-sm">
                    <div className="lg:hidden text-center mb-8">
                         <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="rounded-lg p-3 bg-white shadow-sm"><i className="fa-solid fa-fish text-2xl text-primary"></i></div>
                        </div>
                        <h1 className="text-2xl font-bold text-text-main">Bienvenue</h1>
                    </div>
                    <h2 className="text-xl font-semibold text-text-main">Connectez-vous à votre compte</h2>
                    <p className="text-text-muted mt-1 mb-6">Saisissez vos identifiants ci-dessous.</p>
                    
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="form-input-group">
                            <label htmlFor="username-input" className="sr-only">Identifiant</label>
                            <input
                                id="username-input"
                                name="username"
                                type="text"
                                autoFocus
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="form-input"
                                placeholder="Identifiant"
                            />
                            <i className="fa fa-user form-input-icon"></i>
                        </div>
                         <div className="form-input-group">
                            <label htmlFor="password-input" className="sr-only">Mot de passe</label>
                            <input
                                id="password-input"
                                name="password"
                                type={passwordVisible ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="form-input pr-12"
                                placeholder="Mot de passe"
                            />
                             <i className="fa fa-lock form-input-icon"></i>
                             <button type="button" onClick={() => setPasswordVisible(!passwordVisible)} className="password-toggle" aria-label="Afficher le mot de passe">
                                <i className={`fa ${passwordVisible ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>
                    
                        {error && <p className="text-sm text-danger text-center bg-danger-light p-2 rounded-lg">{error}</p>}

                        <div>
                            <button type="submit" className="btn btn-primary w-full py-3 text-base">
                                Se connecter
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                         <p className="text-sm text-text-muted mb-3">Ou connectez-vous rapidement :</p>
                         <div className="flex gap-3 justify-center">
                            <button onClick={() => handleLogin('directeur')} className="btn btn-ghost flex-1">
                                <i className="fa-solid fa-user-tie"></i>
                                Directeur
                            </button>
                            <button onClick={() => handleLogin('almadies')} className="btn btn-ghost flex-1">
                                <i className="fa-solid fa-store"></i>
                                Gérant
                            </button>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;