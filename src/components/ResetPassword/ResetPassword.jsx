import React, { useState } from "react";
import styles from "./reset-password.module.css";
import CustomInput from "../reusable/custom/Form-Fields/CInput/CustomInput";
import CustomButton from "../reusable/custom/CButton/CustomButton";
import { Form, Formik } from "formik";
import apiCall from "../../hooks/apiCall";
import * as Yup from "yup";
import { ENDPOINTS } from "../../utils/apiEndpoints";
import FormHeader from "../reusable/custom/FormHeader/FormHeader";
import CustomModal from "../reusable/custom/CModal/CustomModal";
import VerificationModal from "../ProfileVerification/VerificationModal/VerificationModal";
import useNavigation from "../../hooks/useNavigation";

const emailSchema = Yup.object().shape({
  emailOrPhone: Yup.string()
    .test(
      "noSpaceAtStart",
      "The first character cannot be a space",
      (value) => value?.trim().charAt(0) !== " "
    )
    .test(
      "emailOrPhone",
      "Please enter a valid email or phone number",
      function (value) {
        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        const phoneRegex = /^\d{10}$/;
        return emailRegex.test(value) || phoneRegex.test(value);
      }
    )
    .required("Email or phone number is required"),
});

const resetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required")
    .test(
      "no-leading-space",
      "Password cannot start with a space",
      (value) => value && value[0] !== " "
    )
    .matches(
      /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).*$/,
      "Password must contain at least one letter, one number, and one special character"
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm password is required")
    .test(
      "no-leading-space",
      "Confirm password cannot start with a space",
      (value) => value && value[0] !== " "
    ),
});

