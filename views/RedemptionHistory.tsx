import React from 'react';
import { useStore } from '../context/StoreContext';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { AppHeader } from '../components/AppHeader';

export const RedemptionHistory: React.FC = () => {
    const { logs, navigateTo } = useStore();

    // Filter for redemption logs
    const redemptionLogs = logs.filter(log => log.type.includes('兑换'));

    return (
        <div className="bg-[#F7F8FA] min-h-full pb-6">
            <AppHeader title="兑换记录" onBack={() => navigateTo('home')} />

            <div className="p-4 space-y-3 fade-in">
                {redemptionLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                         <i className="fas fa-receipt text-5xl mb-4 opacity-30"></i>
                         <p className="text-sm">暂无兑换记录</p>
                    </div>
                ) : (
                    redemptionLogs.map(log => (
                        <div key={log.id} className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-50">
                                <span className="text-xs text-gray-500">订单号: {log.orderId}</span>
                                <span className="text-xs font-medium text-green-500">{log.status}</span>
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
                                    <div className="flex justify-between items-end mt-2">
                                        <span className="text-xs text-[#F5416C] bg-[#F5416C]/10 px-1.5 py-0.5 rounded">{log.type}</span>
                                        <span className="text-sm text-gray-600">数量: {log.count}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
                
                {redemptionLogs.length > 0 && (
                    <div className="text-center text-gray-400 text-xs py-4">已经到底了</div>
                )}
            </div>
        </div>
    );
};
