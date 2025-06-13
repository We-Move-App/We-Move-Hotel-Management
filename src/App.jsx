import React, { useState, useEffect } from 'react'
import { BrowserRouter, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import './App.css'
// import AllRoutes from './AllRoutes/Routes'
import { ScreenProvider } from './context/ScreenContext'
import ProfileVerificationLayout from './layouts/ProfileVerificationLayout/ProfileVerificationLayout';
import DashboardLayout from './layouts/DashboardLayout/DashboardLayout';
import Login from './components/Login/Login';
import CreateAccount from './components/ProfileVerification/CreateAccount/CreateAccount';
import Dashboard from './pages/Dashboard';
import Wallet from './pages/Wallet/Wallet';
import HotelManagement from './pages/HotelManagement/HotelManagement';
import RoomManagement from './pages/RoomManagement/RoomManagement';
import AuthContextProvider, { useAuth } from './context/AuthContext';
import AddBankDetails from './components/ProfileVerification/AddBankDetails/AddBankDetails';
import HotelRegistration from './components/ProfileVerification/HotelRegistration/HotelRegistration';
import NotFound from './pages/NotFound/NotFound';
import BookingManagement from './pages/BookingManagement/BookingManagement';
import CustomerFeedback from './pages/CustomerFeedback/CustomerFeedback';
import ProfileVerificationSuccess from './components/ProfileVerification/ProfileVerificationSuccess/ProfileVerificationSuccess';
import AddCustomer from './pages/AddCustomer/AddCustomer';
import Profile from './pages/Profile/Profile';
import PersonalDetails from './components/ProfileVerification/PersonalDetails/PersonalDetails';
import { ToastContainer } from 'react-toastify';
import useNavigation from './hooks/useNavigation';
import ResetPassword from './components/ResetPassword/ResetPassword';
import Loader from './components/reusable/Loader/Loader';


function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAuth();
    const { goTo } = useNavigation();

    if (isAuthenticated === null) return null; // Or a loading spinner

    return isAuthenticated ? children : <Navigate to="/login" replace />;
    // return isAuthenticated ? children : <Navigate to="/login" replace />;
    // const [isAuth, setIsAuth] = useState(null); // null = loading

    // useEffect(() => {
    //     const token = localStorage.getItem("WEMOVE_TOKEN");
    //     const user = localStorage.getItem("WEMOVE_USER");
    //     setIsAuth(token && user);
    // }, []);

    // if (isAuth === null) return null; // or loading spinner

    // return isAuth ? children : <Navigate to="/login" replace />;
}


function App() {
    const { isAuthenticated, isAuthLoading } = useAuth();
    if (isAuthLoading) {
        // While loading token check, show loading spinner
        return <div className={'center'} ><Loader /></div>;
    }



    return (
        <>
            {/* <ProfileVerification/> */}
            <ScreenProvider>
                <BrowserRouter>
                    <Routes>

                        {/* Redirect root to login */}
                        <Route
                            // path="/"
                            index
                            element={
                                isAuthenticated ? (
                                    <Navigate to="/dashboard" replace />
                                ) : (
                                    <Navigate to="/login" replace />
                                )
                            }
                        />

                        {/* Profile Layout Routes */}
                        <Route path='/' element={<ProfileVerificationLayout />}>
                            <Route path='login' element={<Login />} />
                            <Route path='signup' element={<CreateAccount />} />
                            <Route path="add-bank" element={<AddBankDetails />} />
                            <Route path="personal-details" element={<PersonalDetails />} />
                            <Route path="hotel-registration" element={<HotelRegistration />} />
                            <Route path='profile-verified' element={<ProfileVerificationSuccess />} />
                            <Route path="reset-password" element={<ResetPassword />} />
                        </Route>

                        

                        {/* Dashboard Layout Routes */}
                        <Route path='/dashboard'
                            element={
                                <ProtectedRoute>
                                    <DashboardLayout />
                                </ProtectedRoute>
                            }
                        >
                            {/* <Route path='/' element={<Navigate to={"/dashboard"} />} /> */}
                            {/* <Route path="/dashboard" element={<Dashboard />} /> */}
                            <Route index element={<Dashboard />} />
                            <Route path="wallet" element={<Wallet />} />
                            <Route path="hotel-management" element={<HotelManagement />} />
                            <Route path="hotel-management/hotel-registration" element={<HotelRegistration />} />
                            <Route path="room-management" element={<RoomManagement />} />
                            <Route path="booking-management" element={<BookingManagement />} />
                            <Route path="booking-management/add" element={<AddCustomer />} />
                            <Route path="customer-feedback" element={<CustomerFeedback />} />
                            <Route path="profile" element={<Profile />} />

                            <Route path="*" element={<NotFound />} />
                        </Route>

                        {/* 404 Route */}
                        <Route path="*" element={<NotFound />} />

                    </Routes>
                </BrowserRouter>
            </ScreenProvider>
        </>
    )
}

export default App
