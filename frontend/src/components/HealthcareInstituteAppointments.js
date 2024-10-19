import React from 'react';
import { Bell, Calendar, Clock, Search, User } from "lucide-react";
import HealthcareInstituteSidebar from './HealthcareInstituteSidebar';

const appointments = [
  { professional: "Dr. John Boo", patient: "Alexander Robson", purpose: "Lorem Ipsum", time: "15 Sep, 8:56 AM (2013)" },
  { professional: "Dr. Michael Robinson", patient: "Jennifer Pinsker", purpose: "Lorem Ipsum", time: "15 Sep, 7:12 AM (2013)" },
  { professional: "Dr. Alexander Robson", patient: "Bob Robson", purpose: "Lorem Ipsum", time: "15 Sep, 4:32 AM (2013)" },
  { professional: "Dr. Jennifer Pinsker", patient: "John Boo", purpose: "Lorem Ipsum", time: "15 Sep, 2:08 AM (2013)" },
  { professional: "Dr. Bob Robson", patient: "Alexander Robson", purpose: "Lorem Ipsum", time: "15 Sep, 8:56 AM (2013)" },
  { professional: "Dr. Michael Robinson", patient: "John Boo", purpose: "Lorem Ipsum", time: "15 Sep, 7:12 AM (2013)" },
  { professional: "Dr. Jennifer Pinsker", patient: "Bob Robson", purpose: "Lorem Ipsum", time: "15 Sep, 4:34 AM (2013)" },
  { professional: "Dr. John Boo", patient: "Michael Robinson", purpose: "Lorem Ipsum", time: "15 Sep, 2:08 AM (2013)" },
];

export default function HealthcareInstituteAppointments() {
  return (
    <div className="flex h-screen bg-gray-100">
      <HealthcareInstituteSidebar />
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Appointments</h1>
          <div className="flex items-center space-x-4">
            <Search className="text-gray-400" />
            <Bell className="text-gray-400" />
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          </div>
        </header>

        {/* Appointment Booking Form and Today's Appointments */}
        <div className="flex gap-8 mb-8">
          {/* Appointment Booking Form */}
          <div className="bg-white p-6 rounded-lg shadow-sm flex-grow">
            <h2 className="text-xl font-semibold mb-4">Book a New Appointment</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="doctor" className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                <input id="doctor" placeholder="Select Doctor" className="w-full p-2 border rounded" />
              </div>
              <div>
                <label htmlFor="patient" className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                <input id="patient" placeholder="Select Patient" className="w-full p-2 border rounded" />
              </div>
              <div>
                <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                <input id="purpose" placeholder="Enter Purpose" className="w-full p-2 border rounded" />
              </div>
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <div className="relative">
                  <input id="date" type="date" className="w-full p-2 border rounded pr-10" />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <div className="relative">
                  <input id="time" type="time" className="w-full p-2 border rounded pr-10" />
                  <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
              </div>
              <div className="flex items-end">
                <button className="bg-green-600 hover:bg-green-700 text-white p-2 rounded w-full">Book Appointment</button>
              </div>
            </div>
          </div>

          {/* Today's Appointments Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 w-80 flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Today's Appointments</h2>
            <p className="text-4xl font-bold text-center mb-4">00</p>
            <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 p-2 rounded mt-auto">View List</button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8 flex">
          <input type="search" placeholder="Search appointments..." className="w-full p-2 border rounded-l" />
          <button className="bg-blue-500 text-white px-4 rounded-r">Search</button>
        </div>

        {/* Appointments Table */}
        <table className="w-full bg-white rounded-lg shadow-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 text-left">Professional</th>
              <th className="p-3 text-left">Patient</th>
              <th className="p-3 text-left">Purpose</th>
              <th className="p-3 text-left">Time</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment, index) => (
              <tr key={index} className="border-t">
                <td className="p-3">
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4 text-gray-400" />
                    {appointment.professional}
                  </div>
                </td>
                <td className="p-3">{appointment.patient}</td>
                <td className="p-3">{appointment.purpose}</td>
                <td className="p-3">{appointment.time}</td>
                <td className="p-3">
                  <button className="mr-2 px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded">View Details</button>
                  <button className="px-3 py-1 bg-green-50 text-green-600 hover:bg-green-100 rounded">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}
