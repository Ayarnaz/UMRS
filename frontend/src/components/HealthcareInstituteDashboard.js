import React from 'react';
import { Bell, Search } from "lucide-react";
import HealthcareInstituteSidebar from './HealthcareInstituteSidebar';

const Card = ({ title, children }) => (
  <div className="bg-white rounded-lg shadow-md">
    <div className="p-4 border-b">
      <h2 className="text-lg font-semibold">{title}</h2>
    </div>
    <div className="p-4">
      {children}
    </div>
    <div className="p-4 border-t">
      <button className="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">View Details</button>
    </div>
  </div>
);

const QuickAccessItem = ({ action }) => (
  <div className="flex flex-col items-center">
    <div className="w-24 h-24 bg-gray-200 mb-2"></div>
    <button className="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">{action}</button>
  </div>
);

export default function HealthcareInstituteDashboard() {
  return (
    <div className="flex h-screen bg-gray-100">
      <HealthcareInstituteSidebar />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">You're Logged in As Hope Healthcare!</h1>
          <div className="flex items-center space-x-4">
            <Search className="text-gray-400" />
            <Bell className="text-gray-400" />
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          </div>
        </header>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card title="Appointments">
            <p className="font-semibold">Angela I. <span className="text-green-500">10:00:00</span></p>
            <p className="text-sm text-gray-500">Consultation with Dr. Angelo</p>
            <p className="font-semibold mt-2">Jane D. <span className="text-green-500">11:00:00</span></p>
            <p className="text-sm text-gray-500">First Visit with Dr. Bob</p>
          </Card>

          <Card title="Incoming Medical Reports">
            <p className="font-semibold">Blood Test... <span className="text-green-500">- NEW</span></p>
            <p className="text-sm text-gray-500">From: Lab Tests</p>
            <p className="text-sm text-gray-500">Note: Jane D. Blood count...</p>
          </Card>

          <Card title="Requests">
            <p className="font-semibold">Life Healthcare</p>
            <p className="text-sm text-gray-500">Requested New Blood Test</p>
            <p className="text-sm text-gray-500">01/01/2023 05:00 pm</p>
            <p className="text-sm text-gray-500">Note: Elevated blood cell count</p>
          </Card>

          <Card title="Active Healthcare Professionals">
            <p className="font-semibold">Currently On Duty</p>
            <p className="text-4xl font-bold text-center my-4">00</p>
          </Card>
        </div>

        {/* Quick Access */}
        <Card title="Quick Access">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['View Medical Records', 'Request Access To Patient Medical Records', 'Book an Appointment', 'View Medical Staff Tree'].map((action, index) => (
              <QuickAccessItem key={index} action={action} />
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}
