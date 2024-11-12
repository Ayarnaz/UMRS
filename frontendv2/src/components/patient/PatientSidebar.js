import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Calendar, 
  //MessageSquare, 
  Settings, 
  LogOut,
  Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import PatientProfileModal from './modals/PatientProfileModal';

function PatientSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [patientDetails, setPatientDetails] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Debug current location
  useEffect(() => {
    console.log('Current location:', location.pathname);
  }, [location]);

  // Fetch patient details using PHN (which is stored as userIdentifier)
  useEffect(() => {
    const fetchPatientDetails = async () => {
      if (user?.userIdentifier) {
        try {
          console.log('Fetching patient details for PHN:', user.userIdentifier);
          const response = await api.get(`/api/patient/${user.userIdentifier}`);
          console.log('Patient details API response:', response.data);
          setPatientDetails(response.data);
        } catch (error) {
          console.error('Error fetching patient details:', error);
        }
      }
    };

    fetchPatientDetails();
  }, [user]);

  const handleSettingsClick = () => {
    console.log('Settings clicked');
    setIsProfileModalOpen(true);
  };

  const menuItems = [
    { 
      id: 'dashboard',
      name: 'Dashboard', 
      icon: Home, 
      path: '/dashboard'
    },
    { 
      id: 'records',
      name: 'Medical Records', 
      icon: FileText, 
      path: '/medical-records'
    },
    { 
      id: 'appointments',
      name: 'Appointments', 
      icon: Calendar, 
      path: '/patient/appointments'
    },
    { 
      id: 'settings',
      name: 'Settings', 
      icon: Settings, 
      isModal: true,
      onClick: () => setIsProfileModalOpen(true)
    }
  ];

  const handleNavigation = (path) => {
    console.log('Attempting navigation to:', path);
    try {
      navigate(path);
      console.log('Navigation completed');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-64">
      {/* Profile Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-semibold">
              {patientDetails?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">
              {patientDetails?.name || 'Loading...'}
            </h3>
            <p className="text-sm text-gray-500">
              {user?.userType?.charAt(0).toUpperCase() + user?.userType?.slice(1) || 'Loading...'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={(e) => {
              e.preventDefault();
              if (item.isModal) {
                item.onClick();
              } else {
                navigate(item.path);
              }
            }}
            className={`flex items-center w-full px-4 py-2 text-sm rounded-md transition-colors duration-150 ${
              isActivePath(item.path)
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </button>
        ))}
      </nav>

      {/* Notifications */}
      <div className="p-4 border-t border-b border-gray-200">
        <button 
          className="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
          onClick={() => handleNavigation('/notifications')}
        >
          <Bell className="w-5 h-5 mr-3" />
          Notifications
        </button>
      </div>

      {/* Logout */}
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>

      {isProfileModalOpen && (
        <PatientProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          patientData={patientDetails}
          onUpdate={() => {
            setIsProfileModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

export default PatientSidebar;