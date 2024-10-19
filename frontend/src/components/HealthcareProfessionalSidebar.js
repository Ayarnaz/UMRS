import React from 'react';
import { Bell, Calendar, Home, LogOut, Search, Share2 } from "lucide-react";
import { useNavigate, useLocation } from 'react-router-dom';

const NavButton = ({ isActive, onClick, icon: Icon, label }) => (
  <button 
    className={`p-2 rounded-md ${isActive ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
    onClick={onClick}
    title={label}
  >
    <Icon className="h-5 w-5" />
  </button>
);

export default function HealthcareProfessionalSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-16 bg-white shadow-md flex flex-col">
      <div className="flex flex-col items-center py-4 space-y-4 flex-grow">
        <div className="w-10 h-10 bg-gray-200 rounded-sm flex items-center justify-center text-xs font-bold">
          Logo
        </div>
        <NavButton 
          isActive={isActive('/healthcare-professional-dashboard')}
          onClick={() => navigate('/healthcare-professional-dashboard')}
          icon={Home}
          label="Dashboard"
        />
        <NavButton 
          isActive={isActive('/healthcare-professional-records')}
          onClick={() => navigate('/healthcare-professional-records')}
          icon={() => (
            <svg
              className="h-5 w-5"
              fill="none"
              height="24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z" />
              <path d="M12 11h4" />
              <path d="M12 16h4" />
              <path d="M8 11h.01" />
              <path d="M8 16h.01" />
            </svg>
          )}
          label="Records"
        />
        <NavButton 
          isActive={isActive('/healthcare-professional-share-records')}
          onClick={() => navigate('/healthcare-professional-share-records')}
          icon={Share2}
          label="Share Records"
        />
        <NavButton 
          isActive={isActive('/healthcare-professional-appointments')}
          onClick={() => navigate('/healthcare-professional-appointments')}
          icon={Calendar}
          label="Appointments"
        />
      </div>
      <div className="py-4 flex justify-center">
        <NavButton 
          isActive={false}
          onClick={() => {/* Add logout functionality */}}
          icon={LogOut}
          label="Logout"
        />
      </div>
    </aside>
  );
}
