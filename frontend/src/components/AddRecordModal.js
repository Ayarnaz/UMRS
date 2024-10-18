import React, { useState, useEffect } from 'react';
import { X, Upload, Plus } from 'lucide-react';

export default function AddRecordModal({ isOpen, onClose }) {
  const [recordId, setRecordId] = useState('');
  const [type, setType] = useState('');
  const [summary, setSummary] = useState('');
  const [doctor, setDoctor] = useState('');
  const [institution, setInstitution] = useState('');
  const [date, setDate] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [note, setNote] = useState('');
  const [documents, setDocuments] = useState([null]);

  useEffect(() => {
    // Generate a random Record ID when the modal opens
    if (isOpen) {
      const newRecordId = Math.floor(10000 + Math.random() * 90000);
      setRecordId(newRecordId.toString());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddDocument = () => {
    setDocuments([...documents, null]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-5xl my-8">
        <div className="flex justify-between items-center mb-6">
          <div className="w-6"></div> {/* Spacer for centering */}
          <h2 className="text-2xl font-bold text-center flex-grow">Add a New Medical Record</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex space-x-6">
          {/* Document Upload Section (Left Side) */}
          <div className="w-1/2 space-y-4">
            <div className="bg-gray-100 rounded-lg p-6 flex flex-col items-center justify-center h-64">
              <Upload size={48} className="text-gray-400 mb-2" />
              <p className="text-gray-600 text-center">Drag and Drop Document or Select From Device</p>
              <input type="file" className="hidden" id="fileInput" />
              <label htmlFor="fileInput" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600">
                Select File
              </label>
            </div>
            <button 
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center justify-center"
              onClick={handleAddDocument}
            >
              <Plus size={20} className="mr-2" /> Add Another Document
            </button>
          </div>

          {/* Form Section (Right Side) */}
          <div className="w-1/2 space-y-4">
            <div className="bg-gray-200 p-2 rounded-md text-right">
              <p className="font-medium">Record ID: {recordId}</p>
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
              <select
                id="type"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="">Select</option>
                <option value="appointment">Appointment</option>
                <option value="test_result">Test Result</option>
                <option value="prescription">Prescription</option>
                <option value="scan">Scan</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="summary" className="block text-sm font-medium text-gray-700">Summary</label>
                <input
                  id="summary"
                  type="text"
                  placeholder="####"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="doctor" className="block text-sm font-medium text-gray-700">Doctor</label>
                <input
                  id="doctor"
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  value={doctor}
                  onChange={(e) => setDoctor(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="institution" className="block text-sm font-medium text-gray-700">Medical Institution</label>
                <input
                  id="institution"
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date of Visit</label>
                <input
                  id="date"
                  type="date"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700">Diagnosis</label>
                <input
                  id="diagnosis"
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="treatment" className="block text-sm font-medium text-gray-700">Treatment</label>
                <input
                  id="treatment"
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="mt-6">
          <label htmlFor="note" className="block text-sm font-medium text-gray-700">Note</label>
          <textarea
            id="note"
            rows="4"
            placeholder="Add Relevant Details..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          ></textarea>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <button className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
