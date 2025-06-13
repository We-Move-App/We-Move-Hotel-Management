import React, { useEffect, useState } from 'react'

import styles from './dashboard-layout.module.css';
import Sidebar from '../../components/Sidebar/Sidebar';
import Navbar from '../../components/Navbar/Navbar';

import { Outlet, useLocation } from "react-router-dom";
import { useScreen } from '../../context/ScreenContext';
// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';


const DashboardLayout = () => {
    const location = useLocation();

    const [isOpen, setIsOpen] = useState(false);

    // const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const { isMobile, isTablet } = useScreen();

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
        console.log('Toggle sidebar', isOpen)
    };

    // useEffect(() => {
    //     // Save last visited nested route inside dashboard
    //     if (location.pathname.startsWith('/dashboard')) {
    //         localStorage.setItem('lastDashboardRoute', location.pathname);
    //     }
    // }, [location.pathname]);

    return (

        <div className={styles.dashboardLayout}>

            <Navbar toggleSidebar={toggleSidebar} isOpen={isOpen} isMobile={isMobile || isTablet} />
            <div className={styles.container}>
                <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} isMobile={isMobile || isTablet} />

                {/* Main Content Container */}

                <main className={styles.contentBox}>
                    <Outlet />
                </main>
            </div>
        </div>

    )
}


export default DashboardLayout