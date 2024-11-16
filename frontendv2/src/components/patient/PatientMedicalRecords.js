import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, Search, Upload, UserCircle, Stethoscope, Pill, Eye, Trash2 } from 'lucide-react';
import PatientSidebar from './PatientSidebar';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import AddRecordModal from './modals/AddRecordModal';
import ViewRecordModal from './modals/ViewRecordModal';
import EditRecordModal from './modals/EditRecordModal';
import UploadDocumentModal from './modals/UploadDocumentModal';

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return '';
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const calculateBMI = (height, weight) => {
    if (!height || !weight) return 'N/A';
    // Convert height from cm to meters
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

function PatientMedicalRecords() {
  const { user } = useAuth();
  const [patientData, setPatientData] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [documents, setDocuments] = useState([]);
  const [documentSearchTerm, setDocumentSearchTerm] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('records');
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [recentDiagnosis, setRecentDiagnosis] = useState(null);
  const [recentPrescription, setRecentPrescription] = useState(null);

  const handleView = (record) => {
    setSelectedRecord(record);
    setIsViewModalOpen(true);
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await api.delete(`/api/medical-records/${recordId}`);
        fetchData();
      } catch (err) {
        console.error('Error deleting record:', err);
        alert('Failed to delete record');
      }
    }
  };

  const handleViewDocument = (filePath) => {
    const baseUrl = 'http://localhost:8080';
    window.open(`${baseUrl}/${filePath}`, '_blank');
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await api.delete(`/api/patient/medical-documents/${documentId}`);
      fetchDocuments(); // Refresh the documents list
    } catch (error) {
      console.error('Error deleting document:', error);
      setError('Failed to delete document');
    }
  };

  // Debug log to check user data
  useEffect(() => {
    console.log('Current user:', user);
  }, [user]);

  const fetchData = useCallback(async () => {
    if (!user?.userIdentifier) {
        console.log('No user identifier available, skipping fetch');
        setLoading(false);
        return;
    }

    try {
        console.log('Fetching data for PHN:', user.userIdentifier);
        
        // First get patient details
        const patientResponse = await api.get(`/api/patient/${user.userIdentifier}`);
        console.log('Patient Response:', patientResponse.data);
        
        if (patientResponse.data) {
            setPatientData(patientResponse.data);
        }

        try {
            // Then get medical records
            const recordsResponse = await api.get(`/api/patient/medical-records/by-phn/${user.userIdentifier}`);
            console.log('Records Response:', recordsResponse.data);
            
            if (!recordsResponse.data || recordsResponse.data.length === 0) {
                setRecords([]);
                setError('No medical records found for this patient');
            } else {
                setRecords(recordsResponse.data);
                setError(null);
            }
        } catch (recordErr) {
            console.error('Error fetching records:', recordErr);
            setRecords([]);
            setError('No medical records found for this patient');
        }
    } catch (err) {
        console.error('Error fetching patient data:', err);
        setError(err.response?.data?.message || 'Failed to load patient data');
        setPatientData(null);
        setRecords([]);
    } finally {
        setLoading(false);
    }
}, [user?.userIdentifier]);

  const fetchDocuments = useCallback(async () => {
    if (!user?.userIdentifier) {
      console.log('No user identifier available, skipping document fetch');
      return;
    }

    try {
      console.log('Fetching documents for PHN:', user.userIdentifier);
      const response = await api.get(`/api/patient/medical-documents/by-phn/${user.userIdentifier}`);
      
      console.log('Documents response:', response);
      if (response.data) {
        // Map the documents to ensure consistent record ID field
        const mappedDocuments = response.data.map(doc => ({
          ...doc,
          medicalRecordId: doc.medicalRecordId || doc.recordId || null
        }));
        setDocuments(mappedDocuments);
      } else {
        setDocuments([]);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      console.error('Error response:', error.response);
      setError('Failed to load medical documents');
      setDocuments([]);
    }
  }, [user?.userIdentifier]);

  useEffect(() => {
    fetchData();
    fetchDocuments();
  }, [fetchData, fetchDocuments]);

  // Loading state with timeout
  const [showLoading, setShowLoading] = useState(false);
  useEffect(() => {
    if (loading) {
      // Only show loading indicator after 500ms to prevent flash
      const timer = setTimeout(() => setShowLoading(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    if (user?.personalHealthNo) {
      fetchDocuments();
    }
  }, [user?.personalHealthNo]);

  const handleUploadClick = (recordId = null) => {
    setSelectedRecordId(recordId);
    setIsUploadModalOpen(true);
  };

  if (showLoading) {
    return (
      <div className="flex h-screen">
        <PatientSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <PatientSidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/*debug output */}
          {/*process.env.NODE_ENV === 'development' && (
            <pre className="mb-4 p-2 bg-gray-100 rounded text-xs">
              {JSON.stringify({ user, patientData }, null, 2)}
            </pre>
          )*/}

          {/* Patient Information */}
          {patientData && (
            <div className="bg-white p-4 rounded-lg shadow mb-6 flex">
              <div className="flex items-center mr-6">
                <div className="w-16 h-16 bg-gray-200 rounded-full mr-4 flex items-center justify-center">
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
              <div className="flex-1 grid grid-cols-5 gap-4">
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

          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Recent Diagnosis Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Diagnosis</h3>
                <span className="text-sm text-gray-500">
                  {recentDiagnosis?.date ? new Date(recentDiagnosis.date).toLocaleDateString() : 'No recent diagnosis'}
                </span>
              </div>
              <div className="space-y-3">
                {recentDiagnosis ? (
                  <>
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <Stethoscope className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{recentDiagnosis.condition}</p>
                        <p className="text-sm text-gray-500">{recentDiagnosis.details}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Diagnosed by:</span> Dr. {recentDiagnosis.doctorName}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No recent diagnosis available</p>
                )}
              </div>
            </div>

            {/* Recent Prescription Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Prescription</h3>
                <span className="text-sm text-gray-500">
                  {recentPrescription?.date ? new Date(recentPrescription.date).toLocaleDateString() : 'No recent prescription'}
                </span>
              </div>
              <div className="space-y-3">
                {recentPrescription ? (
                  <>
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <Pill className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{recentPrescription.medication}</p>
                        <p className="text-sm text-gray-500">{recentPrescription.dosage}</p>
                        <p className="text-sm text-gray-500">{recentPrescription.instructions}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Prescribed by:</span> Dr. {recentPrescription.doctorName}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No recent prescription available</p>
                )}
              </div>
            </div>
          </div>

          {/* Error Message - Show as notification instead of replacing content */}
          {error && (
            <div className="mb-4">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="w-full">
            <div className="border-b border-gray-200 mb-4">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
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

            {activeTab === 'records' && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Medical Records</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="bg-blue-500 text-white px-4 py-2 rounded flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Record
                    </button>
                    <button
                      onClick={fetchData}
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Summary</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {records
                      .filter(record => 
                        record.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        record.summary?.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((record, index) => (
                        <tr key={record.recordId}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.type}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.slmcNo}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.summary}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(record.dateOfVisit).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleView(record)}
                                className="px-2 py-1 rounded text-white bg-blue-500 hover:bg-blue-600"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleEdit(record)}
                                className="px-2 py-1 rounded text-white bg-yellow-500 hover:bg-yellow-600"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(record.recordId)}
                                className="px-2 py-1 rounded text-white bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Medical Documents</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUploadClick()}
                      className="bg-blue-500 text-white px-4 py-2 rounded flex items-center"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Document
                    </button>
                    <button
                      onClick={fetchDocuments}
                      className="bg-gray-200 px-4 py-2 rounded flex items-center"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-4 text-red-500 text-sm">
                    {error}
                  </div>
                )}

                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Record ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Upload Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {documents.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                          No documents found
                        </td>
                      </tr>
                    ) : (
                      documents.map((doc) => (
                        <tr key={doc.documentId || doc.documentID}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {doc.details || doc.fileName || 'Untitled'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {doc.documentType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {doc.recordID || doc.recordId ? (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                {doc.recordID || doc.recordId}
                              </span>
                            ) : (
                              <span className="text-gray-400 italic">Not Associated</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(doc.uploadDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewDocument(doc.filePath)}
                                className="text-blue-600 hover:text-blue-900 flex items-center"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </button>
                              <button
                                onClick={() => handleDeleteDocument(doc.documentId || doc.documentID)}
                                className="text-red-600 hover:text-red-900 flex items-center"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddRecordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onRecordAdded={fetchData}
        user={user}
      />
      <ViewRecordModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        record={selectedRecord}
      />
      <EditRecordModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        record={selectedRecord}
        onRecordUpdated={fetchData}
      />
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onDocumentUploaded={fetchDocuments}
        recordId={selectedRecordId}
        user={user}
      />
    </div>
  );
}

export default PatientMedicalRecords;