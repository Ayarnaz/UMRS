import React from 'react';
import { Check } from 'lucide-react';
import Modal from '../common/Modal';
import { useRegistration } from '../../hooks/useRegistration';
import { professionalValidationRules } from '../../utils/validationRules';
import { useNotification } from '../../context/NotificationContext';

const initialValues = {
    fullName: '',
    address: '',
    nic: '',
    slmcNumber: '',
    specialty: '',
    role: '',
    email: '',
    contactNo: '',
    password: '',
    twoFAPreference: 'email-sms',
    healthInstituteNumber: ''
};

const specialties = [
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'dermatology', label: 'Dermatology' },
    { value: 'neurology', label: 'Neurology' },
    { value: 'pediatrics', label: 'Pediatrics' },
    { value: 'psychiatry', label: 'Psychiatry' }
];

const roles = [
    { value: 'doctor', label: 'Doctor' },
    { value: 'nurse', label: 'Nurse' },
    { value: 'specialist', label: 'Specialist' },
    { value: 'surgeon', label: 'Surgeon' }
];

const healthcareInstitutes = [
    { value: 'HI001', label: 'General Hospital Colombo' },
    { value: 'HI002', label: 'National Hospital of Sri Lanka' },
    { value: 'HI003', label: 'Lady Ridgeway Hospital' },
    { value: 'HI004', label: 'Colombo South Teaching Hospital' }
];

export default function HealthcareProfessionalRegistrationModal({ isOpen, onClose }) {
    const {
        values,
        errors,
        isLoading,
        handleChange,
        handleSubmit,
    } = useRegistration(initialValues, professionalValidationRules, 'professional');

    const { showNotification } = useNotification();

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await handleSubmit(e);
            const data = await response.json();

            if (data.status === 'success') {
                showNotification(data.message, 'success');
                onClose();
            } else {
                showNotification(data.message || 'Registration failed', 'error');
            }
        } catch (error) {
            showNotification(error.message || 'An unexpected error occurred', 'error');
        }
    };

    const renderField = (name, label, type = 'text', options = null) => {
        const hasError = errors[name];
        
        return (
            <div className="space-y-2">
                <label className="text-sm text-gray-600">{label}</label>
                <div className="flex items-center gap-2">
                    {options ? (
                        <select
                            name={name}
                            value={values[name]}
                            onChange={handleChange}
                            className={`flex-1 p-2 border rounded focus:ring-2 focus:ring-indigo-500 
                                ${hasError ? 'border-red-500' : 'border-gray-300'}`}
                        >
                            <option value="">Select {label}</option>
                            {options.map(opt => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input
                            type={type}
                            name={name}
                            value={values[name]}
                            onChange={handleChange}
                            className={`flex-1 p-2 border rounded focus:ring-2 focus:ring-indigo-500 
                                ${hasError ? 'border-red-500' : 'border-gray-300'}`}
                        />
                    )}
                    {values[name] && !hasError && (
                        <div className="rounded bg-green-500 p-1">
                            <Check className="h-4 w-4 text-white" />
                        </div>
                    )}
                </div>
                {hasError && <p className="text-xs text-red-500">{errors[name]}</p>}
            </div>
        );
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="REGISTER AS A HEALTHCARE PROFESSIONAL"
            size="sm"
        >
            <form onSubmit={onSubmit}>
                <div className="modal-form-container">
                    <div className="modal-form-content">
                        {renderField('fullName', 'Full Name')}
                        {renderField('address', 'Address')}
                        {renderField('nic', 'NIC')}
                        {renderField('slmcNumber', 'SLMC Number')}

                        <div className="grid grid-cols-1 gap-3">
                            <div className="space-y-2">
                                {renderField('specialty', 'Specialty', 'select', specialties)}
                            </div>
                            <div className="space-y-2">
                                {renderField('role', 'Role', 'select', roles)}
                            </div>
                        </div>

                        <div className="space-y-2">
                            {renderField('healthInstituteNumber', 'Healthcare Institute', 'select', healthcareInstitutes)}
                        </div>

                        {renderField('email', 'Email', 'email')}
                        {renderField('contactNo', 'Contact No.', 'tel')}
                        {renderField('password', 'Password', 'password')}

                        <div className="space-y-2">
                            <label className="text-sm text-gray-600">
                                Preferred Verification / Alert Method
                            </label>
                            <select
                                name="twoFAPreference"
                                value={values.twoFAPreference}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            >
                                <option value="email-sms">Email + SMS</option>
                                <option value="email">Email Only</option>
                                <option value="sms">SMS Only</option>
                            </select>
                        </div>

                        <div className="rounded bg-blue-50 p-4 text-sm text-blue-600">
                            Your registration will be verified against the SLMC database before activation.
                        </div>
                    </div>
                </div>
                
                <div className="modal-form-buttons">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 
                            focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                    >
                        {isLoading ? 'Registering...' : 'Register'}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 
                            focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </Modal>
    );
} 