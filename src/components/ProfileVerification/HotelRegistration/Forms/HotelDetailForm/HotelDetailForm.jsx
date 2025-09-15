import React, { useEffect, useState } from "react";
import styles from "./hotel-detail-form.module.css";

import CustomInput from "../../../../reusable/custom/Form-Fields/CInput/CustomInput";
import CustomButton from "../../../../reusable/custom/CButton/CustomButton";
import CustomLabel from "../../../../reusable/custom/CLabel/CustomLabel";
import CustomCheckBox from "../../../../reusable/custom/Form-Fields/CCheckBoxInput/CustomCheckBox";
import DragDrop from "../../../../reusable/custom/D&DFileUpload/DragDrop";
import { FileUpload } from "../../../../reusable/custom/Form-Fields/CDragAndDrop/CustomDragAndDrop";
import FilesList from "../../../../reusable/FilesList/FilesList";

import { useFormik } from "formik";
import * as Yup from "yup";
import { formatFileSize } from "../../../../../utils/helperFunctions";
import apiCall from "../../../../../hooks/apiCall";
import { ENDPOINTS } from "../../../../../utils/apiEndpoints";
import SnackbarNotification from "../../../../reusable/Snackbar-Notification/SnackbarNotification";

const SUPPORTED_FORMATS = [
  "image/jpg",
  "image/jpeg",
  "image/png",
  "application/pdf",
]; // Supported file types
const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB size limit

