export const ENDPOINTS = {
  // Define your API endpoints here
  SEND_OTP_MOBILE_EMAIL: "/verification/send-otp-email-phone",
  VERIFY_OTP_MOBILE: "/verification/verify-phone-otp",
  VERIFY_OTP_EMAIL: "/verification/verify-email-otp",
  REGISTER: "/hotel-manager/auth/register",
  LOGIN: "/hotel-manager/auth/login",

  HOTEL_BANK_DETAILS: "/hotel-manager/banks",
  HOTEL_DETAILS: "/hotel/create",
  HOTEL_BY_ID: "/hotel",
  GET_HOTEL_DETAILS: "/hotel",
  HOTEL_LOCATION: "/hotel-address",
  HOTEL_ROOM: "/hotel-room",
  HOTEL_POLICY: "/hotel-policies",
  HOTEL_BY_TOKEN: "/hotel/first-hotel-registeration",
  ALLOT_ROOM: "/hotelmanager-booking/allot-room",
  UPDATE_ROOM_STATUS: "/room-layout/update",
  HOTEL_BOOKINGS: "/hotelmanager-booking/bookings",
  FEEDBACK: "/hotel-feedback",
  GET_OTP_RESET_PASSWORD: "/verification/send-otp-email-phone",
  GET_OTP_WITHOUT_TOKEN: "/hotel-manager/auth/resend-otp-without-auth",
  VERIFY_OTP_WITHOUT_TOKEN: "/hotel-manager/auth/verify-otp-without-auth",
  RESET_PASSWORD_WITHOUT_TOKEN: "/hotel-manager//reset-password2",
  RESET_PASSWORD: "/hotel-manager/reset-password",
  HOTEL_ALL_ROOMS: "/hotel-room/getAllRooms",

  PROFILE: "/hotel-manager/profile",
  USER_PROFILE: "/hotel-manager/user/profile",
  GET_ALL_ROOMS: "/room-layout/all",

  ADD_GUEST: "/hotelmanager-booking/bookHotel",

  GET_AMENITIES: "/amenities",

  // FORGOT_PASSWORD: '/hotel-manager/auth/forgot-password',
  // RESET_PASSWORD: '/hotel-manager/auth/reset-password',
  // UPDATE_PROFILE: '/hotel-manager/profile',
  // GET_ALL_HOTELS: '/hotel-manager/hotels',
  //... other endpoints
};
