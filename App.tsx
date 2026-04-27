import React, { useState } from 'react';
import { Home } from './views/Home';
import { Inventory } from './views/Inventory';
import { Category } from './views/Category';
import { History } from './views/History';
import { useStore } from './context/StoreContext';
import { Toast } from './components/Toast';
import { UniversalModal } from './components/Modals';
import { ModalType, Product, InventoryItem } from './types';
import { PRODUCTS } from './constants';

const App: React.FC = () => {
    const { currentView } = useStore();
    
    // Local state for modals to separate UI state from Data state
    const [modalType, setModalType] = useState<ModalType>('none');
    const [activeItem, setActiveItem] = useState<Product | InventoryItem | null>(null);
    const [selectedBulkItems, setSelectedBulkItems] = useState<InventoryItem[]>([]);

    const handleProductClick = (id: number) => {
        const product = PRODUCTS.find(p => p.id === id);
        if (product) {
            setActiveItem(product);
            setModalType('product_detail');
        }
    };

    const handleInventoryAction = (type: 'transfer' | 'pickup' | 'history' | 'bulk_transfer' | 'bulk_pickup', item?: InventoryItem, bulkItems?: InventoryItem[]) => {
        if (type === 'bulk_transfer' || type === 'bulk_pickup') {
            if (bulkItems) setSelectedBulkItems(bulkItems);
            setModalType(type);
        } else if (item) {
            setActiveItem(item);
            if (type === 'transfer') setModalType('action_transfer');
            if (type === 'pickup') setModalType('action_pickup');
            if (type === 'history') setModalType('action_history');
        }
    };

    const closeModal = () => {
        setModalType('none');
        setTimeout(() => {
            setActiveItem(null);
            setSelectedBulkItems([]);
        }, 300); // Clear data after animation usually
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-[#F7F8FA] font-sans">
            <div className="relative max-w-[430px] w-full bg-[#F7F8FA] h-[100dvh] shadow-2xl overflow-hidden flex flex-col">
                
                <div className={`flex-1 overflow-y-auto no-scrollbar bg-[#F7F8FA] relative`}>
                    {currentView === 'home' && <Home onProductClick={handleProductClick} />}
                    {currentView === 'inventory' && <Inventory onActionClick={handleInventoryAction} />}
                    {currentView === 'category' && <Category />}
                    {currentView === 'history' && <History />}
                    {currentView === 'redemption_history' && <History initialTab="redemption" />}
                </div>

                
                <UniversalModal 
                    type={modalType} 
                    data={activeItem} 
                    selectedItems={selectedBulkItems}
                    onClose={closeModal} 
                />

                <Toast />
            </div>
        </div>
    );
};

export default App;