const ResetPassword = () => {
  const [otp, setOtp] = useState("");
  const [open, setOpen] = useState(false);
  const [verified, setVerified] = useState(false);
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [error, setError] = useState("");
  const { goTo } = useNavigation();

  // const formik = useFormik({
  //     initialValues: {
  //         emailOrPhone: '',
  //     },
  //     validationSchema: emailSchema,
  //     onSubmit: async values => {
  //         const payload = { emailOrPhone: values.emailOrPhone };

  //         setOtp('');
  //         setOpen(true);
  //         // await apiCall(ENDPOINTS.LOGIN, 'POST', { body: payload });
  //     },
  // });

  // const resetPasswordFormik = useFormik({
  //     initialValues: {
  //         password: '',
  //         confirmPassword: '',
  //     },
  //     validationSchema: resetPasswordSchema,
  //     onSubmit: async values => {
  //         console.log('Reset password payload:', values);
  //     },
  // });

  const handleModalSubmission = async () => {
    try {
      const payload = { emailOrPhone, otp };
      const { data, error, statusCode, success } = await apiCall(
        `${ENDPOINTS.VERIFY_OTP_WITHOUT_TOKEN}`,
        "POST",
        { body: payload }
      );
      console.log(data, error);
      if (error) {
        setError(error?.message);
        setOpen(false);
        setOtp("");
      } else {
        setOpen(false);
        setOtp("");
        setVerified(true);
        setError(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const resendOtp = () => {
    // Re-trigger OTP API call
    console.log("Resend OTP to -", emailOrPhone);
    sendOtp({ emailOrPhone });
  };

  const sendOtp = async (values) => {
    try {
      console.log(values);
      const payload = { emailOrPhone: "+91" + values.emailOrPhone };
      setEmailOrPhone("+91" + values.emailOrPhone);
      setOtp("");

      const { data, statusCode, success, error } = await apiCall(
        `${ENDPOINTS.GET_OTP_RESET_PASSWORD}`,
        "POST",
        { body: payload }
      );
      // console.log(data, error);
      setOpen(true);
    } catch (error) {
      console.log(error);
    }
  };

  const handleResetPassword = async (values) => {
    console.log(values);
    try {
      const payload = {
        emailOrPhone,
        password: values.password,
        confirmPassword: values.confirmPassword,
      };
      const { data, statusCode, success, error } = await apiCall(
        `${ENDPOINTS.RESET_PASSWORD}`,
        "PUT",
        { body: payload }
      );
      console.log(data, error);
    } catch (error) {
      console.log(error);
    }
  };

  const renderVerificationModal = () => (
    <CustomModal isOpen={open} onClose={() => setOpen(false)}>
      <VerificationModal
        detailsText={{ mobile: emailOrPhone }}
        otp={otp}
        setOTP={setOtp}
        resendOtp={resendOtp}
        onClick={handleModalSubmission}
      />
    </CustomModal>
  );

  return (
    <div className={styles.formContainer}>
      {open && renderVerificationModal()}

      <FormHeader
        heading="Reset Password"
        headingStyle={{ textAlign: "left" }}
      />
      {!verified ? (
        <Formik
          initialValues={{ emailOrPhone: "" }}
          validationSchema={emailSchema}
          onSubmit={sendOtp}
        >
          {(formik) => (
            <Form className={styles.form}>
              <div className={styles.formFieldsContainer}>
                <CustomInput
                  label="Email/Phone Number"
                  required
                  name="emailOrPhone"
                  takeSpecialChar
                  value={formik.values.emailOrPhone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  touched={formik.touched.emailOrPhone}
                  error={formik.errors.emailOrPhone}
                />
              </div>

              <div className={styles.formSubmitBtn}>
                <CustomButton
                  type="submit"
                  buttonSize="medium"
                  buttonText="Send OTP"
                />
              </div>
              {error && <div className={styles.error}>{error}</div>}
            </Form>
          )}
        </Formik>
      ) : (
        <Formik
          initialValues={{ password: "", confirmPassword: "" }}
          validationSchema={resetPasswordSchema}
          onSubmit={(values) => {
            // console.log(values);
            handleResetPassword(values);
            // goTo('/login');
          }}
        >
          {(resetFormik) => (
            <Form className={styles.form}>
              <div className={styles.formFieldsContainer}>
                <CustomInput
                  label="New Password"
                  required
                  name="password"
                  type="password"
                  takeSpecialChar
                  value={resetFormik.values.password}
                  onChange={resetFormik.handleChange}
                  onBlur={resetFormik.handleBlur}
                  touched={resetFormik.touched.password}
                  error={resetFormik.errors.password}
                />
                <CustomInput
                  label="Confirm Password"
                  required
                  name="confirmPassword"
                  type="password"
                  takeSpecialChar
                  value={resetFormik.values.confirmPassword}
                  onChange={resetFormik.handleChange}
                  onBlur={resetFormik.handleBlur}
                  touched={resetFormik.touched.confirmPassword}
                  error={resetFormik.errors.confirmPassword}
                />
              </div>
              <div className={styles.formSubmitBtn}>
                <CustomButton
                  type="submit"
                  buttonSize="medium"
                  buttonText="Confirm"
                />
              </div>
            </Form>
          )}
        </Formik>
      )}

      {/* {!verified ? (
        <form onSubmit={formik.handleSubmit} className={styles.form}>
          <div className={styles.formFieldsContainer}>
            <CustomInput
              label="Email/Phone Number"
              required
              name="emailOrPhone"
              takeSpecialChar
              value={formik.values.emailOrPhone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              touched={formik.touched.emailOrPhone}
              error={formik.errors.emailOrPhone}
            />
          </div>
          <div className={styles.formSubmitBtn}>
            <CustomButton type="submit" buttonSize="medium" buttonText="Send OTP" />
          </div>
        </form>
      ) : (
        <form onSubmit={resetPasswordFormik.handleSubmit} className={styles.form}>
          <div className={styles.formFieldsContainer}>
            <CustomInput
              label="Password"
              required
              name="password"
              type="password"
              takeSpecialChar
              value={resetPasswordFormik.values.password}
              onChange={resetPasswordFormik.handleChange}
              onBlur={resetPasswordFormik.handleBlur}
              touched={resetPasswordFormik.touched.password}
              error={resetPasswordFormik.errors.password}
            />
            <CustomInput
              label="Confirm Password"
              required
              name="confirmPassword"
              type="password"
              takeSpecialChar
              value={resetPasswordFormik.values.confirmPassword}
              onChange={resetPasswordFormik.handleChange}
              onBlur={resetPasswordFormik.handleBlur}
              touched={resetPasswordFormik.touched.confirmPassword}
              error={resetPasswordFormik.errors.confirmPassword}
            />
          </div>
          <div className={styles.formSubmitBtn}>
            <CustomButton type="submit" buttonSize="medium" buttonText="Confirm" />
          </div>
        </form>
      )} */}
    </div>
  );
};

export default ResetPassword;
