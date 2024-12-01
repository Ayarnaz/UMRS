import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    const login = async (credentials) => {
        try {
            console.log('AuthContext: Attempting login with:', credentials);
            const response = await api.post('/login', credentials);
            console.log('AuthContext: Received response:', response.data);

            if (response.data.status === 'success') {
                console.log('AuthContext: Login successful, setting user state');
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                setUser(response.data.user);
                return true;
            } else {
                console.log('AuthContext: Login failed:', response.data.message);
                throw new Error(response.data.message || 'Login failed');
            }
        } catch (error) {
            console.error('AuthContext: Login error:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const userData = JSON.parse(userStr);
            console.log('User data from storage:', userData);
            setUser(userData);
        }
        setLoading(false);
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 