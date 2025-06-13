import React, { useEffect, useState } from 'react'
import LeftBox from '../components/LeftBox/LeftBox'
import CreateAccount from '../components/ProfileVerification/CreateAccount/CreateAccount'
import AddBankDetails from '../components/ProfileVerification/AddBankDetails/AddBankDetails'
import ProfileVerificationLayout from '../layouts/ProfileVerificationLayout/ProfileVerificationLayout'
import HotelRegistration from '../components/ProfileVerification/HotelRegistration/HotelRegistration'
import ProfileVerificationSuccess from '../components/ProfileVerification/ProfileVerificationSuccess/ProfileVerificationSuccess'
import Login from '../components/Login/Login'
import DashboardLayout from '../layouts/DashboardLayout/DashboardLayout'

const Home = () => {
    const [selectLayout, setSelectLayout] = useState();
    useEffect(() => {
        const isVerified = localStorage.getItem('isVerified');
        if (isVerified) {
            setSelectLayout('dashboardLayout');
        } else {
            setSelectLayout('profileVerificationLayout');
        }
    }, [])
    return (
        <>
            {/* <ProfileVerificationLayout/> */}
            {/* <ProfileVerification /> */}
            {/* <CreateAccount/> */}
            {/* <AddBankDetails/> */}
            {/* <HotelRegistration/> */}
            {/* <ProfileVerificationSuccess/> */}
            {/* <Login/> */}
            {/* <DashboardLayout/> */}
            {
                selectLayout === 'profileVerificationLayout' ? <ProfileVerificationLayout /> : <DashboardLayout />
            }
        </>
    )
}

export default Home