import React, { useState, useEffect } from 'react';
import { X, User, Pencil } from 'lucide-react';

export default function PatientProfileModal({ isOpen, onClose }) {
  const [patient, setPatient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Fetch patient data when the modal opens
      fetchPatientData();
    }
  }, [isOpen]);

  const fetchPatientData = async () => {
    try {
      const response = await fetch('/api/patient');
      if (response.ok) {
        const data = await response.json();
        setPatient(data);
      } else {
        console.error('Failed to fetch patient data');
      }
    } catch (error) {
      console.error('Error fetching patient data:', error);
    }
  };

  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Patient Profile</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Pencil className="w-4 h-4 mr-2" />
              {isEditing ? 'Save' : 'Edit Profile'}
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-gray-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">{patient.name}</h3>
              <p className="text-gray-500">PHN: {patient.personalHealthNo}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ProfileField label="NIC" value={patient.NIC} isEditing={isEditing} />
            <ProfileField label="Date of Birth" value={patient.dateOfBirth} isEditing={isEditing} />
            <ProfileField label="Gender" value={patient.gender} isEditing={isEditing} />
            <ProfileField label="Contact No." value={patient.phoneNumber} isEditing={isEditing} />
            <ProfileField label="Email" value={patient.email} isEditing={isEditing} />
            <ProfileField label="Address" value={patient.address} isEditing={isEditing} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ProfileField label="Emergency Contact Name" value={patient.emergencyContactName} isEditing={isEditing} />
            <ProfileField label="Emergency Contact No." value={patient.emergencyContactPhone} isEditing={isEditing} />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Medical Specifications</h3>
            <div className="grid grid-cols-4 gap-4">
              <ProfileField label="Height" value={`${patient.height} cm`} isEditing={isEditing} />
              <ProfileField label="Weight" value={`${patient.weight} kg`} isEditing={isEditing} />
              <ProfileField label="BMI" value={patient.BMI} isEditing={isEditing} />
              <ProfileField label="Blood Type" value={patient.bloodType} isEditing={isEditing} />
            </div>
          </div>

          <ProfileField label="Medical Conditions" value={patient.medicalConditions} isEditing={isEditing} />
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, value, isEditing }) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {isEditing ? (
        <input
          type="text"
          defaultValue={value}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
      ) : (
        <p className="text-gray-900">{value}</p>
      )}
    </div>
  );
}
