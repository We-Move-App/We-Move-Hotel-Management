import * as Yup from "yup";
const SUPPORTED_FORMATS = [
  "image/jpg",
  "image/jpeg",
  "image/png",
  "application/pdf",
]; // Supported file types
const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB size limit


export const HotelDetailsValidationSchema = (t) =>
  Yup.object().shape({
    hotelName: Yup.string()
      .required(t("hotelDetails.validation.hotelNameRequired"))
      .min(2, t("hotelDetails.validation.hotelNameMin"))
      .max(50, t("hotelDetails.validation.hotelNameMax"))
      .matches(
        /^[A-Za-z\s\.\,\-']+$/,
        t("hotelDetails.validation.hotelNamePattern")
      ),

    bussinessLicense: Yup.string().required(
      t("hotelDetails.validation.businessLicenseRequired")
    ),

    totalRooms: Yup.number()
      .required(t("hotelDetails.validation.totalRoomsRequired"))
      .positive(t("hotelDetails.validation.totalRoomsPositive"))
      .integer(t("hotelDetails.validation.totalRoomsInteger")),

    files: Yup.array()
      .of(
        Yup.mixed()
          .required(t("hotelDetails.validation.fileRequired"))
          .test("file-check", t("hotelDetails.validation.fileInvalid"), (value) => {
            if (value instanceof File) {
              const validSize = value.size <= FILE_SIZE_LIMIT;
              const validFormat = SUPPORTED_FORMATS.includes(value.type);
              return validSize && validFormat;
            }
            return true;
          })
      )
      .test("file-count", t("hotelDetails.validation.fileMin"), function (value) {
        const count = value?.length || 0;
        return count >= 3;
      }),

    termsAndConditions: Yup.boolean()
      .required(t("hotelDetails.validation.termsRequired"))
      .oneOf([true], t("hotelDetails.validation.termsRequired")),
  });
