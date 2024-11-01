import React from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const variants = {
    success: {
        icon: CheckCircle,
        className: 'bg-green-50 text-green-800 border-green-500'
    },
    error: {
        icon: XCircle,
        className: 'bg-red-50 text-red-800 border-red-500'
    },
    warning: {
        icon: AlertCircle,
        className: 'bg-yellow-50 text-yellow-800 border-yellow-500'
    }
};

export default function Notification({ 
    type = 'success',
    message,
    isVisible,
    onClose
}) {
    if (!isVisible) return null;

    const { icon: Icon, className } = variants[type];

    return (
        <div className={`fixed top-4 right-4 w-96 border-l-4 p-4 shadow-lg rounded-r-lg ${className}`}>
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <Icon className="h-5 w-5" />
                </div>
                <div className="ml-3 flex-1">
                    <p className="text-sm font-medium">{message}</p>
                </div>
                <div className="ml-4 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="inline-flex text-gray-400 hover:text-gray-500"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
} 