import React, { useState, useEffect } from 'react';
import { Product, InventoryItem, ModalType, Address, TokenConfig } from '../types';
import { useStore } from '../context/StoreContext';
import { ImageWithFallback } from './ImageWithFallback';
import { CHINA_REGIONS, TOKENS, formatTokenAmounts, getProductDetailImages, getTokenAmountEntries } from '../constants';

interface ModalProps {
    type: ModalType;
    data: Product | InventoryItem | null;
    selectedItems?: InventoryItem[]; // Optional prop for bulk actions
    onClose: () => void;
}

export const UniversalModal: React.FC<ModalProps> = ({ type, data, selectedItems = [], onClose }) => {
    const { 
        userBalance,
        buyProduct, transferProduct, pickupProduct, 
        bulkTransferProduct, bulkPickupProduct,
        addresses, addAddress, setDefaultAddress, deleteAddress
    } = useStore();
    
    // General State
    const [inputCount, setInputCount] = useState(1);
    const [info, setInfo] = useState('');

    // Payment State
    const [paymentMethod, setPaymentMethod] = useState<'MIX' | 'DOS' | 'CNV'>('MIX');
    const [calculatedAmounts, setCalculatedAmounts] = useState<{ [key: string]: number }>({});

    // Bulk State
    const [bulkQuantities, setBulkQuantities] = useState<{ [id: number]: number }>({});
    
    // Address Book State
    const [modalView, setModalView] = useState<'main' | 'address_list' | 'address_form' | 'region_picker'>('main');
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [newAddressForm, setNewAddressForm] = useState({ name: '', phone: '', region: '', detail: '', isDefault: false });
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    // Region Picker State
    const [pickerHistory, setPickerHistory] = useState<string[]>([]);
    
    // Reset state when modal opens
    useEffect(() => {
        if (type !== 'none') {
            setInfo('');
            setModalView('main');
            setDeleteConfirmId(null);
            setSelectedAddressId(null);
            setInputCount(1);
            
            // Initialize bulk quantities
            if (type === 'bulk_pickup' || type === 'bulk_transfer') {
                const initialQuantities: { [id: number]: number } = {};
                selectedItems.forEach(item => {
                    initialQuantities[item.inventoryId] = 1;
                });
                setBulkQuantities(initialQuantities);
            }

            // Reset Payment
            setPaymentMethod('MIX'); 
            setCalculatedAmounts({});
        }
    }, [type, data, selectedItems]); 

    // --- Payment Calculation Logic ---
    useEffect(() => {
        if (type === 'product_detail' && data) {
            const p = data as Product;
            const totalCNY = p.price * inputCount;

            const newAmounts: { [key: string]: number } = {};

            const fixedTokenEntries = getTokenAmountEntries(p.tokenPrice);
            if (fixedTokenEntries.length > 0) {
                fixedTokenEntries.forEach(([token, amount]) => {
                    newAmounts[token] = amount * inputCount;
                });
                setCalculatedAmounts(newAmounts);
                return;
            }

            if (paymentMethod === 'MIX') {
                // Fixed Ratio Logic: 80% FEC + 20% SLC (Example fixed ratio)
                const RATIO_FEC = 0.8;
                const RATIO_SLC = 0.2;
                
                const fecToken = TOKENS.find(t => t.id === 'FEC');
                const slcToken = TOKENS.find(t => t.id === 'SLC');
                
                if (fecToken && slcToken) {
                    newAmounts['FEC'] = Math.ceil(totalCNY * RATIO_FEC * fecToken.rate);
                    newAmounts['SLC'] = Math.ceil(totalCNY * RATIO_SLC * slcToken.rate);
                }
            } else {
                // Single Token Payment
                const token = TOKENS.find(t => t.id === paymentMethod);
                if (token) {
                    newAmounts[token.id] = Math.ceil(totalCNY * token.rate);
                }
            }
            setCalculatedAmounts(newAmounts);
        } else {
            setCalculatedAmounts({});
        }
    }, [inputCount, paymentMethod, data, type]);


    // Handle Quantity Changes
    const updateQuantity = (newCount: number) => {
        const validCount = Math.max(1, newCount);
        setInputCount(validCount);
    };

    const handleBulkQuantityChange = (id: number, delta: number, max: number) => {
        setBulkQuantities(prev => {
            const current = prev[id] || 0;
            const next = Math.min(Math.max(0, current + delta), max); // Allow 0
            return { ...prev, [id]: next };
        });
    };
    
    const handleSetBulkMax = (id: number, max: number) => {
        setBulkQuantities(prev => ({ ...prev, [id]: max }));
    };

    const handleSaveAddress = () => {
        if (!newAddressForm.name || !newAddressForm.phone || !newAddressForm.region || !newAddressForm.detail) return;
        const newId = addAddress({
            name: newAddressForm.name,
            phone: newAddressForm.phone,
            fullAddress: `${newAddressForm.region}${newAddressForm.detail}`,
            isDefault: newAddressForm.isDefault
        });
        setSelectedAddressId(newId);
        setNewAddressForm({ name: '', phone: '', region: '', detail: '', isDefault: false });
        setModalView('main');
    };

    const getCurrentRegionList = () => {
        if (pickerHistory.length === 0) return CHINA_REGIONS.map(r => r.name);
        const province = CHINA_REGIONS.find(r => r.name === pickerHistory[0]);
        if (pickerHistory.length === 1) return province?.children.map(c => c.name) || [];
        const city = province?.children.find(c => c.name === pickerHistory[1]);
        if (pickerHistory.length === 2) return city?.children || [];
        return [];
    };

    const handleRegionSelect = (name: string) => {
        const nextHistory = [...pickerHistory, name];
        if (nextHistory.length === 3) {
            setNewAddressForm(prev => ({ ...prev, region: nextHistory.join('') }));
            setPickerHistory([]);
            setModalView('address_form');
        } else {
            setPickerHistory(nextHistory);
        }
    };

    const renderAddressCard = (address: Address | undefined) => {
        const hasAddresses = addresses.length > 0;
        const handleClick = () => {
            if (!hasAddresses) {
                setNewAddressForm({ name: '', phone: '', region: '', detail: '', isDefault: true });
                setModalView('address_form');
            } else {
                setModalView('address_list');
            }
        };

        return (
             <div onClick={handleClick} className="w-full bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition active:scale-[0.99] shadow-sm relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg ${!address && !hasAddresses ? 'bg-gray-100 text-gray-500' : 'bg-[#F5416C]/10 text-[#F5416C]'}`}>
                    <i className={`fas ${!address && !hasAddresses ? 'fa-plus' : 'fa-map-marker-alt'}`}></i>
                </div>
                {address ? (
                    <div className="flex-1 overflow-hidden">
                        <div className="flex items-center gap-3 mb-1">
                            <span className="font-bold text-gray-900 text-base">{address.name}</span>
                            <span className="text-gray-500 text-sm tracking-wide">{address.phone}</span>
                        </div>
                        <div className="text-sm text-gray-500 leading-snug truncate pr-2">{address.fullAddress}</div>
                    </div>
                ) : (
                    <div className="flex-1 text-sm text-gray-400 font-medium py-1">
                        {hasAddresses ? '请选择收货地址...' : '新增收货地址'}
                    </div>
                )}
                {hasAddresses && <i className="fas fa-chevron-right text-gray-300 text-xs ml-2"></i>}
            </div>
        );
    };


    if (type === 'none') return null;

    // --- Sub-View: Address List ---
    if (modalView === 'address_list') {
        return (
            <div className="absolute inset-0 bg-black/40 z-[70] flex items-end justify-center backdrop-blur-sm" onClick={() => setModalView('main')}>
                <div className="bg-white w-full rounded-t-[2rem] p-6 pb-10 slide-up shadow-2xl h-[70vh] flex flex-col" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold">选择收货地址</h3>
                        <button onClick={() => setModalView('main')} className="text-gray-400"><i className="fas fa-times"></i></button>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar pb-4" onClick={() => setDeleteConfirmId(null)}>
                        {addresses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                                <i className="fas fa-map-marked-alt text-3xl mb-2 opacity-30"></i>
                                <span className="text-xs">暂无收货地址</span>
                            </div>
                        ) : (
                            addresses.map(addr => (
                                <div key={addr.id} onClick={() => { setSelectedAddressId(addr.id); setModalView('main'); }} className={`p-4 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-[#F5416C] bg-[#F5416C]/5' : 'border-gray-100 bg-gray-50'}`}>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedAddressId === addr.id ? 'border-[#F5416C] bg-[#F5416C]' : 'border-gray-300'}`}>
                                        {selectedAddressId === addr.id && <i className="fas fa-check text-white text-xs"></i>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-gray-800 truncate">{addr.name}</span>
                                            <span className="text-gray-500 text-sm">{addr.phone}</span>
                                            {addr.isDefault && <span className="bg-[#F5416C]/10 text-[#F5416C] text-xs px-1.5 rounded flex-shrink-0">默认</span>}
                                        </div>
                                        <div className="text-xs text-gray-500 leading-snug break-words">{addr.fullAddress}</div>
                                    </div>
                                    <div className="flex flex-col items-end gap-3 shrink-0 pl-1 border-l border-gray-100">
                                         {deleteConfirmId === addr.id ? (
                                            <button onClick={(e) => { e.stopPropagation(); deleteAddress(addr.id); if (selectedAddressId === addr.id) setSelectedAddressId(null); setDeleteConfirmId(null); }} className="h-6 px-2 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse whitespace-nowrap">确认删除</button>
                                         ) : (
                                            <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(addr.id); setTimeout(() => setDeleteConfirmId(prev => prev === addr.id ? null : prev), 3000); }} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 active:bg-red-50 rounded-full transition-colors"><i className="fas fa-trash-alt text-xs"></i></button>
                                         )}
                                        <button onClick={(e) => { e.stopPropagation(); setDefaultAddress(addr.id); }} className={`text-xs px-2 py-1 rounded border whitespace-nowrap transition-colors ${addr.isDefault ? 'border-transparent text-gray-400' : 'border-gray-200 text-gray-600 active:bg-gray-200 hover:border-gray-300'}`} disabled={addr.isDefault}>{addr.isDefault ? '默认' : '设为默认'}</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <button onClick={() => { setNewAddressForm({ name: '', phone: '', region: '', detail: '', isDefault: false }); setModalView('address_form'); }} className="w-full py-3.5 bg-[#F5416C] text-white rounded-xl font-bold mt-4 shadow-md active:scale-[0.98] transition"><i className="fas fa-plus mr-2"></i> 新增地址</button>
                </div>
            </div>
        );
    }

    // --- Sub-View: Region Picker ---
    if (modalView === 'region_picker') {
        const levels = ['选择省份', '选择城市', '选择区县'];
        const currentTitle = levels[pickerHistory.length];
        return (
            <div className="absolute inset-0 bg-black/40 z-[90] flex items-end justify-center backdrop-blur-sm">
                <div className="bg-white w-full rounded-t-[2rem] p-6 pb-10 slide-up shadow-2xl h-[70vh] flex flex-col" onClick={e => e.stopPropagation()}>
                    <div className="relative flex items-center justify-center mb-6">
                        <button onClick={() => { if (pickerHistory.length > 0) { setPickerHistory(prev => prev.slice(0, -1)); } else { setModalView('address_form'); } }} className="absolute left-0 text-gray-400 w-8 h-8 flex items-center justify-center rounded-full active:bg-gray-100"><i className="fas fa-chevron-left"></i></button>
                        <h3 className="text-lg font-bold text-gray-900">{currentTitle}</h3>
                    </div>
                    <div className="flex items-center gap-2 mb-4 text-sm px-2 overflow-x-auto no-scrollbar whitespace-nowrap border-b border-gray-50 pb-2">
                        {pickerHistory.length === 0 && <span className="text-gray-400">请选择</span>}
                        {pickerHistory.map((item, idx) => ( <React.Fragment key={idx}> <span className="text-gray-900 font-medium cursor-pointer" onClick={() => setPickerHistory(prev => prev.slice(0, idx + 1))}>{item}</span> <span className="text-gray-300">/</span> </React.Fragment> ))}
                    </div>
                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        {getCurrentRegionList().map((item) => ( <div key={item} onClick={() => handleRegionSelect(item)} className="py-4 px-3 border-b border-gray-50 text-gray-800 active:bg-gray-50 flex justify-between items-center transition-colors text-base">{item}<i className="fas fa-chevron-right text-gray-300 text-xs"></i></div> ))}
                    </div>
                </div>
            </div>
        );
    }

    // --- Sub-View: Address Form ---
    if (modalView === 'address_form') {
        return (
            <div className="absolute inset-0 bg-black/40 z-[80] flex items-end justify-center backdrop-blur-sm">
                <div className="bg-white w-full rounded-t-[2rem] p-6 pb-10 slide-up shadow-2xl" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold">新增收货地址</h3>
                        <button onClick={() => setModalView(addresses.length > 0 ? 'address_list' : 'main')} className="text-gray-400"><i className="fas fa-times"></i></button>
                    </div>
                    <div className="space-y-4 mb-8">
                        <div><label className="text-xs font-medium text-gray-500 ml-1">收货人</label><input type="text" value={newAddressForm.name} onChange={e => setNewAddressForm({...newAddressForm, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mt-1 focus:outline-[#F5416C]" placeholder="请填写收货人姓名"/></div>
                        <div><label className="text-xs font-medium text-gray-500 ml-1">手机号码</label><input type="tel" value={newAddressForm.phone} onChange={e => { const val = e.target.value.replace(/[^\d]/g, ''); setNewAddressForm({...newAddressForm, phone: val}); }} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mt-1 focus:outline-[#F5416C]" placeholder="请填写手机号码"/></div>
                        <div><label className="text-xs font-medium text-gray-500 ml-1">所在地区</label><div onClick={() => { setPickerHistory([]); setModalView('region_picker'); }} className={`w-full border rounded-xl px-4 py-3 mt-1 flex justify-between items-center transition-colors cursor-pointer ${newAddressForm.region ? 'bg-white border-gray-200 text-gray-800' : 'bg-gray-50 border-gray-200 text-gray-400'}`}><span>{newAddressForm.region || '省 / 市 / 区（县）'}</span><i className="fas fa-chevron-right text-gray-300 text-xs"></i></div></div>
                        <div><label className="text-xs font-medium text-gray-500 ml-1">详细地址</label><textarea value={newAddressForm.detail} onChange={e => setNewAddressForm({...newAddressForm, detail: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mt-1 focus:outline-[#F5416C] h-20 resize-none" placeholder="街道、楼牌号等"></textarea></div>
                        <div className="flex items-center gap-2 mt-2" onClick={() => setNewAddressForm({...newAddressForm, isDefault: !newAddressForm.isDefault})}><div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${newAddressForm.isDefault ? 'bg-[#F5416C] border-[#F5416C]' : 'border-gray-300'}`}>{newAddressForm.isDefault && <i className="fas fa-check text-white text-xs"></i>}</div><span className="text-sm text-gray-600">设为默认地址</span></div>
                    </div>
                    <button onClick={handleSaveAddress} disabled={!newAddressForm.name || !newAddressForm.phone || !newAddressForm.region || !newAddressForm.detail} className={`w-full py-3.5 rounded-xl font-bold shadow-md transition ${!newAddressForm.name || !newAddressForm.region ? 'bg-gray-200 text-gray-400' : 'bg-[#F5416C] text-white active:scale-[0.98]'}`}>保存并使用</button>
                </div>
            </div>
        );
    }

    // --- Bulk Action Views (Main) ---
    if (type === 'bulk_transfer' || type === 'bulk_pickup') {
        const isTransfer = type === 'bulk_transfer';
        const totalCount = selectedItems.reduce((acc, item) => acc + (bulkQuantities[item.inventoryId] || 0), 0);
        const currentAddress = addresses.find(a => a.id === selectedAddressId);
        return (
             <div className="absolute inset-0 bg-black/40 z-[60] flex items-end justify-center backdrop-blur-sm" onClick={onClose}>
                <div className="bg-white w-full rounded-t-[2rem] p-6 pb-10 slide-up shadow-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 shrink-0"></div>
                    <h3 className="text-lg font-bold mb-2 text-center">{isTransfer ? '批量转让' : '批量提货'}</h3>
                    <p className="text-xs text-center text-gray-400 mb-6 shrink-0">已选择 {selectedItems.length} 种商品，共 {totalCount} 件</p>
                    <div className="flex-1 overflow-y-auto mb-6 bg-gray-50 rounded-xl p-3 border border-gray-100 no-scrollbar">
                        {selectedItems.map(item => {
                            const currentQty = bulkQuantities[item.inventoryId] ?? 0;
                            return (
                                <div key={item.inventoryId} className="flex gap-3 bg-white p-3 rounded-lg mb-2 last:mb-0 shadow-sm items-center">
                                    <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden shrink-0"><ImageWithFallback src={item.img} className="w-full h-full" imgClassName="object-cover h-full" /></div>
                                    <div className="flex-1 flex flex-col justify-center min-w-0"><div className="text-xs font-bold text-gray-800 line-clamp-1">{item.title}</div><div className="text-xs text-gray-400">{item.specs}</div></div>
                                    <div className="flex items-center gap-2"><div className="flex items-center bg-gray-50 rounded-lg border border-gray-100 h-8"><button onClick={() => handleBulkQuantityChange(item.inventoryId, -1, item.count)} className={`w-8 h-full flex items-center justify-center text-gray-500 transition ${currentQty <= 0 ? 'opacity-30' : 'active:bg-gray-200'}`} disabled={currentQty <= 0}><i className="fas fa-minus text-xs"></i></button><span className={`w-8 text-center text-xs font-bold ${currentQty === 0 ? 'text-gray-300' : 'text-gray-800'}`}>{currentQty}</span><button onClick={() => handleBulkQuantityChange(item.inventoryId, 1, item.count)} className={`w-8 h-full flex items-center justify-center text-gray-500 transition ${currentQty >= item.count ? 'opacity-30' : 'active:bg-gray-200'}`} disabled={currentQty >= item.count}><i className="fas fa-plus text-xs"></i></button></div><button onClick={() => handleSetBulkMax(item.inventoryId, item.count)} className="text-xs text-[#F5416C] font-medium px-1 py-1 active:opacity-60 whitespace-nowrap">最大</button></div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="space-y-5 shrink-0">
                        {isTransfer ? (
                             <div><label className="block text-xs font-medium text-gray-700 mb-1.5 ml-1">接收人账号</label><div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 px-3 focus-within:bg-white focus-within:border-[#F5416C] focus-within:ring-2 focus-within:ring-[#F5416C]/10 transition-all"><i className="fas fa-user text-gray-400 mr-2"></i><input type="text" value={info} onChange={e => setInfo(e.target.value)} placeholder="请输入接收人码库账号/手机号" className="flex-1 bg-transparent py-3.5 text-sm focus:outline-none font-medium" /><div className="w-px h-5 bg-gray-300 mx-3"></div><button className="text-[#F5416C] text-xs font-bold whitespace-nowrap flex items-center gap-1.5 active:opacity-60 transition-opacity"><i className="fas fa-address-book"></i> 地址簿</button></div></div>
                        ) : (
                            <div><label className="block text-xs font-medium text-gray-700 mb-1.5 ml-1">收货地址</label>{renderAddressCard(currentAddress)}<div className="mt-3 flex justify-between items-center bg-gray-50 px-4 py-3 rounded-lg"><span className="text-xs font-medium text-gray-600">快递费 (10 DOS/件)</span><span className="text-sm font-bold text-[#F5416C]">{totalCount * 10} DOS</span></div></div>
                        )}
                    </div>
                    <div className="mt-8 shrink-0">
                        <button onClick={() => { const payload = selectedItems.map(i => ({ inventoryId: i.inventoryId, count: bulkQuantities[i.inventoryId] ?? 0 })).filter(i => i.count > 0); if (payload.length === 0) return; if (isTransfer) { bulkTransferProduct(payload, info); onClose(); } else { if (!selectedAddressId) { alert('请选择收货地址'); return; } const addressInfo = `${currentAddress?.name} ${currentAddress?.phone} ${currentAddress?.fullAddress}`; bulkPickupProduct(payload, addressInfo); onClose(); } }} disabled={totalCount === 0} className={`w-full py-4 rounded-xl font-bold active:scale-[0.98] transition shadow-md ${totalCount === 0 ? 'bg-gray-300 text-white cursor-not-allowed shadow-none' : (isTransfer ? 'bg-[#F5416C] text-white shadow-[#F5416C]/30' : 'bg-[#25C4D9] text-white shadow-[#25C4D9]/30')}`}>{isTransfer ? '确认批量转让' : '确认提交批量提货'}</button>
                    </div>
                </div>
            </div>
        );
    }

    if (!data) return null;

    // --- Product Detail View (Home) ---
    if (type === 'product_detail') {
        const p = data as Product;
        const totalCNY = p.price * inputCount;
        const fixedTokenEntries = getTokenAmountEntries(p.tokenPrice);
        const detailImages = getProductDetailImages(p);
        const hasFixedTokenPrice = fixedTokenEntries.length > 0;
        const scaledTokenPrice = fixedTokenEntries.reduce<Product['tokenPrice']>((acc, [token, amount]) => {
            acc[token] = amount * inputCount;
            return acc;
        }, {});

        // Validation Logic
        const isEnough = () => {
            if (Object.keys(calculatedAmounts).length === 0) return false;
            for (const [tokenId, required] of Object.entries(calculatedAmounts)) {
                if ((userBalance[tokenId] || 0) < required) return false;
            }
            return true;
        };
        const canSubmit = isEnough();
        
        // Helper
        const getRate = (id: string) => TOKENS.find(t => t.id === id)?.rate || 1;
        const fecRate = getRate('FEC');
        const slcRate = getRate('SLC');
        const dosRate = getRate('DOS');

        // Calculate cost for display
        const mixFec = Math.ceil(totalCNY * 0.8 * fecRate);
        const mixSlc = Math.ceil(totalCNY * 0.2 * slcRate);
        const dosAmt = Math.ceil(totalCNY * dosRate);
        const cnvAmt = Math.ceil(totalCNY * getRate('CNV'));
        const priceHeaderClass = 'inline-flex flex-wrap items-center gap-x-2 gap-y-1 bg-gradient-to-r from-[#F5416C] to-[#FF6B9D] text-white px-3 py-2 rounded-xl mb-5';

        // Payment Options Config
        const paymentOptions = hasFixedTokenPrice
            ? [
                {
                    id: 'MIX',
                    label: formatTokenAmounts(scaledTokenPrice),
                    desc: null,
                    icons: fixedTokenEntries.map(([token]) => token),
                    balanceText: `余额 ${fixedTokenEntries.map(([token]) => `${(userBalance[token] || 0).toLocaleString()} ${token}`).join(' / ')}`
                }
            ]
            : [
                { 
                    id: 'MIX', 
                    label: `${mixFec.toLocaleString()} FEC + ${mixSlc.toLocaleString()} SLC`,
                    desc: null,
                    icons: ['FEC', 'SLC'],
                    balanceText: `余额 ${userBalance.FEC?.toLocaleString()} FEC/ ${userBalance.SLC?.toLocaleString()} SLC`
                },
                { 
                    id: 'DOS', 
                    label: `${dosAmt.toLocaleString()} DOS`,
                    desc: null,
                    icons: ['DOS'],
                    balanceText: `余额 ${userBalance.DOS?.toLocaleString()} DOS`
                },
                { 
                    id: 'CNV', 
                    label: `${cnvAmt.toLocaleString()} CNV`,
                    desc: null,
                    icons: ['CNV'],
                    balanceText: `余额 ${userBalance.CNV?.toLocaleString()} CNV`
                }
            ];

        const renderPriceHeader = () => {
            if (hasFixedTokenPrice) {
                return (
                    <div className={priceHeaderClass}>
                        {fixedTokenEntries.map(([token, amount], idx) => (
                            <React.Fragment key={token}>
                                {idx > 0 && <span className="text-xl font-bold">+</span>}
                                <div className="flex items-center">
                                    <span className="text-3xl font-extrabold tracking-tight">{amount.toLocaleString()}</span>
                                    <span className="text-lg font-bold ml-2">{token}</span>
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                );
            }

            if (p.displayCurrency === 'MIX') {
                return (
                    <div className={priceHeaderClass}>
                        <span className="text-3xl font-extrabold tracking-tight">{mixFec.toLocaleString()} <span className="text-lg font-bold">FEC</span></span>
                        <span className="text-xl font-bold">+</span>
                        <span className="text-3xl font-extrabold tracking-tight">{mixSlc.toLocaleString()} <span className="text-lg font-bold">SLC</span></span>
                    </div>
                )
            } else if (p.displayCurrency === 'DOS') {
                return (
                    <div className={priceHeaderClass}>
                        <span className="text-3xl font-extrabold tracking-tight">{dosAmt.toLocaleString()}</span>
                        <span className="text-lg font-bold">DOS</span>
                    </div>
                )
            } else {
                 return (
                    <div className={priceHeaderClass}>
                        <span className="text-3xl font-extrabold tracking-tight">{(p.price * fecRate).toLocaleString()}</span>
                        <span className="text-lg font-bold">FEC</span>
                    </div>
                )
            }
        }

        return (
            <div className="absolute inset-0 bg-black/40 z-[60] flex items-end justify-center backdrop-blur-sm transition-opacity duration-300" onClick={onClose}>
                <div className="relative bg-white w-full rounded-t-[2rem] slide-up shadow-2xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                    <button onClick={onClose} className="absolute top-5 right-5 z-50 w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center active:scale-90 transition hover:bg-gray-200"><i className="fas fa-times"></i></button>

                    <div className="flex-1 overflow-y-auto p-6 pb-0 no-scrollbar">
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 shrink-0"></div>
                        <div className="relative rounded-2xl overflow-hidden mb-5 shadow-sm h-64 bg-gray-100 shrink-0 group">
                            <ImageWithFallback src={p.img} alt={p.title} className="w-full h-full" imgClassName="object-cover h-full"/>
                            {p.productType && (
                                <span className={`absolute top-3 right-3 z-10 text-xs font-bold px-2 py-1 rounded-md shadow-sm ${
                                    p.productType === '数字商品' ? 'bg-purple-50 text-purple-600 ring-1 ring-purple-200' :
                                    p.productType === '充值' ? 'bg-amber-50 text-amber-600 ring-1 ring-amber-200' :
                                    'bg-[#FFF1F6] text-[#F5416C] ring-1 ring-[#F5416C]/25'
                                }`}>{p.productType}</span>
                            )}
                        </div>
                        <h2 className="text-xl font-extrabold text-gray-900 mb-1 leading-snug">{p.title}</h2>
                        <div className="flex items-center gap-2 mb-4"><span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{p.specs}</span></div>
                        
                        {renderPriceHeader()}

                        <div className="mb-6">
                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-5">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-800">兑换数量</span>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center border border-gray-200 rounded-lg bg-white h-8 shadow-sm">
                                            <button
                                                onClick={() => updateQuantity(inputCount - 1)}
                                                className={`w-9 h-full flex items-center justify-center text-gray-500 transition ${inputCount <= 1 ? 'opacity-30 cursor-not-allowed' : 'active:bg-gray-100'}`}
                                                disabled={inputCount <= 1}
                                            >
                                                <i className="fas fa-minus text-xs"></i>
                                            </button>
                                            <input
                                                type="number"
                                                value={inputCount}
                                                onChange={e => updateQuantity(parseInt(e.target.value) || 1)}
                                                className="w-10 text-center font-bold text-sm bg-transparent focus:outline-none no-spinner text-gray-800"
                                            />
                                            <button
                                                onClick={() => updateQuantity(inputCount + 1)}
                                                className="w-9 h-full flex items-center justify-center text-gray-500 active:bg-gray-100 transition"
                                            >
                                                <i className="fas fa-plus text-xs"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <h3 className="font-bold text-sm mb-3 text-gray-800 flex justify-between items-center">
                                支付方式
                            </h3>

                            <div className="flex flex-col gap-3">
                                {paymentOptions.map(option => {
                                    const isSelected = paymentMethod === option.id;
                                    return (
                                        <div
                                            key={option.id}
                                            onClick={() => setPaymentMethod(option.id as any)}
                                            className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer active:scale-[0.99] ${
                                                isSelected
                                                    ? 'bg-[#F5416C]/5 border-[#F5416C] shadow-sm'
                                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col">
                                                    <span className={`font-bold text-sm ${isSelected ? 'text-[#F5416C]' : 'text-gray-800'}`}>{option.label}</span>
                                                    <span className="text-xs text-gray-400 mt-1">{option.balanceText}</span>
                                                </div>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'bg-[#F5416C] border-[#F5416C]' : 'border-gray-300 bg-white'}`}>
                                                <div className={`w-2 h-2 bg-white rounded-full transition-transform ${isSelected ? 'scale-100' : 'scale-0'}`}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="font-bold text-sm mb-3 text-gray-800">图文详情</h3>
                            {detailImages.length > 0 ? (
                                <div className="rounded-xl overflow-hidden bg-gray-50">
                                    {detailImages.map((imageUrl, index) => (
                                        <img
                                            key={imageUrl}
                                            src={imageUrl}
                                            alt={`${p.title}详情图 ${index + 1}`}
                                            className="block w-full h-auto"
                                            loading="lazy"
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-400">暂无图文详情</div>
                            )}
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-100 bg-white pb-10 shrink-0">
                        {Object.keys(calculatedAmounts).length > 0 && (
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm font-bold text-gray-800">合计</span>
                                <div className="flex items-center gap-2">
                                    {Object.entries(calculatedAmounts).map(([token, amount], idx) => (
                                        <div key={token} className="flex items-baseline text-[#F5416C]">
                                            {idx > 0 && <span className="text-gray-400 text-xs mr-2">+</span>}
                                            <span className="text-xl font-extrabold">{amount.toLocaleString()}</span>
                                            <span className="text-xs font-bold ml-1">{token}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <button 
                            onClick={() => { 
                                if (!canSubmit) return;
                                buyProduct(p.id, inputCount, calculatedAmounts);
                                onClose();
                            }} 
                            disabled={!canSubmit}
                            className={`w-full py-4 rounded-xl font-bold text-base shadow-lg transition flex items-center justify-center ${
                                !canSubmit
                                    ? 'bg-gray-300 text-white cursor-not-allowed shadow-none'
                                    : 'bg-gradient-to-r from-[#F5416C] to-[#FF6B9D] text-white shadow-[#F5416C]/30 active:scale-[0.98]'
                            }`}
                        >
                            <i className="fas fa-shopping-bag mr-2"></i> {canSubmit ? '确认兑换入库' : '请检查支付方式'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- Inventory Action Views ---
    const invItem = data as InventoryItem;
    
    // Pickup (Single)
    if (type === 'action_pickup') {
        const currentAddress = addresses.find(a => a.id === selectedAddressId);
        
        return (
            <div className="absolute inset-0 bg-black/40 z-[60] flex items-end justify-center backdrop-blur-sm" onClick={onClose}>
                <div className="bg-white w-full rounded-t-[2rem] p-6 pb-10 slide-up shadow-2xl" onClick={e => e.stopPropagation()}>
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
                    <h3 className="text-lg font-bold mb-6 text-center">申请提货</h3>
                    
                    <div className="bg-gray-50 p-4 rounded-xl mb-5 flex items-center gap-4">
                        <div className="bg-white p-2 rounded-lg shadow-sm"><i className="fas fa-box text-[#F5416C]"></i></div>
                        <div className="flex-1 text-sm font-medium">
                            <div className="truncate">{invItem.title}</div>
                            <div className="text-xs text-gray-400 mt-1">{invItem.specs}</div>
                        </div>
                        <div className="text-xs text-gray-500">持有: {invItem.count}</div>
                    </div>
                    
                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5 ml-1">提货数量</label>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 flex items-center border border-gray-200 rounded-xl px-1 bg-white">
                                    <button 
                                        onClick={() => setInputCount(Math.max(1, inputCount - 1))}
                                        className={`w-12 h-12 flex items-center justify-center text-gray-500 rounded-lg transition ${inputCount <= 1 ? 'opacity-30 cursor-not-allowed' : 'active:bg-gray-50'}`}
                                        disabled={inputCount <= 1}
                                    >
                                        <i className="fas fa-minus text-xs"></i>
                                    </button>
                                    <input 
                                        type="number" 
                                        value={inputCount}
                                        onChange={e => {
                                            const val = parseInt(e.target.value) || 0;
                                            setInputCount(Math.min(Math.max(1, val), invItem.count));
                                        }}
                                        className="flex-1 text-center font-bold text-lg focus:outline-none no-spinner"
                                    />
                                    <button 
                                        onClick={() => setInputCount(Math.min(invItem.count, inputCount + 1))}
                                        className={`w-12 h-12 flex items-center justify-center text-gray-500 rounded-lg transition ${inputCount >= invItem.count ? 'opacity-30 cursor-not-allowed' : 'active:bg-gray-50'}`}
                                        disabled={inputCount >= invItem.count}
                                    >
                                        <i className="fas fa-plus text-xs"></i>
                                    </button>
                                </div>
                                <button onClick={() => setInputCount(invItem.count)} className="text-[#F5416C] font-bold text-sm px-2 py-2 active:bg-pink-50 rounded-lg transition whitespace-nowrap">最大</button>
                            </div>
                        </div>

                        <div className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-lg">
                             <span className="text-xs font-medium text-gray-600">快递费 (10 DOS/件)</span>
                             <span className="text-sm font-bold text-[#F5416C]">{inputCount * 10} DOS</span>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5 ml-1">收货地址</label>
                            {renderAddressCard(currentAddress)}
                        </div>
                    </div>

                    <div className="mt-8">
                        <button 
                            onClick={() => { 
                                if (!selectedAddressId) {
                                    alert('请选择收货地址');
                                    return;
                                }
                                const addressInfo = `${currentAddress?.name} ${currentAddress?.phone} ${currentAddress?.fullAddress}`;
                                pickupProduct(invItem.inventoryId, inputCount, addressInfo); 
                                onClose(); 
                            }} 
                            className="w-full bg-[#25C4D9] text-white py-4 rounded-xl font-bold active:scale-[0.98] transition shadow-md shadow-[#25C4D9]/30"
                        >
                            确认提交申请
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Transfer (Single)
    if (type === 'action_transfer') {
        return (
            <div className="absolute inset-0 bg-black/40 z-[60] flex items-end justify-center backdrop-blur-sm" onClick={onClose}>
                <div className="bg-white w-full rounded-t-[2rem] p-6 pb-10 slide-up shadow-2xl" onClick={e => e.stopPropagation()}>
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
                    <h3 className="text-lg font-bold mb-6 text-center">转让商品</h3>
                    
                     <div className="bg-[#F5416C]/5 border border-[#F5416C]/10 p-4 rounded-xl mb-5 flex items-center gap-3">
                        <div className="bg-white p-2 rounded-lg shadow-sm"><i className="fas fa-gift text-[#F5416C]"></i></div>
                        <div className="flex-1 text-sm font-medium">
                            <div className="truncate">{invItem.title}</div>
                            <div className="text-xs text-gray-400 mt-1">{invItem.specs}</div>
                        </div>
                        <div className="text-xs text-gray-500">持有: {invItem.count}</div>
                    </div>

                    <div className="space-y-5">
                         <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5 ml-1">转让数量</label>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 flex items-center border border-gray-200 rounded-xl px-1 bg-white">
                                    <button 
                                        onClick={() => setInputCount(Math.max(1, inputCount - 1))}
                                        className={`w-12 h-12 flex items-center justify-center text-gray-500 rounded-lg transition ${inputCount <= 1 ? 'opacity-30 cursor-not-allowed' : 'active:bg-gray-50'}`}
                                        disabled={inputCount <= 1}
                                    >
                                        <i className="fas fa-minus text-xs"></i>
                                    </button>
                                    <input 
                                        type="number" 
                                        value={inputCount}
                                        onChange={e => {
                                            const val = parseInt(e.target.value) || 0;
                                            setInputCount(Math.min(Math.max(1, val), invItem.count));
                                        }}
                                        className="flex-1 text-center font-bold text-lg focus:outline-none no-spinner"
                                    />
                                    <button 
                                        onClick={() => setInputCount(Math.min(invItem.count, inputCount + 1))}
                                        className={`w-12 h-12 flex items-center justify-center text-gray-500 rounded-lg transition ${inputCount >= invItem.count ? 'opacity-30 cursor-not-allowed' : 'active:bg-gray-50'}`}
                                        disabled={inputCount >= invItem.count}
                                    >
                                        <i className="fas fa-plus text-xs"></i>
                                    </button>
                                </div>
                                <button onClick={() => setInputCount(invItem.count)} className="text-[#F5416C] font-bold text-sm px-2 py-2 active:bg-pink-50 rounded-lg transition whitespace-nowrap">最大</button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5 ml-1">接收人账号</label>
                            <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 px-3 focus-within:bg-white focus-within:border-[#F5416C] focus-within:ring-2 focus-within:ring-[#F5416C]/10 transition-all">
                                <i className="fas fa-user text-gray-400 mr-2"></i>
                                <input 
                                    type="text" 
                                    value={info}
                                    onChange={e => setInfo(e.target.value)}
                                    placeholder="请输入接收人码库账号/手机号" 
                                    className="flex-1 bg-transparent py-3.5 text-sm focus:outline-none font-medium" 
                                />
                                <div className="w-px h-5 bg-gray-300 mx-3"></div>
                                <button className="text-[#F5416C] text-xs font-bold whitespace-nowrap flex items-center gap-1.5 active:opacity-60 transition-opacity">
                                    <i className="fas fa-address-book"></i> 地址簿
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <button 
                            onClick={() => { transferProduct(invItem.inventoryId, inputCount, info); onClose(); }} 
                            className="w-full bg-[#F5416C] text-white py-4 rounded-xl font-bold active:scale-[0.98] transition shadow-lg shadow-[#F5416C]/30"
                        >
                            确认转让
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};
