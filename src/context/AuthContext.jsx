import React, { createContext, useContext, useEffect, useState } from 'react';
import { tokenDecode } from '../utils/helperFunctions';

const AuthContext = createContext(null);

const AuthContextProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(true); // 🆕

    useEffect(() => {
        const token = localStorage.getItem("WEMOVE_TOKEN");
        const verificationStatus = JSON.parse(localStorage.getItem("WEMOVE_USER"))?.verificationStatus;
        const status = verificationStatus === 'approved'
        setIsAuthenticated(!!token && status);
        setIsAuthLoading(false); // 🆕 Done loading
    }, []);

    const login = (tokenObj) => {
        localStorage.setItem('WEMOVE_TOKEN', JSON.stringify(tokenObj));
        const decodedToken = tokenDecode(tokenObj?.accessToken);
        localStorage.setItem('WEMOVE_USER', JSON.stringify(decodedToken));
        const verificationStatus = JSON.parse(localStorage.getItem("WEMOVE_USER"))?.verificationStatus;
        const status = verificationStatus === 'approved'
        setIsAuthenticated(!!tokenObj?.accessToken && status);
        // setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('WEMOVE_TOKEN');
        // localStorage.removeItem('isVerified');
        localStorage.removeItem('WEMOVE_HOTELID');
        localStorage.removeItem('WEMOVE_USER');
        setIsAuthenticated(false);
    };

    const value = {
        isAuthenticated,
        isAuthLoading, // 🆕 add loading state to context
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContextProvider;

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthContext');
    }
    return context;
}
