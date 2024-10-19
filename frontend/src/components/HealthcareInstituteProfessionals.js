import React, { useState } from 'react';
import { Bell, Search, User } from "lucide-react";
import HealthcareInstituteSidebar from './HealthcareInstituteSidebar';
import AddHealthcareProfessionalModal from './AddHealthcareProfessionalModal';

const professionals = [
  { name: "Dr. John Boo", speciality: "General Practice", role: "Doctor", signedIn: "15 Sep, 8:56 AM (2024)" },
  { name: "Dr. Michael Robinson", speciality: "General Practice", role: "Residency", signedIn: "15 Sep, 7:12 AM (2024)" },
  { name: "Dr. Alexander Robson", speciality: "Neurology", role: "Doctor", signedIn: "15 Sep, 4:32 AM (2024)" },
  { name: "Jennifer Pinsker", speciality: "Pediatrics", role: "Nurse", signedIn: "15 Sep, 2:08 AM (2024)" },
  { name: "Dr. Bob Robson", speciality: "General Practice", role: "Doctor", signedIn: "15 Sep, 8:56 AM (2024)" },
  { name: "Dr. Michael Robinson", speciality: "Oncology", role: "Residency", signedIn: "15 Sep, 7:12 AM (2024)" },
  { name: "Dr. Jennifer Pinsker", speciality: "Trauma", role: "Doctor", signedIn: "15 Sep, 4:34 AM (2024)" },
  { name: "Jane Boo", speciality: "Neurology", role: "Nurse", signedIn: "15 Sep, 2:08 AM (2024)" },
];

const specialityColors = {
  "General Practice": "bg-green-100 text-green-800",
  "Neurology": "bg-gray-100 text-gray-800",
  "Pediatrics": "bg-gray-100 text-gray-800",
  "Oncology": "bg-blue-100 text-blue-800",
  "Trauma": "bg-red-100 text-red-800",
};

const roleColors = {
  "Doctor": "bg-green-100 text-green-800",
  "Residency": "bg-blue-100 text-blue-800",
  "Nurse": "bg-blue-100 text-blue-800",
};

export default function HealthcareInstituteProfessionals() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <HealthcareInstituteSidebar />
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Healthcare Professionals</h1>
          <div className="flex items-center space-x-4">
            <Search className="text-gray-400" />
            <Bell className="text-gray-400" />
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          </div>
        </header>

        {/* Search Form and Active Healthcare Professionals */}
        <div className="flex gap-8 mb-8">
          {/* Search Form */}
          <div className="bg-white p-6 rounded-lg shadow-sm flex-grow">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label htmlFor="slmcNo" className="block text-sm font-medium text-gray-700 mb-1">SLMC No</label>
                <input id="slmcNo" placeholder="Enter SLMC No" className="w-full p-2 border rounded" />
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input id="name" placeholder="Enter name" className="w-full p-2 border rounded" />
              </div>
              <div>
                <label htmlFor="speciality" className="block text-sm font-medium text-gray-700 mb-1">Speciality</label>
                <input id="speciality" placeholder="Enter speciality" className="w-full p-2 border rounded" />
              </div>
            </div>
            <div className="flex justify-between">
              <button className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded">Search</button>
              <button 
                className="bg-green-600 hover:bg-green-700 text-white p-2 rounded"
                onClick={() => setIsModalOpen(true)}
              >
                Add a New Professional
              </button>
            </div>
          </div>

          {/* Active Healthcare Professionals Counter */}
          <div className="bg-white rounded-lg shadow-sm w-64">
            <div className="bg-gray-700 text-white p-4 rounded-t-lg">
              <h2 className="text-lg font-semibold">Active Healthcare Professionals</h2>
            </div>
            <div className="p-4">
              <p className="text-4xl font-bold text-center">00</p>
            </div>
          </div>
        </div>

        {/* Healthcare Professionals Table */}
        <div className="bg-white rounded-lg shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Speciality</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Signed in</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {professionals.map((professional, index) => (
                <tr key={index} className="border-t">
                  <td className="p-3 font-medium">
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4 text-gray-400" />
                      {professional.name}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${specialityColors[professional.speciality] || "bg-gray-100 text-gray-800"}`}>
                      {professional.speciality}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${roleColors[professional.role] || "bg-gray-100 text-gray-800"}`}>
                      {professional.role}
                    </span>
                  </td>
                  <td className="p-3">{professional.signedIn}</td>
                  <td className="p-3">
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-sm">View</button>
                      <button className="px-3 py-1 bg-green-50 text-green-600 hover:bg-green-100 rounded text-sm">Edit</button>
                      <button className="px-3 py-1 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded text-sm">Appointments</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Healthcare Professional Modal */}
        <AddHealthcareProfessionalModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      </main>
    </div>
  );
}