const HotelDetailsValidationSchema = Yup.object().shape({
  hotelName: Yup.string()
    .required("Hotel Name is required")
    .min(2, "Hotel Name must be at least 2 characters")
    .max(50, "Hotel Name cannot exceed 50 characters"),
  bussinessLicense: Yup.string().required("Business License is required"),
  totalRooms: Yup.number()
    .required("Total number of rooms is required")
    .positive("Total rooms must be greater than zero")
    .integer("Total rooms must be an integer"),
  files: Yup.array()
    .of(
      Yup.mixed()
        .required("A file is required")
        .test("file-check", "Invalid file", (value) => {
          // Only validate if it's a local file (File object)
          if (value instanceof File) {
            const validSize = value.size <= FILE_SIZE_LIMIT;
            const validFormat = SUPPORTED_FORMATS.includes(value.type);
            return validSize && validFormat;
          }
          return true; // Skip validation for mapped backend files (e.g. image URLs or meta objects)
        })
    )
    // .test(
    //     'fileSize',
    //     ({ value, path }) => `${path} is too large, must be less than 5MB`,
    //     value => value && value.size <= FILE_SIZE_LIMIT
    // )
    // .test(
    //     'fileFormat',
    //     ({ value, path }) => `${path} has unsupported format, only JPG, PNG, and PDF are allowed`,
    //     value => value && SUPPORTED_FORMATS.includes(value.type)
    // )

    .test("file-count", "At least 3 files required", function (value) {
      // Only run this test if no existing or local files
      const count = value?.length || 0;
      return count >= 3;
    }),
  // .min(3, 'At least 3 file is required'),
  termsAndConditions: Yup.boolean()
    .required("You must accept the terms and conditions")
    .oneOf([true], "You must accept the terms and conditions"),
});
const HotelDetailForm = ({ initialValues, onPrev, onNext }) => {
  const [errorObj, setErrorObj] = useState({});
  const [fileProgress, setFileProgress] = useState({});
  const [hotelId, setHotelId] = useState(
    localStorage.getItem("WEMOVE_HOTELID") || ""
  );
  const [deletedImageIds, setDeletedImageIds] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "info", // "success" | "error" | "warning" | "info"
    message: "",
  });

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: HotelDetailsValidationSchema,
    onSubmit: async (values, { setErrors, setStatus }) => {
      console.log(values);
      console.log(values._id);
      try {
        console.log("Hotel Details Form submitted.");
        console.log("Hotel Details Form data:", values);

        const payloadBody = new FormData();
        payloadBody.append("hotelName", values.hotelName);
        payloadBody.append("businessLicense", values.bussinessLicense);
        payloadBody.append("totalRoom", values.totalRooms);

        const existingImageIds = [];
        const newUploads = [];

        for (const image of values.files) {
          if (image instanceof File) {
            newUploads.push(image); // New file to upload
          } else if (typeof image === "object" && image._id) {
            existingImageIds.push(image._id); // Backend image reference
          }
        }

        // Append new files if any
        if (newUploads.length > 0) {
          newUploads.forEach((file) => payloadBody.append("hotelImages", file));
        } else {
          // If no new images, ensure field is sent to indicate no upload
          payloadBody.append("hotelImages", null);
        }

        const finalImageIds =
          deletedImageIds.length > 0 ? deletedImageIds : [""];

        payloadBody.append("imageId", JSON.stringify(finalImageIds));

        payloadBody.append("termsAndConditions", values.termsAndConditions);

        window.scrollTo({ top: 0, behavior: "smooth" });

        // if values._id then update else post req
        if (values._id) {
          console.log("UPDATE REQ");
          const { data, statusCode, error, success } = await apiCall(
            `${ENDPOINTS.HOTEL_BY_ID}/${values._id}`,
            "PUT",
            {
              body: payloadBody,
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${
                  JSON.parse(localStorage.getItem("WEMOVE_TOKEN")).accessToken
                }`,
              },
            }
          );

          if (error) {
            const { errors, message } = error;
            message && setStatus(message);
            return;
          }
          if (statusCode === 200 && success) {
            console.log("UPDATE HOTEL DETAILS:", data);
            // onNext(values);
          }
        } else {
          const { data, statusCode, error, success } = await apiCall(
            ENDPOINTS.HOTEL_DETAILS,
            "POST",
            {
              body: payloadBody,
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${
                  JSON.parse(localStorage.getItem("WEMOVE_TOKEN")).accessToken
                }`,
              },
            }
          );

          if (error) {
            const { errors, message } = error;
            message && setStatus(message);
            setErrorObj((prev) => ({
              ...prev,
              message: error?.message,
            }));
            return;
          }

          if (statusCode === 201 && success) {
            console.log("in hotel detailsform", data);
            localStorage.setItem("WEMOVE_HOTELID", data.data._id);
            setHotelId(data.data._id);
            formik.setFieldValue("_id", data.data._id);
            // onNext(values);
          }
        }

        onNext(values);
        // onNext: Pass data to parent component
      } catch (err) {
        console.error("Error during API call:", err);
      }
    },
  });

  const [fileComponentsCount, setFileComponentsCount] = useState(3); // Default to 3 components

  const handleFilesChange = (newFiles) => {
    const currentFiles = formik.values.files;
    formik.setFieldValue("files", [...currentFiles, ...newFiles]);
    // Simulate upload progress for new files
    newFiles.forEach((file) => {
      simulateUpload(file);
    });
  };

  const simulateUpload = (file) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      if (progress >= 100) {
        clearInterval(interval);
      }
      setFileProgress((prev) => ({
        ...prev,
        [file.name]: Math.min(progress, 100),
      }));
    }, 200);
  };

  const removeFile = (index, fileName) => {
    const files = formik.values.files;
    const fileToRemove = files[index];

    // Track deleted backend image IDs only
    if (fileToRemove && typeof fileToRemove === "object" && fileToRemove._id) {
      setDeletedImageIds((prev) => [...prev, fileToRemove._id]);
    }

    formik.setFieldValue("files", [
      ...files.slice(0, index),
      ...files.slice(index + 1),
    ]);

    // Remove upload progress for local files
    setFileProgress((prev) => {
      const { [fileName]: removed, ...rest } = prev;
      return rest;
    });
  };

  const handleAddClick = () => {
    setFileComponentsCount(fileComponentsCount + 1);
  };

  return (
    <form className={styles.form} onSubmit={formik.handleSubmit}>
      <div className={styles.formFieldsContainer}>
        <CustomInput
          type="text"
          required={true}
          name="hotelName"
          label="Hotel Name"
          value={formik.values.hotelName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.errors?.hotelName}
          touched={formik.touched?.hotelName}
        />
        <CustomInput
          required={true}
          name="bussinessLicense"
          label="Business License"
          alphaNumeric={true}
          value={formik.values.bussinessLicense}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.errors?.bussinessLicense}
          touched={formik.touched?.bussinessLicense}
        />
        <CustomInput
          required={true}
          name="totalRooms"
          label="Total Rooms"
          type="number"
          value={formik.values.totalRooms}
          // onChange={formik.handleChange}
          onChange={(e) => {
            formik.handleChange(e);

            // 👇 Trigger Snackbar when user updates totalRooms
            setSnackbar({
              open: true,
              severity: "warning",
              message:
                "Please also update Standard and Luxury room counts to match Total Rooms.",
            });
          }}
          onBlur={formik.handleBlur}
          error={formik.errors?.totalRooms}
          touched={formik.touched?.totalRooms}
        />
        <SnackbarNotification
          snackbar={snackbar}
          handleClose={handleSnackbarClose}
        />

        {/* Drag and Drop Components Wrapper */}
        <div className={styles.dragDropWrapper}>
          <div className={styles.dragDropLabelBox}>
            <CustomLabel
              labelText={"Upload Hotel Photo (min: 3 img)"}
              required={true}
            />
          </div>
          <div className={styles.dragDropBox}>
            <FileUpload
              onFilesChange={handleFilesChange}
              accept={".png, .jpg, .JPEG"}
            />
            {formik.values.files && (
              <FilesList
                files={formik.values.files}
                fileProgress={fileProgress}
                removeFile={removeFile}
                minRequiredFiles={3}
              />
            )}
          </div>
        </div>

        <CustomCheckBox
          label={"I accept all terms and conditions"}
          error={formik.errors?.termsAndConditions}
          onChange={(e) =>
            formik.setFieldValue("termsAndConditions", e.target.checked)
          }
          // onChange={formik.handleChange}
          required={true}
          name="termsAndConditions"
          checked={formik.values.termsAndConditions}
          touched={formik.touched?.termsAndConditions}
        />
        {formik.status && <div className={styles.error}>{formik.status}</div>}
      </div>

      <div className={styles.formSubmitBtn}>
        <CustomButton
          buttonText={initialValues._id ? "Update" : "Continue"}
          type={"submit"}
          buttonSize={"medium"}
        />
      </div>
    </form>
  );
};

export default HotelDetailForm;
