import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Search, Download, Eye } from "lucide-react";
import { useAuth } from '../../context/AuthContext';
import HealthcareInstituteSidebar from './HealthcareInstituteSidebar';
import api from '../../services/api';

export default function InstituteShareRecordsView() {
    const { user } = useAuth();
    const [sharedRecords, setSharedRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sendForm, setSendForm] = useState({
        providerName: '',
        patientPHN: '',
        recordType: '',
        notes: '',
        file: null,
        receiverType: 'PROFESSIONAL'
    });

    // Define fetchSharedRecords with useCallback before using it in useEffect
    const fetchSharedRecords = useCallback(async () => {
        try {
            const response = await api.get(`/api/institute/shared-records?instituteId=${user?.userIdentifier}`);
            setSharedRecords(response.data || []);
        } catch (error) {
            console.error('Error fetching shared records:', error);
        }
    }, [user]);

    // Use fetchSharedRecords in useEffect after it's defined
    useEffect(() => {
        fetchSharedRecords();
    }, [fetchSharedRecords]);

    const handleSendRecord = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        
        Object.keys(sendForm).forEach(key => {
            if (key === 'file') {
                if (sendForm.file) formData.append('file', sendForm.file);
            } else {
                formData.append(key, sendForm[key]);
            }
        });
        
        formData.append('senderInstituteId', user.userIdentifier);

        try {
            await api.post('/api/institute/send-record', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            setSendForm({
                providerName: '',
                patientPHN: '',
                recordType: '',
                notes: '',
                file: null,
                receiverType: 'PROFESSIONAL'
            });
            
            fetchSharedRecords();
        } catch (error) {
            console.error('Error sending record:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        setSendForm(prev => ({
            ...prev,
            [name]: files ? files[0] : value
        }));
    };

    const filteredRecords = sharedRecords.filter(record => 
        record.patientPHN.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.recordType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.receiverName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-gray-100">
            <HealthcareInstituteSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex justify-between items-center p-4 bg-white shadow-sm">
                    <h1 className="text-2xl font-bold">Share Medical Records</h1>
                    <div className="flex items-center space-x-4">
                        <button className="p-2 rounded-md hover:bg-gray-200">
                            <Bell className="h-5 w-5" />
                        </button>
                        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {/* Send Record Form */}
                        <div className="col-span-2 bg-white p-6 rounded-lg shadow">
                            <h2 className="text-lg font-semibold mb-4 bg-blue-500 text-white p-2 rounded">Send Record</h2>
                            <form onSubmit={handleSendRecord} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Send to</label>
                                    <select
                                        name="receiverType"
                                        value={sendForm.receiverType}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="PROFESSIONAL">Healthcare Professional</option>
                                        <option value="INSTITUTE">Healthcare Institute</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        {sendForm.receiverType === 'PROFESSIONAL' ? 'SLMC Number' : 'Institute ID'}
                                    </label>
                                    <input
                                        type="text"
                                        name="providerName"
                                        value={sendForm.providerName}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Patient PHN</label>
                                    <input
                                        type="text"
                                        name="patientPHN"
                                        value={sendForm.patientPHN}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Record Type</label>
                                    <input
                                        type="text"
                                        name="recordType"
                                        value={sendForm.recordType}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                                    <textarea
                                        name="notes"
                                        value={sendForm.notes}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">File</label>
                                    <input
                                        type="file"
                                        name="file"
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
                                >
                                    Send Record
                                </button>
                            </form>
                        </div>

                        {/* Search Records */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-lg font-semibold mb-4 bg-blue-500 text-white p-2 rounded">Search Records</h2>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search records..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full p-2 border rounded-md pr-10"
                                />
                                <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Shared Records Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient PHN</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Record Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receiver</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredRecords.map((record, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap">{record.patientPHN}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{record.recordType}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{record.receiverName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {new Date(record.shareDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex space-x-2">
                                                <button className="text-blue-600 hover:text-blue-900">
                                                    <Eye className="h-5 w-5" />
                                                </button>
                                                <button className="text-green-600 hover:text-green-900">
                                                    <Download className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    );
} 