import React, { useEffect, useState } from "react";
import styles from "./add-bank-details.module.css";
import { LuFileUp } from "react-icons/lu";

// Layouts
import ProfileVerificationLayout from "../../../layouts/ProfileVerificationLayout/ProfileVerificationLayout";

// Custom Components
import FormHeader from "../../reusable/custom/FormHeader/FormHeader";
import CustomInput from "../../reusable/custom/Form-Fields/CInput/CustomInput";
import CustomButton from "../../reusable/custom/CButton/CustomButton";

// Formik:[For form Validation]
import { useFormik } from "formik";
import * as Yup from "yup";
import CustomFileInput from "../../reusable/custom/Form-Fields/CFileInput/CustomFileInput";

// Hooks
import useNavigation from "../../../hooks/useNavigation";
import apiCall from "../../../hooks/apiCall";
import { ENDPOINTS } from "../../../utils/apiEndpoints";
import { tokenFromLocalStorage } from "../../../utils/helperFunctions";
import Loader from "../../reusable/Loader/Loader";
import callApi from "../../../hooks/callApi";
import CustomModal from "../../reusable/custom/CModal/CustomModal";

const FILE_SIZE = 2 * 1024 * 1024; // 2MB
const SUPPORTED_FORMATS = [
  "application/pdf",
  "image/png",
  "image/jpg",
  "image/jpeg",
];

