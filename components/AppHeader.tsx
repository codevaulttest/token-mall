import React from 'react';

interface AppHeaderProps {
    title: string;
    onBack?: () => void;
    actions?: React.ReactNode;
    children?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ title, onBack, actions, children }) => (
    <div className="sticky top-0 z-40 bg-white">
        <div className="px-4 pb-3.5 pt-[calc(env(safe-area-inset-top)+0.875rem)] flex justify-between items-center text-gray-900 border-b border-gray-200">
            <button
                type="button"
                onClick={onBack}
                className="w-10 h-8 flex items-center justify-start active:opacity-60 transition-opacity"
                aria-label="返回"
            >
                <i className="fas fa-chevron-left text-xl"></i>
            </button>
            <div className="absolute left-1/2 -translate-x-1/2 font-medium text-lg tracking-wide">通证兑换</div>
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
        {(title || actions) && (
            <div className="px-6 pt-4 pb-4 flex items-center justify-between">
                {title && <h1 className="text-xl font-extrabold text-gray-900 leading-tight">{title}</h1>}
                {actions}
            </div>
        )}
        {children && (
            <div className="px-4 pt-4 pb-4">
                {children}
            </div>
        )}
    </div>
);
