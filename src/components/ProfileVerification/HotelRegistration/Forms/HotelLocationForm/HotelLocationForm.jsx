import React, { useEffect, useState } from "react";

// Custom Component
import CustomButton from "../../../../reusable/custom/CButton/CustomButton";
import CustomInput from "../../../../reusable/custom/Form-Fields/CInput/CustomInput";

import styles from "./hotel-location-form.module.css";
import images from "../../../../../assets/images";

import { useFormik } from "formik";
import * as Yup from "yup";
import apiCall from "../../../../../hooks/apiCall";
import { ENDPOINTS } from "../../../../../utils/apiEndpoints";
import GooglePlacesAutocomplete from "../../../../reusable/googlemap/GooglePlacesAutocomplete";

const HotelLocationValidationSchema = Yup.object().shape({
  hotelAddress: Yup.string()
    .required("Hotel Address is required")
    .min(5, "Hotel Address must be at least 5 characters long")
    .max(500, "Hotel Address cannot exceed 500 characters"),
  city: Yup.string()
    .required("City is required")
    .min(2, "City must be at least 2 characters long")
    .max(50, "City cannot exceed 50 characters"),
  locality: Yup.string()
    .required("Locality is required")
    .min(2, "Locality must be at least 2 characters long")
    .max(50, "Locality cannot exceed 50 characters"),
  landmark: Yup.string()
    .min(2, "Landmark must be at least 2 characters long")
    .max(50, "Landmark cannot exceed 50 characters"),
  pincode: Yup.string()
    .nullable()
    .notRequired()
    .matches(/^\d{6}$/, "Pincode must be exactly 6 digits")
    .transform((value, originalValue) => (originalValue === "" ? null : value)),
});

const HotelLocationForm = ({
  initialValues,
  onPrev,
  onNext,
  setMultipartFormState,
}) => {
  // const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: initialValues,
    enableReinitialize: true,
    validationSchema: HotelLocationValidationSchema,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        const hotelID = localStorage.getItem("WEMOVE_HOTELID") || "";
        const payload = {
          address: values.hotelAddress,
          city: values.city,
          street: values.locality,
          landmark: values.landmark,
          pincode: values.pincode,
          state: values.state || "Karnataka",
          country: values.country || "India",
          hotelId: hotelID,
          latitude: values.latitude,
          longitude: values.longitude,
        };

        if (values._id) {
          const { data, statusCode, error, success } = await apiCall(
            `${ENDPOINTS.HOTEL_LOCATION}/${hotelID}`,
            "PUT",
            {
              body: payload,
              headers: {
                Authorization: `Bearer ${
                  JSON.parse(localStorage.getItem("WEMOVE_TOKEN")).accessToken
                }`,
              },
            }
          );
          if (statusCode === 200 && success) {
            onNext(values);
          }
        } else {
          const { data, statusCode, error, success } = await apiCall(
            ENDPOINTS.HOTEL_LOCATION,
            "POST",
            {
              body: payload,
              headers: {
                // 'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${
                  JSON.parse(localStorage.getItem("WEMOVE_TOKEN")).accessToken
                }`,
              },
            }
          );
          if (statusCode === 201 && success) {
            // console.log(data);
            onNext(values);
          }
        }
      } catch (err) {
        console.error("Error during API call:", err);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleLocation = (locationDetails) => {
    const { address, city, locality, landmark, postalCode } = locationDetails;
    // Update Formik values
    formik.setFieldValue("hotelAddress", address);
    formik.setFieldValue("city", city);
    formik.setFieldValue("locality", locality);
    formik.setFieldValue("landmark", landmark);
    formik.setFieldValue("pincode", postalCode);
    setLoading(false);
  };

  useEffect(() => {
    // console.log("Formik values changed:", formik.values);
  }, [formik.values]);

  return (
    <form className={styles.form} onSubmit={formik.handleSubmit}>
      <div className={styles.formFieldsContainer}>
        <div className={styles.mapBox}>
          <label>
            <p>Add Location</p>
          </label>
          {/* <GoogleMapComponent handleLocation={(locationDetails) => handleLocation(locationDetails)} formik={formik} /> */}
          <GooglePlacesAutocomplete
            formik={formik}
            handleLocation={handleLocation}
          />
        </div>

        <div className={styles.doubleFormFieldsBox}>
          <CustomInput
            required={true}
            name="city"
            label="City"
            value={formik.values.city}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            boxStyle={{ width: "50%" }}
            error={formik.errors?.city}
            touched={formik.touched?.city}
          />
          <CustomInput
            required={true}
            name="locality"
            label="Locality"
            value={formik.values.locality}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            boxStyle={{ width: "50%" }}
            error={formik.errors?.locality}
            touched={formik.touched?.locality}
          />
        </div>

        <div className={styles.doubleFormFieldsBox}>
          <CustomInput
            // required={true}
            name="landmark"
            label="Landmark"
            value={formik.values.landmark}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            boxStyle={{ width: "50%" }}
            error={formik.errors?.landmark}
            touched={formik.touched?.landmark}
          />
          <CustomInput
            // required={true}
            name="pincode"
            label="Pincode"
            type="number"
            value={formik.values.pincode}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            boxStyle={{ width: "50%" }}
            error={formik.errors?.pincode}
            touched={formik.touched?.pincode}
          />
        </div>
      </div>

      <div className={styles.formSubmitBtn}>
        <CustomButton
          type={"submit"}
          buttonSize={"medium"}
          disabled={isSubmitting}
          buttonText={
            isSubmitting ? (
              <span className={styles.loadingText}>
                <span className={styles.spinner} />
                Please wait
              </span>
            ) : initialValues._id ? (
              "Update"
            ) : (
              "Continue"
            )
          }
        />
      </div>
    </form>
  );
};

export default HotelLocationForm;
