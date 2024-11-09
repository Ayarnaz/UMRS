import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function AddProfessionalModal({ isOpen, onClose, onAdd }) {
    const [formData, setFormData] = useState({
        slmcNo: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await onAdd(formData);
            onClose();
        } catch (error) {
            console.error('Error adding professional:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Add Healthcare Professional</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="slmcNo" className="block text-sm font-medium text-gray-700 mb-1">
                            SLMC Number
                        </label>
                        <input
                            id="slmcNo"
                            type="text"
                            required
                            value={formData.slmcNo}
                            onChange={(e) => setFormData({ ...formData, slmcNo: e.target.value })}
                            className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter SLMC Number"
                        />
                    </div>

                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                        >
                            Add Professional
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 