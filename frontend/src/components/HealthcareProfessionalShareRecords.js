import React from 'react';
import { Bell } from "lucide-react";
import HealthcareProfessionalSidebar from './HealthcareProfessionalSidebar';

export default function HealthcareProfessionalShareRecords() {
  return (
    <div className="flex h-screen bg-gray-100">
      <HealthcareProfessionalSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex justify-between items-center p-4 bg-white shadow-sm">
          <h1 className="text-2xl font-bold">Shared Reports</h1>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-md hover:bg-gray-200">
              <Bell className="h-5 w-5" />
            </button>
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="col-span-2 bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4 bg-blue-500 text-white p-2 rounded">Request Record</h2>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="healthcare-provider" className="block text-sm font-medium text-gray-700 mb-1">
                    Healthcare Provider
                  </label>
                  <input id="healthcare-provider" placeholder="Enter provider name" className="w-full p-2 border rounded-md" />
                </div>
                <div>
                  <label htmlFor="patient-health-number" className="block text-sm font-medium text-gray-700 mb-1">
                    Patient Personal Health Number
                  </label>
                  <input id="patient-health-number" placeholder="Enter health number" className="w-full p-2 border rounded-md" />
                </div>
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select id="type" className="w-full p-2 border rounded-md">
                    <option value="">Select</option>
                    <option value="prescription">Prescription</option>
                    <option value="scan">Scan</option>
                    <option value="blood-test">Blood Test</option>
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
                  Purpose
                </label>
                <textarea id="purpose" placeholder="Enter purpose" className="w-full p-2 border rounded-md"></textarea>
              </div>
              <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-md">Request A Report</button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4 bg-blue-500 text-white p-2 rounded">Send Records</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-1">
                    Provider
                  </label>
                  <input id="provider" placeholder="Name" className="w-full p-2 border rounded-md" />
                </div>
                <div>
                  <label htmlFor="patient" className="block text-sm font-medium text-gray-700 mb-1">
                    Patient
                  </label>
                  <input id="patient" placeholder="Personal Health" className="w-full p-2 border rounded-md" />
                </div>
                <div>
                  <label htmlFor="send-type" className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select id="send-type" className="w-full p-2 border rounded-md">
                    <option value="">Select</option>
                    <option value="prescription">Prescription</option>
                    <option value="scan">Scan</option>
                    <option value="blood-test">Blood Test</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <input id="notes" placeholder="Notes" className="w-full p-2 border rounded-md" />
                </div>
                <div className="border-2 border-dashed border-gray-300 p-4 text-center rounded-lg">
                  <p className="text-sm text-gray-500">Drag and Drop Document or Select From Device</p>
                </div>
                <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-md">Send Record</button>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="flex justify-between items-center bg-gray-100 p-4 rounded-t-lg">
              <h2 className="text-lg font-semibold">Shared Reports</h2>
              <button className="p-2 rounded-md hover:bg-gray-200">
                <Bell className="h-5 w-5" />
              </button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-2">Request From</th>
                  <th className="text-left p-2">To</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { from: "You", to: "John Boo", type: "Prescription", subType: "Diabetes", date: "15 Sep, 8:56 AM" },
                  { from: "Dr. Bob Robson", to: "You", type: "Scan", subType: "Lorem Ipsum", date: "15 Sep, 7:12 AM" },
                  { from: "Hope Health", to: "You", type: "Doctor's note", subType: "Lorem ipsum", date: "15 Sep, 4:34 AM" },
                  { from: "You", to: "Jennifer Pinsker", type: "Blood Test", subType: "Lorem ipsum", date: "15 Sep, 2:08 AM" },
                  { from: "You", to: "Bob Robson", type: "Urine Test", subType: "Lorem ipsum", date: "15 Sep, 8:56 AM" },
                  { from: "Dr. Michael Robinson", to: "You", type: "Prescription", subType: "Lorem ipsum", date: "15 Sep, 7:12 AM" },
                ].map((record, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-2">{record.from}</td>
                    <td className="p-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-300 rounded-full mr-2 flex items-center justify-center">
                          {record.to[0]}
                        </div>
                        {record.to}
                      </div>
                    </td>
                    <td className="p-2">
                      {record.type}
                      <br />
                      <span className="text-gray-400 text-sm">{record.subType}</span>
                    </td>
                    <td className="p-2">
                      {record.date}
                      <br />
                      <span className="text-gray-400 text-sm">(2023)</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Report Requests</h2>
              <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">+3</span>
            </div>
            <div className="space-y-4">
              {[
                { name: "Dr. Abc", id: "###########", description: "Test Results" },
                { name: "Hope HEALTH", id: "###########", description: "BP Prescription" },
              ].map((request, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-300 rounded-full mr-3 flex items-center justify-center">
                      {request.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold">{request.name}</p>
                      <p className="text-sm text-gray-500">{request.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{request.description}</p>
                    <button className="mt-1 px-3 py-1 bg-white text-gray-800 border border-gray-300 rounded-md text-sm hover:bg-gray-100">
                      Attach
                    </button>
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
