import React from 'react';
// import { useNavigate } from 'react-router-dom';
import { Bell, Search } from "lucide-react";
import HealthcareProfessionalSidebar from './HealthcareProfessionalSidebar';
// Remove the following line as SomeComponent is not used
// import SomeComponent from './SomeComponent';

export default function HealthcareProfessionalRecordsView() {
  // Remove or comment out unused state and hooks
  // const [searchQuery, setSearchQuery] = useState('');
  // const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-gray-100">
      <HealthcareProfessionalSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex justify-between items-center p-4 bg-white shadow-sm">
          <h1 className="text-2xl font-bold">Medical Records</h1>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-md hover:bg-gray-200"><Search className="h-5 w-5" /></button>
            <button className="p-2 rounded-md hover:bg-gray-200"><Bell className="h-5 w-5" /></button>
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4">
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-lg font-semibold mb-4 bg-blue-500 text-white p-2 rounded">Request Record Access</h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label htmlFor="health-number" className="block text-sm font-medium text-gray-700 mb-1">
                  Personal Health Number
                </label>
                <input id="health-number" placeholder="Enter health number" className="w-full p-2 border rounded-md" />
              </div>
              <div>
                <label htmlFor="patient-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Name
                </label>
                <input id="patient-name" placeholder="Enter patient name" className="w-full p-2 border rounded-md" />
              </div>
              <div>
                <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
                  Purpose
                </label>
                <input id="purpose" placeholder="Enter purpose" className="w-full p-2 border rounded-md" />
              </div>
            </div>
            <div className="flex justify-between">
              <button className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">Emergency Access</button>
              <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Send Access Request</button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="flex justify-between items-center bg-blue-500 text-white p-2 rounded-t-lg">
              <h2 className="text-lg font-semibold">Accessed Records</h2>
              <button className="p-2 rounded-md hover:bg-blue-600">
                <Search className="h-5 w-5" />
              </button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-2">Personal Health No</th>
                  <th className="text-left p-2">Patient Name</th>
                  <th className="text-left p-2">Action</th>
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2"></th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: "###########", name: "John Boo", action: "Scan", subAction: "X Ray", date: "15 Sep, 8:56 AM" },
                  { id: "###########", name: "Michael Robinson", action: "Prescription", subAction: "Diabetes", date: "15 Sep, 7:12 AM" },
                  { id: "###########", name: "Alexander Robson", action: "Record Update", subAction: "Lorem ipsum", date: "15 Sep, 4:34 AM" },
                  { id: "###########", name: "Jennifer Pinsker", action: "Prescription", subAction: "Lorem ipsum", date: "15 Sep, 2:08 AM" },
                  { id: "###########", name: "Bob Robson", action: "Record Updated", subAction: "Lorem ipsum", date: "15 Sep, 8:56 AM" },
                  { id: "###########", name: "Michael Robinson", action: "Lorem Ipsum", subAction: "Lorem ipsum", date: "15 Sep, 7:12 AM" },
                ].map((record, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-2">{record.id}</td>
                    <td className="p-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-300 rounded-full mr-2 flex items-center justify-center">
                          {record.name[0]}
                        </div>
                        {record.name}
                      </div>
                    </td>
                    <td className="p-2">
                      {record.action}
                      <br />
                      <span className="text-gray-400 text-sm">{record.subAction}</span>
                    </td>
                    <td className="p-2">
                      {record.date}
                      <br />
                      <span className="text-gray-400 text-sm">(2023)</span>
                    </td>
                    <td className="p-2">
                      <button className="bg-gray-200 text-gray-800 px-2 py-1 rounded-md hover:bg-gray-300 mr-2">View</button>
                      <button className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
