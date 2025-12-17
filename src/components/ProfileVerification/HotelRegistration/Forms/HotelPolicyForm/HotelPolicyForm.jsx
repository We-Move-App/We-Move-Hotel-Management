import React, { useState } from "react";
import CustomButton from "../../../../reusable/custom/CButton/CustomButton";
import CustomLabel from "../../../../reusable/custom/CLabel/CustomLabel";
import CustomInput from "../../../../reusable/custom/Form-Fields/CInput/CustomInput";
import styles from "./hotel-policy-form.module.css";
import GlobalStyles from "../../../../../utils/GlobalStyles";
import images from "../../../../../assets/images";

import { useFormik } from "formik";
import * as Yup from "yup";
import CustomTimeInput from "../../../../reusable/custom/Form-Fields/CTimeInput/CustomTimeInput";
import DragDrop from "../../../../reusable/custom/D&DFileUpload/DragDrop";
import { FileUpload } from "../../../../reusable/custom/Form-Fields/CDragAndDrop/CustomDragAndDrop";
import FilesList from "../../../../reusable/FilesList/FilesList";
import CustomCheckBox from "../../../../reusable/custom/Form-Fields/CCheckBoxInput/CustomCheckBox";
import apiCall from "../../../../../hooks/apiCall";
import { ENDPOINTS } from "../../../../../utils/apiEndpoints";
import { toast } from "react-toastify";

const SUPPORTED_FORMATS = ["application/pdf"];
const FILE_SIZE_LIMIT = 5 * 1024 * 1024;

const HotelPolicyValidationSchema = Yup.object().shape({
  checkingTime: Yup.string()
    .required("Checking time is required")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid checking time"),
  checkoutTime: Yup.string()
    .required("Checkout time is required")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid checkout time"),
  amenities: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string().required(),
        checked: Yup.boolean(),
      })
    )
    .test(
      "at-least-one-checked",
      "At least one amenity must be checked",
      (amenities) => amenities.some((amenity) => amenity.checked)
    ),
  files: Yup.array()
    .of(
      Yup.mixed()
        .required("A file is required")
        .test("file-check", "Invalid file", (value) => {
          if (value instanceof File) {
            const validSize = value.size <= FILE_SIZE_LIMIT;
            const validFormat = SUPPORTED_FORMATS.includes(value.type);
            return validSize && validFormat;
          }
          return true;
        })
    )
    .max(1, "You can only upload one file"),
});

