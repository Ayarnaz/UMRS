import * as React from 'react';
import { Check } from 'lucide-react';
import Modal from '../common/Modal';
import { useRegistration } from '../../hooks/useRegistration';
import { patientValidationRules } from '../../utils/validationRules';
import { useNotification } from '../../context/NotificationContext';

const initialValues = {
    fullName: '',
    address: '',
    nic: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    contactNo: '',
    password: '',
    twoFAPreference: 'email-sms'
};

export default function PatientRegistrationModal({ isOpen, onClose }) {
    const {
        values,
        errors,
        isLoading,
        handleChange,
        handleSubmit,
    } = useRegistration(initialValues, patientValidationRules, 'patient');

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

    const renderField = (name, label, type = 'text') => {
        const hasError = errors[name];
        return (
            <div className="space-y-2">
                <label className="text-sm text-gray-600">{label}</label>
                <div className="flex items-center gap-2">
                    <input
                        type={type}
                        name={name}
                        value={values[name]}
                        onChange={handleChange}
                        className={`flex-1 p-2 border rounded focus:ring-2 focus:ring-indigo-500 
                            ${hasError ? 'border-red-500' : 'border-gray-300'}`}
                    />
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
            title="REGISTER AS A PATIENT"
            size="sm"
        >
            <form onSubmit={onSubmit}>
                <div className="modal-form-container">
                    <div className="modal-form-content">
                        {renderField('fullName', 'Full Name')}
                        {renderField('address', 'Address')}
                        {renderField('nic', 'NIC')}

                        {/* Date of Birth */}
                        <div className="space-y-2">
                            <label className="text-sm text-gray-600">Date of Birth</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={values.dateOfBirth}
                                    onChange={handleChange}
                                    max={new Date().toISOString().split('T')[0]}
                                    className="flex-1 p-2 border rounded focus:ring-2 focus:ring-indigo-500"
                                />
                                {values.dateOfBirth && (
                                    <div className="rounded bg-green-500 p-1">
                                        <Check className="h-4 w-4 text-white" />
                                    </div>
                                )}
                            </div>
                            {errors.dateOfBirth && (
                                <p className="text-xs text-red-500">{errors.dateOfBirth}</p>
                            )}
                        </div>

                        {/* Gender */}
                        <div className="space-y-2">
                            <label className="text-sm text-gray-600">Gender</label>
                            <select
                                name="gender"
                                value={values.gender}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            >
                                <option value="">Select</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {renderField('email', 'Email', 'email')}
                        {renderField('contactNo', 'Contact No.', 'tel')}
                        {renderField('password', 'Password', 'password')}

                        {/* 2FA Preference */}
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

                        {/* Info box */}
                        <div className="rounded bg-blue-50 p-4 text-sm text-blue-600">
                            Heads up! The verification message containing your unique Personal Health Number 
                            will be sent to your preferred Verification / Alert Method
                        </div>
                    </div>
                </div>
                
                {/* Buttons section */}
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