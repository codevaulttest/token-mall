import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { AppHeader } from '../components/AppHeader';

interface HistoryProps {
    initialTab?: 'pickup' | 'transfer' | 'redemption';
}

export const History: React.FC<HistoryProps> = ({ initialTab = 'pickup' }) => {
    const { logs, navigateTo, currentView } = useStore();
    
    // State to toggle between records
    const [recordType, setRecordType] = useState<'pickup' | 'transfer' | 'redemption'>(initialTab);
    
    // Pickup sub-tabs state
    const [activeTab, setActiveTab] = useState('全部');
    const pickupTabs = ['全部', '待发货', '待收货', '已收货'];

    // Filter logs based on recordType
    const filteredLogs = logs.filter(log => {
        if (recordType === 'pickup') {
            const isPickup = log.type === '提货' || log.type === '批量提货';
            if (!isPickup) return false;
            return activeTab === '全部' ? true : log.status === activeTab;
        } else if (recordType === 'transfer') {
            return log.type === '转让' || log.type === '批量转让';
        } else {
            return log.type.includes('兑换');
        }
    });

    // Handle back button click based on entry point
    const handleBack = () => {
        if (currentView === 'redemption_history') {
            navigateTo('home');
        } else {
            navigateTo('inventory');
        }
    };

    return (
        <div className="bg-[#FFF3F6] min-h-full pb-6">
            <AppHeader title="" onBack={handleBack} />

            <div className="px-6 pt-4 pb-2 flex items-center justify-between">
                <h1 className="text-xl font-extrabold text-gray-900 leading-tight">提货记录</h1>
            </div>
            <div className="flex justify-around px-2 border-b border-gray-100">
                {pickupTabs.map(tab => (
                    <div
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`relative pb-3 pt-2 px-2 text-sm font-medium transition-colors cursor-pointer ${activeTab === tab ? 'text-[#F5416C]' : 'text-gray-500'}`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#F5416C] rounded-full"></div>
                        )}
                    </div>
                ))}
            </div>

            <div className="p-4 space-y-3 fade-in">
                {filteredLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                         <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <i className={`fas ${recordType === 'pickup' ? 'fa-truck-loading' : (recordType === 'transfer' ? 'fa-paper-plane' : 'fa-receipt')} text-2xl opacity-30`}></i>
                         </div>
                         <p className="text-sm">暂无{recordType === 'pickup' ? '提货' : (recordType === 'transfer' ? '转让' : '兑换')}记录</p>
                    </div>
                ) : (
                    filteredLogs.map(log => (
                        <div key={log.id} className="bg-white rounded-xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.08)] border border-gray-50">
                            <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-50">
                                <span className="text-xs text-gray-500">订单号: {log.orderId}</span>
                                <span className={`text-xs font-bold ${
                                    recordType === 'transfer' ? 'text-blue-500' : 
                                    (recordType === 'redemption' ? 'text-green-500' : 'text-[#F5416C]')
                                }`}>
                                    {log.status}
                                </span>
                            </div>
                            
                            <div className="flex gap-3">
                                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                    <ImageWithFallback 
                                        src={log.img} 
                                        alt={log.item} 
                                        className="w-full h-full"
                                        imgClassName="object-cover h-full"
                                    />
                                </div>
                                <div className="flex-1 py-1 flex flex-col justify-between">
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className="font-bold text-gray-800 text-sm line-clamp-2">{log.item}</h3>
                                    </div>
                                    <div className="mt-2">
                                        <span className="text-sm font-bold text-gray-500">x {log.count}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
                
                {filteredLogs.length > 0 && (
                    <div className="text-center text-gray-400 text-xs py-4">已经到底了</div>
                )}
            </div>
        </div>
    );
};
