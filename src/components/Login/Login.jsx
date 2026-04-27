import React from "react";
import styles from "./login.module.css";
import { useTranslation } from "react-i18next";

// Formik:[For form Validation]
import { useFormik } from "formik";
import * as Yup from "yup";
import ProfileVerificationLayout from "../../layouts/ProfileVerificationLayout/ProfileVerificationLayout";
import FormHeader from "../reusable/custom/FormHeader/FormHeader";
import CustomInput from "../reusable/custom/Form-Fields/CInput/CustomInput";
import CustomButton from "../reusable/custom/CButton/CustomButton";
import useNavigation from "../../hooks/useNavigation";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import apiCall from "../../hooks/apiCall";
import { ENDPOINTS } from "../../utils/apiEndpoints";
import axios from "axios";
import { loginSchema } from "./loginSchema";

const BASEURL = `${import.meta.env.VITE_BASE_URL}/api/v1`;
const Login = () => {
  const { t } = useTranslation("login");
  const schema = loginSchema(t);

  const { login } = useAuth();
  const { goTo } = useNavigation();

  const formik = useFormik({
    initialValues: {
      emailOrPhone: "",
      password: "",
    },
    validationSchema: schema,

    // onSubmit: async (values, { setErrors, setStatus }) => {
    onSubmit: async (values, { setStatus }) => {
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
        heading={t("headerForm.heading")}
        subheading={t("headerForm.subHeading")}
      />

      <form onSubmit={formik.handleSubmit} className={styles.form}>
        <div className={styles.formFieldsContainer}>
          <CustomInput
            label={t("loginForm.email")}
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
            <Link to={"/reset-password"}>{t("loginForm.forgotPassword")}</Link>
          </div>

          {formik.status && (
            <span className={styles.error}>{formik.status}</span>
          )}
        </div>

        <div className={styles.formSubmitBtn}>
          <CustomButton
            buttonText={t("loginForm.loginBtn")}
            type={"submit"}
            style={{ height: "70px" }}
          />
          <div className={styles.formBottomNoteText}>
            {t("loginForm.question")}
            <span>
              <Link to="/signup">{t("loginForm.signUpLink")}</Link>
            </span>{" "}
            {t("loginForm.here")}
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;
