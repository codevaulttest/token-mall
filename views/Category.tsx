import React from 'react';
import { CATEGORIES } from '../constants';
import { useStore } from '../context/StoreContext';

export const Category: React.FC = () => {
    const { navigateTo } = useStore();

    return (
        <div className="bg-[#F7F8FA] min-h-full">
            <div className="sticky top-0 bg-white z-40 px-6 py-5 border-b border-gray-50 shadow-sm flex items-center gap-3">
                <button onClick={() => navigateTo('home')} className="w-8 h-8 flex items-center justify-center -ml-2 rounded-full active:bg-gray-100 transition">
                    <i className="fas fa-chevron-left text-lg text-gray-800"></i>
                </button>
                <h1 className="text-xl font-extrabold text-gray-900">全部分类</h1>
            </div>
            <div className="p-4 fade-in pb-28">
                <div className="grid grid-cols-3 gap-4">
                    {CATEGORIES.map((c, idx) => (
                        <div key={idx} className="flex flex-col items-center bg-white p-5 rounded-2xl shadow-sm active:scale-95 transition cursor-pointer hover:shadow-md">
                             <div className={`w-14 h-14 bg-${c.color}-50 text-${c.color}-500 rounded-full flex items-center justify-center text-2xl mb-3 shadow-sm`}>
                                <i className={`fas ${c.icon}`}></i>
                             </div>
                             <span className="text-sm font-medium text-gray-700">{c.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};