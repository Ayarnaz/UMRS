import React, { useState, useEffect, useCallback } from 'react';
import HealthcareProfessionalSidebar from './HealthcareProfessionalSidebar';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ProfessionalAppointmentModal from './modals/ProfessionalAppointmentModal';

// Import from local UI components
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Switch } from '../../components/ui/switch';

// Add this helper function at the top level
const getUpcomingAppointments = (appointments) => {
  const now = new Date();
  return appointments
    .filter(apt => new Date(apt.start) > now)
    .sort((a, b) => new Date(a.start) - new Date(b.start))
    .slice(0, 5); // Show only next 5 appointments
};

export default function HealthcareProfessionalAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [appointmentRequests, setAppointmentRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [acceptingAppointments, setAcceptingAppointments] = useState(true);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Current user object:', user);
      
      const slmcNo = user?.userIdentifier;
      
      console.log('Using SLMC number:', slmcNo);
      
      if (!slmcNo) {
        console.log('No SLMC number found in user object');
        setLoading(false);
        return;
      }

      const response = await api.get(`/api/professional/appointments?slmcNo=${slmcNo}`);
      console.log('Raw appointments response:', response.data);
      
      if (!Array.isArray(response.data)) {
        console.error('Expected array of appointments but got:', typeof response.data);
        setError('Invalid appointments data received');
        return;
      }

      const formattedAppointments = response.data.map(apt => {
        console.log('Processing appointment:', apt);
        return {
          id: apt.id,
          title: `${apt.patientName || apt.patientPHN} - ${apt.purpose}`,
          start: `${apt.appointmentDate}T${apt.appointmentTime}`,
          allDay: false,
          backgroundColor: apt.status === 'Scheduled' ? '#3B82F6' : '#10B981',
          borderColor: apt.status === 'Scheduled' ? '#2563EB' : '#059669',
          extendedProps: {
            status: apt.status,
            notes: apt.notes || '',
            patientPHN: apt.patientPHN,
            patientName: apt.patientName,
            healthInstituteNumber: apt.healthInstituteNumber
          }
        };
      });
      
      console.log('Formatted appointments:', formattedAppointments);
      setAppointments(formattedAppointments);
      setError(null);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchAppointmentRequests = useCallback(async () => {
    try {
      console.log('Fetching appointment requests for SLMC:', user?.userIdentifier);
      if (!user?.userIdentifier) {
        console.log('No SLMC number found');
        return;
      }

      const response = await api.get(`/api/professional/appointment-requests?slmcNo=${user.userIdentifier}`);
      console.log('Appointment requests response:', response.data);
      setAppointmentRequests(response.data);
    } catch (error) {
      console.error('Error fetching appointment requests:', error);
      setError('Failed to load appointment requests');
    }
  }, [user?.userIdentifier]);

  useEffect(() => {
    if (user?.userIdentifier) {
      const loadData = async () => {
        try {
          setLoading(true);
          await Promise.all([
            fetchAppointments(),
            fetchAppointmentRequests()
          ]);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [user, fetchAppointments, fetchAppointmentRequests]);

  // Add error display
  if (error) {
    return (
      <div className="flex h-screen bg-gray-100">
        <HealthcareProfessionalSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-red-600">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <HealthcareProfessionalSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading appointments...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleAppointmentAction = async (requestId, action) => {
    try {
      await api.put(`/api/professional/appointment-requests/${requestId}/status`, {
        status: action === 'accepted' ? 'Scheduled' : 'Rejected'
      });
      
      fetchAppointmentRequests();
      fetchAppointments();
    } catch (error) {
      console.error(`Error ${action} appointment:`, error);
    }
  };

  const handleDateSelect = (selectInfo) => {
    setSelectedAppointment(null);
    setIsModalOpen(true);
  };

  const handleEventClick = (clickInfo) => {
    setSelectedAppointment(clickInfo.event);
    setIsModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <HealthcareProfessionalSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center p-4 bg-white shadow-sm">
          <h1 className="text-2xl font-bold">Appointments</h1>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => {
                setSelectedAppointment(null);
                setIsModalOpen(true);
              }}
              variant="default"
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Add Appointment
            </Button>
            <div className="flex items-center space-x-2">
              <Switch
                checked={acceptingAppointments}
                onCheckedChange={setAcceptingAppointments}
              />
              <span className="text-sm text-gray-600">
                Accepting Appointments
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <div className="bg-white p-4 rounded-lg shadow">
                {loading ? (
                  <div className="flex items-center justify-center h-96">
                    <p>Loading appointments...</p>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center h-96 text-red-600">
                    <p>{error}</p>
                  </div>
                ) : (
                  <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                      left: 'prev,next today',
                      center: 'title',
                      right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    events={appointments}
                    eventClick={handleEventClick}
                    selectable={true}
                    select={handleDateSelect}
                    height="auto"
                  />
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Upcoming Appointments</h2>
                <div className="space-y-3">
                  {loading ? (
                    <p>Loading...</p>
                  ) : error ? (
                    <p className="text-red-600">{error}</p>
                  ) : getUpcomingAppointments(appointments).length === 0 ? (
                    <p className="text-gray-500">No upcoming appointments</p>
                  ) : (
                    getUpcomingAppointments(appointments).map((apt) => (
                      <div 
                        key={apt.id} 
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div>
                          <p className="font-medium">
                            {apt.extendedProps.patientName || `PHN: ${apt.extendedProps.patientPHN}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(apt.start).toLocaleDateString()} at{' '}
                            {new Date(apt.start).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Purpose: {apt.title.split(' - ')[1]}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedAppointment(apt);
                            setIsModalOpen(true);
                          }}
                        >
                          View
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow relative min-h-[200px]">
                <div className="absolute inset-0 bg-gray-50/95 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                  <div className="text-center p-6 space-y-4">
                    <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      Coming Soon
                    </span>
                    <p className="text-gray-600 text-base max-w-xs">
                      Appointment requests feature is under development
                    </p>
                  </div>
                </div>
                
                <h2 className="text-lg font-semibold mb-4">Appointment Requests</h2>
                <div className="space-y-4">
                  {appointmentRequests.map((request) => (
                    <div key={request.appointmentID} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarFallback>{request.personalHealthNo[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">PHN: {request.personalHealthNo}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(request.appointmentDate).toLocaleDateString()} | {
                              new Date(`2000-01-01T${request.appointmentTime}`).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            }
                          </p>
                          <p className="text-sm text-gray-500">{request.purpose}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="mr-2"
                          onClick={() => handleAppointmentAction(request.appointmentID, 'accepted')}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAppointmentAction(request.appointmentID, 'rejected')}
                        >
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

        <ProfessionalAppointmentModal
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