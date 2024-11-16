import React, { useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Plus } from 'lucide-react';
import PatientSidebar from './PatientSidebar';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import AppointmentModal from './modals/AppointmentModal';
import './PatientAppointments.css';

export default function PatientAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAppointments = useCallback(async () => {
    if (!user?.userIdentifier) {
        console.log('No user identifier found:', user);
        setError('User identification not found');
        setLoading(false);
        return;
    }

    const phn = user.userIdentifier.trim();
    console.log('Attempting to fetch appointments with PHN:', phn);

    try {
        const response = await api.get(`/api/patient/appointments/list`, {
            params: {
                personalHealthNo: phn
            }
        });
        
        console.log('API Response:', response);
        
        if (response.data) {
            const formattedAppointments = response.data.map(apt => {
                const dateStr = apt.appointmentDate;
                const timeStr = apt.appointmentTime;
                const startDateTime = `${dateStr}T${timeStr}`;
                
                return {
                    id: apt.id,
                    title: `${apt.purpose || 'Appointment'} - ${apt.status}`,
                    start: startDateTime,
                    allDay: false,
                    backgroundColor: apt.status === 'Scheduled' ? '#3B82F6' : '#10B981',
                    borderColor: apt.status === 'Scheduled' ? '#2563EB' : '#059669',
                    extendedProps: {
                        status: apt.status,
                        notes: apt.notes,
                        slmcNo: apt.slmcNo,
                        healthInstituteNumber: apt.healthInstituteNumber
                    }
                };
            });
            
            setAppointments(formattedAppointments);
        } else {
            setAppointments([]);
        }
    } catch (error) {
        console.error('Error details:', error);
        setError('Failed to load appointments');
    } finally {
        setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleDateSelect = (selectInfo) => {
    setSelectedAppointment({
      start: selectInfo.start,
      end: selectInfo.end
    });
    setIsModalOpen(true);
  };

  const handleEventClick = (clickInfo) => {
    setSelectedAppointment({
      id: clickInfo.event.id,
      title: clickInfo.event.title,
      start: clickInfo.event.start,
      end: clickInfo.event.end,
      resource: clickInfo.event.extendedProps
    });
    setIsModalOpen(true);
  };

  const getUpcomingAppointments = () => {
    const now = new Date();
    return appointments
      .filter(apt => new Date(apt.start) >= now)
      .sort((a, b) => new Date(a.start) - new Date(b.start))
      .slice(0, 5); // Show only next 5 appointments
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <PatientSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <PatientSidebar />
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
            <button
              onClick={() => {
                setSelectedAppointment(null);
                setIsModalOpen(true);
              }}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Appointment
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-6">
            <div className="bg-white rounded-lg shadow p-6 flex-1">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                events={appointments}
                selectable={true}
                select={handleDateSelect}
                eventClick={handleEventClick}
                height="auto"
                aspectRatio={1.8}
                eventTimeFormat={{
                  hour: '2-digit',
                  minute: '2-digit',
                  meridiem: 'short'
                }}
                slotMinTime="08:00:00"
                slotMaxTime="18:00:00"
                businessHours={{
                  daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
                  startTime: '08:00',
                  endTime: '18:00',
                }}
                eventDisplay="block"
                displayEventEnd={true}
                eventInteractive={true}
                nowIndicator={true}
                themeSystem="standard"
                dayMaxEvents={true}
                buttonText={{
                  today: 'Today',
                  month: 'Month',
                  week: 'Week',
                  day: 'Day'
                }}
                className="custom-calendar"
                dayHeaderClassNames="text-gray-600 uppercase text-sm font-semibold"
                dayCellClassNames="hover:bg-blue-50"
                slotLabelClassNames="text-gray-500"
                eventClassNames="rounded-md"
                highlightedDates={[new Date()]}
                buttonIcons={{
                  prev: 'chevron-left',
                  next: 'chevron-right'
                }}
                views={{
                  dayGrid: {
                    dayMaxEvents: 3,
                    eventTimeFormat: {
                      hour: '2-digit',
                      minute: '2-digit',
                      meridiem: 'short'
                    }
                  },
                  timeGrid: {
                    eventTimeFormat: {
                      hour: '2-digit',
                      minute: '2-digit',
                      meridiem: 'short'
                    }
                  }
                }}
              />
            </div>

            <div className="w-80 bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Upcoming Appointments
              </h2>
              <div className="space-y-4">
                {getUpcomingAppointments().map(apt => (
                  <div
                    key={apt.id}
                    className="p-4 border rounded-lg hover:border-blue-500 cursor-pointer transition-colors"
                    onClick={() => handleEventClick({ event: {
                      id: apt.id,
                      title: apt.title,
                      start: new Date(apt.start),
                      end: new Date(apt.start),
                      extendedProps: apt.extendedProps
                    }})}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-3 h-3 rounded-full ${
                        apt.extendedProps.status === 'Scheduled' 
                          ? 'bg-blue-500' 
                          : 'bg-green-500'
                      }`} />
                      <span className="text-sm text-gray-500">
                        {new Date(apt.start).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900 mb-1">
                      {apt.title.split(' - ')[0]}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(apt.start).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {apt.extendedProps.slmcNo && (
                      <p className="text-xs text-gray-500 mt-1">
                        Doctor: {apt.extendedProps.slmcNo}
                      </p>
                    )}
                  </div>
                ))}
                {getUpcomingAppointments().length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No upcoming appointments
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <AppointmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          appointment={selectedAppointment}
          onAppointmentUpdated={fetchAppointments}
          user={user}
        />
      </div>
    </div>
  );
} 