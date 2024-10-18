import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';

export default function AddDocumentModal({ isOpen, onClose }) {
  const [recordId, setRecordId] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [details, setDetails] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Add a New Medical Document</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex space-x-6">
          <div className="w-3/5 bg-gray-100 rounded-lg p-6 flex flex-col items-center justify-center">
            <Upload size={48} className="text-gray-400 mb-2" />
            <p className="text-gray-600">Drag and Drop Document or Select From Device</p>
            <input type="file" className="hidden" id="fileInput" />
            <label htmlFor="fileInput" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600">
              Select File
            </label>
          </div>
          
          <div className="w-2/5 space-y-4">
            <div>
              <label htmlFor="record-id" className="block text-sm font-medium text-gray-700">Existing Record ID</label>
              <input
                id="record-id"
                type="text"
                placeholder="####"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                value={recordId}
                onChange={(e) => setRecordId(e.target.value)}
              />
            </div>
            <button className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">
              Generate a New Record ID
            </button>
            <div>
              <label htmlFor="document-type" className="block text-sm font-medium text-gray-700">Document Type</label>
              <select
                id="document-type"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
              >
                <option value="">Select</option>
                <option value="prescription">Prescription</option>
                <option value="lab_report">Lab Report</option>
                <option value="imaging">Imaging</option>
              </select>
            </div>
            <div>
              <label htmlFor="details" className="block text-sm font-medium text-gray-700">Details</label>
              <textarea
                id="details"
                rows="5"
                placeholder="Add details here..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              ></textarea>
            </div>
            <button className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
