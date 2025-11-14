import React from "react";
import styles from "./login.module.css";

// Formik:[For form Validation]
import { useFormik } from "formik";
import * as Yup from "yup";
import ProfileVerificationLayout from "../../layouts/ProfileVerificationLayout/ProfileVerificationLayout";
import FormHeader from "../reusable/custom/FormHeader/FormHeader";
import CustomInput from "../reusable/custom/Form-Fields/CInput/CustomInput";
import CustomButton from "../reusable/custom/CButton/CustomButton";
import useNavigation from "../../hooks/useNavigation";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import apiCall from "../../hooks/apiCall";
import { ENDPOINTS } from "../../utils/apiEndpoints";
import { toast } from "react-toastify";
import axios from "axios";

// Validation Schema
const loginSchema = Yup.object().shape({
  // Email or phone number validation
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
        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/; // Regular email pattern
        const phoneRegex = /^\d{10}$/; // Valid phone number pattern (10 digits)
        return emailRegex.test(value) || phoneRegex.test(value);
      }
    )
    .required("Email or phone number is required"),

  // Password validation
  password: Yup.string()
    .test(
      "noSpaceAtStart",
      "The first character cannot be a space",
      (value) => value?.trim().charAt(0) !== " "
    )
    .required("Password is required")
    .min(6, "Password must be at least 6 characters long") // Minimum length
    .max(20, "Password must be at most 20 characters long") // Maximum length
    .matches(
      /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).*$/,
      "Password must contain at least one letter, one number, and one special character"
    ),
});

const BASEURL = `${import.meta.env.VITE_BASE_URL}/api/v1`;
const Login = () => {
  const { login } = useAuth();
  const { goTo } = useNavigation();

  const formik = useFormik({
    initialValues: {
      emailOrPhone: "",
      password: "",
    },
    validationSchema: loginSchema,

    onSubmit: async (values, { setErrors, setStatus }) => {
      // try {
      //     console.log('Form submitted');
      //     console.log('Form data:', values);
      //     const payloadBody = {
      //         emailOrPhone: "+91" + values.emailOrPhone,
      //         password: values.password
      //     }
      //     const res = await axios.post(`${BASEURL}${ENDPOINTS.LOGIN}`, payloadBody).then(res => {
      //         console.log(res)
      //     }).catch((error) => {
      //         console.log(error)
      //     })
      //     // const { data, statusCode, error, success } = res;
      //     // const { data, statusCode, error, success } = await apiCall(ENDPOINTS.LOGIN, 'POST', { body: payloadBody });
      //     console.log(res)
      //     // console.log( data, error)
      //     if (error) {
      //         // toast.info(error?.message || 'not authorized');
      //         console.log(error)
      //         error.message && setStatus(error?.message || 'not authorized');
      //         return;
      //     }
      //     if (statusCode === 200 && success) {

      //         toast.success("Login successfully.")
      //         const tokenObj = {
      //             'accessToken': data.data.accessToken,
      //             'refreshToken': data.data.refreshToken,
      //         }
      //         console.log(tokenObj, data, data.data);
      //         // localStorage.setItem('WEMOVE_TOKEN', tokenObj);
      //         // localStorage.setItem('isVerified', true);
      //         login(tokenObj);
      //         // useNavigate('/dashboard')
      //         setTimeout(() => {
      //             goTo('/dashboard');
      //         }, 1000)
      //     }

      // } catch (error) {
      //     console.log(error)
      // }

      // console.log("Form submitted");
      // console.log("Form data:", values);
      const emailOrPhone = values.emailOrPhone.split("").includes("@")
        ? values.emailOrPhone
        : "+91" + values.emailOrPhone;
      const payloadBody = {
        emailOrPhone: emailOrPhone,
        password: values.password,
      };
      await axios
        .post(`${BASEURL}${ENDPOINTS.LOGIN}`, payloadBody)
        .then((res) => {
          // console.log(res);
          const { data, statusCode, success } = res.data;
          const tokenObj = {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          };
          if (success && statusCode === 200) {
            // console.log(tokenObj, data, data.data);
            login(tokenObj);

            // Fetch hotelId right after login
            apiCall(ENDPOINTS.HOTEL_BY_TOKEN, "GET", {
              headers: { Authorization: `Bearer ${tokenObj.accessToken}` },
            })
              .then((res) => {
                // console.log("Hotel response full:", res);

                // ✅ check nested structure
                const hotelId = res?.data?.data?.hotel?._id;
                if (res.success && hotelId) {
                  localStorage.setItem("WEMOVE_HOTELID", hotelId);
                  // console.log("Saved HOTEL_ID:", hotelId);
                } else {
                  console.warn("HotelId not found in response");
                }
              })
              .catch((err) => {
                console.error("Failed to fetch hotelId after login", err);
              });

            // Navigate to dashboard
            setTimeout(() => {
              goTo("/dashboard");
            }, 1000);
          }
        })
        .catch((error) => {
          // console.log(error);
          error?.response?.data.message &&
            setStatus(error?.response?.data.message || "not authorized");
          return;
        });
    },
  });

  return (
    <div className={styles.formContainer}>
      <FormHeader
        heading={"Login"}
        // headingStyle={{ textAlign: 'center' }}
        subheading={"Welcome to We Move All! Please login your account."}
        // subheadingStyle={{ textAlign: 'center' }}
      />

      <form onSubmit={formik.handleSubmit} className={styles.form}>
        {/* Add your form fields here */}
        <div className={styles.formFieldsContainer}>
          <CustomInput
            label={"Email/Phone Number"}
            required={true}
            name="emailOrPhone"
            takeSpecialChar={true}
            value={formik.values.emailOrPhone}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            touched={formik.touched.emailOrPhone}
            error={formik.errors.emailOrPhone}
            // error={formik.touched.mobile && formik.errors.mobile}
          />
          <CustomInput
            label={"Password"}
            required={true}
            name="password"
            type="password"
            value={formik.values.password}
            takeSpecialChar={true}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            touched={formik.touched.password}
            error={formik.errors.password}
            // error={formik.touched.email && formik.errors.email}
          />

          <div className={styles.forgotPasswordBox}>
            <Link to={"/reset-password"}>Forgot Password?</Link>
          </div>

          {formik.status && (
            <span className={styles.error}>{formik.status}</span>
          )}
        </div>

        <div className={styles.formSubmitBtn}>
          {/* Submit Button */}
          <CustomButton
            buttonText={"Log In"}
            type={"submit"}
            style={{ height: "70px" }}
          />
          <div className={styles.formBottomNoteText}>
            Don't have an account?{" "}
            <span>
              <Link to="/signup">Sign up</Link>
            </span>{" "}
            here
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;
