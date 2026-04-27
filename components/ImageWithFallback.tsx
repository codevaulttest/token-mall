import React, { useState } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    className?: string; // Applied to the wrapper div
    imgClassName?: string; // Applied to the img element
    fallbackHeight?: string; // CSS height class for error state in variable-height containers
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ 
    src, 
    alt, 
    className = "", 
    imgClassName = "",
    fallbackHeight = "h-40",
    ...props 
}) => {
    const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');

    return (
        <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
            {/* Loading State - Skeleton Overlay */}
            {status === 'loading' && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-200 animate-pulse">
                    <i className="fas fa-image text-gray-300 text-2xl"></i>
                </div>
            )}

            {/* Error State - Placeholder */}
            {status === 'error' && (
                <div className={`flex flex-col items-center justify-center w-full text-gray-300 bg-gray-100 ${fallbackHeight} ${className.includes('h-') ? 'h-full' : ''}`}>
                    <i className="fas fa-image text-4xl mb-2 opacity-30"></i>
                    <span className="text-xs font-medium opacity-50">暂无图片</span>
                </div>
            )}

            {/* Actual Image */}
            {status !== 'error' && (
                <img 
                    src={src} 
                    alt={alt} 
                    // Removed 'h-full' default to allow 'h-auto' (intrinsic height) for waterfall layouts.
                    // Consumers needing h-full must pass it in imgClassName.
                    className={`block w-full ${imgClassName} transition-opacity duration-700 ${status === 'success' ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setStatus('success')}
                    onError={() => setStatus('error')}
                    {...props}
                />
            )}
        </div>
    );
};