import React, { useState, useEffect } from 'react';
import { Search, Bell, User, FileText, Calendar, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getPatientDashboard } from '../../services/patientService';
import PatientSidebar from './PatientSidebar';
import { useNavigate } from 'react-router-dom';

function PatientDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log('Dashboard mounted');
        console.log('Current user:', user);
    }, [user]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user?.userIdentifier) {
                console.log('No user identifier found');
                setLoading(false);
                return;
            }

            try {
                console.log('Fetching dashboard data for:', user.userIdentifier);
                const data = await getPatientDashboard(user.userIdentifier);
                console.log('Dashboard data received:', data);
                setDashboardData(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

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

    const QuickAccessCard = ({ icon: Icon, title, description, onClick }) => (
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mb-4">
                <Icon className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-gray-600 mb-4">{description}</p>
            <button 
                onClick={onClick}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
            >
                Access
            </button>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-100">
            <PatientSidebar />
            
            <div className="flex-1 overflow-auto">
                <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                    <div className="flex items-center space-x-4">
                        <Bell className="h-6 w-6 text-gray-600 cursor-pointer" />
                        <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 font-medium">
                                {dashboardData?.patient?.name?.[0] || 'U'}
                            </span>
                        </div>
                    </div>
                </header>

                <main className="p-6">
                    {/* Welcome Section */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-2">
                            Welcome back, {dashboardData?.patient?.name || 'Patient'}!
                        </h2>
                        <p className="text-gray-600">
                            PHN: {dashboardData?.patient?.personalHealthNo || 'Not available'}
                        </p>
                    </div>

                    {/* Quick Access Grid */}
                    <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        <QuickAccessCard 
                            icon={FileText}
                            title="Medical Records"
                            description="View your complete medical history"
                            onClick={() => navigate('/patient/medical-records')}
                        />
                        <QuickAccessCard 
                            icon={Upload}
                            title="Upload Documents"
                            description="Upload new medical documents"
                            onClick={() => navigate('/patient/upload-documents')}
                        />
                        <QuickAccessCard 
                            icon={Calendar}
                            title="Appointments"
                            description="Schedule or view appointments"
                            onClick={() => navigate('/patient/appointments')}
                        />
                    </div>

                    {/* Recent Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold mb-4">Recent Medical Records</h2>
                            {dashboardData?.recentRecords?.length > 0 ? (
                                <div className="space-y-4">
                                    {dashboardData.recentRecords.map((record, index) => (
                                        <div key={index} className="border-b pb-4">
                                            <p className="font-medium">{record.type}</p>
                                            <p className="text-sm text-gray-600">{record.date}</p>
                                            <p className="text-sm text-gray-600">{record.description}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600">No recent medical records</p>
                            )}
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
                            <p className="text-gray-600">No upcoming appointments</p>
                        </div>
                    </div>

                    {/* Recent Activity Table */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Activity Type
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Description
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {dashboardData?.activities?.length > 0 ? (
                                        dashboardData.activities.map((activity, index) => (
                                            <tr key={index}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(activity.date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        activity.type === 'upload' ? 'bg-green-100 text-green-800' :
                                                        activity.type === 'appointment' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {activity.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {activity.description}
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
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                                                No recent activities
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default PatientDashboard;