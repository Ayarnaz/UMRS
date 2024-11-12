import React, { useState, useEffect } from 'react';
import { Bell, Search, Filter, Download, Eye, Edit, Share2, Plus } from "lucide-react";
import HealthcareProfessionalSidebar from './HealthcareProfessionalSidebar';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import ViewPatientRecordsModal from './modals/ViewPatientRecordsModal';

export default function MedicalRecordsView() {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [searchQuery, setSearchQuery] = useState('');
  const [accessedRecords, setAccessedRecords] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [requestForm, setRequestForm] = useState({
    personalHealthNo: '',
    patientName: '',
    purpose: '',
    isEmergency: false
  });
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPatientPHN, setSelectedPatientPHN] = useState(null);

  useEffect(() => {
    fetchRecordsData();
  }, [user]);

  const fetchRecordsData = async () => {
    if (!user?.userIdentifier) return;
    
    setLoading(true);
    try {
      const response = await api.get('/api/professional/records-data', {
        params: { slmcNo: user.userIdentifier }
      });
      
      setAccessedRecords(response.data.accessedRecords || []);
      setMedicalRecords(response.data.medicalRecords || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      showNotification('error', 'Failed to fetch records');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccess = async (isEmergency = false) => {
    // Clear validation
    const validationErrors = [];
    
    if (!requestForm.personalHealthNo) {
      validationErrors.push('Personal Health Number is required');
    }
    if (!requestForm.purpose) {
      validationErrors.push('Purpose is required');
    }

    if (validationErrors.length > 0) {
      validationErrors.forEach(error => showNotification('error', error));
      console.log('Validation failed:', {
        form: requestForm,
        errors: validationErrors
      });
      return;
    }

    setLoading(true);
    const requestData = {
      ...requestForm,
      slmcNo: user.userIdentifier,
      isEmergency: Boolean(isEmergency)
    };
    
    console.log('Sending request with data:', requestData);

    try {
      const response = await api.post('/api/professional/request-access', requestData);

      console.log('Request access response:', response.data);

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
      const response = await api.get('/api/professional/patient-lookup', {
        params: { search: phn }
      });
      
      if (response.data) {
        setRequestForm(prev => ({
          ...prev,
          personalHealthNo: response.data.personalHealthNo,
          patientName: response.data.name
        }));
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
    setIsViewModalOpen(true);
  };

  const handleAddRecord = (patientPHN) => {
    // TODO: Implement add record functionality
    console.log('Adding record for patient:', patientPHN);
    // You might want to navigate to an add record form or open a modal
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <HealthcareProfessionalSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
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
                {user?.name?.[0] || 'D'}
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
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Accessed Records</h2>
              <div className="flex items-center space-x-2">
                <select
                  className="border rounded-md p-2"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Records</option>
                  <option value="recent">Recent</option>
                  <option value="pending">Pending</option>
                  <option value="emergency">Emergency</option>
                </select>
                <Filter className="h-5 w-5 text-gray-500" />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
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
                  {accessedRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-indigo-600 font-medium">{record.patientName?.[0] || '?'}</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{record.patientName}</div>
                            <div className="text-sm text-gray-500">{record.personalHealthNo}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{record.purpose}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.requestDate}
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
                                className="text-indigo-600 hover:text-indigo-900"
                                title="Download"
                              >
                                <Download className="h-5 w-5" />
                              </button>
                              <button 
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      <ViewPatientRecordsModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        patientPHN={selectedPatientPHN}
      />
    </div>
  );
} 