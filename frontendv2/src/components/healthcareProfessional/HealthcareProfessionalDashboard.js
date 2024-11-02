import React, { useState, useEffect } from 'react';
import { Search, Bell, FileText, Calendar, ClipboardList, Users, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import HealthcareProfessionalSidebar from './HealthcareProfessionalSidebar';
import QuickAccessCard from './QuickAccessCard';
import { getHealthcareProfessionalDashboard } from '../../services/healthcareProfessionalService';
import { useNotification } from '../../context/NotificationContext';
import ActivityTable from './ActivityTable';

function HealthcareProfessionalDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showNotification } = useNotification();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState('active');

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user?.userIdentifier) {
                setLoading(false);
                return;
            }

            try {
                const data = await getHealthcareProfessionalDashboard(user.userIdentifier);
                setDashboardData(data);
                setError(null);
            } catch (err) {
                setError('Failed to load dashboard data');
                showNotification('error', 'Failed to load dashboard data');
                console.error('Dashboard error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user?.userIdentifier, showNotification]);

    const handleStatusChange = async (newStatus) => {
        try {
            // Add API call to update professional status
            setStatus(newStatus);
            showNotification('success', `Status updated to ${newStatus}`);
        } catch (err) {
            showNotification('error', 'Failed to update status');
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <HealthcareProfessionalSidebar />
            
            <div className="flex-1 overflow-auto">
                <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-2xl font-bold text-gray-800">Professional Dashboard</h1>
                        <div className="relative">
                            <select
                                value={status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className={`rounded-full px-4 py-1 text-sm font-medium ${
                                    status === 'active' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                }`}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Bell className="h-6 w-6 text-gray-600 cursor-pointer" />
                        <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 font-medium">
                                {dashboardData?.professional?.name?.[0] || 'D'}
                            </span>
                        </div>
                    </div>
                </header>

                <main className="p-6">
                    {/* Welcome Section */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-2">
                            Welcome, Dr. {dashboardData?.professional?.name || 'Doctor'}
                        </h2>
                        <p className="text-gray-600">
                            SLMC No: {dashboardData?.professional?.slmcNo} | 
                            Specialty: {dashboardData?.professional?.specialty}
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <QuickAccessCard 
                            icon={Calendar}
                            title="Today's Appointments"
                            value={dashboardData?.stats?.todayAppointments || 0}
                            onClick={() => navigate('/professional/appointments')}
                        />
                        <QuickAccessCard 
                            icon={FileText}
                            title="Incoming Medical Reports"
                            value={dashboardData?.stats?.incomingReports || 0}
                            onClick={() => navigate('/professional/incoming-reports')}
                        />
                        <QuickAccessCard 
                            icon={ClipboardList}
                            title="Report Requests"
                            value={dashboardData?.stats?.reportRequests || 0}
                            onClick={() => navigate('/professional/report-requests')}
                        />
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <button 
                            onClick={() => navigate('/professional/search-patient')}
                            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center justify-center space-x-2"
                        >
                            <Search className="h-5 w-5 text-indigo-600" />
                            <span>Search Patient</span>
                        </button>
                        <button 
                            onClick={() => navigate('/professional/new-appointment')}
                            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center justify-center space-x-2"
                        >
                            <Calendar className="h-5 w-5 text-indigo-600" />
                            <span>New Appointment</span>
                        </button>
                        <button 
                            onClick={() => navigate('/professional/create-record')}
                            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center justify-center space-x-2"
                        >
                            <ClipboardList className="h-5 w-5 text-indigo-600" />
                            <span>Create Record</span>
                        </button>
                    </div>

                    {/* Recent Activity Table */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
                        <ActivityTable activities={dashboardData?.recentActivities || []} />
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                            {error}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default HealthcareProfessionalDashboard;