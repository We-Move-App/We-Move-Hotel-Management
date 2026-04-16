import * as Yup from "yup";

export const loginSchema = (t) =>
  Yup.object().shape({
    emailOrPhone: Yup.string()
      .test(
        "noSpaceAtStart",
        t("validation.noSpaceStart"),
        (value) => value?.trim().charAt(0) !== " ",
      )
      .test(
        "emailOrPhone",
        t("validation.invalidEmailPhone"),
        function (value) {
          const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
          const phoneRegex = /^\d{10}$/;
          return emailRegex.test(value) || phoneRegex.test(value);
        },
      )
      .required(t("validation.requiredEmailPhone")),

    password: Yup.string()
      .test(
        "noSpaceAtStart",
        "The first character cannot be a space",
        (value) => value?.trim().charAt(0) !== " ",
      )
      .required("Password is required")
      .min(6, "Password must be at least 6 characters long")
      .max(20, "Password must be at most 20 characters long")
      .matches(
        /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).*$/,
        "Password must contain at least one letter, one number, and one special character",
      ),
  });
