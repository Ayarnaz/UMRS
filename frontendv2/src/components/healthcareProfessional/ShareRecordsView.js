import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Search, Download, Eye } from "lucide-react";
import HealthcareProfessionalSidebar from './HealthcareProfessionalSidebar';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

export default function ShareRecordsView() {
  const { user } = useAuth();
  const [requestForm, setRequestForm] = useState({
    providerName: '',
    patientPHN: '',
    recordType: '',
    purpose: '',
    receiverType: 'PROFESSIONAL'
  });

  const [sendForm, setSendForm] = useState({
    providerName: '',
    patientPHN: '',
    recordType: '',
    notes: '',
    file: null,
    receiverType: 'PROFESSIONAL'
  });

  const [sharedRecords, setSharedRecords] = useState([]);
  const [recordRequests, setRecordRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const recordTypes = [
    'Lab Report',
    'Prescription',
    'Diagnosis Report',
    'Imaging Report',
    'Discharge Summary',
    'Other'
  ];

  const providerTypes = [
    { value: 'PROFESSIONAL', label: 'Healthcare Professional' },
    { value: 'INSTITUTE', label: 'Healthcare Institute' }
  ];

  const [errors, setErrors] = useState({});

  const { showNotification } = useNotification();

  const validateForm = (form, type) => {
    const newErrors = {};
    
    if (!form.patientPHN) {
      newErrors.patientPHN = 'Patient PHN is required';
    }
    if (!form.providerName) {
      newErrors.providerName = 'Provider name is required';
    }
    if (!form.recordType) {
      newErrors.recordType = 'Record type is required';
    }
    if (type === 'request' && !form.purpose) {
      newErrors.purpose = 'Purpose is required';
    }
    if (type === 'send' && !form.file) {
      newErrors.file = 'File is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchSharedRecords = useCallback(async () => {
    if (!user?.userIdentifier) return;
    try {
      const response = await api.get(`/api/professional/shared-records?userIdentifier=${user.userIdentifier}`);
      setSharedRecords(response.data);
    } catch (error) {
      console.error('Error fetching shared records:', error);
    }
  }, [user?.userIdentifier]);

  const fetchRecordRequests = useCallback(async () => {
    if (!user?.userIdentifier) return;
    try {
      const response = await api.get(`/api/professional/record-requests?userIdentifier=${user.userIdentifier}`);
      setRecordRequests(response.data);
    } catch (error) {
      console.error('Error fetching record requests:', error);
    }
  }, [user?.userIdentifier]);

  useEffect(() => {
    fetchSharedRecords();
    fetchRecordRequests();
  }, [fetchSharedRecords, fetchRecordRequests]);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(requestForm, 'request')) return;

    try {
        if (!user?.userIdentifier) {
            showNotification('error', 'User identifier not found');
            return;
        }

        const requestData = {
            requestingSlmcNo: user.userIdentifier,
            providerName: requestForm.providerName,
            patientPHN: requestForm.patientPHN,
            recordType: requestForm.recordType,
            purpose: requestForm.purpose,
            receiverType: requestForm.receiverType
        };

        const response = await api.post('/api/professional/request-record', requestData);
        
        if (response.data.status === 'success') {
            showNotification('success', 'Record request submitted successfully');
            
            setRequestForm({
                providerName: '',
                patientPHN: '',
                recordType: '',
                purpose: '',
                receiverType: 'PROFESSIONAL'
            });
            
            fetchRecordRequests();
        } else {
            showNotification('error', response.data.message || 'Failed to submit request');
        }
    } catch (error) {
        console.error('Error submitting request:', error);
        showNotification('error', error.response?.data?.message || 'Failed to submit request');
    }
  };

  const handleSendRecord = async (e) => {
    e.preventDefault();
    if (!validateForm(sendForm, 'send')) return;

    const formData = new FormData();
    formData.append('senderSlmcNo', user.userIdentifier);
    formData.append('providerName', sendForm.providerName);
    formData.append('patientPHN', sendForm.patientPHN);
    formData.append('recordType', sendForm.recordType);
    formData.append('notes', sendForm.notes);
    formData.append('receiverType', sendForm.receiverType);
    if (sendForm.file) {
      formData.append('file', sendForm.file);
    }

    try {
      await api.post('/api/professional/send-record', formData, {
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
      setErrors({ submit: 'Failed to send record' });
    }
  };

  const filteredRecords = sharedRecords.filter(record => 
    record.patientPHN.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.recordType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.receiverName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderProviderTypeSelect = (formType) => (
    <div>
      <label className="block text-sm font-medium text-gray-700">Provider Type</label>
      <select
        value={formType === 'request' ? requestForm.receiverType : sendForm.receiverType}
        onChange={(e) => {
          if (formType === 'request') {
            setRequestForm({...requestForm, receiverType: e.target.value, providerName: ''});
          } else {
            setSendForm({...sendForm, receiverType: e.target.value, providerName: ''});
          }
        }}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      >
        {providerTypes.map(type => (
          <option key={type.value} value={type.value}>{type.label}</option>
        ))}
      </select>
    </div>
  );

  useEffect(() => {
    if (!user?.userIdentifier) {
        console.error('User identifier not found in auth context:', user);
    }
  }, [user]);

  return (
    <div className="flex h-screen bg-gray-100">
      <HealthcareProfessionalSidebar />
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
            {/* Request Record Form */}
            <div className="col-span-2 bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4 bg-blue-500 text-white p-2 rounded">Request Record</h2>
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                {renderProviderTypeSelect('request')}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Provider Name/ID</label>
                  <input
                    type="text"
                    value={requestForm.providerName}
                    onChange={(e) => setRequestForm({...requestForm, providerName: e.target.value})}
                    placeholder={`Enter ${requestForm.receiverType === 'PROFESSIONAL' ? 'SLMC Number' : 'Institute ID'}`}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                  {errors.providerName && <p className="text-red-500 text-sm mt-1">{errors.providerName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Patient PHN</label>
                  <input
                    type="text"
                    value={requestForm.patientPHN}
                    onChange={(e) => setRequestForm({...requestForm, patientPHN: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Record Type</label>
                  <select
                    value={requestForm.recordType}
                    onChange={(e) => setRequestForm({...requestForm, recordType: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Record Type</option>
                    {recordTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Purpose</label>
                  <textarea
                    value={requestForm.purpose}
                    onChange={(e) => setRequestForm({...requestForm, purpose: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows="3"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Submit Request
                </button>
              </form>
            </div>

            {/* Send Record Form */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4 bg-blue-500 text-white p-2 rounded">Send Record</h2>
              <form onSubmit={handleSendRecord} className="space-y-4">
                {renderProviderTypeSelect('send')}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Provider Name/ID</label>
                  <input
                    type="text"
                    value={sendForm.providerName}
                    onChange={(e) => setSendForm({...sendForm, providerName: e.target.value})}
                    placeholder={`Enter ${sendForm.receiverType === 'PROFESSIONAL' ? 'SLMC Number' : 'Institute ID'}`}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                  {errors.providerName && <p className="text-red-500 text-sm mt-1">{errors.providerName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Patient PHN</label>
                  <input
                    type="text"
                    value={sendForm.patientPHN}
                    onChange={(e) => setSendForm({...sendForm, patientPHN: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Record Type</label>
                  <select
                    value={sendForm.recordType}
                    onChange={(e) => setSendForm({...sendForm, recordType: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Record Type</option>
                    {recordTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={sendForm.notes}
                    onChange={(e) => setSendForm({...sendForm, notes: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows="2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Upload File</label>
                  <input
                    type="file"
                    onChange={(e) => setSendForm({...sendForm, file: e.target.files[0]})}
                    className="mt-1 block w-full"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Send Record
                </button>
              </form>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-4 flex items-center bg-white p-2 rounded-lg shadow">
            <Search className="h-5 w-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 outline-none"
            />
          </div>

          {/* Shared Records Table */}
          <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient PHN</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Record Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shared With</th>
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
                        <button className="text-blue-600 hover:text-blue-800">
                          <Eye className="h-5 w-5" />
                        </button>
                        <button className="text-green-600 hover:text-green-800">
                          <Download className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Record Requests and Shared Records */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-4">Record Requests and Transactions</h3>
            <div className="space-y-4">
                {recordRequests.map((request, index) => (
                    <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
                                    {request.requesterName?.[0] || 'U'}
                                </div>
                            </div>
                            <div>
                                <p className="font-semibold">{request.requesterName || 'Unknown User'}</p>
                                <p className="text-sm text-gray-500">Patient PHN: {request.patientPHN}</p>
                                <p className="text-sm text-gray-500">Record Type: {request.recordType}</p>
                                <p className="text-sm text-gray-500">
                                    Status: <span className={`font-medium ${
                                        request.status === 'pending' ? 'text-yellow-600' :
                                        request.status === 'approved' ? 'text-green-600' :
                                        'text-red-600'
                                    }`}>
                                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">
                                {new Date(request.requestDate).toLocaleDateString()}
                            </p>
                            {request.purpose && (
                                <p className="text-sm text-gray-500">Purpose: {request.purpose}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
        </main>
      </div>
    </div>
  );
} 