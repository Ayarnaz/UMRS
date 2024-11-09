import React, { useState, useEffect } from 'react';
import { Search, Bell, FileText, Calendar, Users, Building2, ClipboardList, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import HealthcareInstituteSidebar from './HealthcareInstituteSidebar';
import { useNotification } from '../../context/NotificationContext';
import { getInstituteDashboard } from '../../services/instituteService';

function HealthcareInstituteDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showNotification } = useNotification();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        let mounted = true;
        let timeoutId;

        const fetchDashboardData = async () => {
            if (!user?.userIdentifier || retryCount >= 3) return;

            try {
                setLoading(true);
                setError(null);
                const data = await getInstituteDashboard(user.userIdentifier);
                if (mounted) {
                    setDashboardData(data);
                    setRetryCount(0); // Reset retry count on success
                }
            } catch (err) {
                console.error('Dashboard error:', err);
                if (mounted) {
                    setError('Failed to load dashboard data');
                    setRetryCount(prev => prev + 1);
                    if (retryCount === 0) { // Only show notification on first error
                        showNotification('error', 'Failed to load dashboard data');
                    }
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchDashboardData();

        return () => {
            mounted = false;
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [user?.userIdentifier, retryCount, showNotification]);

    const QuickAccessCard = ({ icon: Icon, title, value, onClick }) => (
        <div onClick={onClick} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg">
                    <Icon className="h-6 w-6 text-indigo-600" />
                </div>
                <span className="text-2xl font-bold text-gray-800">{value}</span>
            </div>
            <h3 className="text-gray-600 font-medium">{title}</h3>
        </div>
    );

    if (loading) {
        return (
            <div className="flex h-screen">
                <HealthcareInstituteSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!dashboardData) {
        return <div>No data available</div>;
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <HealthcareInstituteSidebar />
            
            <div className="flex-1 overflow-auto">
                <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">Institute Dashboard</h1>
                    <div className="flex items-center space-x-4">
                        <Bell className="h-6 w-6 text-gray-600 cursor-pointer" />
                        <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 font-medium">
                                {dashboardData?.institute?.name?.[0] || 'I'}
                            </span>
                        </div>
                    </div>
                </header>

                <main className="p-6">
                    {/* Welcome Section */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-2">
                            Welcome, {dashboardData?.institute?.name || 'Healthcare Institute'}
                        </h2>
                        <p className="text-gray-600">
                            Institute ID: {dashboardData?.institute?.instituteNumber} | 
                            Type: {dashboardData?.institute?.type}
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <QuickAccessCard 
                            icon={Users}
                            title="Active Professionals"
                            value={dashboardData?.stats?.activeProfessionals || 0}
                            onClick={() => navigate('/institute/professionals')}
                        />
                        <QuickAccessCard 
                            icon={Calendar}
                            title="Today's Appointments"
                            value={dashboardData?.stats?.todayAppointments || 0}
                            onClick={() => navigate('/institute/appointments')}
                        />
                        <QuickAccessCard 
                            icon={FileText}
                            title="Pending Reports"
                            value={dashboardData?.stats?.pendingReports || 0}
                            onClick={() => navigate('/institute/reports')}
                        />
                        <QuickAccessCard 
                            icon={Activity}
                            title="Active Patients"
                            value={dashboardData?.stats?.activePatients || 0}
                            onClick={() => navigate('/institute/patients')}
                        />
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <button 
                            onClick={() => navigate('/institute/search')}
                            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center justify-center space-x-2"
                        >
                            <Search className="h-5 w-5 text-indigo-600" />
                            <span>Search Records</span>
                        </button>
                        <button 
                            onClick={() => navigate('/institute/manage-staff')}
                            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center justify-center space-x-2"
                        >
                            <Users className="h-5 w-5 text-indigo-600" />
                            <span>Manage Staff</span>
                        </button>
                        <button 
                            onClick={() => navigate('/institute/reports')}
                            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center justify-center space-x-2"
                        >
                            <ClipboardList className="h-5 w-5 text-indigo-600" />
                            <span>Generate Reports</span>
                        </button>
                    </div>

                    {/* Recent Activities */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activity</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {dashboardData?.recentActivities?.map((activity, index) => (
                                        <tr key={`activity-${activity.timestamp}-${index}`}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(activity.timestamp).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {activity.description}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {activity.user}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {activity.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default HealthcareInstituteDashboard; 