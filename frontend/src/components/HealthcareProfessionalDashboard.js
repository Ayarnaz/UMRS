import React from 'react';
import { Bell, Search } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import HealthcareProfessionalSidebar from './HealthcareProfessionalSidebar';

// Remove or comment out these lines if not used:
// import { useState } from 'react';
// import { User } from 'some-package';

export default function HealthcareProfessionalDashboard() {
  const navigate = useNavigate();

  const renderDashboardContent = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {[
          {
            title: "Today's Appointments",
            content: (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">Angela J.</p>
                    <p className="text-sm text-gray-500">Consultation</p>
                  </div>
                  <p className="text-green-600">10:00:00</p>
                </div>
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">Jane D.</p>
                    <p className="text-sm text-gray-500">First Visit</p>
                  </div>
                  <p className="text-green-600">11:00:00</p>
                </div>
              </div>
            )
          },
          {
            title: "Incoming Medical Reports",
            content: (
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">Blood Test...</p>
                  <p className="text-sm text-gray-500">From: Lab Tests</p>
                  <p className="text-sm text-gray-500">Note: Jane D. Blood count...</p>
                </div>
                <span className="text-green-600 font-semibold">- NEW</span>
              </div>
            )
          },
          {
            title: "Requests",
            content: (
              <div>
                <p className="font-semibold">Hope Healthcare</p>
                <p className="text-sm text-gray-500">Requested New Blood Test</p>
                <p className="text-sm text-gray-500">01/01/2023 05:00 pm</p>
                <p className="text-sm text-gray-500">Note: Elevated blood cell count</p>
              </div>
            )
          }
        ].map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
            {card.content}
            <button className="w-full bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300 mt-4">
              View Details
            </button>
          </div>
        ))}
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h3 className="text-lg font-semibold mb-2">Quick Access</h3>
        <div className="flex justify-between">
          <button 
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
            onClick={() => navigate('/healthcare-professional-records')}
          >
            View Patient Records
          </button>
          <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">
            Request A Report
          </button>
          <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">
            Book an Appointment
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-2">Most Recently Viewed</h3>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-2">Patient</th>
              <th className="text-left p-2">Action</th>
              <th className="text-left p-2">Date</th>
              <th className="text-left p-2"></th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: "John Boo", action: "Medical Record Update", date: "15 Sep, 8:56 AM" },
              { name: "Michael Robinson", action: "First Visit", date: "15 Sep, 7:12 AM" },
              { name: "Alexander Robson", action: "Renew Prescription", date: "15 Sep, 4:34 AM" },
              { name: "Jennifer Pinsker", action: "Medical Record Update", date: "15 Sep, 2:08 AM" },
              { name: "Bob Robson", action: "Profile Updated", date: "15 Sep, 8:56 AM" },
            ].map((item, index) => (
              <tr key={index} className="border-t">
                <td className="p-2">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-300 rounded-full mr-2 flex items-center justify-center">
                      {item.name[0]}
                    </div>
                    {item.name}
                  </div>
                </td>
                <td className="p-2">{item.action}</td>
                <td className="p-2">{item.date}</td>
                <td className="p-2">
                  <button className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600">Update</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <HealthcareProfessionalSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex justify-between items-center p-4 bg-white shadow-sm">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-md hover:bg-gray-200">
              <Search className="h-5 w-5" />
            </button>
            <button className="p-2 rounded-md hover:bg-gray-200">
              <Bell className="h-5 w-5" />
            </button>
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4">
          {renderDashboardContent()}
        </main>
      </div>

      {/* Right Sidebar */}
      <aside className="w-64 bg-white p-4 border-l">
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-2">Welcome Back Dr. John!</h2>
          <select className="w-full bg-white border border-gray-300 rounded-md py-2 px-4 appearance-none">
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
        <div className="space-y-2 mb-4">
          <button className="w-full text-left py-2 px-4 hover:bg-gray-100 rounded-md">
            Profile Overview
          </button>
          <button className="w-full text-left py-2 px-4 hover:bg-gray-100 rounded-md">
            Update Profile Details
          </button>
        </div>
        <div>
          <h3 className="font-semibold mb-2">New Appointment Requests</h3>
          <div className="space-y-2">
            {[
              { name: "John", date: "24 Th Feb | 05:00 PM", description: "Routine check up" },
              { name: "Cole", date: "24 Th Feb | 05:00 PM", description: "Routine check up" },
            ].map((appointment, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-300 rounded-full mr-2 flex items-center justify-center">
                      {appointment.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold">{appointment.name}</p>
                      <p className="text-sm text-gray-500">{appointment.date}</p>
                    </div>
                  </div>
                  <select className="bg-white border border-gray-300 rounded-md py-1 px-2 text-sm">
                    <option>Select</option>
                    <option>Accept</option>
                    <option>Reject</option>
                  </select>
                </div>
                <p className="text-sm text-gray-500">{appointment.description}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
