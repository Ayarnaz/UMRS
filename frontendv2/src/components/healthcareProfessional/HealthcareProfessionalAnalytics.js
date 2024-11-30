import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import HealthcareProfessionalSidebar from './HealthcareProfessionalSidebar';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { FiUsers, FiCalendar, FiActivity, FiUserCheck } from 'react-icons/fi';

// Register ChartJS components
ChartJS.register(
    ArcElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

// Stat card component for summary statistics
const StatCard = ({ title, value, icon: Icon, description }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                <Icon className="w-6 h-6" />
            </div>
            <div className="ml-4">
                <h3 className="text-gray-500 text-sm">{title}</h3>
                <p className="text-2xl font-semibold text-gray-900">{value}</p>
                {description && (
                    <p className="text-sm text-gray-600">{description}</p>
                )}
            </div>
        </div>
    </div>
);

function HealthcareProfessionalAnalytics() {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('12m');
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!user?.userIdentifier) return;
            
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`/api/professional/analytics?slmcNo=${user.userIdentifier}&range=${timeRange}`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch analytics data');
                }
                
                const data = await response.json();
                setAnalytics(data);
            } catch (err) {
                console.error('Failed to fetch analytics:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [user?.userIdentifier, timeRange]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-red-500">Error: {error}</div>
            </div>
        );
    }

    // Only render charts if we have data
    const hasData = analytics && Object.keys(analytics).length > 0;

    return (
        <div className="flex h-screen bg-gray-100">
            <HealthcareProfessionalSidebar />
            
            <div className="flex-1 overflow-auto">
                <header className="bg-white shadow-sm py-4 px-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
                        <select 
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="border rounded-md px-3 py-1"
                        >
                            <option value="3m">Last 3 months</option>
                            <option value="6m">Last 6 months</option>
                            <option value="12m">Last 12 months</option>
                        </select>
                    </div>
                </header>

                <main className="p-6">
                    {hasData ? (
                        <>
                            {/* Summary Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                                <StatCard
                                    title="Total Patients"
                                    value={analytics.summaryStats?.totalPatients || 0}
                                    icon={FiUsers}
                                />
                                <StatCard
                                    title="Total Visits"
                                    value={analytics.summaryStats?.totalVisits || 0}
                                    icon={FiCalendar}
                                />
                                <StatCard
                                    title="Active Patients"
                                    value={analytics.summaryStats?.activePatients || 0}
                                    icon={FiUserCheck}
                                    description="In the last 30 days"
                                />
                                <StatCard
                                    title="Today's Visits"
                                    value={analytics.summaryStats?.todayVisits || 0}
                                    icon={FiActivity}
                                />
                            </div>

                            {/* Charts Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Monthly Trends */}
                                {analytics.monthlyTrends?.length > 0 && (
                                    <div className="bg-white rounded-lg shadow-md p-6 col-span-2">
                                        <h2 className="text-lg font-semibold mb-4">Monthly Trends</h2>
                                        <Line 
                                            data={{
                                                labels: analytics.monthlyTrends.map(m => m.month),
                                                datasets: [
                                                    {
                                                        label: 'Total Visits',
                                                        data: analytics.monthlyTrends.map(m => m.visitCount),
                                                        borderColor: '#4F46E5',
                                                        tension: 0.1
                                                    },
                                                    {
                                                        label: 'Unique Patients',
                                                        data: analytics.monthlyTrends.map(m => m.uniquePatients),
                                                        borderColor: '#EC4899',
                                                        tension: 0.1
                                                    }
                                                ]
                                            }}
                                            options={{
                                                responsive: true,
                                                plugins: {
                                                    legend: {
                                                        position: 'bottom'
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                )}

                                {/* Gender Distribution */}
                                {analytics.genderDistribution?.length > 0 && (
                                    <div className="bg-white rounded-lg shadow-md p-6">
                                        <h2 className="text-lg font-semibold mb-4">Patient Gender Distribution</h2>
                                        <Pie 
                                            data={{
                                                labels: analytics.genderDistribution.map(g => g.gender),
                                                datasets: [{
                                                    data: analytics.genderDistribution.map(g => g.count),
                                                    backgroundColor: ['#F472B6', '#60A5FA', '#A78BFA']
                                                }]
                                            }}
                                            options={{
                                                plugins: {
                                                    legend: {
                                                        position: 'bottom'
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                )}

                                {/* Visit Time Distribution */}
                                {analytics.visitTimes?.length > 0 && (
                                    <div className="bg-white rounded-lg shadow-md p-6">
                                        <h2 className="text-lg font-semibold mb-4">Visit Time Distribution</h2>
                                        <Bar 
                                            data={{
                                                labels: analytics.visitTimes.map(t => t.timeSlot),
                                                datasets: [{
                                                    label: 'Visits',
                                                    data: analytics.visitTimes.map(t => t.count),
                                                    backgroundColor: '#818CF8'
                                                }]
                                            }}
                                            options={{
                                                plugins: {
                                                    legend: { display: false }
                                                },
                                                scales: {
                                                    y: {
                                                        beginAtZero: true,
                                                        title: {
                                                            display: true,
                                                            text: 'Number of Visits'
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No analytics data available</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default HealthcareProfessionalAnalytics; 