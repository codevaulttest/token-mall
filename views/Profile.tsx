import React from 'react';

export const Profile: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-[70vh] text-gray-400 fade-in">
            <i className="fas fa-user-circle text-7xl mb-4 text-gray-200"></i>
            <h2 className="text-xl font-bold text-gray-600">个人中心</h2>
            <p className="text-sm mt-2">（演示页面，功能待开发）</p>
        </div>
    );
};