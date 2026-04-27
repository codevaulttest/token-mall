import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { InventoryItem, Product, ActionLog, ViewState, Address } from '../types';
import { INITIAL_INVENTORY, PRODUCTS } from '../constants';

interface StoreContextType {
    currentView: ViewState;
    navigateTo: (view: ViewState) => void;
    inventory: InventoryItem[];
    logs: ActionLog[];
    userBalance: { [key: string]: number }; // Changed to generic map
    buyProduct: (productId: number, count: number, payment: { [key: string]: number }) => void;
    transferProduct: (inventoryId: number, count: number, targetUser: string) => void;
    pickupProduct: (inventoryId: number, count: number, info: string) => void;
    bulkTransferProduct: (items: { inventoryId: number, count: number }[], targetUser: string) => void;
    bulkPickupProduct: (items: { inventoryId: number, count: number }[], info: string) => void;
    toastMessage: string | null;
    showToast: (msg: string) => void;
    // Address Management
    addresses: Address[];
    addAddress: (addr: Omit<Address, 'id'>) => string; // Returns the new ID
    deleteAddress: (id: string) => void;
    setDefaultAddress: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Initial Mock Logs
const INITIAL_LOGS: ActionLog[] = [
    // 兑换记录
    { id: 'r1', orderId: '2026032710482201', date: '2026-03-27', type: '兑换(10000FEC)', item: '黄花梨面膜', img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=200&auto=format&fit=crop', count: 1, status: '已完成' },
    { id: 'r2', orderId: '2026021509331847', date: '2026-02-15', type: '兑换(47880FEC)', item: '黄花梨樽花月酒', img: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=200&auto=format&fit=crop', count: 1, status: '已完成' },
    { id: 'r3', orderId: '2025120314220093', date: '2025-12-03', type: '兑换(5000FEC+10000DOS)', item: '黄花梨足贴', img: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?q=80&w=200&auto=format&fit=crop', count: 2, status: '已完成' },
    { id: 'r4', orderId: '2025110822174456', date: '2025-11-08', type: '兑换(9900DOS)', item: '云梵普洱茶', img: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?q=80&w=200&auto=format&fit=crop', count: 1, status: '已完成' },
    // 提货记录
    { id: 'p1', orderId: '2026041814358821', date: '2026-04-18', type: '提货', item: '黄花梨樽花月酒', img: 'https://images.unsplash.com/photo-1569919659476-b08588c3571c?q=80&w=200&auto=format&fit=crop', count: 2, status: '待发货' },
    { id: 'p2', orderId: '2026032509201154', date: '2026-03-25', type: '提货', item: '豪酒', img: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=200&auto=format&fit=crop', count: 1, status: '待收货' },
    { id: 'p3', orderId: '2026010716459932', date: '2026-01-07', type: '批量提货', item: '黄花梨黑茶壹号 等3件', img: 'https://images.unsplash.com/photo-1564890369478-c5235089f65b?q=80&w=200&auto=format&fit=crop', count: 3, status: '已收货' },
    { id: 'p4', orderId: '2025042414358821', date: '2025-04-24', type: '提货', item: '七星伴月月饼', img: 'https://images.unsplash.com/photo-1631857455684-a54a2f03665f?q=80&w=200&auto=format&fit=crop', count: 1, status: '已收货' },
    // 转让记录
    { id: 't1', orderId: '2026040311245502', date: '2026-04-03', type: '转让', item: '黄花梨喷雾', img: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?q=80&w=200&auto=format&fit=crop', count: 1, status: '转让成功' },
    { id: 't2', orderId: '2026021807563318', date: '2026-02-18', type: '批量转让', item: '红酒 等2件', img: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=200&auto=format&fit=crop', count: 2, status: '转让成功' },
    { id: 't3', orderId: '2025093020114477', date: '2025-09-30', type: '转让', item: '黄花梨手串', img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=200&auto=format&fit=crop', count: 1, status: '转让成功' },
];

// Initial Mock Addresses - Cleared
const INITIAL_ADDRESSES: Address[] = [];

// Helper to generate Order ID (YYYYMMDDHHmmss + 4 random digits)
const generateOrderId = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    const random = Math.floor(Math.random() * 9000 + 1000);
    return `${year}${month}${day}${hour}${minute}${second}${random}`;
};

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentView, setCurrentView] = useState<ViewState>('home');
    const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
    const [logs, setLogs] = useState<ActionLog[]>(INITIAL_LOGS);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
    
    // Initial Balance Mock with all tokens
    const [userBalance, setUserBalance] = useState<{ [key: string]: number }>({ 
        FEC: 50000, 
        SLC: 5000,
        DOS: 100000,
        CNV: 20000
    });

    const showToast = useCallback((msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 2000);
    }, []);

    const navigateTo = (view: ViewState) => {
        setCurrentView(view);
        window.scrollTo(0, 0);
    };

    const addLog = (type: string, item: string, status: string, count: number, img: string) => {
        const newLog: ActionLog = {
            id: Date.now().toString() + Math.random(),
            orderId: generateOrderId(),
            date: new Date().toLocaleDateString().replace(/\//g, '-'),
            type,
            item,
            img,
            count,
            status
        };
        setLogs(prev => [newLog, ...prev]);
    };

    const buyProduct = (productId: number, count: number, payment: { [key: string]: number }) => {
        const product = PRODUCTS.find(p => p.id === productId);
        if (!product) return;

        // Check sufficient balance
        for (const [token, amount] of Object.entries(payment)) {
            if (amount > 0 && (userBalance[token] || 0) < amount) {
                showToast(`${token} 余额不足`);
                return;
            }
        }

        // Deduct Balance
        setUserBalance(prev => {
            const newBalance = { ...prev };
            for (const [token, amount] of Object.entries(payment)) {
                if (amount > 0) {
                    newBalance[token] = (newBalance[token] || 0) - amount;
                }
            }
            return newBalance;
        });

        setInventory(prev => {
            const existing = prev.find(i => i.productId === productId);
            if (existing) {
                return prev.map(i => i.productId === productId ? { ...i, count: i.count + count } : i);
            } else {
                return [{ ...product, inventoryId: Date.now(), productId, count: count, status: 'normal' }, ...prev];
            }
        });
        
        // Construct log type string based on payment mix
        const paymentParts = Object.entries(payment)
            .filter(([_, amount]) => amount > 0)
            .map(([token, amount]) => `${amount}${token}`);
            
        let logType = `兑换(${paymentParts.join('+')})`;

        addLog(logType, product.title, '已完成', count, product.img);
        showToast(`成功兑换 ${count} 件商品！`);
        setTimeout(() => navigateTo('inventory'), 800);
    };

    const transferProduct = (inventoryId: number, count: number, targetUser: string) => {
        const item = inventory.find(i => i.inventoryId === inventoryId);
        if (!item || item.count < count) {
            showToast('数量不足');
            return;
        }

        setInventory(prev => {
            const newInv = prev.map(i => {
                if (i.inventoryId === inventoryId) {
                    return { ...i, count: i.count - count };
                }
                return i;
            }).filter(i => i.count > 0);
            return newInv;
        });
        addLog('转让', item.title, '转让成功', count, item.img);
        showToast('转让成功');
    };

    const pickupProduct = (inventoryId: number, count: number, info: string) => {
        const item = inventory.find(i => i.inventoryId === inventoryId);
        if (!item || item.count < count) {
            showToast('数量不足');
            return;
        }

        setInventory(prev => {
            const newInv = prev.map(i => {
                if (i.inventoryId === inventoryId) {
                    return { ...i, count: i.count - count };
                }
                return i;
            }).filter(i => i.count > 0);
            return newInv;
        });
        addLog('提货', item.title, '待发货', count, item.img);
        showToast('提货申请已提交');
    };

    const bulkTransferProduct = (items: { inventoryId: number, count: number }[], targetUser: string) => {
        let successCount = 0;
        
        setInventory(prev => {
            let newInv = [...prev];
            items.forEach(actionItem => {
                const index = newInv.findIndex(i => i.inventoryId === actionItem.inventoryId);
                if (index !== -1 && newInv[index].count >= actionItem.count) {
                    newInv[index] = { ...newInv[index], count: newInv[index].count - actionItem.count };
                    successCount++;
                    addLog('批量转让', newInv[index].title, '转让成功', actionItem.count, newInv[index].img);
                }
            });
            return newInv.filter(i => i.count > 0);
        });

        if (successCount > 0) showToast(`成功转让 ${successCount} 种商品`);
    };

    const bulkPickupProduct = (items: { inventoryId: number, count: number }[], info: string) => {
        let successCount = 0;
        
        setInventory(prev => {
            let newInv = [...prev];
            items.forEach(actionItem => {
                const index = newInv.findIndex(i => i.inventoryId === actionItem.inventoryId);
                if (index !== -1 && newInv[index].count >= actionItem.count) {
                    newInv[index] = { ...newInv[index], count: newInv[index].count - actionItem.count };
                    successCount++;
                    addLog('批量提货', newInv[index].title, '待发货', actionItem.count, newInv[index].img);
                }
            });
            return newInv.filter(i => i.count > 0);
        });

        if (successCount > 0) showToast(`成功申请提货 ${successCount} 种商品`);
    };

    // Address Actions
    const addAddress = (addr: Omit<Address, 'id'>) => {
        const id = Date.now().toString();
        const newAddr = { ...addr, id };
        
        // Auto-set as default if it's the first address
        let finalAddr = newAddr;
        if (addresses.length === 0) {
            finalAddr = { ...newAddr, isDefault: true };
        }

        if (finalAddr.isDefault) {
            setAddresses(prev => prev.map(a => ({ ...a, isDefault: false })).concat(finalAddr));
        } else {
            setAddresses(prev => [...prev, finalAddr]);
        }
        return id;
    };

    const deleteAddress = (id: string) => {
        setAddresses(prev => {
            const remaining = prev.filter(a => a.id !== id);
            // If we deleted the default address, and there are others, make the first one default
            if (remaining.length > 0 && !remaining.some(a => a.isDefault)) {
                remaining[0].isDefault = true;
            }
            return remaining;
        });
    };

    const setDefaultAddress = (id: string) => {
        setAddresses(prev => prev.map(a => ({
            ...a,
            isDefault: a.id === id
        })));
    };

    return (
        <StoreContext.Provider value={{
            currentView,
            navigateTo,
            inventory,
            logs,
            userBalance,
            buyProduct,
            transferProduct,
            pickupProduct,
            bulkTransferProduct,
            bulkPickupProduct,
            toastMessage,
            showToast,
            addresses,
            addAddress,
            deleteAddress,
            setDefaultAddress
        }}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStore = () => {
    const context = useContext(StoreContext);
    if (!context) throw new Error("useStore must be used within a StoreProvider");
    return context;
};