import * as Yup from "yup";

const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5 MB
const SUPPORTED_FORMATS = [
  "image/jpg",
  "image/jpeg",
  "image/png",
  "application/pdf",
];

export const customerValidationSchema = (t) =>
  Yup.object({
    customerName: Yup.string()
      .trim()
      .required(t("validation.customerName.required"))
      .min(2, t("validation.customerName.min"))
      .max(50, t("validation.customerName.max"))
      .matches(/^[a-zA-Z\s]+$/, t("validation.customerName.pattern")),

    email: Yup.string()
      .trim()
      .lowercase()
      .email(t("validation.email.invalid"))
      .required(t("validation.email.required")),

    mobile: Yup.string()
      .required(t("validation.mobile.required"))
      .matches(/^[6-9]\d{9}$/, t("validation.mobile.invalid")),

    checkInDate: Yup.date()
      .required(t("validation.checkInDate.required"))
      .typeError(t("validation.checkInDate.invalid"))
      .min(new Date(), t("validation.checkInDate.past")),

    checkOutDate: Yup.date()
      .required(t("validation.checkOutDate.required"))
      .typeError(t("validation.checkOutDate.invalid"))
      .min(Yup.ref("checkInDate"), t("validation.checkOutDate.min")),

    // isAdult: Yup.number()
    //   .typeError(t("validation.isAdult.invalid"))
    //   .required(t("validation.isAdult.required"))
    //   .min(1, t("validation.isAdult.min"))
    //   .max(10, t("validation.isAdult.max")),
    isAdult: Yup.boolean().required(t("validation.isAdult.required")),

    files: Yup.array()
      .of(
        Yup.mixed()
          .required(t("validation.file.required"))
          .test("fileSize", t("validation.file.size"), (file) => {
            return !file || file.size <= FILE_SIZE_LIMIT;
          })
          .test("fileFormat", t("validation.file.format"), (file) => {
            return !file || SUPPORTED_FORMATS.includes(file.type);
          }),
      )
      .min(1, t("validation.file.min")),
  });
