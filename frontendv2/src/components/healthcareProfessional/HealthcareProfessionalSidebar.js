import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Calendar, 
    FileText, 
    Share2,
    Settings, 
    LogOut 
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
        <div className="w-64 bg-white h-screen border-r flex flex-col">
            <div className="p-4 border-b">
                <h2 className="text-xl font-bold text-gray-800">UMRS</h2>
                <p className="text-sm text-gray-600">Healthcare Professional Portal</p>
            </div>

            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        
                        return (
                            <li key={index}>
                                <button
                                    onClick={() => navigate(item.path)}
                                    className={`w-full flex items-center space-x-2 p-2 rounded-lg transition-colors
                                        ${isActive 
                                            ? 'bg-indigo-50 text-indigo-600' 
                                            : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span>{item.label}</span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="p-4 border-t">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 p-2 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
}

export default HealthcareProfessionalSidebar; 