import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Set up the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [newAppointment, setNewAppointment] = useState({
    providerName: '',
    instituteName: '',
    purpose: '',
    date: '',
    time: '',
  });

  useEffect(() => {
    // Fetch appointments from your API
    fetch('/api/patient/appointments')
      .then(response => response.json())
      .then(data => {
        // Convert the appointments to the format expected by react-big-calendar
        const formattedAppointments = data.map(apt => ({
          title: apt.type,
          start: new Date(apt.date),
          end: new Date(apt.date),
          desc: apt.note,
        }));
        setAppointments(formattedAppointments);
      })
      .catch(error => console.error('Error fetching appointments:', error));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAppointment(prev => ({ ...prev, [name]: value }));
  };

  const handleBookAppointment = () => {
    // Here you would typically send a POST request to your API to book the appointment
    console.log('Booking appointment:', newAppointment);
    // After successful booking, you'd fetch the updated list of appointments
  };

  return (
    <div className="flex h-full">
      <div className="flex-grow p-6">
        <h1 className="text-2xl font-bold mb-4">Appointments</h1>
        <div className="calendar-container" style={{ height: 500 }}>
          <Calendar
            localizer={localizer}
            events={appointments}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
          />
        </div>
      </div>
      <div className="w-64 bg-white shadow-md p-6 space-y-4">
        <input
          className="w-full p-2 border rounded"
          placeholder="Provider Name..."
          name="providerName"
          value={newAppointment.providerName}
          onChange={handleInputChange}
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="Institute Name..."
          name="instituteName"
          value={newAppointment.instituteName}
          onChange={handleInputChange}
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="Purpose Briefly..."
          name="purpose"
          value={newAppointment.purpose}
          onChange={handleInputChange}
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="Date..."
          type="date"
          name="date"
          value={newAppointment.date}
          onChange={handleInputChange}
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="Time..."
          type="time"
          name="time"
          value={newAppointment.time}
          onChange={handleInputChange}
        />
        <button
          className="w-full bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleBookAppointment}
        >
          Book A New Appointment
        </button>
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Upcoming Appointments</h3>
          {appointments.map((apt, index) => (
            <div key={index} className="bg-gray-100 p-2 mb-2 rounded">
              <p className="font-semibold">{apt.title}</p>
              <p className="text-sm">{moment(apt.start).format('DD MMM YYYY | hh:mm A')}</p>
              <p className="text-sm">{apt.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
