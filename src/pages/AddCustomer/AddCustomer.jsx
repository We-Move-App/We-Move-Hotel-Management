import React, { useState } from "react";
import styles from "./add-customer.module.css";
import CustomInput from "../../components/reusable/custom/Form-Fields/CInput/CustomInput";
import CustomButton from "../../components/reusable/custom/CButton/CustomButton";
import DragDrop from "../../components/reusable/custom/D&DFileUpload/DragDrop";
import CustomDatePicker from "../../components/reusable/custom/Form-Fields/CustomDatePicker/CustomDatePicker";
import CustomSelect from "../../components/reusable/custom/CSelect/CustomSelect";
import CustomLabel from "../../components/reusable/custom/CLabel/CustomLabel";
import SelectInput from "../../components/reusable/custom/CSelect/SelectInput";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FileUpload } from "../../components/reusable/custom/Form-Fields/CDragAndDrop/CustomDragAndDrop";
import FilesList from "../../components/reusable/FilesList/FilesList";
import apiCall from "../../hooks/apiCall";
import { ENDPOINTS } from "../../utils/apiEndpoints";
import { useNavigate } from "react-router-dom";
import SnackbarNotification from "../../components/reusable/Snackbar-Notification/SnackbarNotification";
import { useTranslation } from "react-i18next";
import { customerValidationSchema } from "./validation";

// Constants (reuse your supported formats & size limit)
const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5 MB
const SUPPORTED_FORMATS = [
  "image/jpg",
  "image/jpeg",
  "image/png",
  "application/pdf",
];

