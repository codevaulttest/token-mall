import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { InventoryItem } from '../types';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { AppHeader } from '../components/AppHeader';

interface InventoryProps {
    onActionClick: (type: 'transfer' | 'pickup' | 'history' | 'bulk_transfer' | 'bulk_pickup', item?: InventoryItem, bulkItems?: InventoryItem[]) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ onActionClick }) => {
    const { inventory, navigateTo, showToast } = useStore();
    
    // Bulk Selection State
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    const enterSelectionMode = () => {
        if (inventory.length === 0) {
            showToast('暂无库存可操作');
            return;
        }
        setIsSelectionMode(true);
        setSelectedIds(new Set());
    };

    const cancelSelectionMode = () => {
        setIsSelectionMode(false);
        setSelectedIds(new Set());
    };

    const toggleSelection = (id: number) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === inventory.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(inventory.map(i => i.inventoryId)));
        }
    };

    const handleBulkAction = (type: 'transfer' | 'pickup') => {
        if (selectedIds.size === 0) {
            showToast('请至少选择一件商品');
            return;
        }
        
        const selectedItems = inventory.filter(i => selectedIds.has(i.inventoryId));
        
        if (type === 'transfer') {
            onActionClick('bulk_transfer', undefined, selectedItems);
        } else {
            onActionClick('bulk_pickup', undefined, selectedItems);
        }
        
        // Don't close selection mode immediately, wait for modal close (managed by App, but here we can reset if needed or keep it open)
        // For better UX, we usually keep it until success, but here modal handles success. 
        // We will reset after action triggered.
        cancelSelectionMode();
    };

    return (
        <div className="min-h-full relative pb-4 bg-white">
            <AppHeader
                title={isSelectionMode ? '选择商品' : '我的库存'}
                onBack={isSelectionMode ? cancelSelectionMode : () => navigateTo('home')}
                actions={isSelectionMode ? (
                    <div className="flex items-center gap-3 animate-fade-in">
                        <button onClick={cancelSelectionMode} className="text-gray-500 font-medium text-sm">取消</button>
                        <button onClick={toggleSelectAll} className="text-[#F5416C] font-medium text-sm">
                            {selectedIds.size === inventory.length ? '取消全选' : '全选'}
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigateTo('history')}
                            className="flex items-center gap-1 text-gray-500 text-xs font-medium active:text-gray-700 transition"
                        >
                            提货记录
                            <i className="fas fa-chevron-right text-[10px]"></i>
                        </button>
                    </div>
                )}
            >
                {!isSelectionMode && inventory.length > 0 && (
                    <button
                        onClick={enterSelectionMode}
                        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#F5416C]/15 bg-[#FFF4F7] text-sm font-bold text-[#F5416C] active:bg-[#FFE8EF] transition"
                    >
                        <i className="fas fa-tasks text-sm"></i>
                        批量操作
                    </button>
                )}
            </AppHeader>

            <div className={`px-4 space-y-3 fade-in pb-24 ${isSelectionMode ? 'pt-3' : ''}`}>
                {inventory.length === 0 ? (
                    <div className="text-center text-gray-400 py-20 flex flex-col items-center">
                        <i className="fas fa-box-open text-6xl text-gray-200 mb-4"></i>
                        <p>空空如也，快去市集看看吧</p>
                        <button onClick={() => navigateTo('home')} className="mt-6 bg-[#F5416C] text-white px-6 py-2 rounded-full text-sm font-medium shadow-md shadow-[#F5416C]/30 active:scale-95 transition">前往市集</button>
                    </div>
                ) : (
                    inventory.map(item => (
                        <div 
                            key={item.inventoryId} 
                            onClick={() => isSelectionMode ? toggleSelection(item.inventoryId) : null}
                            className={`bg-white p-3 rounded-2xl border border-gray-100/80 shadow-[0_6px_18px_rgba(15,23,42,0.06)] flex gap-3 transition-all duration-300 ${isSelectionMode ? 'cursor-pointer active:scale-[0.99]' : ''} ${isSelectionMode && selectedIds.has(item.inventoryId) ? 'ring-2 ring-[#F5416C]/50 bg-[#F5416C]/5' : ''}`}
                        >
                            {/* Selection Checkbox */}
                            {isSelectionMode && (
                                <div className="flex items-center justify-center w-8">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedIds.has(item.inventoryId) ? 'border-[#F5416C] bg-[#F5416C]' : 'border-gray-300'}`}>
                                        {selectedIds.has(item.inventoryId) && <i className="fas fa-check text-white text-xs"></i>}
                                    </div>
                                </div>
                            )}

                            <div className="relative w-24 h-24 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden">
                                <ImageWithFallback
                                    src={item.img}
                                    alt={item.title}
                                    className="w-full h-full"
                                    imgClassName="object-cover h-full"
                                />
                                {item.productType && (
                                    <span className={`absolute top-1 right-1 text-xs font-bold px-1 py-0.5 rounded-sm ${
                                        item.productType === '数字商品' ? 'bg-purple-50 text-purple-600 ring-1 ring-purple-200' :
                                        item.productType === '充值' ? 'bg-amber-50 text-amber-600 ring-1 ring-amber-200' :
                                        'bg-[#FFF1F6] text-[#F5416C] ring-1 ring-[#F5416C]/25'
                                    }`}>{item.productType}</span>
                                )}
                            </div>
                            <div className="flex-1 h-24 flex flex-col py-1 min-w-0">
                                <div>
                                    <div className="flex items-start gap-2">
                                        <h3 className="font-bold text-gray-800 text-sm line-clamp-2 leading-snug flex-1 min-w-0">{item.title}</h3>
                                        <span
                                            aria-label={`持有 ${item.count} 件`}
                                            className="shrink-0 inline-flex items-center justify-center rounded-full border border-[#F5416C]/10 bg-[#FFF0F3] px-2.5 py-0.5 text-xs font-bold leading-5 text-[#F5416C]"
                                        >
                                            x{item.count}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">{item.specs}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Floating Action Bar for Bulk Selection */}
            {isSelectionMode && (
                <div className="fixed bottom-0 left-0 right-0 z-[60] border-t border-gray-200 bg-white px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] slide-up">
                    <div className="flex items-center gap-3">
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-400">已选</p>
                            <p className="text-base font-extrabold text-gray-900">{selectedIds.size} 件</p>
                        </div>
                        <button
                            onClick={() => handleBulkAction('transfer')}
                            disabled={selectedIds.size === 0}
                            className={`inline-flex h-11 min-w-[88px] items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition active:scale-[0.98] ${selectedIds.size > 0 ? 'border-blue-100 bg-blue-50 text-blue-500 active:bg-blue-100' : 'border-gray-100 bg-gray-100 text-gray-300 cursor-not-allowed'}`}
                        >
                            <i className="fas fa-exchange-alt text-sm"></i>
                            转让
                        </button>
                        <button
                            onClick={() => handleBulkAction('pickup')}
                            disabled={selectedIds.size === 0}
                            className={`inline-flex h-11 min-w-[96px] items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold text-white shadow-lg transition active:scale-[0.98] ${selectedIds.size > 0 ? 'bg-[#F5416C] shadow-[#F5416C]/25' : 'bg-gray-300 shadow-none cursor-not-allowed'}`}
                        >
                            <i className="fas fa-truck text-sm"></i>
                            提货
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
