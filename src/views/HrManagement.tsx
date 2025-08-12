/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { useAppContext } from '../contexts/AppContext';

const HRView = () => {
    const { openModal, employees } = useAppContext();
    return (
        <section id="hr-management" className="view">
            <div className="card mb-6">
                <div className="card-header"><i className="fa fa-users"></i> Gestion des employés <button className="btn btn-primary btn-sm ml-auto" onClick={() => openModal('modalAjoutEmploye')}><i className="fa fa-user-plus"></i> Nouvel employé</button></div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr><th>Nom</th><th>Magasin</th><th>Rôle</th><th className="text-right">Salaire</th><th className="text-center">Statut</th><th className="text-center">Action</th></tr></thead>
                    <tbody>
                      {employees.length > 0 ? employees.map(e => <tr key={e.id}><td>{e.name}</td><td>{e.store}</td><td>{e.role}</td><td className="text-right">{e.salary.toLocaleString('fr-FR')} CFA</td><td className="text-center"><span className={`status-chip ${e.status === 'Actif' ? 'status-green' : 'status-red'}`}>{e.status}</span></td>
                      <td className="text-center">
                          <button className="btn btn-ghost btn-sm" onClick={() => openModal('modalModifierEmploye', { employee: e })}>
                              <i className="fa fa-pencil-alt text-xs"></i>
                          </button>
                      </td>
                      </tr>)
                      : (<tr><td colSpan={6} className="text-center py-10"><div className="text-gray-500"><i className="fa fa-user-slash text-4xl mb-2"></i><p>Aucun employé enregistré.</p><button className="btn btn-primary btn-sm mt-4" onClick={() => openModal('modalAjoutEmploye')}>Ajouter un employé</button></div></td></tr>)}
                    </tbody>
                  </table>
                </div>
            </div>
        </section>
    );
};

export default HRView;