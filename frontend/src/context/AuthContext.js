import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('auth-token'));
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const verifyUser = async () => {
            const storedToken = localStorage.getItem('auth-token');
            if (storedToken) {
                setToken(storedToken);
                axios.defaults.headers.common['x-auth-token'] = storedToken;

                setIsLoggedIn(true);
            }
            setIsLoading(false);
        };
        verifyUser();
    }, []);

    const login = (newToken, userData) => {
        localStorage.setItem('auth-token', newToken);
        setToken(newToken);
        setUser(userData);
        axios.defaults.headers.common['x-auth-token'] = newToken;
        setIsLoggedIn(true);
    };

    const logout = () => {
        localStorage.removeItem('auth-token');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['x-auth-token'];
        setIsLoggedIn(false);
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ token, user, isLoggedIn, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
