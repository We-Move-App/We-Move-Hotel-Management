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

const loginSchema = Yup.object().shape({
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

  password: Yup.string()
    .test(
      "noSpaceAtStart",
      "The first character cannot be a space",
      (value) => value?.trim().charAt(0) !== " "
    )
    .required("Password is required")
    .min(6, "Password must be at least 6 characters long")
    .max(20, "Password must be at most 20 characters long")
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
          const { data, statusCode, success } = res.data;
          const tokenObj = {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          };
          if (success && statusCode === 200) {
            login(tokenObj);

            apiCall(ENDPOINTS.HOTEL_BY_TOKEN, "GET", {
              headers: { Authorization: `Bearer ${tokenObj.accessToken}` },
            })
              .then((res) => {
                const hotelId = res?.data?.data?.hotel?._id;
                if (res.success && hotelId) {
                  localStorage.setItem("WEMOVE_HOTELID", hotelId);
                } else {
                  console.warn("HotelId not found in response");
                }
              })
              .catch((err) => {
                console.error("Failed to fetch hotelId after login", err);
              });
            setTimeout(() => {
              goTo("/dashboard");
            }, 1000);
          }
        })
        .catch((error) => {
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
        subheading={"Welcome to We Move All! Please login your account."}
      />

      <form onSubmit={formik.handleSubmit} className={styles.form}>
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
          />

          <div className={styles.forgotPasswordBox}>
            <Link to={"/reset-password"}>Forgot Password?</Link>
          </div>

          {formik.status && (
            <span className={styles.error}>{formik.status}</span>
          )}
        </div>

        <div className={styles.formSubmitBtn}>
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
