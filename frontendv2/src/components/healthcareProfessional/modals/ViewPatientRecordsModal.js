import React, { useState, useEffect } from 'react';
import { X, UserCircle, Search, RefreshCw } from 'lucide-react';
import api from '../../../services/api';
import ViewRecordModal from '../../patient/modals/ViewRecordModal';

const calculateBMI = (height, weight) => {
    if (!height || !weight) return 'N/A';
    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
    return bmi;
};

const getBMICategory = (bmi) => {
    const numBMI = parseFloat(bmi);
    if (numBMI < 18.5) return 'Underweight';
    if (numBMI < 25) return 'Normal weight';
    if (numBMI < 30) return 'Overweight';
    return 'Obese';
};

export default function ViewPatientRecordsModal({ isOpen, onClose, patientPHN }) {
    const [patientData, setPatientData] = useState(null);
    const [records, setRecords] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('records');
    const [searchTerm, setSearchTerm] = useState('');
    const [documentSearchTerm, setDocumentSearchTerm] = useState('');
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isViewRecordModalOpen, setIsViewRecordModalOpen] = useState(false);

    useEffect(() => {
        if (isOpen && patientPHN) {
            setLoading(true);
            fetchPatientData();
            fetchRecords();
            fetchDocuments();
        }
    }, [isOpen, patientPHN]);

    const fetchPatientData = async () => {
        try {
            const response = await api.get(`/api/patient/${patientPHN}`);
            setPatientData(response.data);
        } catch (error) {
            console.error('Error fetching patient data:', error);
            setError('Failed to load patient information');
        }
    };

    const fetchRecords = async () => {
        try {
            const response = await api.get(`/api/patient/medical-records?personalHealthNo=${patientPHN}`);
            setRecords(response.data);
        } catch (error) {
            console.error('Error fetching records:', error);
            setError('Failed to load medical records');
        }
    };

    const fetchDocuments = async () => {
        try {
            const response = await api.get(`/api/patient/medical-documents/by-phn/${patientPHN}`);
            setDocuments(response.data);
        } catch (error) {
            console.error('Error fetching documents:', error);
            setError('Failed to load medical documents');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDocument = (filePath) => {
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
        window.open(`${baseUrl}/${filePath}`, '_blank');
    };

    const calculateAge = (dateOfBirth) => {
        if (!dateOfBirth) return null;
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleViewRecord = (record) => {
        setSelectedRecord(record);
        setIsViewRecordModalOpen(true);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl w-[90vw] max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b bg-indigo-100">
                    <h2 className="text-2xl font-bold text-gray-900 text-center flex-1">Patient Medical Records</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Patient Information */}
                    {patientData && (
                        <div className="bg-white p-4 rounded-lg shadow mb-6">
                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="w-16 h-16 bg-gray-200 rounded-full mb-3 flex items-center justify-center">
                                    {patientData?.profilePhoto ? (
                                        <img 
                                            src={patientData.profilePhoto} 
                                            alt="Profile" 
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        <UserCircle className="h-10 w-10 text-gray-500" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="font-bold">{patientData.name || 'Name not available'}</h2>
                                    <p className="text-sm text-gray-600">
                                        {`${calculateAge(patientData.dateOfBirth) || 'Age not available'} | ${patientData.gender || 'Gender not available'}`}
                                    </p>
                                </div>
                            </div>

                            {/* Medical Information Grid */}
                            <div className="grid grid-cols-5 gap-4 mt-4">
                                <div className="border rounded p-2">
                                    <p className="text-sm font-semibold">Height</p>
                                    <p>{patientData.height ? `${patientData.height} cm` : 'N/A'}</p>
                                </div>
                                <div className="border rounded p-2">
                                    <p className="text-sm font-semibold">Weight</p>
                                    <p>{patientData.weight ? `${patientData.weight} kg` : 'N/A'}</p>
                                </div>
                                <div className="border rounded p-2">
                                    <p className="text-sm font-semibold">BMI</p>
                                    <p>{calculateBMI(patientData.height, patientData.weight)}</p>
                                    {patientData.height && patientData.weight && (
                                        <p className="text-xs text-gray-500">
                                            {getBMICategory(calculateBMI(patientData.height, patientData.weight))}
                                        </p>
                                    )}
                                </div>
                                <div className="border rounded p-2">
                                    <p className="text-sm font-semibold">Blood Type</p>
                                    <p>{patientData.bloodType || 'N/A'}</p>
                                </div>
                                <div className="border rounded p-2 col-span-5">
                                    <p className="text-sm font-semibold">Medical Conditions</p>
                                    <p>{patientData.medicalConditions || 'None reported'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="border-b border-gray-200 mb-4">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('records')}
                                className={`${
                                    activeTab === 'records'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Medical Records
                            </button>
                            <button
                                onClick={() => setActiveTab('documents')}
                                className={`${
                                    activeTab === 'documents'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Medical Documents
                            </button>
                        </nav>
                    </div>

                    {/* Records Table */}
                    {activeTab === 'records' && (
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="p-4 flex justify-between items-center">
                                <h2 className="text-lg font-semibold">Medical Records</h2>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={fetchRecords}
                                        className="bg-gray-200 px-4 py-2 rounded flex items-center"
                                    >
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Refresh
                                    </button>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Search records..."
                                            className="border rounded px-4 py-2 pr-10"
                                        />
                                        <Search className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    </div>
                                </div>
                            </div>

                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Summary</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {records.map((record) => (
                                        <tr key={record.recordId}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(record.dateOfVisit).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {record.type}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {record.summary}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => handleViewRecord(record)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Documents Table */}
                    {activeTab === 'documents' && (
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="p-4 flex justify-between items-center">
                                <h2 className="text-lg font-semibold">Medical Documents</h2>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={documentSearchTerm}
                                        onChange={(e) => setDocumentSearchTerm(e.target.value)}
                                        placeholder="Search documents..."
                                        className="border rounded px-4 py-2 pr-10"
                                    />
                                    <Search className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                </div>
                            </div>

                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Record ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {documents.map((doc) => (
                                        <tr key={doc.documentId || doc.documentID}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {doc.details || doc.fileName || 'Untitled'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {doc.documentType}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {doc.recordId}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(doc.uploadDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => handleViewDocument(doc.filePath)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            <ViewRecordModal
                isOpen={isViewRecordModalOpen}
                onClose={() => setIsViewRecordModalOpen(false)}
                record={selectedRecord}
            />
        </div>
    );
} 