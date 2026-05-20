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
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setSubmitting(true);

        // console.log("FORM VALUES =>", values);

        const hotelId = localStorage.getItem("WEMOVE_HOTELID");

        if (!hotelId) {
          setSnackbar({
            open: true,
            message: "Hotel ID missing. Please login again.",
            severity: "error",
          });

          return;
        }

        // ==================================================
        // FETCH ROOM TYPE
        // ==================================================

        let roomTypeId = "";

        try {
          const roomResponse = await apiCall(
            `/hotel-room/?hotelId=${hotelId}&roomType=${values.roomType}`,
            "GET",
          );

          console.log("ROOM RESPONSE =>", roomResponse);

          const sampleRoom = roomResponse?.data?.data?.sampleRoom;

          if (!sampleRoom?._id) {
            setSnackbar({
              open: true,
              message: "Room type not found",
              severity: "error",
            });

            return;
          }

          roomTypeId = sampleRoom._id;
        } catch (err) {
          console.error("ROOM FETCH ERROR =>", err);

          setSnackbar({
            open: true,
            message: "Failed to fetch room type",
            severity: "error",
          });

          return;
        }

        // ==================================================
        // PREPARE FORM DATA
        // ==================================================

        const fd = new FormData();

        const formatDate = (date) => {
          if (!(date instanceof Date)) {
            date = new Date(date);
          }

          return date.toLocaleDateString("en-CA");
        };

        fd.append("hotelId", hotelId);
        fd.append("roomTypeId", roomTypeId);

        fd.append("checkInDate", formatDate(values.checkInDate));

        fd.append("checkOutDate", formatDate(values.checkOutDate));

        fd.append("totalAmount", "55489");

        fd.append("paymentStatus", "PAID");

        fd.append("noOfAdults", values.isAdult ? "1" : "0");

        fd.append("noOfKids", values.isAdult ? "0" : "1");

        fd.append("noOfRoom", "1");

        // ==================================================
        // USER OBJECT
        // ==================================================

        const user = {
          name: values.customerName,
          age: 32,
          gender: "male",
          email: values.email,
          phoneNumber: values.mobile,
        };

        fd.append("user", JSON.stringify(user));

        // ==================================================
        // FILES
        // ==================================================

        (values.files || []).forEach((file) => {
          fd.append("identity_card", file);
        });

        // ==================================================
        // DEBUG FORM DATA
        // ==================================================

        for (let pair of fd.entries()) {
          console.log(pair[0], pair[1]);
        }

        // ==================================================
        // API CALL
        // ==================================================

        const bookingResponse = await apiCall(ENDPOINTS.ADD_GUEST, "POST", {
          body: fd,
        });

        console.log("BOOKING RESPONSE =>", bookingResponse);

        // ==================================================
        // SUCCESS
        // ==================================================

        if (bookingResponse?.success && bookingResponse?.statusCode === 201) {
          setSnackbar({
            open: true,
            message: "Booking successful!",
            severity: "success",
          });

          setTimeout(() => {
            navigate("/dashboard/booking-management");
          }, 700);
        } else {
          const message =
            bookingResponse?.message ||
            bookingResponse?.error?.message ||
            "Booking failed";

          setSnackbar({
            open: true,
            message,
            severity: "error",
          });
        }
      } catch (err) {
        console.error("BOOKING ERROR =>", err);

        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong";

        setSnackbar({
          open: true,
          message,
          severity: "error",
        });
      } finally {
        setSubmitting(false);
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
            type="submit"
            buttonSize="medium"
            disabled={formik.isSubmitting}
            buttonText={
              formik.isSubmitting ? "Submitting..." : t("form.submit")
            }
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