const HotelPolicyForm = ({ initialValues, onPrev, onSubmit }) => {
  const [fileProgress, setFileProgress] = useState({});
  const [loading, setLoading] = useState(false);
  // const formik = useFormik({
  //   initialValues: initialValues,
  //   validationSchema: HotelPolicyValidationSchema,
  //   onSubmit: async (values) => {
  //     setLoading(true);
  //     const hotelID = localStorage.getItem("WEMOVE_HOTELID") || "";
  //     const payloadBody = new FormData();
  //     payloadBody.append("hotelId", hotelID);
  //     payloadBody.append("checkInTime", values.checkingTime);
  //     payloadBody.append("checkOutTime", values.checkoutTime);
  //     const amenities = values.amenities.map((amenity) => ({
  //       name: amenity.name,
  //       status: amenity.checked,
  //     }));
  //     payloadBody.append("amenities", JSON.stringify(amenities));
  //     payloadBody.append("hotel_license", values.files[0]);

  //     if (values._id) {
  //       const { data, statusCode, error, success } = await apiCall(
  //         `${ENDPOINTS.HOTEL_POLICY}/${hotelID}`,
  //         "PUT",
  //         {
  //           body: payloadBody,
  //           headers: {
  //             "Content-Type": "multipart/form-data",
  //             Authorization: `Bearer ${
  //               JSON.parse(localStorage.getItem("WEMOVE_TOKEN")).accessToken
  //             }`,
  //           },
  //         }
  //       );
  //       if (success) {
  //         onSubmit(values);
  //       }
  //     } else {
  //       const { data, statusCode, error, success } = await apiCall(
  //         ENDPOINTS.HOTEL_POLICY,
  //         "POST",
  //         {
  //           body: payloadBody,
  //           headers: {
  //             "Content-Type": "multipart/form-data",
  //             Authorization: `Bearer ${
  //               JSON.parse(localStorage.getItem("WEMOVE_TOKEN")).accessToken
  //             }`,
  //           },
  //         }
  //       );
  //       if (success) {
  //         localStorage.removeItem("WEMOVE_USER");
  //         localStorage.removeItem("WEMOVE_HOTELID");
  //         localStorage.removeItem("WEMOVE_TOKEN");
  //         onSubmit(values);
  //       }
  //     }
  //   },
  // });

  // console.log("policy intial state:", formik.values);

  const formik = useFormik({
    initialValues,
    validationSchema: HotelPolicyValidationSchema,
    onSubmit: async (values) => {
      setLoading(true);

      try {
        const hotelID = localStorage.getItem("WEMOVE_HOTELID") || "";
        const tokenData = localStorage.getItem("WEMOVE_TOKEN");

        if (!hotelID || !tokenData) {
          throw new Error("Missing authentication details");
        }

        const { accessToken } = JSON.parse(tokenData);

        const payloadBody = new FormData();
        payloadBody.append("hotelId", hotelID);
        payloadBody.append("checkInTime", values.checkingTime);
        payloadBody.append("checkOutTime", values.checkoutTime);

        const amenities = values.amenities.map((amenity) => ({
          name: amenity.name,
          status: amenity.checked,
        }));

        payloadBody.append("amenities", JSON.stringify(amenities));
        payloadBody.append("hotel_license", values.files[0]);

        const url = values._id
          ? `${ENDPOINTS.HOTEL_POLICY}/${hotelID}`
          : ENDPOINTS.HOTEL_POLICY;

        const method = values._id ? "PUT" : "POST";

        const { success, error } = await apiCall(url, method, {
          body: payloadBody,
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!success) {
          throw new Error(error || "Hotel policy request failed");
        }

        // Clear auth data only on successful CREATE
        if (!values._id) {
          localStorage.removeItem("WEMOVE_USER");
          localStorage.removeItem("WEMOVE_HOTELID");
          localStorage.removeItem("WEMOVE_TOKEN");
        }

        onSubmit(values);
      } catch (err) {
        console.error("Hotel policy submit failed:", err);

        formik.setStatus(
          err instanceof Error ? err.message : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    },
  });

  const [fileComponentsCount, setFileComponentsCount] = useState(3); // Default to 3 components
  const [amenitiesCount, setAmenitiesCount] = useState(9); // Default to 3 components

  // const [tabBarData, setTabBarData] = useState([{ name: 'Standard room', status: true }, { name: 'Luxury room', status: false }]);

  // const handleFileChange = (event, index) => {
  //   const files = event.target.value; // Get the files from the input
  //   console.log(files)
  //   if (!files || files.length === 0) {
  //     console.log("No files found");
  //     return;
  //   }

  //   const currentFiles = formik.values.files || []; // Ensure initial value is an empty array

  //   // Only take the first file, even if multiple are selected
  //   const updatedFiles = [...currentFiles.slice(0, index), files[0], ...currentFiles.slice(index + 1)];

  //   // Update the Formik state with only the first file
  //   formik.setFieldValue('files', updatedFiles);
  // };

  const handleFilesChange = (newFiles) => {
    formik.setFieldValue("files", [...newFiles]);
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
    // console.log("removeFile", fileName, index);
    const files = formik.values.files;
    formik.setFieldValue("files", [
      ...files.slice(0, index),
      ...files.slice(index + 1),
    ]);
    setFileProgress((prev) => {
      const { [fileName]: removed, ...rest } = prev;
      return rest;
    });
  };

  return (
    <form className={styles.form} onSubmit={formik.handleSubmit}>
      {/* <div className={styles.formBoxBorder}> */}

      <div className={styles.formFieldsContainer}>
        <div className={styles.doubleFormFieldsBox}>
          <CustomTimeInput
            required={true}
            id={"checkingTime"}
            name="checkingTime"
            label="Checking Time"
            value={formik.values.checkingTime}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            boxStyle={{ width: "50%" }}
            error={formik.errors?.checkingTime}
            touched={formik.touched?.checkingTime}
          />

          <CustomTimeInput
            required={true}
            id={"checkoutTime"}
            name="checkoutTime"
            label="Checkout Time"
            value={formik.values.checkoutTime}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            boxStyle={{ width: "50%" }}
            error={formik.errors?.checkoutTime}
            touched={formik.touched?.checkoutTime}
          />
        </div>

        <div className={styles.amenitiesContainer}>
          <div className={styles.dragDropLabelBox}>
            <CustomLabel
              labelText={"Select Amenities"}
              htmlFor="label"
              required={true}
            />
            {/* <span><p>Add more</p></span> */}
          </div>

          <div className={styles.amenitiesWrapper}>
            {formik.values.amenities?.map((amenity, index) => (
              <div className={styles.item} key={index}>
                <CustomCheckBox
                  label={amenity?.name || "checkbox"}
                  // error={formik.errors?.amenities[index]?.name}
                  onChange={(e) =>
                    formik.setFieldValue(
                      `amenities[${index}].checked`,
                      e.target.checked
                    )
                  }
                  name={`amenities[${index}].name`}
                  checked={amenity.checked}
                  // checked={formik.values.hotelPolicy?.amenities[index]}
                  variant="grey"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Drag and Drop Components Wrapper */}
        <div className={styles.dragDropWrapper}>
          <div className={styles.dragDropLabelBox}>
            {/* <label htmlFor="customdragDrop"><p>Upload Policy Document</p></label> */}
            <CustomLabel labelText={"Upload Policy Document"} required={true} />
          </div>

          <FileUpload onFilesChange={handleFilesChange} accept={".pdf"} />
          {formik.values.files && (
            <FilesList
              files={formik.values.files}
              fileProgress={fileProgress}
              removeFile={removeFile}
              minRequiredFiles={1}
            />
          )}
          {/* <div className={styles.dragDropBox}>
            Drag and Drop Components
            Add your drag and drop components here
            Dynamically render CustomDragAndDrop components

          </div> */}
        </div>
      </div>

      {/* </div> */}
      <div className={styles.formSubmitBtn}>
        <CustomButton
          // buttonText={initialValues._id ? "Update" : "Continue"}
          type={"submit"}
          buttonSize={"medium"}
          disabled={loading}
          buttonText={
            loading ? (
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

export default HotelPolicyForm;
