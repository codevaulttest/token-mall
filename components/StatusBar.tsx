import React from 'react';

export const StatusBar: React.FC = () => {
    return (
        <div className="h-10 bg-white w-full sticky top-0 z-50 flex items-end px-4 pb-2 text-xs font-medium text-gray-900 border-b border-gray-50 select-none">
            <div>9:41</div>
            <div className="ml-auto flex gap-1.5 items-center">
                <i className="fas fa-signal"></i>
                <i className="fas fa-wifi"></i>
                <i className="fas fa-battery-full text-base"></i>
            </div>
        </div>
    );
};