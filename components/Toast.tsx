import React from 'react';
import { useStore } from '../context/StoreContext';

export const Toast: React.FC = () => {
    const { toastMessage } = useStore();

    if (!toastMessage) return null;

    return (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-gray-800/90 backdrop-blur text-white px-5 py-2.5 rounded-full text-sm shadow-lg z-[70] flex items-center gap-2 transition-all fade-in">
            <i className="fas fa-check-circle text-green-400"></i>
            <span>{toastMessage}</span>
        </div>
    );
};