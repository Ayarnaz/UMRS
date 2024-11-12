import React, { useState, useEffect } from 'react';
import { Bell, Search, Filter, Download, Eye, Edit, Share2, Plus } from "lucide-react";
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import HealthcareInstituteSidebar from './HealthcareInstituteSidebar';
import api from '../../services/api';
import ViewPatientRecordsModal from './modals/ViewPatientRecordsModal';

export default function InstituteMedicalRecordsView() {
    const { user } = useAuth();
    const { showNotification } = useNotification();
    const [searchQuery, setSearchQuery] = useState('');
    const [accessedRecords, setAccessedRecords] = useState([]);
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('all');
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [requestForm, setRequestForm] = useState({
        personalHealthNo: '',
        patientName: '',
        purpose: '',
        isEmergency: false
    });
    const [isPatientRecordsModalOpen, setIsPatientRecordsModalOpen] = useState(false);
    const [selectedPatientPHN, setSelectedPatientPHN] = useState(null);

    const fetchRecordsData = async () => {
        if (!user?.userIdentifier) return;
        
        setLoading(true);
        try {
            console.log('Fetching records for institute:', user.userIdentifier);
            const response = await api.get('/api/institute/records-data', {
                params: { instituteId: user.userIdentifier }
            });
            
            console.log('Received records data:', response.data);
            setAccessedRecords(response.data.accessedRecords || []);
            setMedicalRecords(response.data.medicalRecords || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            showNotification('error', 'Failed to fetch records');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecordsData();
    }, [user?.userIdentifier]);

    const handleRequestAccess = async (isEmergency = false) => {
        const validationErrors = [];
        
        if (!requestForm.personalHealthNo) {
            validationErrors.push('Personal Health Number is required');
        }
        if (!requestForm.purpose) {
            validationErrors.push('Purpose is required');
        }

        if (validationErrors.length > 0) {
            validationErrors.forEach(error => showNotification('error', error));
            return;
        }

        setLoading(true);
        const requestData = {
            ...requestForm,
            instituteId: user.userIdentifier,
            isEmergency: Boolean(isEmergency)
        };

        try {
            const response = await api.post('/api/institute/request-access', requestData);

            if (response.data.status === 'success') {
                showNotification('success', response.data.message);
                fetchRecordsData();
                setRequestForm({
                    personalHealthNo: '',
                    patientName: '',
                    purpose: '',
                    isEmergency: false
                });
            } else {
                showNotification('error', response.data.message || 'Failed to request access');
            }
        } catch (error) {
            console.error('Error in handleRequestAccess:', error);
            showNotification('error', error.response?.data?.message || 'Failed to request access');
        } finally {
            setLoading(false);
        }
    };

    const handlePatientLookup = async (phn) => {
        if (!phn) return;
        
        try {
            const response = await api.get('/api/institute/patient-lookup', {
                params: { search: phn }
            });
            
            if (response.data) {
                setRequestForm(prev => ({
                    ...prev,
                    personalHealthNo: response.data.personalHealthNo,
                    patientName: response.data.name
                }));
                showNotification('success', 'Patient found');
            }
        } catch (error) {
            if (error.response?.status === 404) {
                showNotification('warning', 'Patient not found');
            } else {
                showNotification('error', 'Error looking up patient');
            }
        }
    };

    const handleViewRecord = (record) => {
        setSelectedPatientPHN(record.personalHealthNo);
        setIsPatientRecordsModalOpen(true);
    };

    const handleAddRecord = (personalHealthNo) => {
        // TODO: Implement navigation to add record page
        console.log('Adding record for patient:', personalHealthNo);
        showNotification('info', 'Add record functionality coming soon');
    };

    const handleDownloadRecord = async (recordId) => {
        try {
            const response = await api.get(`/api/institute/medical-records/download/${recordId}`, {
                responseType: 'blob'
            });
            
            // Create a blob from the response data
            const blob = new Blob([response.data], { 
                type: response.headers['content-type'] 
            });
            
            // Create a link and trigger download
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `record-${recordId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            showNotification('success', 'Record downloaded successfully');
        } catch (error) {
            console.error('Error downloading record:', error);
            showNotification('error', 'Failed to download record');
        }
    };

    const handleShareRecord = async (record) => {
        try {
            // TODO: Implement share record modal/functionality
            console.log('Sharing record:', record);
            showNotification('info', 'Share functionality coming soon');
            
            // Example implementation:
            // setSelectedRecord(record);
            // setIsShareModalOpen(true);
        } catch (error) {
            console.error('Error sharing record:', error);
            showNotification('error', 'Failed to share record');
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <HealthcareInstituteSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header section */}
                <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">Medical Records</h1>
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search records..."
                                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                        </div>
                        <Bell className="h-6 w-6 text-gray-600 cursor-pointer" />
                        <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 font-medium">
                                {user?.name?.[0] || 'I'}
                            </span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    {/* Request Access Section */}
                    <div className="bg-white rounded-lg shadow-md mb-6">
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-800">Request Record Access</h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <input
                                    placeholder="Personal Health Number"
                                    className={`p-2 border rounded-md ${!requestForm.personalHealthNo ? 'border-red-300' : 'border-gray-300'}`}
                                    value={requestForm.personalHealthNo}
                                    onChange={(e) => setRequestForm({...requestForm, personalHealthNo: e.target.value})}
                                    onBlur={(e) => handlePatientLookup(e.target.value)}
                                    required
                                />
                                <input
                                    placeholder="Patient Name"
                                    className="p-2 border rounded-md border-gray-300"
                                    value={requestForm.patientName}
                                    onChange={(e) => setRequestForm({...requestForm, patientName: e.target.value})}
                                    readOnly
                                />
                                <input
                                    placeholder="Purpose of Access (Required)"
                                    className={`p-2 border rounded-md ${!requestForm.purpose ? 'border-red-300' : 'border-gray-300'}`}
                                    value={requestForm.purpose}
                                    onChange={(e) => setRequestForm({...requestForm, purpose: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="flex justify-between">
                                <button
                                    onClick={() => handleRequestAccess(true)}
                                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
                                    disabled={loading || !requestForm.personalHealthNo || !requestForm.purpose}
                                >
                                    Emergency Access
                                </button>
                                <button
                                    onClick={() => handleRequestAccess(false)}
                                    className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 transition-colors disabled:opacity-50"
                                    disabled={loading || !requestForm.personalHealthNo || !requestForm.purpose}
                                >
                                    {loading ? 'Processing...' : 'Request Access'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Records Table */}
                    {!loading && (
                        <div className="bg-white shadow-md rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Record Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {accessedRecords.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                                    No records found
                                                </td>
                                            </tr>
                                        ) : (
                                            accessedRecords.map((record) => (
                                                <tr key={record.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                                                                <span className="text-indigo-600 font-medium">
                                                                    {record.patientName?.[0] || '?'}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {record.patientName}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {record.personalHealthNo}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {record.purpose || 'Medical Record'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {record.dateOfVisit || record.requestDate}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                            ${record.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                                            record.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                                            'bg-red-100 text-red-800'}`}>
                                                            {record.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            {record.status === 'approved' && (
                                                                <>
                                                                    <button 
                                                                        onClick={() => handleViewRecord(record)}
                                                                        className="text-indigo-600 hover:text-indigo-900 flex items-center space-x-1"
                                                                        title="View Record"
                                                                    >
                                                                        <Eye className="h-5 w-5" />
                                                                        <span>View</span>
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleAddRecord(record.personalHealthNo)}
                                                                        className="text-green-600 hover:text-green-900 flex items-center space-x-1"
                                                                        title="Add Record"
                                                                    >
                                                                        <Plus className="h-5 w-5" />
                                                                        <span>Add</span>
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleDownloadRecord(record.id)}
                                                                        className="text-indigo-600 hover:text-indigo-900"
                                                                        title="Download"
                                                                    >
                                                                        <Download className="h-5 w-5" />
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleShareRecord(record)}
                                                                        className="text-indigo-600 hover:text-indigo-900"
                                                                        title="Share"
                                                                    >
                                                                        <Share2 className="h-5 w-5" />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* View Record Modal */}
                    {isViewModalOpen && selectedRecord && (
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                                <div className="mt-3">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Record Details</h3>
                                    <div className="space-y-3">
                                        <p><strong>Patient PHN:</strong> {selectedRecord.personalHealthNo}</p>
                                        <p><strong>Patient Name:</strong> {selectedRecord.patientName}</p>
                                        <p><strong>Type:</strong> {selectedRecord.type}</p>
                                        <p><strong>Date:</strong> {selectedRecord.requestDate}</p>
                                        <p><strong>Status:</strong> {selectedRecord.status}</p>
                                        <p><strong>Purpose:</strong> {selectedRecord.purpose}</p>
                                    </div>
                                    <div className="mt-4">
                                        <button
                                            onClick={() => setIsViewModalOpen(false)}
                                            className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
            <ViewPatientRecordsModal
                isOpen={isPatientRecordsModalOpen}
                onClose={() => setIsPatientRecordsModalOpen(false)}
                patientPHN={selectedPatientPHN}
            />
        </div>
    );
} 