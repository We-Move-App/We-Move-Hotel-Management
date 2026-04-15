import * as Yup from "yup";

export const emailSchema = (t) =>
  Yup.object().shape({
    emailOrPhone: Yup.string()
      .test(
        "noSpaceAtStart",
        t("resetPassword.validation.noSpaceStart"),
        (value) => value?.trim().charAt(0) !== " "
      )
      .test(
        "emailOrPhone",
        t("resetPassword.validation.invalidEmailPhone"),
        function (value) {
          if (!value) return false;

          const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
          const phoneRegex = /^\d{10}$/;

          return emailRegex.test(value) || phoneRegex.test(value);
        }
      )
      .required(t("resetPassword.validation.requiredEmailPhone")),
  });

export const resetPasswordSchema = (t) =>
  Yup.object().shape({
    password: Yup.string()
      .min(8, t("resetPassword.validation.passwordMin"))
      .required(t("resetPassword.validation.passwordRequired"))
      .test(
        "no-leading-space",
        t("resetPassword.validation.passwordNoSpace"),
        (value) => value && value[0] !== " "
      )
      .matches(
        /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).*$/,
        t("resetPassword.validation.passwordPattern")
      ),

    confirmPassword: Yup.string()
      .oneOf(
        [Yup.ref("password"), null],
        t("resetPassword.validation.confirmPasswordMatch")
      )
      .required(t("resetPassword.validation.confirmPasswordRequired"))
      .test(
        "no-leading-space",
        t("resetPassword.validation.confirmPasswordNoSpace"),
        (value) => value && value[0] !== " "
      ),
  });
