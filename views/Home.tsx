import React, { useState, useMemo } from 'react';
import { PRODUCTS, CATEGORIES, TOKENS, getTokenAmountEntries } from '../constants';
import { useStore } from '../context/StoreContext';
import { ImageWithFallback } from '../components/ImageWithFallback';

interface HomeProps {
    onProductClick: (id: number) => void;
}

export const Home: React.FC<HomeProps> = ({ onProductClick }) => {
    const { navigateTo } = useStore();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const toggleCategory = (categoryName: string) => {
        if (selectedCategory === categoryName) {
            setSelectedCategory(null);
        } else {
            setSelectedCategory(categoryName);
        }
    };

    const filteredProducts = useMemo(() => {
        return PRODUCTS.filter(p => {
            const matchesCategory = selectedCategory ? p.categories.includes(selectedCategory) : true;
            const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  p.desc.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [selectedCategory, searchQuery]);

    const handleExitToHost = () => {
        console.log("Exit to Host App (CodeVAULT)");
        // In a real environment: window.CodeVAULT.close()
    };

    return (
        <div className="pb-4 bg-white min-h-full">
            {/* Custom Header with Safe Area Padding */}
            <div className="bg-white px-4 pb-3.5 pt-[calc(env(safe-area-inset-top)+0.875rem)] sticky top-0 z-40 border-b border-gray-100 flex justify-between items-center text-gray-900">
                <button onClick={handleExitToHost} className="w-10 h-8 flex items-center justify-start active:opacity-60 transition-opacity">
                    <i className="fas fa-chevron-left text-xl"></i>
                </button>
                <div className="absolute left-1/2 -translate-x-1/2 font-bold text-lg tracking-wide">通证兑换</div>
                <div
                    className="h-8 w-[88px] rounded-full border border-gray-200 bg-white flex items-center justify-center gap-3"
                    aria-hidden="true"
                >
                    <i className="fas fa-ellipsis-h text-base"></i>
                    <span className="h-4 w-px bg-gray-200"></span>
                    <span className="w-5 h-5 rounded-full border-2 border-gray-900 flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-900"></span>
                    </span>
                </div>
            </div>

            {/* Search and Categories Container */}
            <div className="bg-white">
                {/* Search Bar */}
                <div className="px-4 py-3">
                    <div className="flex items-center bg-gray-100/80 rounded-full px-4 py-2.5 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-[#FF6D16]/20 focus-within:shadow-sm">
                        <i className="fas fa-search text-gray-400 mr-3"></i>
                        <input 
                            type="text" 
                            placeholder="搜索商品通证、权益..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent w-full focus:outline-none text-sm text-gray-700 placeholder-gray-400" 
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="text-gray-400 p-1">
                                <i className="fas fa-times-circle"></i>
                            </button>
                        )}
                    </div>
                </div>

                {/* Quick Nav Buttons */}
                <div className="grid grid-cols-3 gap-2 px-4 pb-3 pt-1">
                    {[
                        { icon: 'fa-box-open', label: '我的库存', color: 'text-blue-500', bg: 'bg-blue-50', view: 'inventory' as const },
                        { icon: 'fa-history', label: '记录', color: 'text-rose-400', bg: 'bg-rose-50', view: 'redemption_history' as const },
                        { icon: 'fa-th-large', label: '分类', color: 'text-purple-500', bg: 'bg-purple-50', view: 'category' as const },
                    ].map(({ icon, label, color, bg, view }) => (
                        <button
                            key={label}
                            onClick={() => navigateTo(view)}
                            className={`flex flex-col items-center justify-center gap-2 ${bg} rounded-2xl py-4 active:scale-95 transition`}
                        >
                            <i className={`fas ${icon} text-2xl ${color}`}></i>
                            <span className={`text-xs font-medium ${color} leading-tight text-center`}>{label}</span>
                        </button>
                    ))}
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar px-3 pb-4 pt-1">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`h-8 px-4 rounded-full text-xs font-bold whitespace-nowrap border transition ${
                            selectedCategory === null
                                ? 'bg-[#FF6D16] border-[#FF6D16] text-white shadow-md shadow-[#FF6D16]/20'
                                : 'bg-white border-gray-100 text-gray-500'
                        }`}
                    >
                        全部
                    </button>
                    {CATEGORIES.map(c => {
                        const isActive = selectedCategory === c.name;
                        return (
                            <button
                                key={c.name}
                                onClick={() => toggleCategory(c.name)}
                                className={`h-8 px-4 rounded-full text-xs font-bold whitespace-nowrap border transition ${
                                    isActive
                                        ? 'bg-[#FF6D16] border-[#FF6D16] text-white shadow-md shadow-[#FF6D16]/20'
                                        : 'bg-white border-gray-100 text-gray-500'
                                }`}
                            >
                                {c.name}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="px-3 pb-4">

                {/* Masonry Layout */}
                {filteredProducts.length > 0 ? (
                    <div className="columns-2 gap-3 space-y-3">
                        {filteredProducts.map(p => (
                            <div 
                                key={p.id} 
                                className="break-inside-avoid bg-white rounded-xl overflow-hidden shadow-[0_8px_24px_rgba(15,23,42,0.10)] hover:shadow-[0_12px_30px_rgba(15,23,42,0.14)] transition-shadow cursor-pointer group" 
                                onClick={() => onProductClick(p.id)}
                                style={{ transform: 'translateZ(0)' }} // Fix for rendering artifact where icons get cut off in column layout
                            >
                                <div className="relative overflow-hidden rounded-t-xl">
                                    <ImageWithFallback 
                                        src={p.img} 
                                        alt={p.title}
                                        className="w-full max-h-[300px] min-h-[100px]" 
                                        imgClassName="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                                        loading="lazy"
                                    />
                                    {/* Removed Badge */}
                                </div>
                                <div className="p-3">
                                    <h4 className="text-sm font-bold text-gray-800 leading-snug mb-1 line-clamp-2">{p.title}</h4>
                                    <div className="text-xs text-gray-400 mb-3">{p.specs}</div>
                                    
                                    <div className="flex justify-between items-end">
                                        <div className="flex flex-col gap-1">
                                            {(() => {
                                                const tokenEntries = getTokenAmountEntries(p.tokenPrice);
                                                if (tokenEntries.length > 0) {
                                                    return (
                                                        <div className="flex flex-wrap items-baseline gap-x-1">
                                                            {tokenEntries.map(([token, amount], idx) => (
                                                                <React.Fragment key={token}>
                                                                    {idx > 0 && <span className="text-base font-extrabold text-[#FF6D16] leading-none">+</span>}
                                                                    <div className="flex items-baseline gap-1">
                                                                    <span className="text-base font-extrabold text-[#FF6D16] leading-none">{amount.toLocaleString()}</span>
                                                                    <span className="text-xs font-bold text-[#FF6D16]">{token}</span>
                                                                    </div>
                                                                </React.Fragment>
                                                            ))}
                                                        </div>
                                                    );
                                                }

                                                const getRate = (id: string) => TOKENS.find(t => t.id === id)?.rate ?? 1;
                                                if (p.displayCurrency === 'MIX') {
                                                    const fec = Math.ceil(p.price * 0.8 * getRate('FEC'));
                                                    const slc = Math.ceil(p.price * 0.2 * getRate('SLC'));
                                                    return (
                                                        <div className="flex flex-col gap-0.5">
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-base font-extrabold text-[#FF6D16] leading-none">{fec.toLocaleString()}</span>
                                                                <span className="text-xs font-bold text-[#FF6D16]">FEC</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-sm font-extrabold text-[#FF6D16] leading-none">+</span>
                                                                <span className="text-base font-extrabold text-[#FF6D16] leading-none">{slc.toLocaleString()}</span>
                                                                <span className="text-xs font-bold text-[#FF6D16]">SLC</span>
                                                            </div>
                                                        </div>
                                                    );
                                                } else if (p.displayCurrency === 'DOS') {
                                                    const dos = Math.ceil(p.price * getRate('DOS'));
                                                    return (
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-base font-extrabold text-[#FF6D16] leading-none">{dos.toLocaleString()}</span>
                                                            <span className="text-xs font-bold text-[#FF6D16]">DOS</span>
                                                        </div>
                                                    );
                                                } else if (p.displayCurrency === 'CNV') {
                                                    const cnv = Math.ceil(p.price * getRate('CNV'));
                                                    return (
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-base font-extrabold text-[#FF6D16] leading-none">{cnv.toLocaleString()}</span>
                                                            <span className="text-xs font-bold text-[#FF6D16]">CNV</span>
                                                        </div>
                                                    );
                                                } else {
                                                    const fec = Math.ceil(p.price * getRate('FEC'));
                                                    return (
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-base font-extrabold text-[#FF6D16] leading-none">{fec.toLocaleString()}</span>
                                                            <span className="text-xs font-bold text-[#FF6D16]">FEC</span>
                                                        </div>
                                                    );
                                                }
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <i className="fas fa-search text-4xl mb-3 opacity-30"></i>
                        <p className="text-sm">未找到相关商品</p>
                        {(searchQuery || selectedCategory) && (
                            <button 
                                onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
                                className="mt-4 text-[#FF6D16] text-xs font-bold"
                            >
                                清除筛选条件
                            </button>
                        )}
                    </div>
                )}
                 {filteredProducts.length > 0 && <div className="text-center text-gray-400 text-xs py-6">—— 已经到底了 ——</div>}
            </div>
        </div>
    );
};
