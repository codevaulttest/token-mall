import React from 'react';
import { useStore } from '../context/StoreContext';

export const BottomNav: React.FC = () => {
    const { currentView, navigateTo } = useStore();
    
    // Highlight Home when on home or category view since category is a sub-section
    const isHomeActive = currentView === 'home' || currentView === 'category';

    return (
        <div className="absolute bottom-0 w-full bg-white border-t border-gray-100 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] h-[88px]">
            <div className="grid grid-cols-2 h-full items-end pb-6">
                {/* Home */}
                <button 
                    onClick={() => navigateTo('home')} 
                    className="flex flex-col items-center justify-center h-14 active:scale-95 transition group w-full"
                >
                    <i className={`fas fa-store text-2xl mb-1 transition-colors duration-300 ${isHomeActive ? 'text-[#FF6D16]' : 'text-gray-300 group-hover:text-gray-400'}`}></i>
                    <span className={`text-xs font-medium transition-colors duration-300 ${isHomeActive ? 'text-[#FF6D16]' : 'text-gray-400 group-hover:text-gray-500'}`}>商城</span>
                </button>
                
                {/* Inventory */}
                <button 
                    onClick={() => navigateTo('inventory')} 
                    className="flex flex-col items-center justify-center h-14 active:scale-95 transition group w-full"
                >
                    <i className={`fas fa-box-open text-2xl mb-1 transition-colors duration-300 ${currentView === 'inventory' ? 'text-[#FF6D16]' : 'text-gray-300 group-hover:text-gray-400'}`}></i>
                    <span className={`text-xs font-medium transition-colors duration-300 ${currentView === 'inventory' ? 'text-[#FF6D16]' : 'text-gray-400 group-hover:text-gray-500'}`}>我的库存</span>
                </button>
            </div>
        </div>
    );
};