const BankDetailsSchema = Yup.object().shape({
  bankName: Yup.string()
    .matches(
      /^[a-zA-Z\s]*$/,
      "Bank Name should only contain alphabets and spaces"
    ) // Only alphabets and spaces
    .test(
      "noSpaceAtStart",
      "The first character cannot be a space",
      (value) => value?.trim().charAt(0) !== " "
    ) // No space at the start
    .required("Bank Name is required"),

  bankAccountNumber: Yup.string()
    // .matches(/^\d+$/, 'Bank Account Number should only contain numbers') // Ensure only numbers
    .min(11, "Bank Account Number must be at least 11 digits")
    .required("Bank Account Number is required"),

  accountHolderName: Yup.string()
    .matches(
      /^[a-zA-Z\s]*$/,
      "Account Holder Name should only contain alphabets and spaces"
    ) // Only alphabets and spaces
    .test(
      "noSpaceAtStart",
      "The first character cannot be a space",
      (value) => value?.trim().charAt(0) !== " "
    ) // No space at the start
    .required("Account Holder Name is required"),

  bankAccountDetails: Yup.mixed()
    .nullable()
    // .required('A file is required')
    .test("fileSize", "File is too large", (value) => {
      return !value || (value && value.size <= FILE_SIZE);
    })
    .test("fileFormat", "Unsupported Format", (value) => {
      return !value || SUPPORTED_FORMATS.includes(value.type);
    }),
});
const AddBankDetails = () => {
  const { goTo } = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  const formik = useFormik({
    initialValues: {
      bankName: "",
      bankAccountNumber: "",
      accountHolderName: "",
      bankAccountDetails: "",
    },
    validationSchema: BankDetailsSchema,

    onSubmit: async (values) => {
      // console.log('Form submitted');
      if (Object.keys(formik.errors).length === 0) {
        // console.log('Form submitted successfully', values);
        try {
          if (values.id) {
            goTo("/hotel-registration");
          } else {
            const payloadBody = new FormData();
            payloadBody.append("bankName", values.bankName);
            payloadBody.append("accountNumber", values.bankAccountNumber);
            payloadBody.append("accountHolderName", values.accountHolderName);
            payloadBody.append("bank_detail", values.bankAccountDetails);
            // payloadBody.append('ifscCode', 'SBIN0005678');
            // payloadBody.append('bankAccountDetails', values.bankAccountDetails);

            const { data, statusCode, error, success } = await apiCall(
              ENDPOINTS.HOTEL_BANK_DETAILS,
              "POST",
              {
                body: payloadBody,
                // headers: {
                //     'Content-Type': 'multipart/form-data',
                //     Authorization: `Bearer ${JSON.parse(localStorage.getItem('WEMOVE_TOKEN')).accessToken}`
                // }
              }
            );
            if (statusCode === 200 && success) {
              //   console.log(data);
              goTo("/hotel-registration");
            }
          }
        } catch (err) {
          console.error("Error during API call:", err);
        }
      } else {
        // console.log("Form has errors:", formik.errors);
      }
      // If successfully submitted
      // goTo('/hotel-registration')
    },
  });

  const getData = async (token) => {
    const { data, statusCode, error, success } = await apiCall(
      ENDPOINTS.HOTEL_BANK_DETAILS,
      "GET",
      {}
    );
    return { data, statusCode, error, success };
  };

  useEffect(() => {
    // Fetching bank details if available

    const token = tokenFromLocalStorage();
    if (token) {
      getData(token)
        .then(({ data, statusCode, error, success }) => {
          if (statusCode === 200 && success) {
            // console.log(data);
            const bankData = data.data.bank;
            const {
              bankName,
              accountNumber,
              accountHolderName,
              bankDocs: bank_detail,
              _id,
            } = bankData;

            formik.setValues({
              bankName: bankName || "",
              bankAccountNumber: accountNumber || "",
              accountHolderName: accountHolderName || "",
              bankAccountDetails: bank_detail || "",
            });

            if (_id) {
              formik.setFieldValue("id", _id);
            }
          } else {
            console.error("Error fetching hotel details:", error);
          }
        })
        .finally(() => {
          setIsLoading(false); // Set loading to false after data is fetched
        });
    } else {
      //   console.log("No hotel details available in local storage");
      setIsLoading(false);
    }
  }, []);

  const handleModalSubmit = () => {
    formik.handleSubmit();
    setOpenModal(false);
  };

  const verificationModal = () => {
    return (
      <CustomModal isOpen={openModal} onClose={() => setOpenModal(false)}>
        <div className={styles.modal}>
          <p className={styles.text}>
            Bank details cannot be updated until approved by the admin.
          </p>
          <div className={styles.modalButtonBox}>
            <CustomButton
              buttonText={"Cancel"}
              buttonSize={"small"}
              onClick={() => setOpenModal(false)}
            />
            <CustomButton
              buttonText={"Continue"}
              buttonSize={"small"}
              onClick={handleModalSubmit}
            />
          </div>
        </div>
      </CustomModal>
    );
  };

  if (isLoading) {
    return (
      <div className={styles.formContainer}>
        <Loader />
      </div>
    ); // Loading state indicator
  }

  return (
    <div className={styles.formContainer}>
      {openModal && verificationModal()}
      <FormHeader
        heading={"Add Bank Details"}
        subheading={"Welcome to We Move All! Please login to your account."}
      />

      <form onSubmit={formik.handleSubmit} className={styles.form}>
        {/* Add your form fields here */}
        <div className={styles.formFieldsContainer}>
          <CustomInput
            label={"Bank Name"}
            required={true}
            name="bankName"
            isDisabled={formik.values?.id}
            value={formik.values.bankName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            touched={formik.touched.bankName}
            error={formik.errors.bankName}
            // error={formik.touched.bankName && formik.errors.bankName}
          />
          <CustomInput
            label={"Bank Account Number"}
            required={true}
            name="bankAccountNumber"
            type="text"
            isDisabled={formik.values?.id}
            alphaNumeric={true}
            value={formik.values.bankAccountNumber}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            touched={formik.touched.bankAccountNumber}
            error={formik.errors.bankAccountNumber}
            // error={formik.touched.bankAccountNumber && formik.errors.bankAccountNumber}
          />
          <CustomInput
            label={"Account Holder Name"}
            required={true}
            name="accountHolderName"
            isDisabled={formik.values?.id}
            value={formik.values.accountHolderName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            touched={formik.touched.accountHolderName}
            error={formik.errors.accountHolderName}
            // error={formik.touched.accountHolderName && formik.errors.accountHolderName}
          />

          <CustomFileInput
            label={"Bank Account Details"}
            placeholder={"Upload file"}
            onChange={formik.handleChange}
            isDisabled={formik.values?.id}
            value={formik.values.bankAccountDetails}
            accept={".pdf, .png, .jpg, .jpeg"}
            name={"bankAccountDetails"}
            icon={<LuFileUp />}
            touched={formik.touched.bankAccountDetails}
            error={formik.errors.bankAccountDetails}
          />
        </div>

        <div className={styles.formSubmitBtn}>
          {/* Submit Button */}
          <CustomButton
            buttonText={"Continue"}
            type={"button"}
            onClick={() => setOpenModal(true)}
            style={{ height: "70px" }}
          />
          <div className={styles.skipBox}>
            <p>OR</p>
            <p onClick={() => goTo("/hotel-registration")}>Skip</p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddBankDetails;
