import api from './api';

export const getPatientDashboard = async (userIdentifier) => {
  try {
    console.log('Calling dashboard API for:', userIdentifier);
    const response = await api.get(`/api/patient/dashboard?personalHealthNo=${userIdentifier}`);
    console.log('Dashboard API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Dashboard API error:', error);
    throw error;
  }
};

export const getMedicalRecords = async () => {
  try {
    const response = await api.get('/api/patient/medical-records');
    return response.data;
  } catch (error) {
    console.error('Error fetching medical records:', error);
    throw error;
  }
};

export const uploadMedicalRecord = async (data) => {
  try {
    const response = await api.post('/api/patient/medical-records', data);
    return response.data;
  } catch (error) {
    console.error('Error uploading medical record:', error);
    throw error;
  }
};

export const deleteMedicalRecord = async (recordId) => {
  try {
    const response = await api.delete(`/api/patient/medical-records/${recordId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting medical record:', error);
    throw error;
  }
};

export const updateMedicalRecord = async (recordId, data) => {
  try {
    const response = await api.put(`/api/patient/medical-records/${recordId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating medical record:', error);
    throw error;
  }
};

export const getAppointments = async () => {
  try {
    const response = await api.get('/api/patient/appointments');
    return response.data;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
};

export const getPrescriptions = async () => {
  try {
    const response = await api.get('/api/patient/prescriptions');
    return response.data;
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    throw error;
  }
};

export const getTestResults = async () => {
  try {
    const response = await api.get('/api/patient/test-results');
    return response.data;
  } catch (error) {
    console.error('Error fetching test results:', error);
    throw error;
  }
};

export const getPatientDetails = async () => {
  try {
    const response = await api.get('/api/patient/details');
    return response.data;
  } catch (error) {
    console.error('Error fetching patient details:', error);
    throw error;
  }
};

export const updatePatientProfile = async (phn, profileData) => {
  try {
    const response = await api.put(`/api/patient/profile/${phn}`, profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating patient profile:', error);
    throw error;
  }
};