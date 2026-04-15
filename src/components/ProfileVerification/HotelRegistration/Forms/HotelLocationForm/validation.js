import * as Yup from "yup";

export const HotelLocationValidationSchema = (t) =>
  Yup.object().shape({
    hotelAddress: Yup.string()
      .required(t("hotelLocation.validation.addressRequired"))
      .min(5, t("hotelLocation.validation.addressMin"))
      .max(500, t("hotelLocation.validation.addressMax")),

    city: Yup.string()
      .required(t("hotelLocation.validation.cityRequired"))
      .min(2, t("hotelLocation.validation.cityMin"))
      .max(50, t("hotelLocation.validation.cityMax")),

    locality: Yup.string()
      .required(t("hotelLocation.validation.localityRequired"))
      .min(2, t("hotelLocation.validation.localityMin"))
      .max(50, t("hotelLocation.validation.localityMax")),

    landmark: Yup.string()
      .nullable()
      .notRequired()
      .min(2, t("hotelLocation.validation.landmarkMin"))
      .max(50, t("hotelLocation.validation.landmarkMax")),

    pincode: Yup.string()
      .nullable()
      .notRequired()
      .matches(/^\d{6}$/, t("hotelLocation.validation.pincodeInvalid"))
      .transform((value, originalValue) =>
        originalValue === "" ? null : value
      ),
  });
