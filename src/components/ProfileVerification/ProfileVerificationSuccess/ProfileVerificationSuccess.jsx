import React, { useEffect } from "react";
import styles from "./profile-verification-sucess.module.css";

import ProfileVerificationLayout from "../../../layouts/ProfileVerificationLayout/ProfileVerificationLayout";
import FormHeader from "../../reusable/custom/FormHeader/FormHeader";
import images from "../../../assets/images";
import Loader from "../../reusable/Loader/Loader";
import useNavigation from "../../../hooks/useNavigation";
import { useTranslation } from "react-i18next";

const ProfileVerificationSuccess = () => {
  const { t } = useTranslation("hotelRegistration");
  const { goTo } = useNavigation();

  const handleRedirect = () => {
    // goTo('/dashboard');
    // window.location.reload();
    goTo("/");
  };

  useEffect(() => {
    setTimeout(() => {
      handleRedirect();
    }, 1000); // Change the delay time as needed.
    // 1000ms = 1 seconds.
  }, []);

  return (
    <div className={styles.box}>
      <div className={styles.imageWrapper}>
        <img
          src={images.tickCircle}
          width={100}
          height={100}
          alt="tick-circle"
        />
      </div>
      <FormHeader
        heading={t("verificationSuccess.heading")}
        headingStyle={{ textAlign: "center" }}
        subheading={t("verificationSuccess.subHeding")}
        subheadingStyle={{ textAlign: "center", fontSize: "32px" }}
      />

      <Loader />
    </div>
  );
};

export default ProfileVerificationSuccess;
