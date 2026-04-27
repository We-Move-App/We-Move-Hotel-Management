import axios from "axios";
import {
  selectedLanguageFromLocalStorage,
  tokenFromLocalStorage,
} from "../utils/helperFunctions";
// import { setAccessToken } from "./authToken";

const BASEURL = import.meta.env.VITE_BASE_URL;
const apiVersion = "/api/v1";

const axiosInstance = axios.create({
  baseURL: `${BASEURL}${apiVersion}`,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

//  REQUEST INTERCEPTOR
axiosInstance.interceptors.request.use((config) => {
  const token = tokenFromLocalStorage();
  const selectedLanguage = selectedLanguageFromLocalStorage();

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  if (selectedLanguage) {
    config.headers["ln"] = selectedLanguage;
  }

  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

// RESPONSE INTERCEPTOR (refresh token logic)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          `${BASEURL}${apiVersion}/hotel-manager/auth/refresh-token`,
          {},
          { withCredentials: true },
        );

        const newToken = res.data.accessToken;

        //  make sure this exists in your project
        localStorage.setItem("token", newToken);

        processQueue(null, newToken);

        originalRequest.headers["Authorization"] = "Bearer " + newToken;
        return axiosInstance(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.clear();
        window.location.reload();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// Main API call function
const apiCall = async (
  url,
  method = "GET",
  { body = null, params = {}, headers = {}, options = {} } = {},
) => {
  try {
    const response = await axiosInstance({
      method,
      url,
      params,
      data: body,
      headers,
      ...options,
    });

    return {
      data: response.data,
      statusCode: response.status,
      error: null,
      success: response.data?.success ?? true, //  always boolean
    };
  } catch (error) {
    return {
      data: null,
      statusCode: error.response?.status || 500,
      success: false, //  ALWAYS present
      error: {
        message: error.response?.data?.message || "Something went wrong",
        raw: error.response?.data || null,
      },
    };
  }
};

export default apiCall;
