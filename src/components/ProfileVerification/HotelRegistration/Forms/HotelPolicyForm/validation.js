import * as Yup from "yup";

const SUPPORTED_FORMATS = ["application/pdf"];
const FILE_SIZE_LIMIT = 5 * 1024 * 1024;


export const HotelPolicyValidationSchema = (t) =>
  Yup.object().shape({
    checkingTime: Yup.string()
      .required(t("hotelPolicy.validation.checkinRequired"))
      .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, t("hotelPolicy.validation.invalidTime")),

    checkoutTime: Yup.string()
      .required(t("hotelPolicy.validation.checkoutRequired"))
      .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, t("hotelPolicy.validation.invalidTime")),

    amenities: Yup.array()
      .of(
        Yup.object().shape({
          name: Yup.string().required(),
          checked: Yup.boolean()
        })
      )
      .test(
        "at-least-one-checked",
        t("hotelPolicy.validation.amenitiesRequired"),
        (amenities = []) => amenities.some((a) => a.checked)
      ),

    files: Yup.array()
      .of(
        Yup.mixed()
          .required(t("hotelPolicy.validation.fileRequired"))
          .test("file-check", t("hotelPolicy.validation.fileInvalid"), (value) => {
            if (value instanceof File) {
              const validSize = value.size <= FILE_SIZE_LIMIT;
              const validFormat = SUPPORTED_FORMATS.includes(value.type);
              return validSize && validFormat;
            }
            return true;
          })
      )
      .max(1, t("hotelPolicy.validation.fileMax")),
  });
