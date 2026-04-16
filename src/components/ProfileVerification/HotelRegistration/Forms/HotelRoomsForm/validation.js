import * as Yup from "yup";
const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png"]; // Supported file types
const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB size limit


export const roomValidationSchema = (t) =>
  Yup.object().shape({
    roomPrice: Yup.number().required(
      t("hotelRooms&Amenities.validation.roomPriceRequired")
    ),

    numberOfRooms: Yup.number().required(
      t("hotelRooms&Amenities.validation.numberOfRoomsRequired")
    ),

    files: Yup.array()
      .of(
        Yup.mixed()
          .required(t("hotelRooms&Amenities.validation.fileRequired"))
          .test("file-check", t("hotelRooms&Amenities.validation.fileInvalid"), (value) => {
            if (value instanceof File) {
              const validSize = value.size <= FILE_SIZE_LIMIT;
              const validFormat = SUPPORTED_FORMATS.includes(value.type);
              return validSize && validFormat;
            }
            return true;
          })
      )
      .test(
        "file-count",
        t("hotelRooms&Amenities.validation.fileMinCount"),
        (value = []) => value.length >= 3
      )
      .min(1, t("hotelRooms&Amenities.validation.fileMin")),

    amenities: Yup.array()
      .of(Yup.mixed())
      .min(1, t("hotelRooms&Amenities.validation.amenitiesRequired")),
  });
