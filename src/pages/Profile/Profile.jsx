import React, { useEffect, useState } from "react";
import styles from "./profile.module.css";
import CustomInput from "../../components/reusable/custom/Form-Fields/CInput/CustomInput";
// import CustomButton from "../../components/reusable/custom/CButton/CustomButton";
import images from "../../assets/images";
// import CustomDownloadButton from "../../components/reusable/custom/CDownloadButton/CustomDownloadButton";
import { LuFileDown } from "react-icons/lu";
import apiCall from "../../hooks/apiCall";
import { ENDPOINTS } from "../../utils/apiEndpoints";
import { tokenFromLocalStorage } from "../../utils/helperFunctions";
import { useFormik } from "formik";
import * as Yup from "yup";
import Loader from "../../components/reusable/Loader/Loader";
import CustomLabel from "../../components/reusable/custom/CLabel/CustomLabel";
import { FileUpload } from "../../components/reusable/custom/Form-Fields/CDragAndDrop/CustomDragAndDrop";
import FilesList from "../../components/reusable/FilesList/FilesList";
import CustomFileInput from "../../components/reusable/custom/Form-Fields/CFileInput/CustomFileInput";
import CustomBtn from "../../components/reusable/Custom-Button/CustomBtn";
import CustomDownloadButton from "../../components/reusable/custom/Custom-Download-Button/CustomDownloadButton";
import { BadgeCheck } from "lucide-react";
import { BankDetailsSchema } from "./validation";
import { useTranslation } from "react-i18next";

const FILE_SIZE = 2 * 1024 * 1024; // 2MB
const SUPPORTED_FORMATS = ["application/pdf"];

// const BankDetailsSchema = Yup.object().shape({
//   bankName: Yup.string()
//     .matches(
//       /^[a-zA-Z\s]*$/,
//       "Bank Name should only contain alphabets and spaces"
//     ) // Only alphabets and spaces
//     .test(
//       "noSpaceAtStart",
//       "The first character cannot be a space",
//       (value) => value?.trim().charAt(0) !== " "
//     ) // No space at the start
//     .required("Bank Name is required"),

//   bankAccountNumber: Yup.string()
//     .matches(/^\d+$/, "Bank Account Number should only contain numbers") // Ensure only numbers
//     .required("Bank Account Number is required"),

//   accountHolderName: Yup.string()
//     .matches(
//       /^[a-zA-Z\s]*$/,
//       "Account Holder Name should only contain alphabets and spaces"
//     ) // Only alphabets and spaces
//     .test(
//       "noSpaceAtStart",
//       "The first character cannot be a space",
//       (value) => value?.trim().charAt(0) !== " "
//     ) // No space at the start
//     .required("Account Holder Name is required"),

//   bankAccountDetails: Yup.mixed()
//     .nullable()
//     // .required('A file is required')
//     .test("fileSize", "File is too large", (value) => {
//       return !value || (value && value.size <= FILE_SIZE);
//     })
//     .test("fileFormat", "Unsupported Format", (value) => {
//       return !value || SUPPORTED_FORMATS.includes(value.type);
//     }),
// });

