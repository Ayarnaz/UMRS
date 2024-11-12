import React, { useState, useEffect } from 'react';
import { X, Save, UserCircle } from 'lucide-react';
import { useNotification } from '../../../context/NotificationContext';
import { updatePatientProfile } from '../../../services/patientService';

export default function PatientProfileModal({ isOpen, onClose, patientData, onUpdate }) {
    const { showNotification } = useNotification();
    const [formData, setFormData] = useState({
        name: '',
        personalHealthNo: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        email: '',
        contactNo: '',
        height: '',
        weight: '',
        bloodType: '',
        medicalConditions: '',
        emergencyContact: '',
        emergencyPhone: '',
        preferredAlert: ''
    });

    useEffect(() => {
        if (patientData) {
            setFormData({
                name: patientData.name || '',
                personalHealthNo: patientData.personalHealthNo || '',
                dateOfBirth: patientData.dateOfBirth || '',
                gender: patientData.gender || '',
                address: patientData.address || '',
                email: patientData.email || '',
                contactNo: patientData.phoneNumber || '',
                height: patientData.height?.toString() || '',
                weight: patientData.weight?.toString() || '',
                bloodType: patientData.bloodType || '',
                medicalConditions: patientData.medicalConditions || '',
                emergencyContact: patientData.emergencyContactName || '',
                emergencyPhone: patientData.emergencyContactPhone || '',
                preferredAlert: patientData.preferredAlert || ''
            });
        }
    }, [patientData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value === '' ? '' : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // Validate required fields
            const requiredFields = ['email', 'contactNo'];
            const missingFields = requiredFields.filter(field => !formData[field]);
            
            if (missingFields.length > 0) {
                showNotification('error', `Please fill in required fields: ${missingFields.join(', ')}`);
                return;
            }

            // Convert height and weight to numbers or null
            const profileData = {
                ...formData,
                height: formData.height ? parseFloat(formData.height) : null,
                weight: formData.weight ? parseFloat(formData.weight) : null
            };

            const response = await updatePatientProfile(formData.personalHealthNo, profileData);
            
            if (response.status === 'success') {
                showNotification('success', 'Profile updated successfully');
                onUpdate && onUpdate(profileData);
                onClose();
            } else {
                showNotification('error', response.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            showNotification('error', 'Failed to update profile: ' + (error.response?.data?.message || error.message || 'Unknown error'));
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-[800px] w-full mx-4 my-8">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-900">Patient Profile</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid gap-4 py-4">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                                {patientData?.profilePhoto ? (
                                    <img 
                                        src={patientData.profilePhoto} 
                                        alt="Profile" 
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <UserCircle className="h-12 w-12 text-gray-500" />
                                )}
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">{formData.name}</h2>
                                <p className="text-sm text-gray-500">
                                    {formData.dateOfBirth && new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear()} | {formData.gender}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium text-gray-700">Personal Health Number</label>
                                <input
                                    type="text"
                                    value={formData.personalHealthNo}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    disabled
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    disabled
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-gray-700">Address</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter address"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter email"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium text-gray-700">Contact No.</label>
                                <input
                                    type="tel"
                                    name="contactNo"
                                    value={formData.contactNo}
                                    onChange={handleChange}
                                    placeholder="Enter contact number"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium text-gray-700">Emergency Contact Name</label>
                                <input
                                    type="text"
                                    name="emergencyContact"
                                    value={formData.emergencyContact}
                                    onChange={handleChange}
                                    placeholder="Enter emergency contact name"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium text-gray-700">Emergency Contact Phone</label>
                                <input
                                    type="tel"
                                    name="emergencyPhone"
                                    value={formData.emergencyPhone}
                                    onChange={handleChange}
                                    placeholder="Enter emergency contact number"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-gray-700">Preferences</label>
                            <select
                                name="preferredAlert"
                                value={formData.preferredAlert}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">Preferred Verification / Alert Method</option>
                                <option value="email">Email</option>
                                <option value="sms">SMS</option>
                                <option value="email-sms">Email + SMS</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <h3 className="text-lg font-semibold mb-2">Medical Specifications</h3>
                            <div className="grid grid-cols-4 gap-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium text-gray-700">Height (cm)</label>
                                    <input
                                        type="number"
                                        name="height"
                                        value={formData.height}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium text-gray-700">Weight (kg)</label>
                                    <input
                                        type="number"
                                        name="weight"
                                        value={formData.weight}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium text-gray-700">BMI</label>
                                    <input
                                        type="text"
                                        value={formData.height && formData.weight 
                                            ? (formData.weight / Math.pow(formData.height/100, 2)).toFixed(1) 
                                            : ''}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        disabled
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium text-gray-700">Blood Type</label>
                                    <select
                                        name="bloodType"
                                        value={formData.bloodType}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="">Select</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-gray-700">Medical Conditions</label>
                            <textarea
                                name="medicalConditions"
                                value={formData.medicalConditions}
                                onChange={handleChange}
                                rows="3"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="List any medical conditions..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 flex items-center"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}