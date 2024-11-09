import React, { useState, useEffect } from 'react';
import { Bell, Search, User, Plus } from "lucide-react";
import HealthcareInstituteSidebar from './HealthcareInstituteSidebar';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { getInstituteProfessionals, addProfessional, updateProfessionalStatus, getProfessionalBySlmc } from '../../services/instituteService';
import AddProfessionalModal from './AddProfessionalModal';

const specialityColors = {
    "General Practice": "bg-green-100 text-green-800",
    "Neurology": "bg-gray-100 text-gray-800",
    "Pediatrics": "bg-purple-100 text-purple-800",
    "Oncology": "bg-blue-100 text-blue-800",
    "Trauma": "bg-red-100 text-red-800",
};

const roleColors = {
    "Doctor": "bg-green-100 text-green-800",
    "Residency": "bg-blue-100 text-blue-800",
    "Nurse": "bg-purple-100 text-purple-800",
};

export default function InstituteProfessionals() {
    const { user } = useAuth();
    const { showNotification } = useNotification();
    const [professionals, setProfessionals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchParams, setSearchParams] = useState({
        slmcNo: '',
        name: '',
        specialty: '',
        role: ''
    });

    useEffect(() => {
        fetchProfessionals();
    }, [user?.userIdentifier]);

    const fetchProfessionals = async () => {
        try {
            setLoading(true);
            const data = await getInstituteProfessionals(user?.userIdentifier);
            setProfessionals(data || []);
        } catch (error) {
            console.error('Error fetching professionals:', error);
            showNotification('error', 'Failed to load healthcare professionals');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // Implement search functionality
        console.log('Searching with params:', searchParams);
    };

    const handleAddProfessional = async (professionalData) => {
        try {
            await addProfessional(user?.userIdentifier, professionalData);
            showNotification('success', 'Healthcare professional added successfully');
            setIsModalOpen(false);
            fetchProfessionals(); // Refresh the list
        } catch (error) {
            console.error('Error adding professional:', error);
            showNotification('error', 'Failed to add healthcare professional');
        }
    };

    const handleStatusUpdate = async (slmcNo, status) => {
        try {
            await updateProfessionalStatus(user?.userIdentifier, slmcNo, status);
            showNotification('success', 'Professional status updated successfully');
            fetchProfessionals(); // Refresh the list
        } catch (error) {
            console.error('Error updating professional status:', error);
            showNotification('error', 'Failed to update professional status');
        }
    };

    const renderActions = (professional) => (
        <div className="flex space-x-2">
            <button 
                className="text-indigo-600 hover:text-indigo-900"
                onClick={() => {/* Implement view action */}}
            >
                View
            </button>
            <button 
                className="text-green-600 hover:text-green-900"
                onClick={() => {/* Implement edit action */}}
            >
                Edit
            </button>
            <button 
                className="text-red-600 hover:text-red-900"
                onClick={() => handleStatusUpdate(
                    professional.slmcNo, 
                    professional.status === 'active' ? 'inactive' : 'active'
                )}
            >
                {professional.status === 'active' ? 'Deactivate' : 'Activate'}
            </button>
        </div>
    );

    const filteredProfessionals = professionals.filter(professional => {
        const searchLower = {
            slmcNo: searchParams.slmcNo.toLowerCase(),
            name: searchParams.name.toLowerCase(),
            specialty: searchParams.specialty.toLowerCase(),
            role: searchParams.role.toLowerCase()
        };

        return (
            (searchLower.slmcNo === '' || professional.slmcNo.toLowerCase().includes(searchLower.slmcNo)) &&
            (searchLower.name === '' || professional.name.toLowerCase().includes(searchLower.name)) &&
            (searchLower.specialty === '' || professional.specialty.toLowerCase().includes(searchLower.specialty)) &&
            (searchLower.role === '' || professional.role.toLowerCase().includes(searchLower.role))
        );
    });

    const handleSlmcChange = async (value) => {
        setSearchParams(prev => ({ ...prev, slmcNo: value }));
        
        if (value.length >= 4) {
            try {
                const professionalData = await getProfessionalBySlmc(value);
                if (professionalData) {
                    setSearchParams(prev => ({
                        ...prev,
                        name: professionalData.name || '',
                        specialty: professionalData.specialty || '',
                        role: professionalData.role || ''
                    }));
                }
            } catch (error) {
                console.error('Error fetching professional details:', error);
                setSearchParams(prev => ({
                    ...prev,
                    name: '',
                    specialty: '',
                    role: ''
                }));
            }
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-100">
                <HealthcareInstituteSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <HealthcareInstituteSidebar />
            <main className="flex-1 p-8 overflow-auto">
                {/* Header */}
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Healthcare Professionals</h1>
                    <div className="flex items-center space-x-4">
                        <Bell className="h-6 w-6 text-gray-600 cursor-pointer" />
                        <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 font-medium">
                                {user?.name?.[0] || 'U'}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Search and Stats Section */}
                <div className="flex gap-8 mb-8">
                    {/* Search Form */}
                    <div className="bg-white p-6 rounded-lg shadow-md flex-grow">
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label htmlFor="slmcNo" className="block text-sm font-medium text-gray-700 mb-1">
                                        SLMC No
                                    </label>
                                    <input
                                        id="slmcNo"
                                        type="text"
                                        value={searchParams.slmcNo}
                                        onChange={(e) => handleSlmcChange(e.target.value)}
                                        className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Enter SLMC No"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Name
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={searchParams.name}
                                        readOnly
                                        className="w-full p-2 border rounded-md bg-gray-50"
                                        placeholder="Professional name will appear here"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">
                                        Specialty
                                    </label>
                                    <input
                                        id="specialty"
                                        type="text"
                                        value={searchParams.specialty}
                                        readOnly
                                        className="w-full p-2 border rounded-md bg-gray-50"
                                        placeholder="Specialty will appear here"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                        Role
                                    </label>
                                    <input
                                        id="role"
                                        type="text"
                                        value={searchParams.role}
                                        readOnly
                                        className="w-full p-2 border rounded-md bg-gray-50"
                                        placeholder="Role will appear here"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <button
                                    type="submit"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
                                >
                                    Search
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(true)}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
                                >
                                    <Plus className="h-5 w-5 mr-2" />
                                    Add Professional
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-white rounded-lg shadow-md w-64">
                        <div className="bg-indigo-600 text-white p-4 rounded-t-lg">
                            <h2 className="text-lg font-semibold">Active Professionals</h2>
                        </div>
                        <div className="p-4">
                            <p className="text-4xl font-bold text-center text-gray-800">
                                {professionals.length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Professionals Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Specialty
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredProfessionals.map((professional, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <User className="h-5 w-5 text-gray-400 mr-3" />
                                            <div className="text-sm font-medium text-gray-900">
                                                {professional.name}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            professional.specialty.toLowerCase() === 'general practice' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {professional.specialty}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            roleColors[professional.role] || "bg-gray-100 text-gray-800"
                                        }`}>
                                            {professional.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            professional.status === 'active' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {professional.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {renderActions(professional)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            <AddProfessionalModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddProfessional}
            />
        </div>
    );
} 