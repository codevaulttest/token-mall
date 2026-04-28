import React, { useState } from 'react';
import { PRODUCTS, getTokenAmountEntries } from '../constants';
import { useStore } from '../context/StoreContext';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { AppHeader } from '../components/AppHeader';

interface HomeProps {
    onProductClick: (id: number) => void;
}

const TABS = ['为您推荐', '天天低价', '发现好货', '新品首发', '通证好物'] as const;

const QUICK_ACTIONS = [
    { icon: 'fa-search',   label: '搜索库存', color: 'text-rose-500',   bg: 'bg-rose-50/60',   view: 'inventory'          },
    { icon: 'fa-box-open', label: '我的库存', color: 'text-sky-500',    bg: 'bg-sky-50/60',    view: 'inventory'          },
    { icon: 'fa-tag',      label: '码券',     color: 'text-amber-500',  bg: 'bg-amber-50/60',  view: 'redemption_history' },
    { icon: 'fa-store',    label: '更多商品', color: 'text-violet-500', bg: 'bg-violet-50/60', view: 'category'           },
] as const;

export const Home: React.FC<HomeProps> = ({ onProductClick }) => {
    const { navigateTo } = useStore();
    const [activeTab, setActiveTab] = useState<typeof TABS[number]>('为您推荐');

    const handleExitToHost = () => {
        console.log("Exit to Host App (CodeVAULT)");
    };

    return (
        <div className="pb-4 min-h-full bg-gradient-to-br from-[#F5416C] to-[#FF6B9D]">
            <AppHeader title="" onBack={handleExitToHost} />

            {/* Quick-nav buttons + category tabs */}
            <div className="bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                <div className="px-4 pt-2 pb-2">
                    <div className="grid grid-cols-4 gap-3">
                        {QUICK_ACTIONS.map(({ icon, label, color, bg, view }) => (
                            <button
                                key={label}
                                onClick={() => navigateTo(view)}
                                className={`flex flex-col items-center justify-center gap-2 rounded-2xl ${bg} aspect-square active:opacity-70 active:scale-95 transition`}
                            >
                                <i className={`fas ${icon} text-[22px] ${color}`}></i>
                                <span className="text-xs font-medium text-gray-600 leading-none text-center">{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex overflow-x-auto no-scrollbar">
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className="relative flex-1 flex-shrink-0 flex flex-col items-center px-3 pt-2.5 pb-3 transition-colors"
                            >
                                <span className={`text-sm whitespace-nowrap ${isActive ? 'text-[#F5416C] font-bold' : 'text-gray-500 font-medium'}`}>
                                    {tab}
                                </span>
                                {isActive && (
                                    <span className="absolute bottom-0 left-5 right-5 h-0.5 bg-[#F5416C] rounded-full"></span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Product grid */}
            <div className="px-2 pt-2 pb-4">
                <div className="grid grid-cols-3 gap-1.5">
                    {PRODUCTS.map(p => (
                        <div
                            key={p.id}
                            className="flex flex-col bg-white rounded overflow-hidden cursor-pointer active:opacity-90 transition-opacity"
                            onClick={() => onProductClick(p.id)}
                            style={{ transform: 'translateZ(0)' }}
                        >
                            <div className="relative overflow-hidden h-32 flex-shrink-0">
                                <ImageWithFallback
                                    src={p.img}
                                    alt={p.title}
                                    className="!absolute inset-0 w-full h-full"
                                    imgClassName="object-cover object-top w-full h-full"
                                    loading="lazy"
                                />
                                {p.productType && (
                                    <span className={`absolute top-1 right-1 text-xs font-bold px-1 py-0.5 rounded-sm ${
                                        p.productType === '数字商品' ? 'bg-purple-50 text-purple-600 ring-1 ring-purple-200' :
                                        p.productType === '充值' ? 'bg-amber-50 text-amber-600 ring-1 ring-amber-200' :
                                        'bg-[#FFF1F6] text-[#F5416C] ring-1 ring-[#F5416C]/25'
                                    }`}>{p.productType}</span>
                                )}
                            </div>

                            <div className="px-1.5 pt-1.5 pb-2 flex flex-col flex-1">
                                <p className="text-[13px] text-gray-900 font-semibold leading-snug line-clamp-2 mb-1">{p.title}</p>
                                {p.retailPrice && (
                                    <p className="text-xs text-gray-400 line-through mb-1.5 leading-none truncate">零售价 {p.retailPrice}</p>
                                )}
                                <p className="mx-auto mt-auto flex min-h-[34px] w-full flex-col items-center justify-center text-center bg-gradient-to-r from-[#F5416C] to-[#FF6B9D] text-white text-xs font-semibold leading-tight px-1 py-1 rounded">
                                    {getTokenAmountEntries(p.tokenPrice).map(([token, amount], idx, entries) => (
                                        <span key={token}>
                                            {amount.toLocaleString()} {token}{idx < entries.length - 1 ? ' +' : ''}
                                        </span>
                                    ))}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="text-center text-white/80 text-xs py-6">—— 已经到底了 ——</div>
            </div>
        </div>
    );
};
