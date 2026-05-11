import * as Yup from "yup";

export const SignupSchema = (t) =>
  Yup.object().shape({
    mobile: Yup.string()
      .matches(/^[6-9]{8}$/, t("signup.validation.mobileDigits"))
      .matches(/^\d+$/, t("signup.validation.mobileInvalid"))
      .required(t("signup.validation.mobileRequired"))
      .test(
        "no-leading-space",
        t("signup.validation.mobileNoSpace"),
        (value) => value && value[0] !== " "
      ),

    email: Yup.string()
      .test(
        "noSpaceAtStart",
        t("signup.validation.noSpaceStart"),
        (value) => value?.trim().charAt(0) !== " "
      )
      .test("email", t("signup.validation.emailInvalid"), function (value) {
        if (!value) return false;
        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        return emailRegex.test(value);
      })
      .required(t("signup.validation.emailRequired")),

    password: Yup.string()
      .min(8, t("signup.validation.passwordMin"))
      .required(t("signup.validation.passwordRequired"))
      .test(
        "no-leading-space",
        t("signup.validation.passwordNoSpace"),
        (value) => value && value[0] !== " "
      )
      .matches(
        /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).*$/,
        t("signup.validation.passwordPattern")
      ),

    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], t("signup.validation.confirmPasswordMatch"))
      .required(t("signup.validation.confirmPasswordRequired"))
      .test(
        "no-leading-space",
        t("signup.validation.confirmPasswordNoSpace"),
        (value) => value && value[0] !== " "
      ),

    branch: Yup.string().required(t("signup.validation.branchRequired")),
  });