const Profile = () => {
  const { t } = useTranslation("profile");
  // const token = tokenFromLocalStorage();
  const [loading, setLoading] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [bankId, setBankId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [user, setUser] = useState({
    userName: "",
    mobile: "",
    email: "",
    batchVerified: "",
    avatar: "",
    companyName: "",
    companyAddress: "",
  });

  const formik = useFormik({
    initialValues: {
      bankName: "",
      accountHolderName: "",
      bankAccountNumber: "",
      bankDocs: "",
    },
    validationSchema: BankDetailsSchema(t),
    onSubmit: async (values) => {
      setIsEdit(!isEdit);
      setLoading(true);

      const payloadForm = new FormData();
      const { bankName, bankAccountNumber, accountHolderName, bankDocs } =
        values;
      payloadForm.append("bankName", bankName);
      payloadForm.append("accountNumber", bankAccountNumber);
      payloadForm.append("accountHolderName", accountHolderName);
      payloadForm.append("bank_detail", bankDocs);

      if (bankId) {
        const { data, statusCode, error, success } = await apiCall(
          `${ENDPOINTS.HOTEL_BANK_DETAILS}/${bankId}`,
          "PUT",
          {
            body: payloadForm,
            // headers: {
            //     Authorization: `Bearer ${token}`
            // }
          },
        );

        if (success && statusCode === 200) {
          fetchUserBank();
          // setLoading(false)
        }
      } else {
        const { data, statusCode, error, success } = await apiCall(
          `${ENDPOINTS.HOTEL_BANK_DETAILS}`,
          "POST",
          {
            body: payloadForm,
            // headers: {
            //     Authorization: `Bearer ${token}`
            // }
          },
        );

        if (success && statusCode === 201) {
          fetchUserBank();
          // setLoading(false)
        }
      }

      setLoading(false);
    },
  });

  // const handleBankDetails = (event) => {
  //     const { name, value } = event.target;
  //     setBankDetails((prev) => ({
  //         ...prev,
  //         [name]: value,
  //     }));
  // };
  // const handleBankDetails = (eventOrName, value) => {
  //     if (typeof eventOrName === 'string') {
  //         // Called with (name, value)
  //         setBankDetails((prev) => ({
  //             ...prev,
  //             [eventOrName]: value,
  //         }));
  //     } else {
  //         // Called with (event)
  //         const { name, value } = eventOrName.target;
  //         setBankDetails((prev) => ({
  //             ...prev,
  //             [name]: value,
  //         }));
  //     }
  // };

  const fetchUserDetails = async () => {
    const { data, statusCode, error, success } = await apiCall(
      ENDPOINTS.PROFILE,
      "GET",
      {
        // headers: {
        //     Authorization: `Bearer ${token}`
        // }
      },
    );

    if (success && statusCode === 200) {
      // console.log("Data Profile:", data);
      const {
        email,
        phoneNumber,
        fullName,
        avatar,
        batchVerified,
        companyName,
        companyAddress,
      } = data?.data?.user;
      setUser((prev) => ({
        ...prev,
        userName: fullName || "Priya Dey Bhaumik",
        mobile: phoneNumber || "+91 8767760912",
        email: email || "priyadey.d@gmail.com",
        batchVerified: batchVerified || "",
        avatar: avatar?.url,
        companyName: companyName || "WeMove Pvt Ltd",
        companyAddress: companyAddress || "Kolkata, West Bengal",
      }));
    }
  };

  const handleFileChange = (file) => {
    const currentFormikValues = formik.values;
    formik.setValues({
      ...currentFormikValues,
      bankDocs: file?.target?.value,
    });
  };

  const fetchUserBank = async () => {
    const { data, statusCode, error, success } = await apiCall(
      ENDPOINTS.HOTEL_BANK_DETAILS,
      "GET",
      {
        // headers: {
        //     Authorization: `Bearer ${token}`
        // }
      },
    );

    if (success && statusCode === 200) {
      const { bankName, accountHolderName, accountNumber, _id, bankDocs } =
        data?.data?.bank;
      // console.log("bank Data :", data);
      formik.setValues({
        bankName: bankName || "",
        accountHolderName: accountHolderName || "",
        bankAccountNumber: accountNumber || "",
        bankDocs: bankDocs?.url ? encodeURI(bankDocs.url) : "", // or fetched file data if available
      });
      setBankId(_id);
      setLoading(false);
    } else {
      setIsEdit(true);
      setLoading(false);
      console.log("Bank not exists.");
    }
  };

  useEffect(() => {
    fetchUserDetails();
    fetchUserBank();
  }, []);

  return (
    <div className={styles.profileContainer}>
      <h1>{t("bankDetails.heading")}</h1>

      <div className={styles.contentContainer}>
        <div className={styles.personalDetailsContainer}>
          <div className={styles.profileImageBox}>
            <img
              src={user?.avatar || images.profileImage}
              className={styles.profileImage}
              alt="profile"
            />
          </div>
          <div className={styles.detailsBoxWrapper}>
            <p className={styles.detailsHeading}>
              {t("bankDetails.personalDetails")}
            </p>
            <div className={styles.detailsBox}>
              <span className={styles.nameBlock}>
                <p>{user?.userName}</p>
                {user?.batchVerified && (
                  <BadgeCheck
                    size={18}
                    color="#4CAF50"
                    title={t("bankDetails.verified")}
                  />
                )}
              </span>
              <p>{user?.mobile}</p>
              <p>{user?.email}</p>
            </div>
          </div>

          <div className={styles.detailsBoxWrapper}>
            <p className={styles.detailsHeading}>
              {t("bankDetails.companyDetails")}
            </p>
            <div className={styles.detailsBox}>
              <p>{user?.companyName}</p>
              <p>{user?.companyAddress}</p>
            </div>
          </div>
        </div>

        <div className={styles.bankSection}>
          <h2>{t("bankDetails.bankSection.heading")}</h2>
          {loading ? (
            <div>
              <Loader />
            </div>
          ) : (
            <div className={styles.formWrapper}>
              <form className={styles.form} onSubmit={formik.handleSubmit}>
                <div className={styles.formFieldsContainerWrapper}>
                  <div className={styles.formFieldsContainer}>
                    <div className={styles.doubleFormFieldBox}>
                      <CustomInput
                        label={t("bankDetails.bankSection.form.bankName")}
                        name={"bankName"}
                        value={formik.values.bankName}
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        touched={formik.touched.bankName}
                        required={true}
                        isDisabled={!isEdit}
                      />
                      <CustomInput
                        label={t(
                          "bankDetails.bankSection.form.bankAccountNumber",
                        )}
                        name={"bankAccountNumber"}
                        type="number"
                        value={formik.values.bankAccountNumber}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        touched={formik.touched.bankAccountNumber}
                        required={true}
                        isDisabled={!isEdit}
                      />
                    </div>
                    <div className={styles.doubleFormFieldBox}>
                      <CustomInput
                        label={t(
                          "bankDetails.bankSection.form.accountHolderName",
                        )}
                        name={"accountHolderName"}
                        value={formik.values.accountHolderName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        touched={formik.touched.accountHolderName}
                        required={true}
                        isDisabled={!isEdit}
                      />
                      {/* <CustomInput label={'Bank Account Details'} /> */}
                      {/* <CustomDownloadButton buttonText='View file' icon={<LuFileDown />} label={'Bank Accont Details'} /> */}

                      {!isEdit && formik.values?.bankDocs ? (
                        <CustomDownloadButton
                          label={t("bankDetails.bankSection.form.bankDetails")}
                          icon={<LuFileDown />}
                          buttonText={t("bankDetails.bankSection.form.viewFile")}
                          downloadLink={formik.values.bankDocs}
                        />
                      ) : (
                        <CustomFileInput
                          label={t("bankDetails.bankSection.form.bankDetails")}
                          required={true}
                          icon={<LuFileDown />}
                          name={"bankDocs"}
                          value={formik.values?.bankDocs}
                          onChange={handleFileChange}
                          placeholder={t(
                            "bankDetails.bankSection.form.viewFile",
                          )}
                          accept={".pdf, .png, .jpeg, .jpg"}
                        />
                      )}
                    </div>
                    {/* <div className={styles.dragDropLabelBox}>
                                           <CustomLabel labelText={'Upload Policy Document'} required={true} />
                                        </div>

                                        <FileUpload onFilesChange={''} accept={'.pdf'} />
                                        {
                                            formik.values.files && (<FilesList files={formik.values.files} fileProgress={fileProgress} removeFile={removeFile} minRequiredFiles={1} />)
                                        } */}
                  </div>
                </div>

                <div className={styles.formSubmitBtn}>
                  {!isEdit && (
                    <CustomBtn
                      label={t("bankDetails.bankSection.form.edit")}
                      onClick={() => setIsEdit(!isEdit)}
                    />
                  )}
                  {isEdit && (
                    <CustomBtn
                      label={
                        bankId
                          ? t("bankDetails.bankSection.form.update")
                          : t("bankDetails.bankSection.form.addBank")
                      }
                      type={"submit"}
                    />
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
