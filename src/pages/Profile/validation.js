import * as Yup from "yup";

const FILE_SIZE = 2 * 1024 * 1024; // 2MB
const SUPPORTED_FORMATS = ["application/pdf"];

export const BankDetailsSchema = (t) =>
  Yup.object().shape({
    bankName: Yup.string()
      .matches(
        /^[a-zA-Z\s]*$/,
        t("bankDetails.validation.bankNamePattern")
      )
      .test(
        "noSpaceAtStart",
        t("bankDetails.validation.noSpaceStart"),
        (value) => value?.trim().charAt(0) !== " "
      )
      .required(t("bankDetails.validation.bankNameRequired")),

    bankAccountNumber: Yup.string()
      .matches(
        /^\d+$/,
        t("bankDetails.validation.accountNumberDigits")
      )
      .required(t("bankDetails.validation.accountNumberRequired")),

    accountHolderName: Yup.string()
      .matches(
        /^[a-zA-Z\s]*$/,
        t("bankDetails.validation.accountHolderPattern")
      )
      .test(
        "noSpaceAtStart",
        t("bankDetails.validation.noSpaceStart"),
        (value) => value?.trim().charAt(0) !== " "
      )
      .required(t("bankDetails.validation.accountHolderRequired")),

    bankAccountDetails: Yup.mixed()
      .nullable()
      .test(
        "fileSize",
        t("bankDetails.validation.fileSize"),
        (value) => !value || value.size <= FILE_SIZE
      )
      .test(
        "fileFormat",
        t("bankDetails.validation.fileFormat"),
        (value) => !value || SUPPORTED_FORMATS.includes(value.type)
      ),
  });
