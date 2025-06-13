import React, { useEffect, useState } from 'react'
import styles from './profile-verification-layout.module.css';
import images from '../../assets/images';
import { useScreen } from '../../context/ScreenContext';
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

// Import Components
import LeftBox from '../../components/LeftBox/LeftBox';
import Login from '../../components/Login/Login';
import CreateAccount from '../../components/ProfileVerification/CreateAccount/CreateAccount';
import AddBankDetails from '../../components/ProfileVerification/AddBankDetails/AddBankDetails';
import HotelRegistration from '../../components/ProfileVerification/HotelRegistration/HotelRegistration';
import ProfileVerificationSuccess from '../../components/ProfileVerification/ProfileVerificationSuccess/ProfileVerificationSuccess';
import Home from '../../pages/Home';
import { useAuth } from '../../context/AuthContext';
import { ToastContainer } from 'react-toastify';


const ProfileVerificationLayout = () => {
    const { isAuthenticated } = useAuth();
    const { isTablet, isMobile } = useScreen();
    // const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    // useEffect(() => {
    //     const handleResize = () => setIsMobile(window.innerWidth < 1024);
    //     window.addEventListener('resize', handleResize);

    //     return () => window.removeEventListener('resize', handleResize);
    // }, [])
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className={styles.profileVerificationLayout} style={{ backgroundImage: `url(${images.bodyBackgroundImage})`, backgroundSize: 'contain', }}>
            <ToastContainer position="top-right" closeOnClick autoClose={false} />
            {!isTablet && <div className={styles.leftBoxWrapper}> <LeftBox /></div>}
            {
                (isTablet || isMobile) && (
                    <div className={styles.logoHeaderBar} style={{ backgroundImage: `url(${images.leftBoxBackgroundImage})` }}>
                        <div className={styles.whiteCircle}>
                            <img src={images.trollyLogo} alt="logo" />
                        </div>
                    </div>
                )
            }
            <div className={styles.rightBox}>
                {/* {
                    (isTablet || isMobile) && (
                        <div className={styles.logoHeaderBar} style={{ backgroundImage: `url(${images.leftBoxBackgroundImage})` }}>
                            <div className={styles.whiteCircle}>
                                <img src={images.trollyLogo} alt="logo" />
                            </div>
                        </div>
                    )
                } */}
                <Outlet />
                {/* {children} */}
                {/* <Routes>
                    Profile Verifications Flow Routes
                    <Route path='/' element={<Navigate to={"/login"} />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<CreateAccount />} />
                    <Route path="/add-bank" element={<AddBankDetails />} />
                    <Route path="/hotel-registration" element={<HotelRegistration />} />
                    <Route path="/profile-verified" element={<ProfileVerificationSuccess />} />
                </Routes> */}

            </div>
        </div>
    )
}

export default ProfileVerificationLayout