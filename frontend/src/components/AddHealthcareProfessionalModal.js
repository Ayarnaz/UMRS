import React from 'react';
import { ArrowLeft, Upload } from "lucide-react";

export default function AddHealthcareProfessionalModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <header className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <ArrowLeft className="mr-2 cursor-pointer" onClick={onClose} />
              <h2 className="text-2xl font-bold">Add a New Healthcare Professional</h2>
            </div>
          </header>

          <form className="space-y-6">
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <button type="button" className="flex flex-col items-center p-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
                    <Upload className="mb-2" />
                    <span>Upload Photo</span>
                  </button>
                </div>
              </div>
              <div className="flex-grow">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 bg-gray-200 p-2">Name</label>
                <input id="name" className="mt-1 block w-full border rounded p-2" placeholder="Enter name" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 bg-gray-200 p-2">Address</label>
                <input id="address" className="mt-1 block w-full border rounded p-2" placeholder="Enter address" />
              </div>
              <div>
                <label htmlFor="contact" className="block text-sm font-medium text-gray-700 bg-gray-200 p-2">Contact Number</label>
                <input id="contact" className="mt-1 block w-full border rounded p-2" placeholder="Enter contact number" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 bg-gray-200 p-2">Email</label>
                <input id="email" type="email" className="mt-1 block w-full border rounded p-2" placeholder="Enter email" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="nic" className="block text-sm font-medium text-gray-700 bg-gray-200 p-2">NIC</label>
                <input id="nic" className="mt-1 block w-full border rounded p-2" placeholder="Enter NIC" />
              </div>
              <div>
                <label htmlFor="slmc" className="block text-sm font-medium text-gray-700 bg-gray-200 p-2">SLMC Number</label>
                <input id="slmc" className="mt-1 block w-full border rounded p-2" placeholder="Enter SLMC Number" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="speciality" className="block text-sm font-medium text-gray-700 bg-gray-200 p-2">Speciality</label>
                <select id="speciality" className="mt-1 block w-full border rounded p-2">
                  <option value="">Select</option>
                  <option value="general">General Practice</option>
                  <option value="neurology">Neurology</option>
                  <option value="pediatrics">Pediatrics</option>
                  <option value="oncology">Oncology</option>
                </select>
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 bg-gray-200 p-2">Role</label>
                <select id="role" className="mt-1 block w-full border rounded p-2">
                  <option value="">Select</option>
                  <option value="doctor">Doctor</option>
                  <option value="nurse">Nurse</option>
                  <option value="residency">Residency</option>
                </select>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Preferences</h2>
              <p className="text-sm text-gray-500 mb-2">Preferred Verification / Alert Method</p>
              <select id="preferences" className="mt-1 block w-full border rounded p-2">
                <option value="email-sms">Email + SMS</option>
                <option value="email">Email Only</option>
                <option value="sms">SMS Only</option>
              </select>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                Add Healthcare Professional
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
