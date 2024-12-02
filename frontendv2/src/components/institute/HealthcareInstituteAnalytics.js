import React, { useState, useEffect } from 'react';
import { FiUsers, FiCalendar, FiActivity, FiUserCheck, FiTrendingUp } from 'react-icons/fi';
import HealthcareInstituteSidebar from './HealthcareInstituteSidebar';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const StatCard = ({ title, value, icon: Icon, description, trend }) => (
    <div className="bg-white rounded-lg shadow-md p-6 transform transition-all duration-300 hover:scale-105">
        <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                <Icon className="w-6 h-6" />
            </div>
            <div className="ml-4">
                <h3 className="text-gray-500 text-sm">{title}</h3>
                <p className="text-2xl font-semibold text-gray-900">
                    {typeof value === 'number' ? value.toLocaleString() : value || '0'}
                </p>
                {trend !== undefined && (
                    <div className="flex items-center mt-1">
                        <FiTrendingUp className={`w-4 h-4 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                        <span className={`text-sm ml-1 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {Math.abs(trend)}% {trend >= 0 ? 'increase' : 'decrease'}
                        </span>
                    </div>
                )}
                {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
            </div>
        </div>
    </div>
);

function HealthcareInstituteAnalytics() {
    const { user } = useAuth();
    const [data, setData] = useState({
        totalPatients: 0,
        totalProfessionals: 0,
        totalAppointments: 0,
        patientSatisfaction: 0,
        patientsTrend: 0,
        professionalsTrend: 0,
        appointmentsTrend: 0,
        satisfactionTrend: 0,
        departmentStats: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState(7);

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!user?.userIdentifier) return;
            
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`/api/institute/analytics`, {
                    params: {
                        instituteId: user.userIdentifier,
                        days: timeRange
                    }
                });
                setData(prev => ({
                    ...prev,
                    ...response.data,
                    departmentStats: response.data.departmentStats || []
                }));
            } catch (err) {
                console.error('Error fetching analytics:', err);
                setError('Failed to fetch analytics data');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [user?.userIdentifier, timeRange]);

    const renderContent = () => (
        <main className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Institute Analytics</h1>
                <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(Number(e.target.value))}
                    className="bg-white border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value={7}>Last 7 Days</option>
                    <option value={30}>Last 30 Days</option>
                    <option value={90}>Last 90 Days</option>
                    <option value={365}>Last Year</option>
                </select>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard
                    title="Total Patients"
                    value={data.totalPatients}
                    icon={FiUsers}
                    trend={data.patientsTrend}
                />
                <StatCard
                    title="Healthcare Professionals"
                    value={data.totalProfessionals}
                    icon={FiUserCheck}
                    trend={data.professionalsTrend}
                />
                <StatCard
                    title="Total Appointments"
                    value={data.totalAppointments}
                    icon={FiCalendar}
                    trend={data.appointmentsTrend}
                />
                <StatCard
                    title="Patient Satisfaction"
                    value={`${data.patientSatisfaction || 0}%`}
                    icon={FiActivity}
                    trend={data.satisfactionTrend}
                />
            </div>

            {/* Department Stats Table */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Department Analytics</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patients</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Professionals</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appointments</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Satisfaction</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.departmentStats.length > 0 ? (
                                data.departmentStats.map((dept, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">{dept.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{dept.patients.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{dept.professionals.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{dept.appointments.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{dept.satisfaction}%</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                        No department data available for this time period
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );

    return (
        <div className="flex h-screen">
            <HealthcareInstituteSidebar />
            <div className="flex-1 overflow-auto bg-gray-100">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-red-500 bg-white p-4 rounded-lg shadow">
                            {error}
                        </div>
                    </div>
                ) : (
                    renderContent()
                )}
            </div>
        </div>
    );
}

export default HealthcareInstituteAnalytics; 