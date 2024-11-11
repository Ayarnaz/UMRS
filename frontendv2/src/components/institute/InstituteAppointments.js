import React, { useState, useEffect } from 'react';
import { Bell, Search, Filter, Calendar, Clock, User, Edit2, Eye, X } from "lucide-react";
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import HealthcareInstituteSidebar from './HealthcareInstituteSidebar';
import api from '../../services/api';

export default function InstituteAppointments() {
    const { user } = useAuth();
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState([]);
    const [stats, setStats] = useState({
        todayCount: 0
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [professionals, setProfessionals] = useState([]);
    const [appointmentForm, setAppointmentForm] = useState({
        professionalId: '',
        patientPHN: '',
        purpose: '',
        date: '',
        time: '',
        status: 'scheduled'
    });

    // Fetch appointments data
    const fetchAppointments = async () => {
        try {
            const response = await api.get('/api/institute/appointments', {
                params: { 
                    instituteId: user.userIdentifier,
                    status: filterStatus !== 'all' ? filterStatus : undefined,
                    search: searchQuery || undefined
                }
            });
            setAppointments(response.data.appointments);
            setStats({
                todayCount: response.data.todayCount || 0
            });
        } catch (error) {
            console.error('Error fetching appointments:', error);
            showNotification('error', 'Failed to fetch appointments');
        } finally {
            setLoading(false);
        }
    };

    // Fetch professionals for dropdown
    const fetchProfessionals = async () => {
        try {
            const response = await api.get('/api/institute/professionals', {
                params: { instituteNumber: user.userIdentifier }
            });
            setProfessionals(response.data);
        } catch (error) {
            console.error('Error fetching professionals:', error);
            showNotification('error', 'Failed to fetch professionals');
        }
    };

    // Add new function to fetch stats
    const fetchStats = async () => {
        try {
            const response = await api.get('/api/institute/dashboard-stats', {
                params: { instituteId: user.userIdentifier }
            });
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
            showNotification('error', 'Failed to fetch stats');
        }
    };

    // Update useEffect to fetch both appointments and stats
    useEffect(() => {
        fetchAppointments();
        fetchStats();
        fetchProfessionals();
    }, [user?.userIdentifier]);

    const handleBookAppointment = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            const response = await api.post('/api/institute/appointments', {
                ...appointmentForm,
                instituteId: user.userIdentifier,
                dateTime: `${appointmentForm.date} ${appointmentForm.time}`
            });

            showNotification('success', 'Appointment booked successfully');
            setAppointmentForm({
                professionalId: '',
                patientPHN: '',
                purpose: '',
                date: '',
                time: '',
                status: 'scheduled'
            });
            fetchAppointments();
        } catch (error) {
            console.error('Error booking appointment:', error);
            showNotification('error', 'Failed to book appointment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <HealthcareInstituteSidebar />
            <main className="flex-1 p-8 overflow-auto">
                {/* Header */}
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
                    <div className="flex items-center space-x-4">
                        <Bell className="h-6 w-6 text-gray-400 cursor-pointer" />
                        <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                    </div>
                </header>

                {/* Appointment Booking and Stats Section */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                    {/* Booking Form */}
                    <div className="col-span-2 bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Book New Appointment</h2>
                        <form onSubmit={handleBookAppointment} className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Healthcare Professional
                                </label>
                                <select
                                    className="w-full p-2 border rounded-md"
                                    value={appointmentForm.professionalId}
                                    onChange={(e) => setAppointmentForm({
                                        ...appointmentForm,
                                        professionalId: e.target.value
                                    })}
                                    required
                                >
                                    <option value="">Select Professional</option>
                                    {professionals.map((prof) => (
                                        <option key={prof.slmcNo} value={prof.slmcNo}>
                                            {prof.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Patient PHN
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded-md"
                                    value={appointmentForm.patientPHN}
                                    onChange={(e) => setAppointmentForm({
                                        ...appointmentForm,
                                        patientPHN: e.target.value
                                    })}
                                    required
                                    placeholder="Enter Patient PHN"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Purpose
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded-md"
                                    value={appointmentForm.purpose}
                                    onChange={(e) => setAppointmentForm({
                                        ...appointmentForm,
                                        purpose: e.target.value
                                    })}
                                    required
                                    placeholder="Enter appointment purpose"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    className="w-full p-2 border rounded-md"
                                    value={appointmentForm.date}
                                    onChange={(e) => setAppointmentForm({
                                        ...appointmentForm,
                                        date: e.target.value
                                    })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Time
                                </label>
                                <input
                                    type="time"
                                    className="w-full p-2 border rounded-md"
                                    value={appointmentForm.time}
                                    onChange={(e) => setAppointmentForm({
                                        ...appointmentForm,
                                        time: e.target.value
                                    })}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="col-span-2 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                                disabled={loading}
                            >
                                {loading ? 'Booking...' : 'Book Appointment'}
                            </button>
                        </form>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Today's Appointments</h2>
                        <div className="text-center">
                            <p className="text-4xl font-bold text-indigo-600">{stats.todayCount}</p>
                            <p className="text-gray-500 mt-2">Total Appointments</p>
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex-1 max-w-md">
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-2 border rounded-md"
                                placeholder="Search appointments..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                    <select
                        className="ml-4 p-2 border rounded-md"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                {/* Appointments Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Professional
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Patient
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Purpose
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date & Time
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center">
                                        Loading...
                                    </td>
                                </tr>
                            ) : appointments.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                        No appointments found
                                    </td>
                                </tr>
                            ) : (
                                appointments.map((appointment) => (
                                    <tr key={appointment.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                                    <span className="text-indigo-600 font-medium">
                                                        {appointment.professionalName?.[0]}
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {appointment.professionalName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {appointment.professionalId}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{appointment.patientName}</div>
                                            <div className="text-sm text-gray-500">{appointment.patientPHN}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{appointment.purpose}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {console.log('Raw datetime:', appointment.dateTime)}
                                                <div className="text-sm text-gray-900">
                                                    {appointment.dateTime ? 
                                                        (() => {
                                                            const date = new Date(appointment.dateTime);
                                                            console.log('Parsed date object:', date);
                                                            return date.toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            });
                                                        })()
                                                        : 'N/A'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {appointment.dateTime ? 
                                                        new Date(appointment.dateTime).toLocaleTimeString('en-US', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })
                                                        : 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                ${appointment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                                  appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                                                  'bg-yellow-100 text-yellow-800'}`}>
                                                {appointment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                                                <Eye className="h-5 w-5" />
                                            </button>
                                            <button className="text-green-600 hover:text-green-900 mr-3">
                                                <Edit2 className="h-5 w-5" />
                                            </button>
                                            <button className="text-red-600 hover:text-red-900">
                                                <X className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
} 