import React, { useState, useEffect } from 'react';
import { Plus, Upload, X } from 'lucide-react';
import api from '../../../services/api';

function generateRecordId() {
  const timestamp = new Date().getTime().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 5);
  return `REC-${timestamp}-${randomPart}`.toUpperCase();
}

export default function AddRecordModal({ isOpen, onClose, onRecordAdded, user }) {
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
    documents: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        recordId: generateRecordId()
      }));
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      console.log('Current user object:', user);
      console.log('User Identifier:', user?.userIdentifier);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

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
      console.log('Submitting record with PHN:', user?.userIdentifier);

      const recordData = {
        personalHealthNo: user?.userIdentifier,
        type: formData.type,
        slmcNo: formData.slmcNo,
        summary: formData.summary,
        diagnosis: formData.diagnosis,
        treatment: formData.treatment,
        notes: formData.notes,
        dateOfVisit: formData.dateOfVisit
      };

      console.log('Record data being submitted:', recordData);

      const response = await api.post('/api/patient/medical-records', recordData);
      console.log('Add record response:', response);

      if (response.data) {
        onRecordAdded();
        onClose();
        resetForm();
      }
    } catch (error) {
      console.error('Error submitting record:', error);
      console.error('Error details:', error.response?.data);
      setSubmitError(error.response?.data?.message || 'Failed to submit record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      recordId: generateRecordId(),
      summary: '',
      slmcNo: '',
      healthInstituteNumber: '',
      dateOfVisit: '',
      diagnosis: '',
      treatment: '',
      notes: '',
      type: '',
      documents: []
    });
    setSubmitError('');
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, ...Array.from(e.target.files)]
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-5xl my-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Add Medical Record</h2>
            <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="bg-gray-100 p-3 rounded">
                <p className="font-medium">Record ID: {formData.recordId}</p>
              </div>

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
            </div>

            {/* Right Column */}
            <div className="space-y-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700">Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select type</option>
                  <option value="Consultation">Consultation</option>
                  <option value="Procedure">Procedure</option>
                  <option value="Test Result">Test Result</option>
                  <option value="Lab Report">Lab Report</option>
                  <option value="Prescription">Prescription</option>
                  <option value="Referral">Referral</option>
                  <option value="Diagnosis">Diagnosis</option>
                  <option value="Scan">Scan</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Diagnosis *</label>
                <input
                  type="text"
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Treatment *</label>
                <input
                  type="text"
                  name="treatment"
                  value={formData.treatment}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Document Upload Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">Documents</h3>
              <button
                type="button"
                onClick={handleAddDocument}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus size={16} className="mr-2" />
                Add Document
              </button>
            </div>
            <ul className="space-y-2">
              {formData.documents.map((doc, index) => (
                <li key={index} className="text-sm text-gray-600">{doc.name}</li>
              ))}
            </ul>
          </div>

          {submitError && (
            <div className="text-red-600 text-sm">{submitError}</div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 