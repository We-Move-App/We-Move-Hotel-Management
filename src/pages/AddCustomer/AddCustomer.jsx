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

// Constants (reuse your supported formats & size limit)
const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5 MB
const SUPPORTED_FORMATS = [
  "image/jpg",
  "image/jpeg",
  "image/png",
  "application/pdf",
];

const customerValidationSchema = Yup.object().shape({
  customerName: Yup.string()
    .required("Customer Name is required")
    .min(2, "Customer Name must be at least 2 characters")
    .max(50, "Customer Name cannot exceed 50 characters"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  mobile: Yup.string()
    .required("Mobile number is required")
    .matches(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),

  checkInDate: Yup.date()
    .required("Check-in date is required")
    .typeError("Check-in date is invalid"),

  checkOutDate: Yup.date()
    .required("Check-out date is required")
    .typeError("Check-out date is invalid")
    .min(
      Yup.ref("checkInDate"),
      "Check-out date cannot be before check-in date"
    ),
  isAdult: Yup.string().required("Number of adults is required"),
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
    .test("file-count", "At least 1 file is required", function (value) {
      const count = value?.length || 0;
      return count >= 1;
    }),
});
const AddCustomer = () => {
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
    validationSchema: customerValidationSchema,
    onSubmit: async (values) => {
      const hotelId = localStorage.getItem("WEMOVE_HOTELID");
      if (!hotelId) {
        console.error("Hotel ID not found in localStorage");
        return;
      }

      // Step 1: Fetch roomTypeId
      let roomTypeId = "";
      try {
        const roomResponse = await apiCall(
          `/hotel-room/?hotelId=${hotelId}&roomType=${values.roomType}`,
          "GET"
        );

        const sampleRoom = roomResponse?.data?.data?.sampleRoom;
        console.log("Room response:", roomResponse);
        if (sampleRoom?._id) {
          roomTypeId = sampleRoom._id;
          console.log("Retrieved roomTypeId:", roomTypeId);
        } else {
          console.error(
            "sampleRoom not found in API response",
            roomResponse?.data
          );
        }
      } catch (err) {
        console.error("Error fetching room type ID:", err);
        return;
      }

      // Step 2: Prepare booking payload
      const formData = new FormData();

      const formatDate = (date) => {
        if (!(date instanceof Date)) {
          date = new Date(date);
        }
        return date.toLocaleDateString("en-CA");
      };

      const checkInDateStr = formatDate(new Date(values.checkInDate));
      const checkOutDateStr = formatDate(new Date(values.checkOutDate));

      formData.append("hotelId", hotelId);
      formData.append("roomTypeId", roomTypeId);
      formData.append("checkInDate", checkInDateStr);
      formData.append("checkOutDate", checkOutDateStr);
      formData.append("totalAmount", "55489");
      formData.append("paymentStatus", "PAID");
      formData.append("noOfAdults", values.isAdult ? "1" : "0");
      formData.append("noOfKids", values.isAdult ? "0" : "1");
      formData.append("noOfRoom", "1");

      const user = {
        name: values.customerName,
        age: 32,
        gender: "male",
        email: values.email,
        phoneNumber: values.mobile,
      };
      formData.append("user", JSON.stringify(user));

      values.files.forEach((file) => {
        formData.append("identity_card", file);
      });

      // Step 3: Send booking request
      try {
        const bookingResponse = await apiCall(ENDPOINTS.ADD_GUEST, "POST", {
          body: formData,
        });

        if (bookingResponse.success && bookingResponse.statusCode === 201) {
          console.log("Booking successful:", bookingResponse.data);
          navigate("/dashboard/booking-management");
        } else {
          console.error("Booking failed:", bookingResponse.message);
        }
      } catch (err) {
        console.error("Booking error:", err);
      }
    },
  });
  const [fileProgress, setFileProgress] = useState({});

  const [options, setOptions] = useState([
    { label: "Adult", value: true },
    { label: "Kid", value: false },
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
        Booking Management {">"}{" "}
        <span className={styles.lightText}>Add New Customer</span>{" "}
      </p>

      <form className={styles.form} onSubmit={formik.handleSubmit}>
        <div className={styles.formFieldsContainerWrapper}>
          <p className={styles.title}>Guest Details</p>

          <div className={styles.formFieldsContainer}>
            <div className={styles.formLeftBox}>
              <CustomInput
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                label="Customer Name"
                type="text"
                name="customerName"
                required
                error={formik.errors?.customerName}
                touched={formik.touched?.customerName}
              />
              <CustomInput
                label="Email Id"
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
                label="Mobile Number"
                type="number"
                name="mobile"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                required
                error={formik.errors?.mobile}
                touched={formik.touched?.mobile}
              />
              <CustomInput
                label="Room Type"
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
                    <CustomLabel labelText={"Checkin"} />
                    <div className={styles.customDatePickerBox}>
                      <CustomDatePicker
                        value={formik.values.checkInDate}
                        onChange={handleCheckInDate}
                      />
                    </div>
                  </div>

                  <div className={styles.multiInputs}>
                    <CustomLabel labelText={"Checkout"} />
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
                        options={options}
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
              <p className={styles.title}>Add ID Card</p>
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
            buttonText={"Book"}
          />
        </div>
      </form>
    </div>
  );
};

export default AddCustomer;
