/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';

const AdminHubView = () => {
    const { openModal, users, stores, auditLogs } = useAppContext();
    const [tab, setTab] = useState('admin-users');

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'medium' }).format(date);
    }

    return (
        <section id="admin-view" className="view">
            <div className="card mb-6">
                <div className="card-header"><i className="fa fa-cogs"></i> Administration</div>
                <div className="flex gap-3 mb-4 border-b pb-3">
                    <button className={`btn btn-ghost btn-sm ${tab === 'admin-users' ? 'bg-bg-subtle text-text-main' : ''}`} onClick={() => setTab('admin-users')}>Utilisateurs</button>
                    <button className={`btn btn-ghost btn-sm ${tab === 'admin-stores' ? 'bg-bg-subtle text-text-main' : ''}`} onClick={() => setTab('admin-stores')}>Magasins</button>
                    <button className={`btn btn-ghost btn-sm ${tab === 'admin-logs' ? 'bg-bg-subtle text-text-main' : ''}`} onClick={() => setTab('admin-logs')}>Logs</button>
                </div>
                {tab === 'admin-users' && <div>
                    <div className="flex justify-between items-center mb-4"><h3 className="font-semibold">Gestion des comptes</h3><button className="btn btn-primary btn-sm" onClick={() => openModal('modalAjoutUtilisateur')}><i className="fa fa-user-plus"></i> Ajouter</button></div>
                    <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr><th>Nom</th><th>Identifiant</th><th>Rôle</th><th>Magasin</th><th className="text-center">Statut</th><th className="text-center">Action</th></tr></thead>
                    <tbody>
                        {users.length > 0 ? users.map(u => <tr key={u.id}><td>{u.name}</td><td>{u.login}</td><td>{u.role}</td><td>{u.store}</td><td className="text-center"><span className={`status-chip ${u.status === 'Actif' ? 'status-green' : 'status-red'}`}>{u.status}</span></td>
                        <td className="text-center"><button className="btn btn-ghost btn-sm" onClick={() => openModal('modalModifierUtilisateur', { user: u })}><i className="fa fa-pencil-alt text-xs"></i></button></td></tr>) 
                        : (<tr><td colSpan={6} className="text-center py-4 text-text-muted">Aucun utilisateur.</td></tr>)}
                    </tbody></table></div>
                </div>}
                {tab === 'admin-stores' && <div>
                    <div className="flex justify-between items-center mb-4"><h3 className="font-semibold">Points de vente</h3><button className="btn btn-primary btn-sm" onClick={() => openModal('modalAjoutMagasin')}><i className="fa fa-store"></i> Nouveau magasin</button></div>
                    <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr><th>Nom</th><th>Type</th><th>Adresse</th><th className="text-center">Statut</th><th className="text-center">Action</th></tr></thead>
                    <tbody>
                        {stores.length > 0 ? stores.map(s => <tr key={s.id}><td>{s.name}</td><td>{s.type}</td><td>{s.address}</td><td className="text-center"><span className={`status-chip ${s.status === 'Actif' ? 'status-green' : 'status-red'}`}>{s.status}</span></td>
                        <td className="text-center"><button className="btn btn-ghost btn-sm" onClick={() => openModal('modalModifierMagasin', { store: s })}><i className="fa fa-pencil-alt text-xs"></i></button></td></tr>)
                        : (<tr><td colSpan={5} className="text-center py-4 text-text-muted">Aucun magasin.</td></tr>)}
                    </tbody></table></div>
                </div>}
                {tab === 'admin-logs' && <div>
                    <h3 className="font-semibold mb-4">Journal des actions</h3>
                    <div className="overflow-x-auto max-h-96"><table className="w-full text-sm"><thead><tr><th>Date</th><th>Utilisateur</th><th>Action</th><th>Détails</th></tr></thead>
                    <tbody className="divide-y divide-border-color">
                        {auditLogs.length > 0 ? auditLogs.map(log => <tr key={log.id}>
                            <td className="text-text-muted">{formatDate(log.date)}</td>
                            <td>{log.user}</td>
                            <td><span className="font-mono text-xs bg-bg-subtle p-1 rounded">{log.action}</span></td>
                            <td>{log.details}</td>
                        </tr>)
                        : (<tr><td colSpan={4} className="text-center py-10 text-text-muted"><i className="fa fa-history mr-2"></i>Aucune action enregistrée pour le moment.</td></tr>)}
                    </tbody></table></div>
                </div>}
            </div>
        </section>
    );
};

export default AdminHubView;