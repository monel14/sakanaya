/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import type { ToastMessage } from '../types';

export const ToastContainer = ({ toasts }: { toasts: ToastMessage[] }) => (
    <div className="toast-container" aria-live="polite">
        {toasts.map(toast => <div key={toast.id} className="toast"><div className="text-sm">{toast.message}</div></div>)}
    </div>
);
