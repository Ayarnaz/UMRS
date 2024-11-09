import api from './api';

export const getInstituteDashboard = async (instituteNumber) => {
    try {
        const response = await api.get(`/api/institute/dashboard?instituteNumber=${instituteNumber}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching institute dashboard:', error);
        throw error;
    }
};

export const manageStaff = async (instituteNumber, staffData) => {
    try {
        const response = await api.post('/api/institute/staff', {
            instituteNumber,
            ...staffData
        });
        return response.data;
    } catch (error) {
        console.error('Error managing staff:', error);
        throw error;
    }
};

export const getInstituteStaff = async (instituteNumber) => {
    try {
        const response = await api.get(`/api/institute/staff?instituteNumber=${instituteNumber}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching institute staff:', error);
        throw error;
    }
};

export const getInstituteAppointments = async (instituteNumber) => {
    try {
        const response = await api.get(`/api/institute/appointments?instituteNumber=${instituteNumber}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching institute appointments:', error);
        throw error;
    }
};

export const getInstituteProfessionals = async (instituteNumber) => {
    try {
        const response = await api.get(`/api/institute/professionals?instituteNumber=${instituteNumber}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching institute professionals:', error);
        throw error;
    }
};

export const addProfessional = async (instituteNumber, professionalData) => {
    try {
        const response = await api.post('/api/institute/professionals', {
            instituteNumber,
            ...professionalData
        });
        return response.data;
    } catch (error) {
        console.error('Error adding professional:', error);
        throw error;
    }
};

export const updateProfessionalStatus = async (instituteNumber, slmcNo, status) => {
    try {
        const response = await api.put(`/api/institute/professionals/${slmcNo}`, {
            instituteNumber,
            status
        });
        return response.data;
    } catch (error) {
        console.error('Error updating professional status:', error);
        throw error;
    }
};

export const getProfessionalBySlmc = async (slmcNo) => {
    try {
        const response = await api.get(`/api/professional/details/${slmcNo}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching professional details:', error);
        throw error;
    }
};

// Add more institute-related API calls as needed 