import React from 'react';
import { CATEGORIES } from '../constants';
import { useStore } from '../context/StoreContext';
import { AppHeader } from '../components/AppHeader';

export const Category: React.FC = () => {
    const { navigateTo, setSelectedCategory } = useStore();

    const handleCategoryClick = (categoryName: string) => {
        setSelectedCategory(categoryName);
        navigateTo('home');
    };

    return (
        <div className="bg-white min-h-full">
            <AppHeader title="全部分类" onBack={() => navigateTo('home')} />
            <div className="p-4 fade-in pb-28">
                <div className="grid grid-cols-3 gap-4">
                    {CATEGORIES.map((c, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => handleCategoryClick(c.name)}
                            className="flex flex-col items-center bg-white p-5 rounded-2xl shadow-[0_10px_24px_rgba(15,23,42,0.12)] active:scale-95 transition cursor-pointer hover:shadow-[0_14px_30px_rgba(15,23,42,0.16)]"
                        >
                             <div className={`w-14 h-14 bg-${c.color}-50 text-${c.color}-500 rounded-full flex items-center justify-center text-2xl mb-3 shadow-sm`}>
                                <i className={`fas ${c.icon}`}></i>
                             </div>
                             <span className="text-sm font-medium text-gray-700">{c.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
