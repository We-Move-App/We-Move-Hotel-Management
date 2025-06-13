import React, { useState, useEffect } from 'react'
import styles from './createAccount.module.css';
import OTPInput, { ResendOTP } from "otp-input-react";

// Layouts
import ProfileVerificationLayout from '../../../layouts/ProfileVerificationLayout/ProfileVerificationLayout';

// Custom Components
import FormHeader from '../../reusable/custom/FormHeader/FormHeader';
import CustomInput from '../../reusable/custom/Form-Fields/CInput/CustomInput';
import CustomButton from '../../reusable/custom/CButton/CustomButton';

// Formik:[For form Validation]
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import useNavigation from '../../../hooks/useNavigation';
import callApi from '../../../hooks/callApi';
import CustomModal from '../../reusable/custom/CModal/CustomModal';
import VerificationModal from '../VerificationModal/VerificationModal';

import useApi from '../../../hooks/callApi';
import apiCall from '../../../hooks/apiCall';
import { ENDPOINTS } from '../../../utils/apiEndpoints';
import { tokenDecode } from '../../../utils/helperFunctions';
import { toast } from 'react-toastify';

// Validation Schema
const SignupSchema = Yup.object().shape({
  mobile: Yup.string()
    .matches(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits')
    .matches(/^\d+$/, 'Mobile number cannot contain special characters')
    .required('Mobile number is required')
    .test(
      'no-leading-space',
      'Mobile number cannot start with a space',
      (value) => value && value[0] !== ' '
    ),
  email: Yup.string()
    .test('noSpaceAtStart', 'The first character cannot be a space', value => value?.trim().charAt(0) !== ' ')
    .test(
      'email', 'Invalid email format.',
      function (value) {
        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/; // Regular email pattern
        return emailRegex.test(value);
      }
    )
    .required('Email is required.'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required')
    .test(
      'no-leading-space',
      'Password cannot start with a space',
      (value) => value && value[0] !== ' '
    )
    .matches(
      /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).*$/,
      'Password must contain at least one letter, one number, and one special character'
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required')
    .test(
      'no-leading-space',
      'Confirm password cannot start with a space',
      (value) => value && value[0] !== ' '
    )

});


const CreateAccount = () => {
  const { goTo } = useNavigation();
  const navigate = useNavigate()
  const [errorObj, setErrorObj] = useState({
    mobileError: '',
    emailError: ''
  });

  const formik = useFormik({
    initialValues: {
      mobile: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: SignupSchema,

    onSubmit: async (values, { setErrors, setStatus }) => {
      console.log('Form submitted');
      console.log('Form data:', values);

      try {
        const payloadBody = {
          email: values.email,
          password: values.password,
          phoneNumber: '+91' + values.mobile,
          fullName: 'userName',
          // role: 'hotelManager',
          address: "123 kathmandu"
        }

        if (!mobileVerifyStatus || !emailVerifyStatus) {
          // toast.info('Please verify your mobile and email first.');
          setErrors({
            email: 'Please verify you email.',
            mobile: 'Please verify your mobile.'
          })

          !mobileVerifyStatus && setErrorObj(prev => ({
            ...prev,
            mobileError: "Please verify your mobile"
          }))
          !emailVerifyStatus && setErrorObj(prev => ({
            ...prev,
            emailError: "Please verify your email"
          }))
          return;
        }

        const { data, statusCode, error, success } = await apiCall(ENDPOINTS.REGISTER, 'POST', { body: payloadBody });
        if (error) {
          setStatus(error.message);
          // if (error.statusCode === 400, !error.success) {
          //   toast.info(error.message);
          // }
          return;
        }

        if (statusCode === 200 && success) {

          console.log("From Create Account:", data)
          if (data.data.hotelmanager.verificationStatus === "submitted") {
            const wemove_token = {
              accessToken: data.data.accessToken,
              refreshToken: data.data.refreshToken,
            }
            const decodedToken = tokenDecode(wemove_token.accessToken);
            localStorage.setItem('WEMOVE_USER', JSON.stringify(decodedToken));
            localStorage.setItem('WEMOVE_TOKEN', JSON.stringify(wemove_token));
            // localStorag.setItem('WEMOVE_VERIFY_STATUS', JSON.stringify(wemove_token?.verificationStatus));
            // navigate('/add-bank');
            goTo('/add-bank');
          }
          else if (data.data.hotelmanage.verificationStatus === "approved") {
            goTo('/dashboard');
          }

          goTo('/add-bank');

        }


      } catch (err) {
        console.log('Error during API call:', err);
      }
    },
  })

  const [verifyMobileModal, setVerifyMobileModal] = useState(false);
  const [mobileOtp, setMobileOtp] = useState();
  const [verifyEmailModal, setVerifyEmailModal] = useState(false);
  const [emailOtp, setEmailOtp] = useState();

  const closeMobileModal = () => {
    setVerifyMobileModal(false);
  }
  const closeEmailModal = () => {
    setVerifyEmailModal(false);
  }

  const [mobileVerifyStatus, setMobileVerifyStatus] = useState(false);
  const [emailVerifyStatus, setEmailVerifyStatus] = useState(false);

  // const { data, loading, error, callApi: handleMobileVerification } = useApi();

  // const { data, loading, error, refetch: mobileVerification } = callApi('/verification/send-otp-email-phone', 'POST', { body: payload });

  const handleVerifyMobileStatus = async () => {
    const mobileNumber = formik.values.mobile;

    if (mobileNumber.length === 10) {
      const payload = {
        emailOrPhone: '+91' + mobileNumber
      }
      // console.log(formik.values)
      try {
        const { data, statusCode, error, success } = await apiCall(ENDPOINTS.SEND_OTP_MOBILE_EMAIL, 'POST', { body: payload })

        console.log('OTP sent:', data);
        if (statusCode === 200 && success) {
          setVerifyMobileModal(true);  // Show the OTP modal
        }

        if (error) {
          console.log('Error sending OTP:', error);
        }

      } catch (err) {
        console.error('Error during API call:', err);
      }
    } else {
      alert('Please enter valid 10 digit mobile number')
      return
    }
  }

  const handleVerifyEmailStatus = async () => {
    const email = formik.values.email;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (emailRegex.test(email)) {
      // setEmailVerifyStatus(!emailVerifyStatus);
      try {
        const payload = {
          emailOrPhone: email
        }
        const { data, statusCode, error, success } = await apiCall(ENDPOINTS.SEND_OTP_MOBILE_EMAIL, 'POST', { body: payload });
        // console.log(data, statusCode,success)
        if (statusCode === 200 && success) {
          setVerifyEmailModal(true);
        }

        if (error) {
          console.log('Error sending OTP:', error);
        }
      } catch (err) {
        console.error('Error during API call:', err);
      }
    } else {
      alert('Please enter a valid email.')
      return
    }
  }


  const handleVerifyMobile = async () => {
    // verify mobile number with OTP
    // console.log('verify mobile number with OTP');
    try {
      const payload = {
        otp: mobileOtp,
        phoneNumber: '+91' + formik.values.mobile
      }
      const { data, statusCode, error } = await apiCall(ENDPOINTS.VERIFY_OTP_MOBILE, 'PUT', { body: payload });
      if (statusCode === 200) {
        setMobileVerifyStatus(true);
        closeMobileModal();
        // toast.success("Mobile verification successful");
        return;
      }
      if (error) {
        console.error('Error verifying OTP:', error);
        toast.error('Invalid OTP. Please try again.')
        return;
      }
    } catch (err) {
      console.error('Error during API call:', err);
    }
  }

  const handleVerifyEmail = async () => {
    try {
      const payload = {
        email: formik.values.email,
        otp: emailOtp,
      }
      console.log(payload);
      const { data, statusCode, error, success } = await apiCall(ENDPOINTS.VERIFY_OTP_EMAIL, 'PUT', { body: payload });

      if (statusCode === 200 && success) {
        setEmailVerifyStatus(true);
        closeEmailModal();
        // toast.success("Email verification successful");
        return;
      }
      if (error) {
        // console.error('Error verifying OTP:', error);
        toast.error('Invalid OTP. Please try again.');
        return;
      }
    } catch (err) {
      console.error('Error during API call:', err);
    }
    // setEmailVerifyStatus(true);
    // closeEmailModal();
  }



  const mobileVerificationModal = () => {
    return (
      <CustomModal isOpen={verifyMobileModal} onClose={closeMobileModal} >
        <VerificationModal
          detailsText={{ mobile: formik.values.mobile }}
          otp={mobileOtp}
          setOTP={setMobileOtp}
          resendOtp={handleVerifyMobileStatus}
          onClick={handleVerifyMobile}
        />
      </CustomModal>
    )
  }

  const emailVerificationModal = () => {
    return (
      <CustomModal isOpen={verifyEmailModal} onClose={closeEmailModal} >
        <VerificationModal
          detailsText={{ email: formik.values.email }}
          otp={emailOtp}
          setOTP={setEmailOtp}
          resendOtp={handleVerifyEmailStatus}
          onClick={handleVerifyEmail}
        />
      </CustomModal>
    )
  }

  // useEffect(() => {
  //   const isVerified = localStorage.getItem("isVerified");
  //   isVerified && goTo('/')
  // }, [])
  return (
    <div className={styles.formContainer}>
      {
        // Render Mobile Verification Modal
        verifyMobileModal && mobileVerificationModal()
      }
      {
        // Render Email Verification Modal
        verifyEmailModal && emailVerificationModal()
      }
      <FormHeader
        heading={'Create Account'}
        subheading={'Welcome to We Move All! Please create your account here.'}
      />

      <form onSubmit={formik.handleSubmit} className={styles.form} >

        {/* Add your form fields here */}
        <div className={styles.formFieldsContainer}>
          <CustomInput
            label={'Mobile Number'}
            required={true}
            name='mobile'
            type='tel'
            value={formik.values.mobile} a
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            touched={formik.touched.mobile}
            error={formik.errors.mobile}
            verifyStatus={mobileVerifyStatus}
            handleVerifyStatus={handleVerifyMobileStatus}

          // error={formik.touched.mobile && formik.errors.mobile}
          />
          <CustomInput
            label={'E-mail Id'}
            required={true}
            name='email'
            takeSpecialChar={true}
            type='email'
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            touched={formik.touched.email}
            error={formik.errors.email}
            verifyStatus={emailVerifyStatus}
            handleVerifyStatus={handleVerifyEmailStatus}
          // error={formik.touched.email && formik.errors.email}
          />
          <CustomInput
            label={'Password'}
            required={true}
            name='password'
            type='password'
            takeSpecialChar={true}
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            touched={formik.touched.password}
            error={formik.errors.password}
          // error={formik.touched.password && formik.errors.password}
          />
          <CustomInput
            label={'Confirm Password'}
            required={true}
            name='confirmPassword'
            type='password'
            takeSpecialChar={true}
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            touched={formik.touched.confirmPassword}
            error={formik.errors.confirmPassword}
          // error={formik.touched.confirmPassword && formik.errors.confirmPassword}
          />
        </div>
        {
          formik.status && <div className={styles.error} >{formik.status}</div>
        }

        <div className={styles.formSubmitBtn}>
          {/* Submit Button */}
          <CustomButton
            // disabled={!mobileVerifyStatus || !emailVerifyStatus}
            buttonText={'Sign Up'}
            type={'submit'}
            buttonSize={'large'}
          // style={{ height: '70px', }}
          />
          <div className={styles.formBottomNoteText}>
            Already have an account? <span><Link to="/login">Log in</Link></span> here
          </div>
        </div>
      </form>
    </div>
  )
}

export default CreateAccount