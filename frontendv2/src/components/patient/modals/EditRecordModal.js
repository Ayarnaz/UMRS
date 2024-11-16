import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import api from '../../../services/api';

function EditRecordModal({ isOpen, onClose, record, onRecordUpdated }) {
  const [formData, setFormData] = useState({
    recordId: '',
    summary: '',
    slmcNo: '',
    healthInstituteNumber: '',
    dateOfVisit: '',
    diagnosis: '',
    treatment: '',
    notes: '',
    type: '',
    documents: [],
    newDocuments: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (isOpen && record) {
      setFormData({
        recordId: record.recordId || '',
        summary: record.summary || '',
        slmcNo: record.slmcNo || '',
        healthInstituteNumber: record.healthInstituteNumber || '',
        dateOfVisit: record.dateOfVisit ? record.dateOfVisit.split('T')[0] : '',
        diagnosis: record.diagnosis || '',
        treatment: record.treatment || '',
        notes: record.notes || '',
        type: record.type || '',
        documents: record.documents || [],
        newDocuments: []
      });
    }
  }, [isOpen, record]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const recordData = {
        recordId: formData.recordId,
        type: formData.type,
        slmcNo: formData.slmcNo,
        summary: formData.summary,
        diagnosis: formData.diagnosis,
        treatment: formData.treatment,
        notes: formData.notes,
        dateOfVisit: formData.dateOfVisit,
        healthInstituteNumber: formData.healthInstituteNumber
      };

      console.log('Record data being updated:', recordData);

      const response = await api.put(`/api/patient/medical-records/${formData.recordId}`, recordData);
      console.log('Update record response:', response);

      if (formData.newDocuments && formData.newDocuments.length > 0) {
        const formDataWithFiles = new FormData();
        formData.newDocuments.forEach(doc => {
          formDataWithFiles.append('documents', doc);
        });
        formDataWithFiles.append('recordId', formData.recordId);

        await api.post(`/api/patient/medical-records/${formData.recordId}/documents`, formDataWithFiles, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      if (response.data) {
        onRecordUpdated();
        onClose();
      }
    } catch (error) {
      console.error('Error updating record:', error);
      console.error('Error details:', error.response?.data);
      setSubmitError(error.response?.data?.message || 'Failed to update record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        newDocuments: [...(prev.newDocuments || []), ...Array.from(e.target.files)]
      }));
    }
  };

  const handleAddDocument = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
    fileInput.onchange = handleFileChange;
    fileInput.click();
  };

  const handleViewDocument = (doc) => {
    const baseUrl = 'http://localhost:8080'; // Adjust based on your API URL
    if (doc.filePath) {
      window.open(`${baseUrl}/${doc.filePath}`, '_blank');
    }
  };

  const handleRemoveNewDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      newDocuments: prev.newDocuments.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto ${!isOpen && 'hidden'}`}>
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl my-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-xl font-bold text-gray-900">Edit Medical Record</h2>
            <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>

          <div className="bg-gray-50 p-3 rounded-md">
            <p className="font-medium text-gray-700">Record ID: {formData.recordId}</p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Summary</label>
                <input
                  type="text"
                  name="summary"
                  value={formData.summary}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Doctor SLMC No</label>
                <input
                  type="text"
                  name="slmcNo"
                  value={formData.slmcNo}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Health Institute</label>
                <input
                  type="text"
                  name="healthInstituteNumber"
                  value={formData.healthInstituteNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Visit *</label>
                <input
                  type="date"
                  name="dateOfVisit"
                  value={formData.dateOfVisit}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="col-span-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
                <textarea
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows="4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Treatment</label>
                <textarea
                  name="treatment"
                  value={formData.treatment}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows="4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows="3"
                />
              </div>
            </div>

            <div className="col-span-1 space-y-4">
              <label className="block text-sm font-medium text-gray-700">Documents</label>
              
              {formData.documents && formData.documents.length > 0 ? (
                <div className="border rounded-md p-3 space-y-2 max-h-[200px] overflow-y-auto">
                  <h4 className="text-sm font-medium text-gray-700">Existing Documents</h4>
                  <ul className="space-y-2">
                    {formData.documents.map((doc, index) => (
                      <li key={index} className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <span className="truncate flex-1 mr-2">{doc.fileName || doc.name || 'Document'}</span>
                        <button
                          type="button"
                          onClick={() => handleViewDocument(doc)}
                          className="text-blue-600 hover:text-blue-800 text-sm whitespace-nowrap"
                        >
                          View
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No documents attached</p>
              )}

              <button 
                type="button" 
                onClick={handleAddDocument}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus size={16} className="mr-2" />
                Add New Document
              </button>

              {formData.newDocuments && formData.newDocuments.length > 0 && (
                <div className="border rounded-md p-3 space-y-2 max-h-[200px] overflow-y-auto">
                  <h4 className="text-sm font-medium text-gray-700">New Documents to Upload</h4>
                  <ul className="space-y-2">
                    {formData.newDocuments.map((doc, index) => (
                      <li key={index} className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <span className="truncate flex-1 mr-2">{doc.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveNewDocument(index)}
                          className="text-red-600 hover:text-red-800 text-sm whitespace-nowrap"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditRecordModal; 