import React, { useState } from 'react';
import { PRODUCTS, formatTokenAmounts } from '../constants';
import { useStore } from '../context/StoreContext';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { AppHeader } from '../components/AppHeader';

interface HomeProps {
    onProductClick: (id: number) => void;
}

const TABS = ['为您推荐', '天天低价', '发现好货', '新品首发'] as const;

const QUICK_ACTIONS = [
    { icon: 'fa-search',   label: '搜索库存', color: 'text-[#F5416C]', bg: 'bg-[#F5416C]/10', view: 'inventory'          },
    { icon: 'fa-box-open', label: '我的库存', color: 'text-blue-500',   bg: 'bg-blue-50',      view: 'inventory'          },
    { icon: 'fa-tag',      label: '码券',     color: 'text-amber-500',  bg: 'bg-amber-50',     view: 'redemption_history' },
    { icon: 'fa-store',    label: '更多商品', color: 'text-purple-500', bg: 'bg-purple-50',    view: 'category'           },
] as const;

export const Home: React.FC<HomeProps> = ({ onProductClick }) => {
    const { navigateTo } = useStore();
    const [activeTab, setActiveTab] = useState<typeof TABS[number]>('为您推荐');

    const handleExitToHost = () => {
        console.log("Exit to Host App (CodeVAULT)");
    };

    return (
        <div className="pb-4 bg-[#F5416C] min-h-full">
            <AppHeader title="" onBack={handleExitToHost} />

            {/* Quick-nav buttons */}
            <div className="px-4 pt-3 pb-4 grid grid-cols-4 gap-3">
                {QUICK_ACTIONS.map(({ icon, label, view }) => (
                    <button
                        key={label}
                        onClick={() => navigateTo(view)}
                        className="flex flex-col items-center justify-center gap-2 bg-white/20 rounded-2xl py-4 active:scale-95 transition"
                    >
                        <i className={`fas ${icon} text-2xl text-white`}></i>
                        <span className="text-xs font-medium text-white leading-tight text-center">{label}</span>
                    </button>
                ))}
            </div>

            {/* Category tabs */}
            <div className="bg-white border-b border-gray-100">
                <div className="flex overflow-x-auto no-scrollbar">
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className="relative flex-shrink-0 flex flex-col items-center px-4 py-2.5 transition-colors"
                            >
                                <span className={`text-base whitespace-nowrap ${isActive ? 'text-[#F5416C] font-bold' : 'text-gray-600 font-medium'}`}>
                                    {tab}
                                </span>
                                {isActive && (
                                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#F5416C] rounded-full"></span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Product grid */}
            <div className="px-2 pt-2 pb-4">
                <div className="grid grid-cols-2 gap-2">
                    {PRODUCTS.map(p => (
                        <div
                            key={p.id}
                            className="flex flex-col bg-white rounded overflow-hidden cursor-pointer active:opacity-90 transition-opacity"
                            onClick={() => onProductClick(p.id)}
                            style={{ transform: 'translateZ(0)' }}
                        >
                            <div className="relative overflow-hidden max-h-52 flex-shrink-0">
                                <ImageWithFallback
                                    src={p.img}
                                    alt={p.title}
                                    className="w-full h-full"
                                    imgClassName="object-cover object-top w-full h-full"
                                    loading="lazy"
                                />
                            </div>

                            <div className="px-2 pt-2 pb-2.5 flex flex-col flex-1">
                                <p className="text-base text-gray-800 font-normal leading-snug line-clamp-2 mb-1.5">{p.title}</p>
                                <p className="text-xs text-gray-400 leading-tight mb-1.5">{p.specs}</p>
                                <p className="mt-auto block w-full text-center bg-[#F5416C] text-white text-xs font-extrabold leading-tight px-3 py-1.5 rounded whitespace-nowrap overflow-hidden text-ellipsis">
                                    {formatTokenAmounts(p.tokenPrice)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="text-center text-white/60 text-xs py-6">—— 已经到底了 ——</div>
            </div>
        </div>
    );
};