const AddCustomer = () => {
  const { t } = useTranslation("addCustomer");
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      customerName: "",
      email: "",
      mobile: "",
      checkInDate: "",
      checkOutDate: "",
      isAdult: "",
      roomType: "",
      files: [],
    },
    validationSchema: customerValidationSchema(t),
    // onSubmit: async (values) => {
    //   const hotelId = localStorage.getItem("WEMOVE_HOTELID");
    //   if (!hotelId) {
    //     console.error("Hotel ID not found in localStorage");
    //     return;
    //   }

    //   // Step 1: Fetch roomTypeId
    //   let roomTypeId = "";
    //   try {
    //     const roomResponse = await apiCall(
    //       `/hotel-room/?hotelId=${hotelId}&roomType=${values.roomType}`,
    //       "GET"
    //     );

    //     const sampleRoom = roomResponse?.data?.data?.sampleRoom;
    //     console.log("Room response:", roomResponse);
    //     if (sampleRoom?._id) {
    //       roomTypeId = sampleRoom._id;
    //       console.log("Retrieved roomTypeId:", roomTypeId);
    //     } else {
    //       console.error(
    //         "sampleRoom not found in API response",
    //         roomResponse?.data
    //       );
    //     }
    //   } catch (err) {
    //     console.error("Error fetching room type ID:", err);
    //     return;
    //   }

    //   // Step 2: Prepare booking payload
    //   const formData = new FormData();

    //   const formatDate = (date) => {
    //     if (!(date instanceof Date)) {
    //       date = new Date(date);
    //     }
    //     return date.toLocaleDateString("en-CA");
    //   };

    //   const checkInDateStr = formatDate(new Date(values.checkInDate));
    //   const checkOutDateStr = formatDate(new Date(values.checkOutDate));

    //   formData.append("hotelId", hotelId);
    //   formData.append("roomTypeId", roomTypeId);
    //   formData.append("checkInDate", checkInDateStr);
    //   formData.append("checkOutDate", checkOutDateStr);
    //   formData.append("totalAmount", "55489");
    //   formData.append("paymentStatus", "PAID");
    //   formData.append("noOfAdults", values.isAdult ? "1" : "0");
    //   formData.append("noOfKids", values.isAdult ? "0" : "1");
    //   formData.append("noOfRoom", "1");

    //   const user = {
    //     name: values.customerName,
    //     age: 32,
    //     gender: "male",
    //     email: values.email,
    //     phoneNumber: values.mobile,
    //   };
    //   formData.append("user", JSON.stringify(user));

    //   values.files.forEach((file) => {
    //     formData.append("identity_card", file);
    //   });

    //   // Step 3: Send booking request
    //   try {
    //     const bookingResponse = await apiCall(ENDPOINTS.ADD_GUEST, "POST", {
    //       body: formData,
    //     });

    //     if (bookingResponse.success && bookingResponse.statusCode === 201) {
    //       console.log("Booking successful:", bookingResponse.data);
    //       navigate("/dashboard/booking-management");
    //     } else {
    //       console.error("Booking failed:", bookingResponse.message);
    //     }
    //   } catch (err) {
    //     console.error("Booking error:", err);
    //   }
    // },
    onSubmit: async (values) => {
      const hotelId = localStorage.getItem("WEMOVE_HOTELID");
      if (!hotelId) {
        setSnackbar({
          open: true,
          message: "Hotel ID missing. Please login again.",
          severity: "error",
        });
        return;
      }

      // Step 1: Fetch roomTypeId
      let roomTypeId = "";
      try {
        const roomResponse = await apiCall(
          `/hotel-room/?hotelId=${hotelId}&roomType=${values.roomType}`,
          "GET",
        );

        const sampleRoom = roomResponse?.data?.data?.sampleRoom;
        if (sampleRoom?._id) {
          roomTypeId = sampleRoom._id;
        } else {
          const msg =
            roomResponse?.message ||
            roomResponse?.data?.message ||
            "Room type not found";
          console.error(
            "sampleRoom not found in API response",
            roomResponse?.data,
          );
          setSnackbar({ open: true, message: msg, severity: "error" });
          return;
        }
      } catch (err) {
        // network / unexpected error
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch room type. Please try again.";
        setSnackbar({ open: true, message, severity: "error" });
        return;
      }

      // Step 2: Prepare booking payload
      const fd = new FormData();

      const formatDate = (date) => {
        if (!(date instanceof Date)) date = new Date(date);
        return date.toLocaleDateString("en-CA"); // YYYY-MM-DD
      };

      const checkInDateStr = formatDate(values.checkInDate);
      const checkOutDateStr = formatDate(values.checkOutDate);

      fd.append("hotelId", hotelId);
      fd.append("roomTypeId", roomTypeId);
      fd.append("checkInDate", checkInDateStr);
      fd.append("checkOutDate", checkOutDateStr);
      fd.append("totalAmount", "55489");
      fd.append("paymentStatus", "PAID");
      fd.append("noOfAdults", values.isAdult ? "1" : "0");
      fd.append("noOfKids", values.isAdult ? "0" : "1");
      fd.append("noOfRoom", "1");

      const user = {
        name: values.customerName,
        age: 32,
        gender: "male",
        email: values.email,
        phoneNumber: values.mobile,
      };
      fd.append("user", JSON.stringify(user));

      (values.files || []).forEach((file) => {
        fd.append("identity_card", file); // same key as before
      });

      // Step 3: Send booking request
      try {
        const bookingResponse = await apiCall(ENDPOINTS.ADD_GUEST, "POST", {
          body: fd,
        });

        const success = bookingResponse?.success ?? false;
        const status = bookingResponse?.statusCode;
        // const serverMessage =
        //   bookingResponse?.message || bookingResponse?.data?.message || "";

        if (success && status === 201) {
          setSnackbar({
            open: true,
            message: "Booking successful!",
            severity: "success",
          });
          setTimeout(() => {
            navigate("/dashboard/booking-management");
          }, 700);
        } else {
          const msg = bookingResponse?.error?.message || "Booking failed.";

          console.error("Booking failed:", bookingResponse);
          setSnackbar({ open: true, message: msg, severity: "error" });
        }
      } catch (err) {
        // network / unexpected error
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Booking failed due to network error. Try again.";
        console.error("Booking error:", err);
        setSnackbar({ open: true, message, severity: "error" });
      }
    },
  });
  const [fileProgress, setFileProgress] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // 'success' | 'error' | 'info' | 'warning'
  });

  const handleCloseSnackbar = () => {
    setSnackbar((s) => ({ ...s, open: false }));
  };

  const [options, setOptions] = useState([
    { label: "form.adult", value: true },
    { label: "form.kid", value: false },
  ]);

  const handleFilesChange = (newFiles) => {
    const currentFiles = formik.values.files;
    formik.setFieldValue("files", [...currentFiles, ...newFiles]);
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
    console.log("removeFile", fileName, index);
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

  const handleCheckInDate = (date) => {
    formik.setFieldValue("checkInDate", date);
  };
  const handleCheckOutDate = (date) => {
    formik.setFieldValue("checkOutDate", date);
  };

  const handelSelect = () => {
    const value = !formik.values.isAdult;
    formik.setFieldValue("isAdult", value);
  };

  return (
    <div className={styles.addCustomer}>
      <p className={styles.breadcrumb}>
        {t("breadcrumb.booking")} {">"}{" "}
        <span className={styles.lightText}>
          {t("breadcrumb.addCustomer")}
        </span>{" "}
      </p>

      <form className={styles.form} onSubmit={formik.handleSubmit}>
        <div className={styles.formFieldsContainerWrapper}>
          <p className={styles.title}>{t("guestDetails.title")}</p>

          <div className={styles.formFieldsContainer}>
            <div className={styles.formLeftBox}>
              <CustomInput
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                label={t("form.customerName")}
                type="text"
                name="customerName"
                required
                error={formik.errors?.customerName}
                touched={formik.touched?.customerName}
              />
              <CustomInput
                label={t("form.email")}
                type="email"
                takeSpecialChar={true}
                name="email"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                required
                error={formik.errors?.email}
                touched={formik.touched?.email}
              />
              <CustomInput
                label={t("form.mobile")}
                type="number"
                name="mobile"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                required
                error={formik.errors?.mobile}
                touched={formik.touched?.mobile}
              />
              <CustomInput
                label={t("form.roomType")}
                type="text"
                name="roomType"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                required
                error={formik.errors?.roomType}
                touched={formik.touched?.roomType}
              />
              <div>
                {/* <div className={styles.checkInOutTimeAndPersonCount}> */}

                <div className={styles.multipleInputsContainer}>
                  <div className={styles.multiInputs}>
                    <CustomLabel labelText={t("form.checkIn")} />
                    <div className={styles.customDatePickerBox}>
                      <CustomDatePicker
                        value={formik.values.checkInDate}
                        onChange={handleCheckInDate}
                      />
                    </div>
                  </div>

                  <div className={styles.multiInputs}>
                    <CustomLabel labelText={t("form.checkOut")} />
                    <div className={styles.customDatePickerBox}>
                      <CustomDatePicker
                        value={formik.values.checkOutDate}
                        onChange={handleCheckOutDate}
                      />
                    </div>
                  </div>
                  <div className={styles.multiInputs}>
                    <CustomLabel labelText={""} />
                    <div className={styles.customDatePickerBox}>
                      {/* <CustomDatePicker /> */}
                      <SelectInput
                        options={options.map((opt) => ({
                          ...opt,
                          label: t(opt.label),
                        }))}
                        placeholder={t("form.select")}
                        value={formik?.values.isAdult}
                        onChange={handelSelect}
                      />
                    </div>
                  </div>
                </div>
                {formik.errors?.checkInDate && (
                  <div className={styles.error}>
                    {formik.errors?.checkInDate}
                  </div>
                )}
                {formik.errors?.checkOutDate && (
                  <div className={styles.error}>
                    {formik.errors?.checkOutDate}
                  </div>
                )}
                {formik.errors?.isAdult && (
                  <div className={styles.error}>{formik.errors?.isAdult}</div>
                )}
              </div>
            </div>
            <div className={styles.formRightBox}>
              <p className={styles.title}>{t("idCard.title")}</p>
              <FileUpload
                onFilesChange={handleFilesChange}
                accept={".png, .jpg, .JPEG"}
              />
              {formik.values.files && (
                <FilesList
                  files={formik.values.files}
                  fileProgress={fileProgress}
                  removeFile={removeFile}
                  minRequiredFiles={1}
                />
              )}
            </div>
          </div>
        </div>
        <div className={styles.formSubmitBtn}>
          <CustomButton
            type={"submit"}
            buttonSize={"medium"}
            buttonText={t("form.submit")}
          />
        </div>
        <SnackbarNotification
          snackbar={snackbar}
          handleClose={handleCloseSnackbar}
        />
      </form>
    </div>
  );
};

export default AddCustomer;
