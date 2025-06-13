import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from '../pages/Home'
import Login from '../components/Login/Login'
import CreateAccount from '../components/ProfileVerification/CreateAccount/CreateAccount'
import AddBankDetails from '../components/ProfileVerification/AddBankDetails/AddBankDetails'
import HotelRegistration from '../components/ProfileVerification/HotelRegistration/HotelRegistration'
import ProfileVerificationSuccess from '../components/ProfileVerification/ProfileVerificationSuccess/ProfileVerificationSuccess'
import HotelManagement from '../pages/HotelManagement/HotelManagement'

const AllRoutes = () => {
  return (
    <Routes>
      {/* Add your routes here */}
      {/* Example: <Route exact path="/home" component={Home} /> */}
      <Route  path="/" element={<Home />} />

      {/* Profile Verifications Flow Routes */}
      {/* <Route  path="/login" element={<Login />} />
      <Route  path="/signup" element={<CreateAccount />} />
      <Route  path="/add-bank" element={<AddBankDetails />} />
      <Route  path="/hotel-registration" element={<HotelRegistration />} />
      <Route  path="/profile-verified" element={<ProfileVerificationSuccess />} /> */}

      {/* Dashboard Routes */}
      <Route  path="/hotel-management" element={<HotelManagement />} />

    </Routes>
  )
}

export default AllRoutes;