import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Stethoscope, Building2 } from 'lucide-react';
import PatientRegistrationModal from './PatientRegistrationModal';
import HealthcareProfessionalRegistrationModal from './HealthcareProfessionalRegistrationModal';
import HealthcareInstituteRegistrationModal from './HealthcareInstituteRegistrationModal';
import ShootingStarsBackground from '../backgrounds/ShootingStarsBackground';

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        portalType: 'patient'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showCredentials, setShowCredentials] = useState(false);
    
    // Modal states
    const [showPatientModal, setShowPatientModal] = useState(false);
    const [showProfessionalModal, setShowProfessionalModal] = useState(false);
    const [showInstituteModal, setShowInstituteModal] = useState(false);

    const handlePortalChange = (portal) => {
        let backendPortalType;
        switch(portal) {
            case 'healthcare_professional':
                backendPortalType = 'professional';
                break;
            case 'healthcare_institute':
                backendPortalType = 'institute';
                break;
            default:
                backendPortalType = portal;
        }
        
        setFormData({ ...formData, portalType: backendPortalType });
        setShowCredentials(false);
        setError('');
    };

    const handleRegisterClick = () => {
        console.log('Register clicked for portal type:', formData.portalType);
        switch(formData.portalType) {
            case 'patient':
                setShowPatientModal(true);
                break;
            case 'professional':
                setShowProfessionalModal(true);
                break;
            case 'institute':
                setShowInstituteModal(true);
                break;
            default:
                console.log('Unknown portal type:', formData.portalType);
                break;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!showCredentials) {
            setShowCredentials(true);
            return;
        }

        setError('');
        setLoading(true);
        
        try {
            const success = await login(formData);
            if (success) {
                setLoading(false);
                // Redirect based on portal type
                switch(formData.portalType) {
                    case 'patient':
                        navigate('/dashboard', { replace: true });
                        break;
                    case 'professional':
                        navigate('/professional/dashboard', { replace: true });
                        break;
                    case 'institute':
                        navigate('/institute/dashboard', { replace: true });
                        break;
                    default:
                        navigate('/dashboard', { replace: true });
                }
                return;
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Login failed. Please try again.');
        }
        setLoading(false);
    };

    const getPlaceholder = () => {
        switch(formData.portalType) {
            case 'patient':
                return "Personal Health Number";
            case 'professional':
                return "SLMC Number";
            case 'institute':
                return "Healthcare Institute Number";
            default:
                return "Username";
        }
    };

    const getRegistrationPath = () => {
        switch(formData.portalType) {
            case 'patient':
                return '/patient-signup';
            case 'healthcare_professional':
                return '/healthcare-professional-signup';
            case 'healthcare_institute':
                return '/healthcare-institute-signup';
            default:
                return '/signup';
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
            <ShootingStarsBackground />
            
            <div className="max-w-md w-full space-y-8 relative z-10">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        UNIFIED INTERHOSPITAL MEDICAL RECORD SYSTEM
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Sign in to your account
                    </p>
                </div>

                <div className="mt-8 bg-white/70 backdrop-blur-md backdrop-saturate-150 py-8 px-4 shadow-xl rounded-lg sm:px-10 border border-white/20">
                    {error && (
                        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 text-red-700" role="alert">
                            <p className="font-medium">Error</p>
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="flex justify-center space-x-4 mb-6">
                        <button
                            onClick={() => handlePortalChange('patient')}
                            className={`flex flex-col items-center p-4 rounded-lg transition-all w-32 h-24 ${
                                formData.portalType === 'patient' 
                                ? 'bg-indigo-100/80 backdrop-blur-sm text-indigo-700 shadow-md' 
                                : 'bg-gray-50/80 backdrop-blur-sm text-gray-500 hover:bg-gray-100/80'
                            }`}
                        >
                            <User className="h-6 w-6 mb-2" />
                            <span className="text-xs text-center">Patient</span>
                        </button>

                        <button
                            onClick={() => handlePortalChange('healthcare_professional')}
                            className={`flex flex-col items-center p-4 rounded-lg transition-all w-32 h-24 ${
                                formData.portalType === 'professional'
                                ? 'bg-indigo-100/80 backdrop-blur-sm text-indigo-700 shadow-md'
                                : 'bg-gray-50/80 backdrop-blur-sm text-gray-500 hover:bg-gray-100/80'
                            }`}
                        >
                            <Stethoscope className="h-6 w-6 mb-2" />
                            <span className="text-xs text-center leading-tight">Healthcare Professional</span>
                        </button>

                        <button
                            onClick={() => handlePortalChange('healthcare_institute')}
                            className={`flex flex-col items-center p-4 rounded-lg transition-all w-32 h-24 ${
                                formData.portalType === 'institute'
                                ? 'bg-indigo-100/80 backdrop-blur-sm text-indigo-700 shadow-md'
                                : 'bg-gray-50/80 backdrop-blur-sm text-gray-500 hover:bg-gray-100/80'
                            }`}
                        >
                            <Building2 className="h-6 w-6 mb-2" />
                            <span className="text-xs text-center leading-tight">Healthcare Institute</span>
                        </button>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {showCredentials ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        {getPlaceholder()}
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </>
                        ) : null}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {loading ? 'Signing in...' : (showCredentials ? 'Sign In' : 'Continue')}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                type="button"
                                onClick={handleRegisterClick}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                            >
                                Register as {
                                    formData.portalType === 'patient' ? 'Patient' : 
                                    formData.portalType === 'professional' ? 'Healthcare Professional' : 
                                    'Healthcare Institute'
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Registration Modals */}
            <PatientRegistrationModal 
                isOpen={showPatientModal} 
                onClose={() => setShowPatientModal(false)} 
            />
            <HealthcareProfessionalRegistrationModal 
                isOpen={showProfessionalModal} 
                onClose={() => setShowProfessionalModal(false)} 
            />
            <HealthcareInstituteRegistrationModal 
                isOpen={showInstituteModal} 
                onClose={() => setShowInstituteModal(false)} 
            />
        </div>
    );
}

export default Login;