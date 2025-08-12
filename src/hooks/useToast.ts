/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useCallback } from 'react';
import type { ToastMessage } from '../types';

export default function useToast() {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = useCallback((message: string) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3500);
    }, []);

    return { toasts, showToast };
}
