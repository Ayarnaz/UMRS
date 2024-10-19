import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Home, LogOut, Share2, Users, FileText } from "lucide-react";

const NavButton = ({ icon: Icon, label, onClick }) => (
  <button 
    className="p-2 rounded-md hover:bg-gray-200 relative group"
    onClick={onClick}
    title={label}
  >
    <Icon className="h-5 w-5 text-gray-400" />
  </button>
);

export default function HealthcareInstituteSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Add logout logic here
    navigate('/');
  };

  return (
    <aside className="w-16 bg-white shadow-md flex flex-col items-center py-4">
      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-8">Logo</div>
      <nav className="flex flex-col items-center space-y-6 flex-grow">
        <NavButton 
          icon={Home} 
          label="Dashboard" 
          onClick={() => navigate('/healthcare-institute-dashboard')} 
        />
        <NavButton 
          icon={FileText} 
          label="Records" 
          onClick={() => navigate('/healthcare-institute-records')} 
        />
        <NavButton 
          icon={Calendar} 
          label="Appointments" 
          onClick={() => navigate('/healthcare-institute-appointments')} 
        />
        <NavButton 
          icon={Users} 
          label="Healthcare Professionals" 
          onClick={() => navigate('/healthcare-institute-professionals')} 
        />
        <NavButton 
          icon={Share2} 
          label="Share" 
          onClick={() => navigate('/healthcare-institute-share')} 
        />
      </nav>
      <div className="mt-auto">
        <NavButton icon={LogOut} label="Logout" onClick={handleLogout} />
      </div>
    </aside>
  );
}
