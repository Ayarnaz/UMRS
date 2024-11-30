import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Calendar, 
    FileText, 
    Share2,
    Settings, 
    LogOut,
    BarChart2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function HealthcareProfessionalSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

    const menuItems = [
        {
            icon: LayoutDashboard,
            label: 'Dashboard',
            path: '/professional/dashboard'
        },
        {
            icon: FileText,
            label: 'Medical Records',
            path: '/professional/records'
        },
        {
            icon: Share2,
            label: 'Share Records',
            path: '/professional/share-records'
        },
        {
            icon: Calendar,
            label: 'Appointments',
            path: '/professional/appointments'
        },
        {
            icon: BarChart2,
            label: 'Analytics',
            path: '/professional/analytics'
        },
        {
            icon: Settings,
            label: 'Settings',
            path: '/professional/settings'
        }
    ];

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="w-64 bg-white h-screen flex flex-col border-r border-gray-200">
            {/* Logo/Header */}
            <div className="p-6 border-b border-gray-200">
                <h1 className="text-xl font-bold text-gray-800">UMRS</h1>
                <p className="text-sm text-gray-600">Healthcare Professional Portal</p>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <li key={item.path}>
                                <button
                                    onClick={() => navigate(item.path)}
                                    className={`w-full flex items-center space-x-3 px-6 py-3 text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors ${
                                        isActive ? 'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600' : ''
                                    }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Bottom Actions */}
            <div className="border-t border-gray-200 p-4">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors rounded-md"
                >
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
}

export default HealthcareProfessionalSidebar; 