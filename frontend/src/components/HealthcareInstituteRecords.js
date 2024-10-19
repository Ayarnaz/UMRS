import React from 'react';
import { Bell, Calendar, Search, User } from "lucide-react";
import HealthcareInstituteSidebar from './HealthcareInstituteSidebar';

const accessedRecords = [
  { healthNo: "##########", name: "John Boo", action: "Scan", subAction: "X-Ray", date: "15 Sep, 8:56 AM (2013)" },
  { healthNo: "##########", name: "Michael Robinson", action: "Prescription", subAction: "Cholestrol", date: "15 Sep, 7:12 AM (2013)" },
  { healthNo: "##########", name: "Alexander Robson", action: "Update Documents", subAction: "Lorem Ipsum", date: "15 Sep, 4:34 AM (2013)" },
  { healthNo: "##########", name: "Jennifer Pinsker", action: "Update Records", subAction: "Lorem Ipsum", date: "15 Sep, 2:08 AM (2013)" },
  { healthNo: "##########", name: "Bob Robson", action: "Record Updated", subAction: "Lorem Ipsum", date: "15 Sep, 8:56 AM (2013)" },
  { healthNo: "##########", name: "Michael Robinson", action: "Record Updated", subAction: "Lorem Ipsum", date: "15 Sep, 7:12 AM (2013)" },
];

export default function HealthcareInstituteRecords() {
  return (
    <div className="flex h-screen bg-gray-100">
      <HealthcareInstituteSidebar />
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Medical Records</h1>
          <div className="flex items-center space-x-4">
            <Search className="text-gray-400" />
            <Bell className="text-gray-400" />
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          </div>
        </header>

        {/* Request Record Access Form */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="bg-blue-500 text-white p-4 rounded-t-lg">
            <h2 className="text-xl font-semibold">Request Record Access</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label htmlFor="healthNumber" className="block text-sm font-medium text-gray-700 mb-1">Personal Health Number</label>
                <input id="healthNumber" placeholder="Enter health number" className="w-full p-2 border rounded" />
              </div>
              <div>
                <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                <input id="patientName" placeholder="Enter patient name" className="w-full p-2 border rounded" />
              </div>
              <div>
                <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                <input id="purpose" placeholder="Enter purpose" className="w-full p-2 border rounded" />
              </div>
            </div>
            <div className="flex justify-between">
              <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">Emergency Access</button>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Send Access Request</button>
            </div>
          </div>
        </div>

        {/* Accessed Records */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="bg-blue-500 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h2 className="text-xl font-semibold">Accessed Records</h2>
            <Search className="text-white" />
          </div>
          <div className="p-6">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-3 text-left">Personal Health No</th>
                  <th className="p-3 text-left">Patient Name</th>
                  <th className="p-3 text-left">Action</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {accessedRecords.map((record, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-3 font-medium">{record.healthNo}</td>
                    <td className="p-3">
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4 text-gray-400" />
                        {record.name}
                      </div>
                    </td>
                    <td className="p-3">
                      {record.action}
                      <br />
                      <span className="text-gray-400 text-sm">{record.subAction}</span>
                    </td>
                    <td className="p-3">{record.date}</td>
                    <td className="p-3">
                      <button className="mr-2 px-3 py-1 bg-green-50 text-green-600 hover:bg-green-100 rounded">View</button>
                      <button className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
