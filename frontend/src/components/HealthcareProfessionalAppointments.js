import React, { useState } from 'react';
import { Bell, Search } from "lucide-react";
import HealthcareProfessionalSidebar from './HealthcareProfessionalSidebar';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Avatar, AvatarFallback, AvatarImage, Button, Input, Switch } from './UIComponents';

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

export default function HealthcareProfessionalAppointments() {
  const [acceptingAppointments, setAcceptingAppointments] = useState(true);
  const [events] = useState([
    {
      title: 'Appointment with John',
      start: new Date(2024, 1, 24, 17, 0),
      end: new Date(2024, 1, 24, 18, 0),
    },
    {
      title: 'Appointment with Cole',
      start: new Date(2024, 1, 24, 17, 0),
      end: new Date(2024, 1, 24, 18, 0),
    },
  ]);

  const handleSelectSlot = (slotInfo) => {
    // Handle selecting an empty slot (e.g., to create a new appointment)
    console.log('Selected slot:', slotInfo);
  };

  const handleSelectEvent = (event) => {
    // Handle selecting an existing event (e.g., to view or edit an appointment)
    console.log('Selected event:', event);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <HealthcareProfessionalSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex justify-between items-center p-4 bg-white shadow-sm">
          <h1 className="text-2xl font-bold">Appointments</h1>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Avatar>
              <AvatarImage src="/placeholder-user.jpg" alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4">
          <div className="flex justify-between items-center mb-4">
            <div></div>
            <div className="flex items-center space-x-2">
              <span>Accepting new appointments</span>
              <Switch
                checked={acceptingAppointments}
                onCheckedChange={setAcceptingAppointments}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 bg-white p-4 rounded-lg shadow">
              <BigCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                selectable
              />
            </div>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Book an Appointment</h2>
                <form className="space-y-4">
                  <div>
                    <label htmlFor="patient" className="block text-sm font-medium text-gray-700">Patient</label>
                    <Input id="patient" placeholder="Name" />
                  </div>
                  <div>
                    <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">Purpose</label>
                    <Input id="purpose" placeholder="Briefly" />
                  </div>
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                    <Input id="date" type="date" />
                  </div>
                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700">Time</label>
                    <Input id="time" type="time" />
                  </div>
                  <Button className="w-full bg-green-500 hover:bg-green-600">Book A New Appointment</Button>
                </form>
                <Button variant="outline" className="w-full mt-2">Manage My Appointments</Button>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Appointment Requests</h2>
                <div className="space-y-4">
                  {[
                    { name: "John", date: "24 Th Feb | 05:00 PM", description: "Routine check up" },
                    { name: "Cole", date: "24 Th Feb | 05:00 PM", description: "Routine check up" },
                    { name: "Cole", date: "24 Th Feb | 05:00 PM", description: "Routine check up" },
                  ].map((appointment, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarFallback>{appointment.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{appointment.name}</p>
                          <p className="text-sm text-gray-500">{appointment.date}</p>
                          <p className="text-sm text-gray-500">{appointment.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Button size="sm" variant="outline" className="mr-2">
                          Accept
                        </Button>
                        <Button size="sm" variant="outline">
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
