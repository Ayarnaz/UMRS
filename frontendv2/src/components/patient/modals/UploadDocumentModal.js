import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import api from '../../../services/api';

export default function UploadDocumentModal({ isOpen, onClose, onDocumentUploaded, recordId, user }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const [details, setDetails] = useState('');
  const [customRecordId, setCustomRecordId] = useState(recordId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setSelectedFile(null);
      setDocumentType('');
      setDetails('');
      setCustomRecordId(recordId || '');
      setError('');
      console.log('Modal opened with user:', user);
      console.log('Initial recordId:', recordId);
    }
  }, [isOpen, recordId, user]);

  useEffect(() => {
    if (isOpen && recordId) {
      console.log('Setting initial record ID:', recordId);
      setCustomRecordId(recordId);
    }
  }, [isOpen, recordId]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setError('');
  };

  const generateNewRecordId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const newId = `${timestamp}-${random}`;
    console.log('Generated new record ID:', newId);
    setCustomRecordId(newId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!customRecordId) {
      setError('Record ID is required');
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('recordId', customRecordId.toString());
      formData.append('documentType', documentType);
      formData.append('details', details || '');
      formData.append('personalHealthNo', user.userIdentifier);

      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const response = await api.post('/api/patient/medical-documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload response:', response);
      
      if (response.data.status === 'success') {
        onDocumentUploaded();
        onClose();
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      setError(error.response?.data?.message || error.message || 'Failed to upload document');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Upload Medical Document</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Left side - File Upload */}
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center w-full">
                <label className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-gray-400">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="mt-2 text-sm text-gray-500">
                    {selectedFile ? selectedFile.name : 'Drag and Drop or Click to select a file'}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </label>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Record ID</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={customRecordId}
                    onChange={(e) => setCustomRecordId(e.target.value)}
                    placeholder="Enter Record ID"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  />
                  <button
                    type="button"
                    onClick={generateNewRecordId}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Generate ID
                  </button>
                </div>
              </div>
            </div>

            {/* Right side - Document Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Document Type</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="prescription">Prescription</option>
                  <option value="lab_report">Lab Report</option>
                  <option value="imaging">Imaging</option>
                  <option value="referral">Referral Letter</option>
                  <option value="discharge">Discharge Summary</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Details</label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows="4"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  placeholder="Add any additional details about this document..."
                ></textarea>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 text-red-500 text-sm">{error}</div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedFile || !documentType || !customRecordId}
              className="px-4 py-2 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isSubmitting ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 