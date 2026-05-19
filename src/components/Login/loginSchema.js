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
          const phoneRegex = /^[2-5]\d{8}$/;
          return emailRegex.test(value) || phoneRegex.test(value);
        },
      )
      .required(t("validation.requiredEmailPhone")),
      
    password: Yup.string()
      .test(
        t("validation.noSpaceStart"),
        (value) => value?.trim().charAt(0) !== " ",
      )
      .required(t("validation.requiredPassword"))
      .min(6, t("validation.passwordMin"))
      .max(20, t("validation.passwordMax"))
      .matches(
        /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).*$/,
        t("validation.passwordPattern"),
      ),
  });
