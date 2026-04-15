import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translations
// EN
import enCommon from "./locales/en/common.json";
import enLogin from "./locales/en/auth/login.json";
import enRegister from "./locales/en/auth/register.json";
import enHotelRegistration from "./locales/en/hotelRegistraion/multiStepForm.json";
import enDashboard from "./locales/en/dashboard/dashboard.json";
import enHotelManagement from "./locales/en/dashboard/hotelManagement.json";
import enRoomManagement from "./locales/en/dashboard/roomManagement.json";
import enBookingManagement from "./locales/en/dashboard/bookingManagement.json";
import enFeedback from "./locales/en/dashboard/feedback.json";
import enProfile from "./locales/en/dashboard/profile.json";
import enWallet from "./locales/en/dashboard/wallet.json";
import enAddCustomer from "./locales/en/dashboard/addCustomer.json";

// FR
import frCommon from "./locales/fr/common.json";
import frLogin from "./locales/fr/auth/login.json";
import frRegister from "./locales/fr/auth/register.json";
import frHotelRegistration from "./locales/fr/hotelRegistraion/multiStepForm.json";
import frDashboard from "./locales/fr/dashboard/dashboard.json";
import frHotelManagement from "./locales/fr/dashboard/hotelManagement.json";
import frRoomManagement from "./locales/fr/dashboard/roomManagement.json";
import frBookingManagement from "./locales/fr/dashboard/bookingManagement.json";
import frFeedback from "./locales/fr/dashboard/feedback.json";
import frProfile from "./locales/fr/dashboard/profile.json";
import frWallet from "./locales/fr/dashboard/wallet.json";
import frAddCustomer from "./locales/fr/dashboard/addCustomer.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    fallbackLng: "en",
    supportedLngs: ["en", "fr"],
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        common: enCommon,
        login: enLogin,
        register: enRegister,
        hotelRegistration: enHotelRegistration,
        dashboard: enDashboard,
        hotelManagement: enHotelManagement,
        roomManagement: enRoomManagement,
        bookingManagement: enBookingManagement,
        feedback: enFeedback,
        profile: enProfile,
        wallet: enWallet,
        addCustomer: enAddCustomer,
      },
      fr: {
        common: frCommon,
        login: frLogin,
        register: frRegister,
        hotelRegistration: frHotelRegistration,
        dashboard: frDashboard,
        hotelManagement: frHotelManagement,
        roomManagement: frRoomManagement,
        bookingManagement: frBookingManagement,
        feedback: frFeedback,
        profile: frProfile,
        wallet: frWallet,
        addCustomer: frAddCustomer,
      },
    },
  });

export default i18n;
