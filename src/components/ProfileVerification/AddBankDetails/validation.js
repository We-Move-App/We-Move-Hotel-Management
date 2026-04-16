import * as Yup from "yup";

const FILE_SIZE = 2 * 1024 * 1024; // 2MB
const SUPPORTED_FORMATS = [
  "application/pdf",
  "image/png",
  "image/jpg",
  "image/jpeg",
];

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
        /^[0-9]+$/,
        t("bankDetails.validation.accountNumberDigits")
      )
      .min(11, t("bankDetails.validation.accountNumberMin"))
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
      .test("fileSize", t("bankDetails.validation.fileSize"), (value) => {
        return !value || (value && value.size <= FILE_SIZE);
      })
      .test("fileFormat", t("bankDetails.validation.fileFormat"), (value) => {
        return !value || SUPPORTED_FORMATS.includes(value.type);
      }),
  });
