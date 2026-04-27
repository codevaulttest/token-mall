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
    const [selectionType, setSelectionType] = useState<'transfer' | 'pickup' | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    const enterSelectionMode = (type: 'transfer' | 'pickup') => {
        if (inventory.length === 0) {
            showToast('暂无库存可操作');
            return;
        }
        setIsSelectionMode(true);
        setSelectionType(type);
        setSelectedIds(new Set());
    };

    const cancelSelectionMode = () => {
        setIsSelectionMode(false);
        setSelectionType(null);
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

    const handleConfirmBulk = () => {
        if (selectedIds.size === 0) {
            showToast('请至少选择一件商品');
            return;
        }
        
        const selectedItems = inventory.filter(i => selectedIds.has(i.inventoryId));
        
        if (selectionType === 'transfer') {
            onActionClick('bulk_transfer', undefined, selectedItems);
        } else if (selectionType === 'pickup') {
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
                title={isSelectionMode ? `已选择 ${selectedIds.size} 件` : '我的库存'}
                onBack={isSelectionMode ? cancelSelectionMode : () => navigateTo('home')}
                actions={isSelectionMode ? (
                    <div className="flex items-center gap-3 animate-fade-in">
                        <button onClick={cancelSelectionMode} className="text-gray-500 font-medium text-sm">取消</button>
                        <button onClick={toggleSelectAll} className="text-[#FF6D16] font-medium text-sm">
                            {selectedIds.size === inventory.length ? '取消全选' : '全选'}
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => enterSelectionMode('transfer')}
                            className="h-8 px-2.5 bg-[#FF6D16]/10 border border-[#FF6D16]/20 text-[#FF6D16] rounded-lg text-xs font-bold active:bg-[#FF6D16]/20 transition flex items-center gap-1.5"
                        >
                            <i className="fas fa-exchange-alt text-[#FF6D16]"></i> 批量转让
                        </button>
                        <button
                            onClick={() => enterSelectionMode('pickup')}
                            className="h-8 px-2.5 bg-[#25C4D9] border border-[#25C4D9] text-white rounded-lg text-xs font-bold active:scale-95 transition flex items-center gap-1.5 shadow-md shadow-[#25C4D9]/20"
                        >
                            <i className="fas fa-truck text-white"></i> 批量提货
                        </button>
                    </div>
                )}
            />

            <div className="px-4 space-y-4 fade-in pb-24">
                {inventory.length === 0 ? (
                    <div className="text-center text-gray-400 py-20 flex flex-col items-center">
                        <i className="fas fa-box-open text-6xl text-gray-200 mb-4"></i>
                        <p>空空如也，快去市集看看吧</p>
                        <button onClick={() => navigateTo('home')} className="mt-6 bg-[#FF6D16] text-white px-6 py-2 rounded-full text-sm font-medium shadow-md shadow-[#FF6D16]/30 active:scale-95 transition">前往市集</button>
                    </div>
                ) : (
                    inventory.map(item => (
                        <div 
                            key={item.inventoryId} 
                            onClick={() => isSelectionMode ? toggleSelection(item.inventoryId) : null}
                            className={`bg-white p-3 rounded-2xl shadow-[0_10px_24px_rgba(15,23,42,0.12)] flex gap-3 transition-all duration-300 ${isSelectionMode ? 'cursor-pointer active:scale-[0.99]' : ''} ${isSelectionMode && selectedIds.has(item.inventoryId) ? 'ring-2 ring-[#FF6D16]/50 bg-[#FF6D16]/5' : ''}`}
                        >
                            {/* Selection Checkbox */}
                            {isSelectionMode && (
                                <div className="flex items-center justify-center w-8">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedIds.has(item.inventoryId) ? 'border-[#FF6D16] bg-[#FF6D16]' : 'border-gray-300'}`}>
                                        {selectedIds.has(item.inventoryId) && <i className="fas fa-check text-white text-xs"></i>}
                                    </div>
                                </div>
                            )}

                            <div className="w-24 h-24 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden">
                                <ImageWithFallback
                                    src={item.img}
                                    alt={item.title}
                                    className="w-full h-full"
                                    imgClassName="object-cover h-full"
                                />
                            </div>
                            <div className="flex-1 flex flex-col justify-between py-1">
                                <div>
                                    <h3 className="font-bold text-gray-800 text-sm line-clamp-2 leading-snug">{item.title}</h3>
                                    <p className="text-xs text-gray-400 mt-1">{item.specs}</p>
                                </div>
                                
                                {!isSelectionMode && (
                                    <div className="flex mt-3 items-center justify-between">
                                        <span className="text-xs font-semibold text-[#FF6D16]">持有 x{item.count}</span>
                                        <div className="flex gap-2">
                                            <button onClick={(e) => { e.stopPropagation(); onActionClick('transfer', item); }} className="px-3 py-1.5 bg-[#FF6D16]/10 border border-[#FF6D16]/20 text-[#FF6D16] rounded-lg text-xs font-medium active:bg-[#FF6D16]/20 transition flex items-center gap-1">
                                                <i className="fas fa-exchange-alt"></i>
                                                转让
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); onActionClick('pickup', item); }} className="px-4 py-1.5 bg-[#25C4D9] text-white rounded-lg text-xs font-bold active:scale-95 transition shadow-sm shadow-[#25C4D9]/30 flex items-center gap-1">
                                                <i className="fas fa-truck"></i>
                                                提货
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Floating Action Bar for Bulk Selection */}
            {isSelectionMode && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-[60] slide-up shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                     <button 
                        onClick={handleConfirmBulk}
                        disabled={selectedIds.size === 0}
                        className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-[0.98] ${selectedIds.size > 0 ? (selectionType === 'transfer' ? 'bg-[#FF6D16] shadow-[#FF6D16]/30' : 'bg-[#25C4D9] shadow-[#25C4D9]/30') : 'bg-gray-300 shadow-none cursor-not-allowed'}`}
                    >
                        {selectionType === 'transfer' ? '确认批量转让' : '确认批量提货'} ({selectedIds.size})
                    </button>
                </div>
            )}
        </div>
    );
};
